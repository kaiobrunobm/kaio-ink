import { QuestionIcon } from "@phosphor-icons/react";
import React from "react";
import { motion } from "framer-motion";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type flash = {
  id: number;
  title: string;
  style: string;
  img: string;
  size: string;
  available: boolean;
  value?: number;
  recommendedBodyPart?: string;
}

interface flashTattooSectionProps {
  openModal: React.Dispatch<React.SetStateAction<boolean>>;
  flashList: flash[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const FlashGrid = ({ items }: { items: flash[] }) => (
  <motion.div 
    variants={containerVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.1 }}
    className="grid grid-cols-1 md:grid-cols-3 gap-8"
  >
    {items.map((item) => (
      <motion.div 
        key={item.id} 
        variants={itemVariants}
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
            <HoverCardContent className="w-64 bg-white/95 backdrop-blur-sm border-accent/20 p-5 shadow-2xl">
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-muted pb-3">
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">Valor estimado</h4>
                    <p className="text-lg font-bbh uppercase leading-none">R$ {item.value || "---"}</p>
                  </div>
               
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">Tamanho</h4>
                    <p className="text-xs font-bold uppercase">{item.size}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">Local sugerido</h4>
                    <p className="text-xs font-bold uppercase">{item.recommendedBodyPart || "Qualquer local"}</p>
                  </div>
                </div>

                <p className="text-[9px] text-muted-foreground leading-relaxed italic border-t border-muted pt-3">
                  * Orçamento final será confirmado via WhatsApp após análise da anatomia.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

export const FlashTattooSection: React.FC<flashTattooSectionProps> = ({openModal, flashList}) => {

  const availableArt = flashList.filter(item => item.available);
  const tattoosDone = flashList.filter(item => !item.available);

  return (
    <section id="portfolio" className="flex flex-col items-center py-24 bg-white/30 px-5 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="container max-w-6xl space-y-12"
      >
        
        <div className="text-center space-y-3">
          <span className="text-xs uppercase text-muted-foreground font-mono font-bold">Galeria ativa</span>
          <h2 className="text-xl sm:text-3xl font-display uppercase tracking-[0.15em] font-bbh">Portfolio & Flashes</h2>
          <div className="w-12 h-px bg-accent mx-auto mt-2"></div>
        </div>


        <Tabs defaultValue="available" className="w-full flex flex-col items-center justify-around">
          <TabsList className="mb-8" variant="line">
            <TabsTrigger value="available" className="uppercase tracking-widest text-[10px] md:text-xs px-1 md:px-6 font-mono">Desenhos Disponíveis</TabsTrigger>
            <TabsTrigger value="done" className="uppercase tracking-widest text-[10px] md:text-xs px-1 md:px-6 font-mono">Tatuagens Feitas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="w-full">
            <FlashGrid items={availableArt} />
          </TabsContent>
          
          <TabsContent value="done" className="w-full">
            <FlashGrid items={tattoosDone} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </section>
  )
}
