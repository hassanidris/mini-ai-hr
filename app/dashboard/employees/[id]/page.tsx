import { getEmployee } from "@/actions/employees";
import { getUser } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Pencil,
  Mail,
  Briefcase,
  Building2,
  CalendarDays,
  BadgeCheck,
} from "lucide-react";
import DeactivateButton from "@/components/DeactivateButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERN: "Intern",
};

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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/");

  const { id } = await params;
  const { data: employee, errorMessage } = await getEmployee(id);

  if (errorMessage === "Employee not found.") notFound();
  if (!employee) {
    return (
      <div className="text-muted-foreground py-20 text-center text-sm">
        {errorMessage}
      </div>
    );
  }

  const isActive = employee.status === "ACTIVE";

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back link */}
      <Link
        href="/dashboard/employees"
        className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Employees
      </Link>

      <div className="bg-card rounded-xl border shadow-sm">
        {/* Profile header */}
        <div className="flex flex-col items-start justify-between gap-4 border-b px-6 py-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white",
                getAvatarColor(employee.name),
              )}
            >
              {getInitials(employee.name)}
            </div>
            <div>
              <h1 className="text-xl font-bold">{employee.name}</h1>
              <p className="text-muted-foreground text-sm">
                {employee.jobTitle}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <Badge
            variant={isActive ? "default" : "destructive"}
            className={
              isActive
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : ""
            }
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Details grid */}
        <div className="grid gap-0 sm:grid-cols-2">
          {[
            { icon: Mail, label: "Email", value: employee.email },
            {
              icon: Building2,
              label: "Department",
              value: employee.department,
            },
            {
              icon: Briefcase,
              label: "Employment Type",
              value:
                EMPLOYMENT_LABELS[employee.employmentType] ??
                employee.employmentType,
            },
            {
              icon: CalendarDays,
              label: "Joined On",
              value: formatDate(employee.joiningDate),
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-3 border-b px-6 py-4 last:border-b-0 sm:nth-last-2:border-b-0"
            >
              <div className="bg-muted mt-0.5 rounded-md p-1.5">
                <Icon className="text-muted-foreground h-4 w-4" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-3 border-t px-6 py-4">
          <Button size="lg" asChild>
            <Link href={`/dashboard/employees/${employee.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>

          {isActive && (
            <DeactivateButton
              employeeId={employee.id}
              employeeName={employee.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}
