"use client";

import { motion, useReducedMotion } from "motion/react";

const bubbles = [
  {
    className: "absolute -right-16 -top-14 h-72 w-72 rounded-full bg-white/6 sm:h-80 sm:w-80",
    x: [0, -12, 8, 0],
    y: [0, 10, -8, 0],
    scale: [1, 1.04, 0.99, 1],
    opacity: [0.6, 0.72, 0.64, 0.6],
    duration: 18,
    delay: 0.4,
  },
  {
    className: "absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-white/8 sm:h-52 sm:w-52",
    x: [0, 10, -6, 0],
    y: [0, -12, 8, 0],
    scale: [1, 1.05, 1.01, 1],
    opacity: [0.78, 0.66, 0.74, 0.78],
    duration: 22,
    delay: 1.3,
  },
] as const;

export function RegisterBubbles() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {bubbles.map((bubble, index) => (
        <motion.div
          key={index}
          className={`${bubble.className} will-change-transform`}
          initial={false}
          animate={
            shouldReduceMotion
              ? { x: 0, y: 0, scale: 1, opacity: bubble.opacity[0] }
              : {
                  x: bubble.x,
                  y: bubble.y,
                  scale: bubble.scale,
                  opacity: bubble.opacity,
                }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: bubble.duration,
                  delay: bubble.delay,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "mirror",
                }
          }
        />
      ))}
    </div>
  );
}
