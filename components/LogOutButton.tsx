"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const LogOutButton = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogOut = async () => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const errorMessage = null;

    if (!errorMessage) {
      toast.success("Logged out", {
        description: "You have been logged out successfully.",
      });
      setLoading(false);
      router.push("/");
    } else {
      toast.error("Error", {
        description: errorMessage,
      });
      setLoading(false);
    }
  };
  return (
    <Button
      className="w-24"
      variant="outline"
      onClick={handleLogOut}
      disabled={loading}
    >
      {loading ? <Loader2 className="animate-spin" /> : "Log Out"}
    </Button>
  );
};

export default LogOutButton;
