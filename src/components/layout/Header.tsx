import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { getCurrentUser, logout, type CurrentUser } from "@/lib/api/auth";

function greeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function initialOf(user: CurrentUser | null | undefined): string {
  const source = user?.name?.trim() || user?.email || "";
  return source.charAt(0).toUpperCase() || "?";
}

export function Header() {
  const now = new Date();

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60_000,
  });

  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">
          {greeting(now.getHours())}
        </h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
          {DATE_FMT.format(now)} · Personal
        </p>
      </div>

      <div className="flex items-center gap-3.5">
        <span className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)]">
          EUR
        </span>
        <UserMenu user={user} />
      </div>
    </header>
  );
}

function UserMenu({ user }: { user: CurrentUser | null | undefined }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const displayName = user?.name?.trim() || user?.email || "Guest";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title={user?.email}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] font-semibold text-[var(--color-text)] transition-shadow"
        style={{ boxShadow: "0 0 0 2px rgba(240,168,104,0.25)" }}
      >
        {initialOf(user)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] shadow-lg"
        >
          <div className="flex items-center gap-3 border-b border-[var(--color-border-soft)] px-4 py-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-sm font-semibold text-[var(--color-accent)]"
            >
              {initialOf(user)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--color-text)]">
                {displayName}
              </p>
              {user?.email && (
                <p className="truncate text-xs text-[var(--color-text-muted)]">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
