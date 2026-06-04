import React from "react"
import { motion } from "framer-motion"

interface heroSectionProps {
  openModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const HeroSection: React.FC<heroSectionProps> = ({openModal}) => {
  return (
    <section className="flex flex-col items-center relative pt-24 pb-20 overflow-hidden px-5">  
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container max-w-5xl relative z-10 text-center space-y-8"
      >


        <div className="relative flex flex-col items-center space-y-4 max-w-3xl mx-auto w-full py-4 sm:py-8">      
            {/* Background Seal Logo */}''
            <div className="absolute top-40 -right-90 rotate-24 -translate-y-1/2 translate-x-[-40%] sm:translate-x-[-30%] -z-10 opacity-20 mix-blend-multiply pointer-events-none select-none">
              <img src="/logo.png" alt="Selo Kaio Ink" className="w-64 sm:w-[28rem] object-contain" />
            </div>

            <h1 className="text-3xl sm:text-7xl font-bbh uppercase tracking-widest text-black leading-[1.1] relative z-10">
              Kaio.ink
            </h1>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-muted-foreground sm:text-sm max-w-lg mx-auto font-light leading-relaxed"
        >
          Estúdio privado focado na criação de artes autorais exclusivas. Explore os flashes disponíveis abaixo, selecione sua data preferida e agende diretamente pelo WhatsApp. Orçamento personalizado pós-contato.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
        >
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
        </motion.div>
      </motion.div>
  </section>
  )
}
