import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import DarkModeToggle from "./DarkModeToggle";
import LogOutButton from "./LogOutButton";
import { getUser } from "@/lib/supabase/server";

async function Header() {
  const user = await getUser(); // Replace with actual user authentication logic
  return (
    <header className="bg-sidebar border-sidebar-border relative flex h-24 w-full items-center justify-between border-b px-3 sm:px-8">
      <Link href="/" className="flex items-end gap-2">
        <Image
          src="/logo-main.png"
          alt="Mini AI HR Logo"
          width={64}
          height={64}
          priority
          style={{ width: 64, height: 64 }}
        />
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-black tracking-tight">
            <span className="text-blue-950 dark:text-white">Mini </span>
            <span className="text-primary">AI</span>
            <span className="text-blue-950 dark:text-white"> HR</span>
          </h1>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
            Smart HR. Simple Management.
          </p>
        </div>
      </Link>
      <div className="flex gap-4">
        {
          user ? (
            <LogOutButton />
          ) : null /* TODO: add login/signup buttons here when not authenticated */
        }
        <DarkModeToggle />
      </div>
    </header>
  );
}

export default Header;
