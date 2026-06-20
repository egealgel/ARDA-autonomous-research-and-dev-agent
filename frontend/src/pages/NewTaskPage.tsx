import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiClient, type PlanType } from "@/lib/api";

const easing: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

type AgentKind = "claude" | "research" | "plan";

const agents: Array<{
  kind: AgentKind;
  title: string;
  blurb: string;
  hue: string;
  needsUrls: boolean;
  needsPlanType: boolean;
}> = [
  {
    kind: "claude",
    title: "Claude (direct)",
    blurb: "Tek atışlık Claude çağrısı. URL veya RAG yok. Hızlı, ucuz.",
    hue: "from-cyan-500/20 to-cyan-500/0",
    needsUrls: false,
    needsPlanType: false,
  },
  {
    kind: "research",
    title: "Research",
    blurb: "URL'leri scrape eder, vektörize eder, ilgili chunk'larla Claude'a sorar. Citation'lı yanıt.",
    hue: "from-violet-500/20 to-violet-500/0",
    needsUrls: true,
    needsPlanType: false,
  },
  {
    kind: "plan",
    title: "Planner",
    blurb: "Roadmap / research-plan / PRD üretir. URL'ler opsiyonel — verilirse RAG ile zenginleşir.",
    hue: "from-fuchsia-500/20 to-fuchsia-500/0",
    needsUrls: true,
    needsPlanType: true,
  },
];

const planTypes: Array<{ value: PlanType; title: string; blurb: string }> = [
  { value: "software_roadmap", title: "Software roadmap", blurb: "Milestones, epic/story breakdown, risk matrisi, mimari kararlar." },
  { value: "research_plan", title: "Research plan", blurb: "Anahtar sorular, kaynak haritası, okuma sırası, doğrulama yöntemleri." },
  { value: "prd", title: "PRD", blurb: "User stories, kabul kriterleri, API/data model taslakları, edge cases." },
];

export function NewTaskPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [agent, setAgent] = useState<AgentKind | null>(null);
  const [planType, setPlanType] = useState<PlanType>("software_roadmap");
  const [prompt, setPrompt] = useState("");
  const [urlsRaw, setUrlsRaw] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      if (!agent) throw new Error("No agent selected");
      const urls = urlsRaw.split(/\s+/).map((s) => s.trim()).filter(Boolean);

      if (agent === "claude") {
        const task = await apiClient.createTask({ prompt });
        return { id: task.id };
      }
      if (agent === "research") {
        if (urls.length === 0) throw new Error("Research için en az 1 URL gerekli.");
        const accepted = await apiClient.createResearch({ prompt, urls });
        return { id: accepted.task_id };
      }
      const accepted = await apiClient.createPlan({ prompt, plan_type: planType, urls });
      return { id: accepted.task_id };
    },
    onSuccess: (data) => {
      navigate(`/tasks/${data.id}`);
    },
  });

  const goNext = () => {
    setDirection(1);
    setStep((s) => (s + 1) as 0 | 1 | 2);
  };
  const goBack = () => {
    setDirection(-1);
    setStep((s) => (s - 1) as 0 | 1 | 2);
  };

  const activeAgent = agents.find((a) => a.kind === agent);
  const promptOk = prompt.trim().length > 10;
  const urlsList = urlsRaw.split(/\s+/).map((s) => s.trim()).filter(Boolean);
  const detailsOk =
    activeAgent && (!activeAgent.needsUrls || urlsList.length > 0 ? promptOk : promptOk);

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -60 }),
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        {[0, 1, 2].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
              s <= step ? "bg-gradient-to-r from-indigo-500 to-violet-500" : "bg-white/5"
            }`}
          />
        ))}
      </div>

      <div className="relative min-h-[420px]">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.section
              key="step-0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: easing }}
              className="space-y-6"
            >
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Step 1 of 3</div>
                <h2 className="font-display text-3xl font-bold mt-1">Agent seç</h2>
                <p className="text-[var(--color-text-secondary)] mt-2">
                  Hangi ajan görevi alacak?
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {agents.map((a) => (
                  <button
                    key={a.kind}
                    onClick={() => {
                      setAgent(a.kind);
                      goNext();
                    }}
                    className={`group relative text-left glass rounded-xl p-5 hover:bg-white/[0.06] hover:scale-[1.01] transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                      agent === a.kind ? "ring-2 ring-indigo-500/50" : ""
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${a.hue} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                    <div className="relative">
                      <div className="font-display font-semibold text-lg">{a.title}</div>
                      <div className="text-sm text-[var(--color-text-secondary)] mt-1">{a.blurb}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {step === 1 && activeAgent && (
            <motion.section
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: easing }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Step 2 of 3</div>
                  <h2 className="font-display text-3xl font-bold mt-1">Detaylar</h2>
                </div>
                <button
                  onClick={goBack}
                  className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors"
                >
                  ← change agent
                </button>
              </div>

              {activeAgent.needsPlanType && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Plan türü
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {planTypes.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPlanType(p.value)}
                        className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                          planType === p.value
                            ? "bg-indigo-500/20 border-indigo-500/50"
                            : "glass hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="font-medium text-sm">{p.title}</div>
                        <div className="text-xs text-[var(--color-text-muted)] mt-1 leading-snug">{p.blurb}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  placeholder="Görevi açıkça yaz. Ne istiyorsun, neden, hangi kısıtlar var?"
                  className="w-full glass rounded-lg p-4 text-sm leading-relaxed bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-[var(--color-text-muted)]"
                />
                <div className="text-xs text-[var(--color-text-muted)]">{prompt.length} karakter</div>
              </div>

              {activeAgent.needsUrls && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                    URL'ler {activeAgent.kind === "research" ? "(en az 1 zorunlu)" : "(opsiyonel)"}
                  </label>
                  <textarea
                    value={urlsRaw}
                    onChange={(e) => setUrlsRaw(e.target.value)}
                    rows={3}
                    placeholder="https://github.com/foo/bar&#10;https://blog.example.com/article"
                    className="w-full glass rounded-lg p-4 text-sm font-mono leading-relaxed bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-[var(--color-text-muted)]"
                  />
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {urlsList.length} URL · GitHub repolar README + metadata, diğerleri scrape + bs4
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={goNext}
                  disabled={!detailsOk}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Continue
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                  </svg>
                </button>
              </div>
            </motion.section>
          )}

          {step === 2 && activeAgent && (
            <motion.section
              key="step-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: easing }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Step 3 of 3</div>
                  <h2 className="font-display text-3xl font-bold mt-1">Confirm & submit</h2>
                </div>
                <button
                  onClick={goBack}
                  className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors"
                >
                  ← edit
                </button>
              </div>

              <div className="glass rounded-xl p-6 space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Agent</div>
                  <div className="font-medium">{activeAgent.title}</div>
                </div>
                {activeAgent.needsPlanType && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Plan type</div>
                    <div className="font-medium font-mono text-sm">{planType}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Prompt</div>
                  <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">{prompt}</div>
                </div>
                {activeAgent.needsUrls && urlsList.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">URLs ({urlsList.length})</div>
                    <ul className="text-sm font-mono text-[var(--color-accent-cyan)] space-y-1">
                      {urlsList.map((u) => (
                        <li key={u} className="truncate">{u}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {submit.isError && (
                <div className="glass rounded-lg p-4 border border-rose-500/40 bg-rose-500/10 text-rose-200 text-sm">
                  {(submit.error as Error)?.message ?? "Submit failed"}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => submit.mutate()}
                  disabled={submit.isPending}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] disabled:opacity-50"
                >
                  {submit.isPending ? "Submitting…" : "Submit task"}
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
