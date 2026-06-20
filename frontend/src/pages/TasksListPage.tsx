import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { AgentBadge, StatusBadge } from "@/components/StatusBadge";
import { formatDistanceToNow } from "date-fns";

const easing: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export function TasksListPage() {
  const tasks = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiClient.listTasks(50),
    refetchInterval: (q) => {
      const data = q.state.data as Array<{ status: string }> | undefined;
      const hasActive = data?.some((t) => t.status === "running" || t.status === "pending");
      return hasActive ? 3_000 : false;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold">Tasks</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            All tasks across agents — claude, research, planner.
          </p>
        </div>
        <Link
          to="/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        >
          + New
        </Link>
      </div>

      {tasks.isLoading && (
        <div className="text-center py-20 text-[var(--color-text-muted)]">Loading…</div>
      )}

      {tasks.data && tasks.data.length === 0 && (
        <div className="glass rounded-xl p-16 text-center">
          <div className="text-[var(--color-text-muted)] mb-4">No tasks yet.</div>
          <Link
            to="/new"
            className="inline-flex items-center px-5 py-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded-lg text-indigo-200 hover:bg-indigo-500/30 transition-colors"
          >
            Create first task
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {tasks.data?.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.04 * i, ease: easing }}
          >
            <Link
              to={`/tasks/${task.id}`}
              className="block glass rounded-xl p-5 hover:bg-white/[0.06] hover:-translate-y-1 hover:rotate-[0.3deg] transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] h-full"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={task.status} />
                  {task.agent && <AgentBadge agent={task.agent} />}
                  {task.params && (task.params as Record<string, unknown>).plan_type ? (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                      · {String((task.params as Record<string, unknown>).plan_type)}
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] font-mono">
                  {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                </div>
              </div>
              <div className="text-sm text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">
                {task.prompt}
              </div>
              {task.usage && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-muted)] font-mono">
                    {task.usage.input_tokens + task.usage.output_tokens} tok
                  </span>
                  <span className="text-[var(--color-accent-cyan)] font-mono font-semibold">
                    ${task.usage.cost_usd.toFixed(4)}
                  </span>
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
