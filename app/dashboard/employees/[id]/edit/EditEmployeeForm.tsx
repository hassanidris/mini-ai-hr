"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateEmployee, type EmployeeRow } from "@/actions/employees";
import { EmploymentType } from "@/db/generated/enums";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERN", label: "Intern" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function toDateInputValue(date: Date) {
  return new Date(date).toISOString().split("T")[0];
}

type Props = { employee: EmployeeRow };

export default function EditEmployeeForm({ employee }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    employee.employmentType,
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const { errorMessage } = await updateEmployee(employee.id, {
        name: fd.get("name") as string,
        email: fd.get("email") as string,
        jobTitle: fd.get("jobTitle") as string,
        department: fd.get("department") as string,
        employmentType,
        joiningDate: fd.get("joiningDate") as string,
      });

      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.success("Employee updated successfully.");
        router.push(`/dashboard/employees/${employee.id}`);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back link */}
      <Link
        href={`/dashboard/employees/${employee.id}`}
        className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold">Edit Employee</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Update the details for{" "}
          <span className="text-foreground font-medium">{employee.name}</span>.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name + Email */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name">
              <Input
                name="name"
                type="text"
                required
                defaultValue={employee.name}
              />
            </Field>
            <Field label="Email Address">
              <Input
                name="email"
                type="email"
                required
                defaultValue={employee.email}
              />
            </Field>
          </div>

          {/* Job Title + Department */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Job Title">
              <Input
                name="jobTitle"
                type="text"
                required
                defaultValue={employee.jobTitle}
              />
            </Field>
            <Field label="Department">
              <Input
                name="department"
                type="text"
                required
                defaultValue={employee.department}
              />
            </Field>
          </div>

          {/* Employment Type + Joining Date */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Employment Type">
              <Select
                value={employmentType}
                onValueChange={(v) => setEmploymentType(v as EmploymentType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Joining Date">
              <Input
                name="joiningDate"
                type="date"
                required
                defaultValue={toDateInputValue(employee.joiningDate)}
              />
            </Field>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="lg" asChild>
              <Link href={`/dashboard/employees/${employee.id}`}>Cancel</Link>
            </Button>
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
