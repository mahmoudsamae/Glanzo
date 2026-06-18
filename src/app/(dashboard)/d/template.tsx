"use client";

import { useReducedMotion } from "framer-motion";
import { div as MotionDiv } from "framer-motion/m";

import { fadeIn } from "@/lib/motion";

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <MotionDiv
      className="salon-dash-content flex flex-1 flex-col"
      variants={fadeIn(reducedMotion)}
      initial="hidden"
      animate="visible"
    >
      {children}
    </MotionDiv>
  );
}
