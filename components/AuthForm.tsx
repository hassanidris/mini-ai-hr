"use client";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CardContent, CardFooter } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useTransition } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

type Props = {
  type: "login" | "signUp";
};

const AuthForm = ({ type }: Props) => {
  const isLogin = type === "login";

  const router = useRouter();
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    console.log("Form submitted");
  };
  return (
    <form action={handleSubmit}>
      <CardContent className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email" className="mb-2">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            placeholder="Enter your email"
            type="email"
            required
            disabled={isPending}
            className="mb-4"
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password" className="mb-2">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            placeholder="Enter your password"
            type="password"
            required
            disabled={isPending}
            className="mb-4"
          />
        </div>
      </CardContent>
      <CardFooter className="mt-4 flex flex-col gap-4 border-none bg-transparent">
        <Button className="w-full">
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : isLogin ? (
            "Login"
          ) : (
            "Sign Up"
          )}
        </Button>
        <p className="text-xs">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link
            href={isLogin ? "/sign-up" : "/login"}
            className={`text-blue-500 underline ${isPending ? "pointer-events-none opacity-50" : ""}`}
          >
            {isLogin ? "Sign Up" : "Login"}
          </Link>
        </p>
      </CardFooter>
    </form>
  );
};

export default AuthForm;
