import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/db/prisma";
import Link from "next/link";
import { Users, CheckCircle2, UserX, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import EmployeeRowActions from "@/components/EmployeeRowActions";
import { EmployeeStatus } from "@/db/generated/enums";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

// ── DEMO DATA — remove once real data is flowing ──────────────────────────
const DEMO_STATS = { total: 12, active: 9, inactive: 3, departments: 4 };
const DEMO_EMPLOYEES = [
  {
    id: "d1",
    name: "John Doe",
    department: "Engineering",
    jobTitle: "Software Engineer",
    status: EmployeeStatus.ACTIVE,
    joiningDate: new Date("2026-06-01"),
  },
  {
    id: "d2",
    name: "Emma Johnson",
    department: "Product",
    jobTitle: "Product Manager",
    status: EmployeeStatus.ACTIVE,
    joiningDate: new Date("2026-05-28"),
  },
  {
    id: "d3",
    name: "Michael Brown",
    department: "Design",
    jobTitle: "UI/UX Designer",
    status: EmployeeStatus.ACTIVE,
    joiningDate: new Date("2026-05-25"),
  },
  {
    id: "d4",
    name: "Olivia Smith",
    department: "Marketing",
    jobTitle: "Marketing Specialist",
    status: EmployeeStatus.INACTIVE,
    joiningDate: new Date("2026-05-20"),
  },
  {
    id: "d5",
    name: "Liam Wilson",
    department: "Sales",
    jobTitle: "Sales Executive",
    status: EmployeeStatus.ACTIVE,
    joiningDate: new Date("2026-05-18"),
  },
];
// ────────────────────────────────────────────────────────────────────────────

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
    status: EmployeeStatus;
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
    <div className="flex min-h-0 flex-1 flex-col gap-6">
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
          <Card
            key={label}
            className="flex-row items-center justify-between gap-0 p-5"
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
          </Card>
        ))}
      </div>

      {/* Recent Employees */}
      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold">Recent Employees</h2>
          <Link
            href="/dashboard/employees"
            className="text-primary text-sm hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs">
                <th className="px-6 py-3 text-left font-medium">Name</th>
                <th className="px-6 py-3 text-left font-medium">Department</th>
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
                    <Badge
                      variant={
                        emp.status === "ACTIVE" ? "default" : "destructive"
                      }
                      className={
                        emp.status === "ACTIVE"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : ""
                      }
                    >
                      {emp.status === "ACTIVE" ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground px-6 py-3">
                    {formatDate(emp.joiningDate)}
                  </td>
                  <td className="px-6 py-3">
                    <EmployeeRowActions
                      employeeId={emp.id}
                      employeeName={emp.name}
                      status={emp.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex-1" />
      <p className="text-muted-foreground pb-2 text-center text-xs">
        © 2026 Mini AI HR. All rights reserved.
      </p>
    </div>
  );
}
