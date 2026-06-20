import type { TaskStatus } from "@/lib/api";

const styles: Record<TaskStatus, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  running: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  succeeded: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  failed: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

const labels: Record<TaskStatus, string> = {
  pending: "Pending",
  running: "Running",
  succeeded: "Succeeded",
  failed: "Failed",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {(status === "running" || status === "pending") && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {labels[status]}
    </span>
  );
}

const agentStyles: Record<string, string> = {
  claude: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  research: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  planner: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
};

export function AgentBadge({ agent }: { agent: string }) {
  const style = agentStyles[agent] ?? "bg-white/10 text-white border-white/20";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${style}`}>
      {agent}
    </span>
  );
}
