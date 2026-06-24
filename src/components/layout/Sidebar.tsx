import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PieChart,
  Receipt,
  Briefcase,
  Settings,
  Search,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/api/auth";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/holdings", label: "Holdings", icon: PieChart },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/business", label: "Business", icon: Briefcase },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-16 shrink-0 flex-col items-center justify-between border-r border-[var(--color-border)] bg-[var(--color-surface)] py-4">
      <div className="flex flex-col items-center gap-2">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--color-accent)] text-[var(--color-bg)]">
          <TrendingUp size={20} strokeWidth={2.4} />
        </div>
        <SidebarIconLink to="/search" label="Search" icon={Search} disabled />
        {navItems.map((item) => (
          <SidebarIconLink key={item.to} {...item} />
        ))}
      </div>
      <div className="flex flex-col items-center gap-2">
        <SidebarIconLink to="/settings" label="Settings" icon={Settings} disabled />
        <LogoutButton />
      </div>
    </aside>
  );
}

function LogoutButton() {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  return (
    <button
      type="button"
      title="Sign out"
      onClick={handleLogout}
      className="flex h-10 w-10 items-center justify-center rounded-[11px] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
    >
      <LogOut size={19} />
    </button>
  );
}

interface SidebarIconLinkProps extends NavItem {
  disabled?: boolean;
}

function SidebarIconLink({ to, label, icon: Icon, disabled }: SidebarIconLinkProps) {
  if (disabled) {
    return (
      <button
        type="button"
        title={label}
        className="flex h-10 w-10 items-center justify-center rounded-[11px] text-[var(--color-text-muted)] opacity-50 hover:bg-[var(--color-surface-2)]"
      >
        <Icon size={19} />
      </button>
    );
  }
  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        cn(
          "flex h-10 w-10 items-center justify-center rounded-[11px] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]",
          isActive &&
            "bg-[var(--color-surface-2)] text-[var(--color-accent)]",
        )
      }
    >
      <Icon size={19} />
    </NavLink>
  );
}
