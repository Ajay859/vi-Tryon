"use client";
import Lenis from "lenis";
import { useEffect } from "react";

export default function SmoothScroller() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.7,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
  return null;
}
