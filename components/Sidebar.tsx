"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Bot,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/employees", label: "Employees", icon: Users },
  { href: "/dashboard/ai-assistant", label: "AI Assistant", icon: Bot },
  { href: "/dashboard/employees/new", label: "Add Employee", icon: UserPlus },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsCollapsed(window.innerWidth < 1024);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground border-sidebar-border relative flex shrink-0 flex-col border-r transition-all duration-200",
        isCollapsed ? "w-14" : "w-64",
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed((c) => !c)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent absolute top-5 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              title={isCollapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isCollapsed && "justify-center px-2",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
