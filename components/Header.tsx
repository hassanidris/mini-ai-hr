import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import DarkModeToggle from "./DarkModeToggle";
import LogOutButton from "./LogOutButton";

const Header = () => {
  const user = 1; // Replace with actual user authentication logic
  return (
    <header className="bg-popover relative flex h-24 w-full items-center justify-between px-3 sm:px-8">
      <Link href="/" className="flex items-end gap-2">
        <Image
          src="/logo.png"
          alt="Mini AI HR Logo"
          width={60}
          height={60}
          className="mr-2 inline-block"
          priority
        />
        <h1 className="flex flex-col pb-1 text-2xl leading-6 font-semibold">
          Mini AI HR
        </h1>
      </Link>
      <div className="flex gap-4">
        {user ? (
          <LogOutButton />
        ) : (
          <>
            <Button asChild className="hidden sm:block">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
          </>
        )}
        <DarkModeToggle />
      </div>
    </header>
  );
};

export default Header;
