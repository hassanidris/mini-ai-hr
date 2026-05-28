"use server";

import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { EmploymentType, EmployeeStatus } from "@/db/generated/enums";

// ── Types ─────────────────────────────────────────────────────────────────────

export type EmployeeFormData = {
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  employmentType: EmploymentType;
  joiningDate: string; // ISO date string from <input type="date">
};

export type EmployeeRow = {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  employmentType: EmploymentType;
  joiningDate: Date;
  status: EmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDate(value: string): Date {
  const d = new Date(value);
  if (isNaN(d.getTime())) throw new Error("Invalid date: " + value);
  return d;
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function createEmployee(data: EmployeeFormData) {
  try {
    const employee = await prisma.employee.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        jobTitle: data.jobTitle.trim(),
        department: data.department.trim(),
        employmentType: data.employmentType,
        joiningDate: parseDate(data.joiningDate),
      },
    });

    revalidatePath("/dashboard/employees");
    revalidatePath("/dashboard");
    return { data: employee, errorMessage: null };
  } catch (error) {
    console.error("[createEmployee]", error);
    return { data: null, ...handleError(error) };
  }
}

export async function listEmployees(): Promise<
  | { data: EmployeeRow[]; errorMessage: null }
  | { data: null; errorMessage: string }
> {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });

    return { data: employees as EmployeeRow[], errorMessage: null };
  } catch (error) {
    console.error("[listEmployees]", error);
    return { data: null, ...handleError(error) };
  }
}

export async function getEmployee(
  id: string,
): Promise<
  | { data: EmployeeRow; errorMessage: null }
  | { data: null; errorMessage: string }
> {
  try {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) return { data: null, errorMessage: "Employee not found." };
    return { data: employee as EmployeeRow, errorMessage: null };
  } catch (error) {
    console.error("[getEmployee]", error);
    return { data: null, ...handleError(error) };
  }
}

export async function updateEmployee(
  id: string,
  data: Partial<EmployeeFormData>,
) {
  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.email ? { email: data.email.trim().toLowerCase() } : {}),
        ...(data.jobTitle ? { jobTitle: data.jobTitle.trim() } : {}),
        ...(data.department ? { department: data.department.trim() } : {}),
        ...(data.employmentType ? { employmentType: data.employmentType } : {}),
        ...(data.joiningDate
          ? { joiningDate: parseDate(data.joiningDate) }
          : {}),
      },
    });

    revalidatePath("/dashboard/employees");
    revalidatePath(`/dashboard/employees/${id}`);
    revalidatePath("/dashboard");
    return { data: employee, errorMessage: null };
  } catch (error) {
    console.error("[updateEmployee]", error);
    return { data: null, ...handleError(error) };
  }
}

export async function deactivateEmployee(id: string) {
  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    revalidatePath("/dashboard/employees");
    revalidatePath(`/dashboard/employees/${id}`);
    revalidatePath("/dashboard");
    return { data: employee, errorMessage: null };
  } catch (error) {
    console.error("[deactivateEmployee]", error);
    return { data: null, ...handleError(error) };
  }
}

export async function getEmployeeStats() {
  try {
    const [total, active, inactive, allDepts] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: "ACTIVE" } }),
      prisma.employee.count({ where: { status: "INACTIVE" } }),
      prisma.employee.findMany({ select: { department: true } }),
    ]);

    return {
      data: {
        total,
        active,
        inactive,
        departments: new Set(allDepts.map((d) => d.department)).size,
      },
      errorMessage: null,
    };
  } catch (error) {
    console.error("[getEmployeeStats]", error);
    return { data: null, ...handleError(error) };
  }
}
