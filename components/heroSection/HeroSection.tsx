"use client";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "../MagneticButtons/MagneticButton";
gsap.registerPlugin(ScrollTrigger);

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200"],
});

export default function HeroSection() {
  const textRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        scrub: true,
        // markers: true,
        start: "top top",
        end: "bottom top",
      },
    });
    tl.to(
      textRef.current,
      {
        y: -250,
        opacity: "-0.9",
        ease: "none",
      },
      "a",
    )
      .to(
        imageRef.current,
        {
          x: "-700",
          ease: "none",
        },
        "a",
      )
      .to(
        imageRef.current,
        {
          y: "1000",
          ease: "none",
        },
        "a",
      );
  });

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full"
      style={{ backgroundColor: "#e8e6e2" }}
    >
      {/* ── Centered model image ── */}
      <div className="absolute inset-0 flex items-end justify-center z-50">
        <Image
          ref={imageRef}
          src="/images/3.png"
          alt="Model wearing Dolenga Wear"
          width={600}
          height={680}
          className="object-contain object-bottom  translate-y-18 h-[103%] 
     drop-shadow-2xl "
          priority
        />
      </div>

      {/* ── Bottom-left text block ── */}
      <div
        ref={textRef}
        className="absolute  top-1/2 -translate-y-5 translate-x-19  left-10 z-10"
      >
        <h1
          className={`
        ${montserrat.className}

        text-9xl
        font-black
        uppercase
        leading-[0.99]
      `}
        >
          <span className="block  translate-x-29">fashion</span>
          WEAR
        </h1>
        <p className="mt-4 max-w-55 text-[19px] leading-snug text-[#555]">
          Choose best outfits with
          <br />
          <span className="flex gap-[5px]">
            your personal
            <MagneticButton>AI Assistant</MagneticButton>
          </span>
        </p>
      </div>
    </section>
  );
}
