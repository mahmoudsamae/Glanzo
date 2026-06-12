"use client";

import { useReducedMotion } from "framer-motion";
import { div as MotionDiv } from "framer-motion/m";

import { fadeSlideIn } from "@/lib/motion";

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <MotionDiv
      className="flex flex-1 flex-col"
      variants={fadeSlideIn(reducedMotion)}
      initial="hidden"
      animate="visible"
    >
      {children}
    </MotionDiv>
  );
}
