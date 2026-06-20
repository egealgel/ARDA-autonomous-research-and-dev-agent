import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useLenis } from "@/hooks/useLenis";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/tasks", label: "Tasks" },
  { to: "/new", label: "New" },
];

export function Layout() {
  const location = useLocation();
  useLenis();

  const usage = useQuery({
    queryKey: ["usage"],
    queryFn: apiClient.usage,
    refetchInterval: 15_000,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50">
        <div className="glass-strong">
          <div className="max-w-[1280px] mx-auto px-8 py-4 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-display font-bold text-white text-lg shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow duration-300">
                A
              </div>
              <div>
                <div className="font-display font-semibold text-base leading-none">ARDA</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">research · plan</div>
              </div>
            </NavLink>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `relative px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-[var(--color-text-secondary)] hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/40 rounded-md"
                          transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {usage.data && (
                <div className="text-right text-xs">
                  <div className="text-[var(--color-text-muted)]">Budget</div>
                  <div className="font-mono font-semibold text-[var(--color-accent-cyan)]">
                    ${usage.data.budget_remaining_usd.toFixed(2)}
                    <span className="text-[var(--color-text-muted)] ml-1">
                      / ${usage.data.budget_usd.toFixed(0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-[1280px] mx-auto px-8 py-10"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-[var(--color-border-subtle)] py-6 mt-12">
        <div className="max-w-[1280px] mx-auto px-8 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <div>ARDA · Autonomous Research & Dev Agent</div>
          <div className="font-mono">v0.4.0</div>
        </div>
      </footer>
    </div>
  );
}
