"use client";

import { useRef } from "react";
import gsap from "gsap";

type MagneticButtonProps = {
  children: React.ReactNode;
};

export default function MagneticButton({
  children,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // QUICK SETTERS
  const xTo = useRef<((value: number) => void) | null>(null);
  const yTo = useRef<((value: number) => void) | null>(null);

  const handleMouseEnter = () => {
    const button = buttonRef.current;

    if (!button) return;

    // CREATE QUICK ANIMATION FUNCTIONS
    xTo.current = gsap.quickTo(button, "x", {
      duration: 0.4,
      ease: "power3.out",
    });

    yTo.current = gsap.quickTo(button, "y", {
      duration: 0.4,
      ease: "power3.out",
    });
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const button = buttonRef.current;

    if (!button || !xTo.current || !yTo.current) return;

    const rect = button.getBoundingClientRect();

    // DISTANCE FROM CENTER
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // MOVE BUTTON
    xTo.current(x * 0.3);
    yTo.current(y * 0.3);
  };

  const handleMouseLeave = () => {
    if (!xTo.current || !yTo.current) return;

    // RESET POSITION
    xTo.current(0);
    yTo.current(0);
  };

  return (
    <button
    className="
    flex items-center justify-center gap-2

  "
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
}