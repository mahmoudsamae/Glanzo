"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { acceptStaffInviteAction } from "../api";

type JoinInvitePanelProps = {
  token: string;
  shopName: string;
};

export function JoinInvitePanel({ token, shopName }: JoinInvitePanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function accept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptStaffInviteAction(token);
      if (!result.ok) {
        if (result.code === "ALREADY_MEMBER") {
          setError("Du bist bereits Mitglied dieses Salons.");
          return;
        }
        setError("Diese Einladung ist nicht mehr gültig.");
        return;
      }
      router.push("/d");
    });
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <p className="text-base text-[var(--text-2)]">
        Du trittst <strong className="text-[var(--text-0)]">{shopName}</strong> als Barber bei.
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="button" className="w-full" disabled={isPending} onClick={accept}>
        Einladung annehmen
      </Button>
    </div>
  );
}
