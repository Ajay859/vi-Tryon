"use client";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google";
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

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600"],
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
        markers: true,
        // pin: true,
        start: "top top",
        end: "bottom top",
      },
    });
    tl.to(
      textRef.current,
      {
        y: -250,
        opacity: 0,
        ease: "none",
        duration: 2,
      },
      0,
    ).to(
      imageRef.current,
      {
        x: "-26vw",
        y: "100vh",
        duration: 3,
        ease: "none",
      },
      0,
    );
  });

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full"
      style={{ backgroundColor: "#e8e6e2" }}
    >
      {/* ── Centered model image ── */}
      <div className="absolute inset-0 flex items-end justify-center z-3 ">
        <Image
          ref={imageRef}
          src="/images/3.png"
          alt="Model wearing Dolenga Wear"
          width={600}
          height={680}
          className="object-contain object-bottom  translate-y-18 h-[90vh] 
     drop-shadow-2xl w-auto "
          priority
        />
      </div>

      {/* ── Bottom-left text block ── */}
      <div
        ref={textRef}
        className="absolute  top-1/2 -translate-y-5 translate-x-19  left-10 z-4"
      >
        <h1
          className={`
        ${montserrat.className}
        text-[clamp(48px,8vw,120px)]
        
        font-black
        uppercase
        leading-[0.99]
      `}
        >
          <span className="block   translate-x-29">fashion</span>
          WEAR
        </h1>
        <p
          className={` ${cormorant.className} tracking-wide italic mt-4 max-w-55 text-[clamp(20px,2vw,13px)] leading-snug text-[#555]`}
        >
          Choose best outfits with
          <br />
          <span className="flex gap-1.25">
            your personal
            <MagneticButton>AI Assistant</MagneticButton>
          </span>
        </p>
      </div>
    </section>
  );
}
