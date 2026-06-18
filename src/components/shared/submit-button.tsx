"use client";

import { div as MotionDiv } from "framer-motion/m";

import { Button } from "@/components/ui/button";
import { pressScale } from "@/lib/motion";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  children: React.ReactNode;
  pending?: boolean;
  className?: string;
};

export function SubmitButton({ children, pending, className }: SubmitButtonProps) {
  const isSalonAuth = className?.includes("salon-auth-submit");

  return (
    <MotionDiv {...pressScale} className="w-full">
      <Button
        type="submit"
        className={cn(
          "w-full",
          isSalonAuth
            ? "salon-auth-submit h-11 border-0 shadow-none"
            : "bg-primary text-primary-foreground",
          className,
        )}
        disabled={pending}
      >
        {pending ? "One moment…" : children}
      </Button>
    </MotionDiv>
  );
}
