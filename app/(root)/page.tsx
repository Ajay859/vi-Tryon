import HeroSection from "@/components/heroSection/HeroSection";
import Navbar from "@/components/heroSection/Navbar";
import SecondPage from "@/components/heroSection/SecondPage";

export default function HomePage() {
  return (
    <div>
      {/* navbar */}
      <Navbar />

      <HeroSection />
      <SecondPage />

      {/* hero section  */}
    </div>
  );
}
