import { QuestionIcon } from "@phosphor-icons/react";
import React from "react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Badge } from "../ui/badge";

type flash = {
  id: number;
  title: string;
  style: string;
  img: string;
  size: string;
  available: boolean;
}

interface flashTattooSectionProps {
  openModal: React.Dispatch<React.SetStateAction<boolean>>;
  flashList: flash[]
}

export const FlashTattooSection: React.FC<flashTattooSectionProps> = ({openModal, flashList}) => {
  return (
    <section id="portfolio" className="flex flex-col items-center py-24 bg-white/30 px-5">
    <div className="container max-w-6xl space-y-12">
      
      <div className="text-center space-y-3">
        <span className="text-xs uppercase text-muted-foreground font-mono font-bold">Galeria ativa</span>
        <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-[0.15em] font-bbh">Desenhos disponiveis</h2>
        <div className="w-12 h-px bg-accent mx-auto mt-2"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {flashList.map((item) => (
          <div 
            key={item.id} 
            className="group bg-white p-4 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="aspect-3/4 w-full overflow-hidden bg-[#fafafa] relative">
              <img 
                src={item.img} 
                alt={item.title} 
                className="w-full h-full object-contain p-4 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 font-mono">
                {item.available ? <Badge variant="secondary">Disponível</Badge> : <Badge variant="destructive">Indisponível</Badge> }
              </div>
            </div>
            
            <div className="pt-4 flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h3 className="text-xs font-sans uppercase tracking-wider font-bold">{item.title}</h3>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{item.style}</p>
              </div>
              <HoverCard>
                

                <HoverCardTrigger>
                  <button className="md:block hidden cursor-pointer hover:text-muted-foreground">
                    <QuestionIcon size={24} />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent>

                </HoverCardContent>
              </HoverCard>
    
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
  )
}
