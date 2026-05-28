"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deactivateEmployee } from "@/actions/employees";
import { toast } from "sonner";
import { Loader2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { employeeId: string; employeeName: string };

export default function DeactivateButton({ employeeId, employeeName }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      `Deactivate ${employeeName}? This will mark them as inactive.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      const { errorMessage } = await deactivateEmployee(employeeId);
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.success(`${employeeName} has been deactivated.`);
        router.refresh();
      }
    });
  }

  return (
    <Button
      variant="destructive"
      size="lg"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UserX className="h-4 w-4" />
      )}
      {isPending ? "Deactivating…" : "Deactivate"}
    </Button>
  );
}
