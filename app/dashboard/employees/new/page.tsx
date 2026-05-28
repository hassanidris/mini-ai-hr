"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createEmployee } from "@/actions/employees";
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
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

export default function NewEmployeePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>("FULL_TIME");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const { errorMessage } = await createEmployee({
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
        toast.success("Employee created successfully.");
        router.push("/dashboard/employees");
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back link */}
      <Link
        href="/dashboard/employees"
        className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Employees
      </Link>

      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold">Add Employee</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Fill in the details below to create a new employee record.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name + Email */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="name" label="Full Name">
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Jane Doe"
              />
            </Field>
            <Field id="email" label="Email Address">
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="jane@company.com"
              />
            </Field>
          </div>

          {/* Job Title + Department */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="jobTitle" label="Job Title">
              <Input
                id="jobTitle"
                name="jobTitle"
                type="text"
                required
                placeholder="e.g. Software Engineer"
              />
            </Field>
            <Field id="department" label="Department">
              <Input
                id="department"
                name="department"
                type="text"
                required
                placeholder="e.g. Engineering"
              />
            </Field>
          </div>

          {/* Employment Type + Joining Date */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="employmentType" label="Employment Type">
              <Select
                value={employmentType}
                onValueChange={(v) => setEmploymentType(v as EmploymentType)}
              >
                <SelectTrigger id="employmentType" className="w-full">
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
            <Field id="joiningDate" label="Joining Date">
              <Input id="joiningDate" name="joiningDate" type="date" required />
            </Field>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="lg" asChild>
              <Link href="/dashboard/employees">Cancel</Link>
            </Button>
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Creating…" : "Create Employee"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
