import React from "react"

interface heroSectionProps {
  openModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const HeroSection: React.FC<heroSectionProps> = ({openModal}) => {
  return (
    <section className="flex flex-col items-center relative pt-24 pb-20 overflow-hidden px-5">  
      <div className="container max-w-5xl relative z-10 text-center space-y-8">

        <div className="flex flex-col items-center space-y-4 max-w-3xl mx-auto">      
            <h1 className="text-4xl sm:text-7xl font-bbh uppercase tracking-widest text-foreground leading-[1.1] font-black">
              Kaio.ink
            </h1>
        </div>

        <p className="text-muted-foreground sm:text-sm max-w-lg mx-auto font-light leading-relaxed">
          Estúdio privado focado na criação de artes autorais exclusivas. Explore os flashes disponíveis abaixo, selecione sua data preferida e agende diretamente pelo WhatsApp. Orçamento personalizado pós-contato.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button 
            onClick={() => openModal(true)}
            className="font-mono font-bold text-sm text-white bg-black px-8 py-2 transition-all duration-150 ease-in uppercase hover:bg-transparent hover:text-black hover:pb-0 hover:border-b-2 hover:border-black"
          >
           Agendar sessão
          </button>
          <a 
            href="#portfolio"
            className="px-8 py-4 border border-border bg-white/40 backdrop-blur-sm text-[10px] uppercase tracking-[0.25em] font-bold hover:border-black transition-all duration-150 flex items-center justify-center gap-2"
          >
            Ver portfólio
          </a>
        </div>
      </div>
  </section>
  )
}
