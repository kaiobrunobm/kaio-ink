'use client'
import { useState } from "react";
import BookingFunnel from "@/components/BookingFunnel";
import { Header } from "@/components/main/Header";
import { HeroSection } from "@/components/main/HeroSection";
import { FlashTattooSection } from "@/components/main/FlashTattooSection";
import { AboutSection } from "@/components/main/AboutSection";
import { Footer } from "@/components/main/Footer";
import { PromotionBanner } from "@/components/main/PromotionBanner";

export default function Page() {

  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#fbfbf9] text-[#111111] selection:bg-[#111111] selection:text-[#fbfbf9] font-sans relative scroll-smooth">
      <PromotionBanner />
      <Header openModal={setIsBookingOpen} />
      <HeroSection openModal={setIsBookingOpen}/>
      <FlashTattooSection openModal={setIsBookingOpen}/>
      <AboutSection/>
      <Footer/>

      <BookingFunnel 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
      />
    </main>
  )
}
