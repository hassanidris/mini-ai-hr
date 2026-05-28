"use server";

import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { EmploymentType, EmployeeStatus } from "@/db/generated/enums";
import { getUser } from "@/lib/supabase/server";

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

async function requireAuth() {
  const user = await getUser();
  if (!user) throw new Error("Unauthenticated");
  return user;
}

function parseDate(value: string): Date {
  const d = new Date(value);
  if (isNaN(d.getTime())) throw new Error("Invalid date: " + value);
  return d;
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function createEmployee(data: EmployeeFormData) {
  try {
    await requireAuth();

    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();
    const jobTitle = data.jobTitle?.trim();
    const department = data.department?.trim();
    const joiningDateRaw = data.joiningDate?.trim();

    if (!name) return { data: null, errorMessage: "Name is required." };
    if (!email) return { data: null, errorMessage: "Email is required." };
    if (!jobTitle)
      return { data: null, errorMessage: "Job title is required." };
    if (!department)
      return { data: null, errorMessage: "Department is required." };
    if (!joiningDateRaw)
      return { data: null, errorMessage: "Joining date is required." };

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        jobTitle,
        department,
        employmentType: data.employmentType,
        joiningDate: parseDate(joiningDateRaw),
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
    await requireAuth();
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
    await requireAuth();
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
    await requireAuth();

    const updateData: {
      name?: string;
      email?: string;
      jobTitle?: string;
      department?: string;
      employmentType?: EmploymentType;
      joiningDate?: Date;
    } = {};

    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) return { data: null, errorMessage: "Name cannot be empty." };
      updateData.name = name;
    }
    if (data.email !== undefined) {
      const email = data.email.trim().toLowerCase();
      if (!email) return { data: null, errorMessage: "Email cannot be empty." };
      updateData.email = email;
    }
    if (data.jobTitle !== undefined) {
      const jobTitle = data.jobTitle.trim();
      if (!jobTitle)
        return { data: null, errorMessage: "Job title cannot be empty." };
      updateData.jobTitle = jobTitle;
    }
    if (data.department !== undefined) {
      const department = data.department.trim();
      if (!department)
        return { data: null, errorMessage: "Department cannot be empty." };
      updateData.department = department;
    }
    if (data.employmentType !== undefined) {
      updateData.employmentType = data.employmentType;
    }
    if (data.joiningDate !== undefined) {
      const joiningDateRaw = data.joiningDate.trim();
      if (!joiningDateRaw)
        return { data: null, errorMessage: "Joining date cannot be empty." };
      updateData.joiningDate = parseDate(joiningDateRaw);
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
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
    await requireAuth();
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

export async function setEmployeeStatus(id: string, status: EmployeeStatus) {
  try {
    await requireAuth();
    const employee = await prisma.employee.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/dashboard/employees");
    revalidatePath(`/dashboard/employees/${id}`);
    revalidatePath("/dashboard");
    return { data: employee, errorMessage: null };
  } catch (error) {
    console.error("[setEmployeeStatus]", error);
    return { data: null, ...handleError(error) };
  }
}

export async function getEmployeeStats() {
  try {
    await requireAuth();
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
