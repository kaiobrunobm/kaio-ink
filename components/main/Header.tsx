import React from "react";
import { Button } from "../ui/button";

interface headerProps {
  openModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Header: React.FC<headerProps> = ({openModal}) => {
  return (
    <header className="py-5 px-2 sticky top-0 bg-[#fbfbf9]/95 backdrop-blur-md z-30 transition-all duration-150">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">

          <div className="w-12 h-12 overflow-hidden bg-transparent p-1">
            {/* TODO: Add Logo */}
            <div className="sm:block w-full h-full bg-black rounded-full" />
          </div>

          <div className="flex flex-col">
            <span className="font-bbh text-xs uppercase tracking-[0.25em] font-black leading-none">
                Kaio.ink
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
                Studio
              </span>
            </div>
          </div>

          <nav className="hidden font-mono md:flex gap-8 text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          <a href="#portfolio" className="hover:text-foreground transition-all hover:underline">
            Disponíveis
          </a>
          <a href="#como-funciona" className="hover:text-foreground transition-all hover:underline">
            Como Funciona
          </a>
          </nav>

          <button onClick={() => openModal(true)} className="font-mono font-bold text-white bg-black px-6 py-2 transition-all duration-150 ease-in uppercase hover:bg-transparent hover:text-black hover:pb-0 hover:border-b-2 hover:border-black">
            Agendar
          </button>
      </div>
    </header>

  )
}
