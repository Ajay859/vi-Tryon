"use client";
import Image from "next/image";
import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import slides from "../slides/Slides";

gsap.registerPlugin(ScrollTrigger);

const montserrat = Montserrat({ subsets: ["latin"], weight: ["700"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["600"] });

const SCROLL_PER_SLIDE = 700;

const SecondPage = () => {
  const sectionRef = useRef<HTMLElement>(null);

  // Arrays of refs for each slide's image + text
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    gsap.set([...imgRefs.current, ...textRefs.current], {
      opacity: 0,
      immediateRender: true,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        // Total pinned scroll = slides × scroll-per-slide
        end: `+=${slides.length * SCROLL_PER_SLIDE}`,
        pin: true,
        scrub: 1.5,
        markers: true,
      },
    });

    slides.forEach((_, i) => {
      if (i === 0) return; // slide 0 is visible by default

      const prevImg = imgRefs.current[i - 1];
      const prevText = textRefs.current[i - 1];
      const currImg = imgRefs.current[i];
      const currText = textRefs.current[i];

      // ── Exit previous slide ──
      tl.to(prevImg, {
        opacity: 0,
        x: -40,
        duration: 0.4,
      })
        .to(
          prevText,
          {
            opacity: 0,
            y: -24,
            duration: 0.3,
          },
          "<",
        ) // "<" = same time as above

        // ── Enter next slide ──
        .fromTo(
          currImg,
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 0.4 },
        )
        .fromTo(
          currText,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.3 },
          "<",
        );
    });
  });

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden flex items-center"
      style={{ backgroundColor: "#757575" }}
    >
      {slides.map((slide, index) => (
        <React.Fragment key={index}>
          {/* ── Image column (left 40%) ── */}
          <div
            ref={(el) => {
              imgRefs.current[index] = el;
            }}
            className={`
              absolute left-0 top-0 h-full w-[40%]
              flex items-end justify-center pl-10 pb-0
              transition-none
              ${index === 0 ? "opacity-100" : "opacity-0"}
            `}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              width={420}
              height={580}
              className="h-[82%] w-auto object-contain object-bottom drop-shadow-2xl"
              priority={index === 0}
            />
          </div>

          {/* ── Text column (right 60%) ── */}
          <div
            ref={(el) => {
              textRefs.current[index] = el;
            }}
            className={`
              absolute right-0 top-0 h-full w-[58%]
              flex flex-col justify-center pr-20
              ${index === 0 ? "opacity-100" : "opacity-0"}
            `}
          >
            {/* Slide counter */}
            <p className="text-[#bbb] text-sm tracking-[0.3em] uppercase mb-4">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(slides.length).padStart(2, "0")}
            </p>

            {/* Title */}
            <h2
              className={`${montserrat.className} text-[clamp(36px,5vw,72px)] font-bold uppercase leading-[0.95] text-white mb-6`}
            >
              {slide.title}
            </h2>

            {/* Divider */}
            <div className="w-16 h-[2px] bg-white/30 mb-6" />

            {/* Description */}
            <p
              className={`${cormorant.className} text-[clamp(16px,1.5vw,22px)] italic leading-relaxed text-[#ddd] max-w-md`}
            >
              {slide.desc}
            </p>
          </div>
        </React.Fragment>
      ))}

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {slides.map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40" />
        ))}
      </div>
    </section>
  );
};

export default SecondPage;
