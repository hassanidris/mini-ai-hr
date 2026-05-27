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
    <header className="bg-popover relative flex h-24 w-full items-center justify-between px-3 sm:px-8">
      <Link href="/" className="flex items-end gap-2">
        <Image
          src="/logo.png"
          alt="Mini AI HR Logo"
          width={64}
          height={64}
          priority
          style={{ width: 64, height: 64 }}
        />
        <h1 className="flex flex-col text-2xl font-semibold">Mini AI HR</h1>
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
