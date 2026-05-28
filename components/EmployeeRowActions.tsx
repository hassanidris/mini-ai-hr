"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreVertical, Pencil, UserCheck, UserX, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setEmployeeStatus } from "@/actions/employees";
import { EmployeeStatus } from "@/db/generated/enums";

type Props = {
  employeeId: string;
  employeeName: string;
  status: EmployeeStatus;
};

export default function EmployeeRowActions({
  employeeId,
  employeeName,
  status,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isActive = status === EmployeeStatus.ACTIVE;

  function handleToggleStatus() {
    const newStatus = isActive
      ? EmployeeStatus.INACTIVE
      : EmployeeStatus.ACTIVE;
    const label = isActive ? "Deactivate" : "Activate";
    const confirmed = window.confirm(`${label} ${employeeName}?`);
    if (!confirmed) return;

    startTransition(async () => {
      try {
        const { errorMessage } = await setEmployeeStatus(employeeId, newStatus);
        if (errorMessage) {
          toast.error(errorMessage);
        } else {
          toast.success(
            `${employeeName} has been ${isActive ? "deactivated" : "activated"}.`,
          );
          router.refresh();
        }
      } catch {
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="More options"
          disabled={isPending}
          className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/employees/${employeeId}/edit`)}
        >
          <Pencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant={isActive ? "destructive" : "default"}
          onClick={handleToggleStatus}
        >
          {isActive ? <UserX /> : <UserCheck />}
          {isActive ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
