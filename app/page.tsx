import AuthForm from "@/components/AuthForm";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function Home() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="mt-20 flex flex-1 flex-col items-center">
      <Card className="w-full max-w-md p-8">
        <CardHeader className="mb-4">
          <CardTitle className="text-center text-3xl">Welcome</CardTitle>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            Sign in to your account or create a new one
          </p>
        </CardHeader>

        <AuthForm type="login" />
      </Card>
    </div>
  );
}
