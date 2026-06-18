"use client";

import { useReducedMotion } from "framer-motion";
import { div as MotionDiv } from "framer-motion/m";
import type { ReactNode } from "react";

import { duration, easing, staggerContainer, fadeSlideIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function AuthMotionShell({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <MotionDiv
      className={cn(className)}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.expressive, ease: [...easing.enter] }}
    >
      {children}
    </MotionDiv>
  );
}

export function AuthBrandMotion({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <MotionDiv
      variants={staggerContainer(reducedMotion)}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-[var(--space-6)]"
    >
      {children}
    </MotionDiv>
  );
}

export function AuthBrandLine({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <MotionDiv variants={fadeSlideIn(reducedMotion)} className={className}>
      {children}
    </MotionDiv>
  );
}
