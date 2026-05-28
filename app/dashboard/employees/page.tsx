import { listEmployees } from "@/actions/employees";
import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-GB", {
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

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERN: "Intern",
};

export default async function EmployeesPage() {
  const user = await getUser();
  if (!user) redirect("/");

  const { data: employees, errorMessage } = await listEmployees();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-muted-foreground text-sm">
            {errorMessage
              ? "Could not load employees."
              : `${employees?.length ?? 0} employee${(employees?.length ?? 0) !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <Link
          href="/dashboard/employees/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Link>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm">
        {errorMessage ? (
          <div className="text-muted-foreground flex flex-col items-center gap-3 py-20 text-center">
            <Users className="h-10 w-10 opacity-30" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        ) : employees && employees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-xs">
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="px-6 py-3 text-left font-medium">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left font-medium">Job Title</th>
                  <th className="px-6 py-3 text-left font-medium">Type</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">Joined</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
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
                        <div>
                          <p className="font-medium">{emp.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted-foreground px-6 py-3">
                      {emp.department}
                    </td>
                    <td className="px-6 py-3">{emp.jobTitle}</td>
                    <td className="text-muted-foreground px-6 py-3">
                      {EMPLOYMENT_LABELS[emp.employmentType] ??
                        emp.employmentType}
                    </td>
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
                      <Link
                        href={`/dashboard/employees/${emp.id}`}
                        className="text-primary text-xs font-medium hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center gap-3 py-20 text-center">
            <Users className="h-10 w-10 opacity-30" />
            <p className="text-sm">No employees found.</p>
            <Link
              href="/dashboard/employees/new"
              className="text-primary text-sm hover:underline"
            >
              Add your first employee
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
