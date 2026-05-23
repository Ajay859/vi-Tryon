import Link from "next/link";
import { MapIcon, MessageSquare, Sparkles } from "lucide-react";
import MagneticButton from "../MagneticButtons/MagneticButton";

export default function Navbar() {
  return (
    <nav className="fixed left-1/2  z-50 w-full  -translate-x-1/2">
      <div
        className="
          flex h-18 items-center justify-between

          bg-white/10

          px-6

          backdrop-blur-xl

          shadow-[0_8px_32px_rgba(0,0,0,0.08)]
        "
      >
        {/* LEFT SIDE */}
        <div className="flex items-center gap-8">
          {/* LOGO */}
          <Link href="/">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#6f8c6a] to-[#8fa88a] shadow-md">
                <MagneticButton>
                  <Sparkles className="h-5 w-5 text-white" />
                </MagneticButton>
              </div>

              <span className="text-[17px] font-semibold tracking-tight text-[#1d1d1d]">
                <MagneticButton>Feedback Fusion</MagneticButton>
              </span>
            </div>
          </Link>

          {/* NAV LINKS */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/roadmap"
              className="
                flex items-center gap-2
                text-sm font-medium  
                text-[#4d4d4d]
                transition-colors
                hover:text-black
              "
            >
              <MagneticButton>
                <MapIcon className="h-4 w-4" />
                Roadmap
              </MagneticButton>
            </Link>

            <Link
              href="/tryon"
              className="
                flex items-center gap-2
                text-sm font-medium
                text-[#4d4d4d]
                transition-colors
                hover:text-black
              "
            >
              <MessageSquare className="h-4 w-4" />
              Try-On
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE BUTTON */}
        <button
          className="
            rounded-xl
            bg-[#6f8c6a]

            px-6 py-3

            text-[12px]
            font-medium
            uppercase
            tracking-[0.15em]

            text-white

            transition-all
            hover:scale-[1.03]
            hover:bg-[#5f7c5a]
          "
        >
          Sign Up
        </button>
      </div>
    </nav>
  );
}
