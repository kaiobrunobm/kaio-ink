import React from "react";
import { Button } from "../ui/button";

interface headerProps {
  openModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Header: React.FC<headerProps> = ({openModal}) => {
  return (
    <header className="py-4 sm:py-5 px-2 sm:px-5 sticky top-0 backdrop-blur-lg z-50 transition-all duration-150 border-b border-border/40">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3">

          <div className="hidden sm:block w-10 h-10 sm:w-12 sm:h-12 overflow-hidden bg-transparent p-1">
            {/* TODO: Add Logo */}
            <div className="w-full h-full bg-black rounded-full" />
          </div>

          <div className="flex flex-col">
            <span className="font-bbh text-xs sm:text-sm uppercase tracking-[0.25em] font-black leading-none">
                Kaio.ink
              </span>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
                Studio
              </span>
            </div>
          </div>

          <nav className="hidden font-mono md:flex gap-8 text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          <a href="#portfolio" className="hover:text-black transition-all hover:underline">
            Disponíveis
          </a>
          <a href="#como-funciona" className="hover:text-black transition-all hover:underline">
            Como Funciona
          </a>
          </nav>

          <button onClick={() => openModal(true)} className="h-8 font-mono font-bold text-white bg-black px-4 sm:px-6 py-2 text-[10px] sm:text-xs transition-all duration-150 ease-in uppercase hover:bg-transparent hover:text-black hover:pb-0 hover:border-b-2 hover:border-black shrink-0">
            Agendar
          </button>
      </div>
    </header>

  )
}
