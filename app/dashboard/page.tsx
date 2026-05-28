import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/db/prisma";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  UserX,
  Building2,
  UserPlus,
  Bot,
  MoreVertical,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-teal-500",
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

const AI_CHIPS = [
  "Create employee",
  "Show active employees",
  "Generate summary",
  "Deactivate employee",
];

// ── DEMO DATA — remove once real data is flowing ──────────────────────────
const DEMO_STATS = { total: 12, active: 9, inactive: 3, departments: 4 };
const DEMO_EMPLOYEES = [
  {
    id: "d1",
    name: "John Doe",
    department: "Engineering",
    jobTitle: "Software Engineer",
    status: "ACTIVE",
    joiningDate: new Date("2026-06-01"),
  },
  {
    id: "d2",
    name: "Emma Johnson",
    department: "Product",
    jobTitle: "Product Manager",
    status: "ACTIVE",
    joiningDate: new Date("2026-05-28"),
  },
  {
    id: "d3",
    name: "Michael Brown",
    department: "Design",
    jobTitle: "UI/UX Designer",
    status: "ACTIVE",
    joiningDate: new Date("2026-05-25"),
  },
  {
    id: "d4",
    name: "Olivia Smith",
    department: "Marketing",
    jobTitle: "Marketing Specialist",
    status: "INACTIVE",
    joiningDate: new Date("2026-05-20"),
  },
  {
    id: "d5",
    name: "Liam Wilson",
    department: "Sales",
    jobTitle: "Sales Executive",
    status: "ACTIVE",
    joiningDate: new Date("2026-05-18"),
  },
];
// ────────────────────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    href: "/dashboard/employees/new",
    label: "Add Employee",
    icon: UserPlus,
    iconBg: "bg-blue-50 dark:bg-blue-950",
    iconColor: "text-blue-500",
  },
  {
    href: "/dashboard/employees",
    label: "View Employees",
    icon: Users,
    iconBg: "bg-green-50 dark:bg-green-950",
    iconColor: "text-green-500",
  },
  {
    href: "/dashboard/ai-assistant",
    label: "AI Assistant",
    icon: Bot,
    iconBg: "bg-purple-50 dark:bg-purple-950",
    iconColor: "text-purple-500",
  },
  {
    href: "/dashboard/employees",
    label: "Departments",
    icon: Building2,
    iconBg: "bg-orange-50 dark:bg-orange-950",
    iconColor: "text-orange-500",
  },
];

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/");

  let fetchFailed = false;
  let stats = { total: 0, active: 0, inactive: 0, departments: 0 };
  let recentEmployees: Array<{
    id: string;
    name: string;
    department: string;
    jobTitle: string;
    status: string;
    joiningDate: Date;
  }> = [];

  try {
    const [total, active, inactive, allDepts, recent] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: "ACTIVE" } }),
      prisma.employee.count({ where: { status: "INACTIVE" } }),
      prisma.employee.findMany({ select: { department: true } }),
      prisma.employee.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          department: true,
          jobTitle: true,
          status: true,
          joiningDate: true,
        },
      }),
    ]);

    stats = {
      total,
      active,
      inactive,
      departments: new Set(allDepts.map((d) => d.department)).size,
    };
    recentEmployees = recent;
  } catch (err) {
    fetchFailed = true;
    console.error("[DashboardPage] failed to fetch employee data:", err);
  }

  // Fallback to demo data only when the fetch itself failed
  const displayStats = fetchFailed ? DEMO_STATS : stats;
  const displayEmployees = fetchFailed ? DEMO_EMPLOYEES : recentEmployees;

  const statCards = [
    {
      label: "Total Employees",
      value: displayStats.total,
      icon: Users,
      iconBg: "bg-blue-50 dark:bg-blue-950",
      iconColor: "text-blue-500",
    },
    {
      label: "Active Employees",
      value: displayStats.active,
      icon: CheckCircle2,
      iconBg: "bg-green-50 dark:bg-green-950",
      iconColor: "text-green-500",
    },
    {
      label: "Inactive Employees",
      value: displayStats.inactive,
      icon: UserX,
      iconBg: "bg-red-50 dark:bg-red-950",
      iconColor: "text-red-500",
    },
    {
      label: "Departments",
      value: displayStats.departments,
      icon: Building2,
      iconBg: "bg-purple-50 dark:bg-purple-950",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 gap-6">
      {/* ── Main column ── */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold">Welcome, HR Admin 👋</h1>
          <p className="text-muted-foreground text-sm">
            Here&apos;s what&apos;s happening in your organization.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
            <div
              key={label}
              className="bg-card flex items-center justify-between rounded-xl border p-5 shadow-sm"
            >
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  {label}
                </p>
                <p className="mt-1 text-3xl font-bold">{value}</p>
              </div>
              <div className={cn("rounded-full p-3", iconBg)}>
                <Icon className={cn("h-5 w-5", iconColor)} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Employees */}
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-semibold">Recent Employees</h2>
            <Link
              href="/dashboard/employees"
              className="text-primary text-sm hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-xs">
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="px-6 py-3 text-left font-medium">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left font-medium">Job Title</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">Joined On</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {displayEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-muted/50 border-b transition-colors last:border-b-0"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                            getAvatarColor(emp.name),
                          )}
                        >
                          {getInitials(emp.name)}
                        </div>
                        <span className="font-medium">{emp.name}</span>
                      </div>
                    </td>
                    <td className="text-muted-foreground px-6 py-3">
                      {emp.department}
                    </td>
                    <td className="px-6 py-3">{emp.jobTitle}</td>
                    <td className="px-6 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          emp.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                        )}
                      >
                        {emp.status === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-6 py-3">
                      {formatDate(emp.joiningDate)}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        aria-label="More options"
                        className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_ACTIONS.map(
              ({ href, label, icon: Icon, iconBg, iconColor }) => (
                <Link
                  key={label}
                  href={href}
                  className="hover:bg-accent flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors"
                >
                  <div className={cn("rounded-full p-2.5", iconBg)}>
                    <Icon className={cn("h-5 w-5", iconColor)} />
                  </div>
                  {label}
                </Link>
              ),
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-muted-foreground pb-2 text-center text-xs">
          © 2026 Mini AI HR. All rights reserved.
        </p>
      </div>

      {/* ── AI Assistant panel ── */}
      <div className="bg-card flex w-80 shrink-0 flex-col rounded-xl border shadow-sm">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Bot className="text-primary h-5 w-5" />
          <h2 className="font-semibold">AI Assistant</h2>
        </div>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          <p className="text-muted-foreground mt-8 text-center text-xs">
            Ask me anything about your employees or HR tasks.
          </p>
        </div>
        <div className="border-t p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {AI_CHIPS.map((chip) => (
              <button
                key={chip}
                className="hover:bg-accent rounded-full border px-2.5 py-0.5 text-xs transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your command..."
              className="bg-background focus:ring-ring flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            />
            <button className="bg-primary rounded-lg p-2 text-white transition-opacity hover:opacity-90">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
