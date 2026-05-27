import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="rounded-lg bg-card p-6 shadow">
        <p className="text-lg">Welcome, {user.email}!</p>
        <p className="mt-2 text-muted-foreground">
          This is your HR Dashboard. More features coming soon.
        </p>
      </div>
    </div>
  );
}
