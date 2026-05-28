import { getEmployee } from "@/actions/employees";
import { getUser } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import EditEmployeeForm from "./EditEmployeeForm";

export default async function EditEmployeePage({
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

  return <EditEmployeeForm employee={employee} />;
}
