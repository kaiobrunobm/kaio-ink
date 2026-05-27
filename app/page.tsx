'use client'
import { useState } from "react";
import BookingFunnel from "@/components/BookingFunnel";
import { portfolioItems } from "@/lib/data";
import { Header } from "@/components/main/Header";
import { HeroSection } from "@/components/main/HeroSection";
import { FlashTattooSection } from "@/components/main/FlashTattooSection";
import { AboutSection } from "@/components/main/AboutSection";
import { Footer } from "@/components/main/Footer";

export default function Page() {

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "flash">("all");

  const filteredPortfolio = activeTab === "all" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.size.includes("Flash"));

  return (
    <main className="min-h-screen bg-[#fbfbf9] text-[#111111] selection:bg-[#111111] selection:text-[#fbfbf9] font-sans relative overflow-x-hidden scroll-smooth">

      <Header openModal={setIsBookingOpen} />
      <HeroSection openModal={setIsBookingOpen}/>
      <FlashTattooSection openModal={setIsBookingOpen} flashList={portfolioItems}/>
      <AboutSection/>
      <Footer/>

      <BookingFunnel 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
      />
    </main>
  )
}
