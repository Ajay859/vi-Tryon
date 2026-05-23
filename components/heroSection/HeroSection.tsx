"use client";


import Image from "next/image";
import SecondPage from "./SecondPage";

export default function HeroSection() {


  return (
    <div
    style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    className="flex flex-col bg-[#ede9e0] overflow-hidden"
    >
      {/* ─── HERO ─── */}
      <section className="relative flex min-h-screen items-stretch">

        <div className="absolute inset-y-0 right-0 lg:w-[34%] w-[50%] bg-[#7a9472]" />

        {/* LEFT COLUMN */}
        <div className="relative ml-5 z-10 flex flex-1 items-center px-14 py-20 lg:px-20">
          <div className="max-w-[480px]">

            <p
              className="mb-6 text-[11px] uppercase tracking-[0.25em] text-[#999]"
            >
              AI Fashion Experience
            </p>

            <h1
              className="mb-7  text-[clamp(48px,5.5vw,72px)] font-bold leading-[0.93] text-[#1c1c1c]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Virtual
              <br  />
              Try-On
              <br />
              Studio
            </h1>

            {/* Body */}
            <p className="mb-10 max-w-[390px] text-[15px] leading-[1.75] text-[#6b6b6b]">
              Experience immersive AI-powered fashion previews with cinematic
              virtual try-on technology and modern interactive storytelling.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-[5px] bg-[#6f8c6a] px-7 py-[13px] text-[13px] font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90"
              >
                Try Now
              </button>
              <button
                className="rounded-[5px] border-[1.5px] border-[#1c1c1c] px-7 py-[13px] text-[13px] font-medium uppercase tracking-wider text-[#1c1c1c] transition hover:bg-[#1c1c1c] hover:text-white"
              >
                Explore
              </button>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex w-[32%] shrink-0 mt-20 mr-75 items-center justify-center py-12">
          <div
            className="relative overflow-hidden"
            style={{
              width: "clamp(260px, 35vw, 400px)",
              height: "clamp(320px, 35vw, 1000px)",
              borderRadius: "50% 50% 0 0 / 30% 30% 0 0",
            }}
          >
            <Image
              src="/images/5.png"
              alt="Fashion Model"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>
        
      </section>
      

      {/*second page */}
      <SecondPage/>

    </div>
  );
}