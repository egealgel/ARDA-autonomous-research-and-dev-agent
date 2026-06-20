import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { StatusBadge, AgentBadge } from "@/components/StatusBadge";
import { formatDistanceToNow } from "date-fns";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const easing: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export function DashboardPage() {
  const usage = useQuery({ queryKey: ["usage"], queryFn: apiClient.usage });
  const tasks = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiClient.listTasks(8),
  });

  const succeeded = tasks.data?.filter((t) => t.status === "succeeded").length ?? 0;
  const running = tasks.data?.filter((t) => t.status === "running" || t.status === "pending").length ?? 0;

  return (
    <div className="space-y-16">
      <section>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easing }}
        >
          <h1 className="font-display text-6xl font-bold leading-tight tracking-tight">
            Autonomous
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
              Research & Planning
            </span>
          </h1>
          <p className="mt-6 text-lg text-[var(--color-text-secondary)] max-w-2xl">
            Bir görev tanımla. Sistem URL'leri tarar, vektör hafızaya yazar, Claude Sonnet 4.6
            ile detaylı roadmap, PRD veya araştırma planı üretir.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              to="/new"
              className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            >
              <span>New Task</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
              </svg>
            </Link>
            <Link
              to="/tasks"
              className="inline-flex items-center px-6 py-3 glass rounded-lg font-medium hover:bg-white/5 transition-colors duration-200"
            >
              View Tasks
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Budget remaining",
            value: usage.data ? `$${usage.data.budget_remaining_usd.toFixed(2)}` : "—",
            sub: usage.data ? `of $${usage.data.budget_usd.toFixed(0)} this month` : "",
            accent: "from-emerald-500/20 to-emerald-500/0",
          },
          {
            label: "Total spent",
            value: usage.data ? `$${usage.data.total_cost_usd.toFixed(3)}` : "—",
            sub: usage.data ? `${usage.data.request_count} requests` : "",
            accent: "from-cyan-500/20 to-cyan-500/0",
          },
          {
            label: "Tasks completed",
            value: succeeded.toString(),
            sub: `${running} running`,
            accent: "from-violet-500/20 to-violet-500/0",
          },
          {
            label: "Output tokens",
            value: usage.data ? usage.data.total_output_tokens.toLocaleString() : "—",
            sub: usage.data ? `${usage.data.total_input_tokens.toLocaleString()} input` : "",
            accent: "from-indigo-500/20 to-indigo-500/0",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: easing }}
            className="glass rounded-xl p-5 relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent} pointer-events-none`} />
            <div className="relative">
              <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{stat.label}</div>
              <div className="mt-2 text-3xl font-display font-bold">{stat.value}</div>
              <div className="mt-1 text-xs text-[var(--color-text-secondary)]">{stat.sub}</div>
            </div>
          </motion.div>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-semibold">Recent activity</h2>
          <Link
            to="/tasks"
            className="text-sm text-[var(--color-accent-cyan)] hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="space-y-2">
          {tasks.isLoading && (
            <div className="text-center py-12 text-[var(--color-text-muted)]">Loading…</div>
          )}
          {tasks.data?.length === 0 && (
            <div className="glass rounded-xl p-10 text-center text-[var(--color-text-muted)]">
              No tasks yet. <Link to="/new" className="text-[var(--color-accent-cyan)] underline">Create your first one →</Link>
            </div>
          )}
          {tasks.data?.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i, ease: easing }}
            >
              <Link
                to={`/tasks/${task.id}`}
                className="block glass rounded-lg p-4 hover:bg-white/[0.06] hover:translate-x-1 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group"
              >
                <div className="flex items-center gap-3">
                  <StatusBadge status={task.status} />
                  {task.agent && <AgentBadge agent={task.agent} />}
                  <div className="flex-1 truncate text-sm text-[var(--color-text-secondary)] group-hover:text-white transition-colors">
                    {task.prompt}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] font-mono whitespace-nowrap">
                    {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
