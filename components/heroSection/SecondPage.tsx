import React from "react";

const SecondPage = () => {
  return (
    <section className="relative min-h-screen w-full bg-[#2d3554] flex flex-col items-center pt-20 pb-10">
      {/* The image lands here visually via the scroll animation above */}
      <div className="mt-12">
        <h2
          className="text-center text-2xl font-bold text-white mb-3"
          style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif" }}
        >
          What is Virtual Try-On Studio?
        </h2>
        <p className="text-center text-sm text-[#aaa] max-w-sm mx-auto leading-relaxed">
          Experience immersive AI-powered fashion previews with cinematic
          virtual try-on technology and modern interactive storytelling.
        </p>
      </div>
    </section>
  );
};

export default SecondPage;
