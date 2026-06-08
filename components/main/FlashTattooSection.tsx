import { QuestionIcon, CaretLeftIcon, CaretRightIcon, MagnifyingGlassPlusIcon, XIcon } from "@phosphor-icons/react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { 
  Drawer, 
  DrawerContent, 
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";

type flash = {
  id: number;
  title: string;
  style: string;
  img: string;
  imgFresh?: string;
  imgHealed?: string;
  size: string;
  available: boolean;
  value?: number;
  recommendedBodyPart?: string;
  doneDate?: string;
  healedTime?: string;
}

interface ZoomedImage {
  id: string;
  url: string;
  title: string;
}

interface flashTattooSectionProps {
  openModal: React.Dispatch<React.SetStateAction<boolean>>;
  flashList: flash[]
}

const DoneTattooCarousel = ({ 
  item, 
  onZoom 
}: { 
  item: flash; 
  onZoom: (image: ZoomedImage) => void 
}) => {
  const images = [
    { url: item.img, label: "Desenho" },
    { url: item.imgFresh, label: item.doneDate ? `Tatuagem • ${item.doneDate}` : "Tatuagem" },
    { url: item.imgHealed, label: item.healedTime ? `Cicatrizada • ${item.healedTime}` : "Cicatrizada" }
  ].filter((img): img is { url: string; label: string } => !!img.url);

  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="relative group/carousel h-full w-full overflow-hidden">
      <motion.div 
        className="flex h-full w-full"
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={(_, { offset, velocity }) => {
          const swipe = offset.x;
          const vel = velocity.x;
          if (swipe < -50 || vel < -500) {
            next();
          } else if (swipe > 50 || vel > 500) {
            prev();
          }
        }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="w-full h-full shrink-0">
            <motion.img
              src={img.url}
              alt={`${item.title} - ${img.label}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => onZoom({ 
                id: `flash-${item.id}-${idx}`, 
                url: img.url as string, 
                title: item.title 
              })}
              layoutId={idx === currentIndex ? `flash-${item.id}-${currentIndex}` : undefined}
            />
          </div>
        ))}
      </motion.div>

      {/* Label Badge */}
      {images[currentIndex].label && (
        <div className="absolute top-3 left-3 font-mono z-20">
          <Badge variant="secondary" className="bg-black text-white hover:bg-black whitespace-nowrap">
            {images[currentIndex].label}
          </Badge>
        </div>
      )}

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20"
            >
              <CaretLeftIcon size={16} />
            </button>
          )}
          {currentIndex < images.length - 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20"
            >
              <CaretRightIcon size={16} />
            </button>
          )}
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {images.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-black w-3' : 'bg-black/20'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FlashDetailsContent = ({ item }: { item: flash }) => (
  <div className="space-y-4 text-black">
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
);

const FlashGrid = ({ 
  items, 
  onZoom 
}: { 
  items: flash[]; 
  onZoom: (image: ZoomedImage) => void 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {items.map((item) => (
      <div 
        key={item.id} 
        className="group relative aspect-3/4 w-full overflow-hidden bg-gray-100 rounded-sm"
      >
        {item.available ? (
          <div 
            className="w-full h-full relative cursor-pointer group/available"
            onClick={() => onZoom({ id: `flash-${item.id}`, url: item.img, title: item.title })}
          >
            <motion.img 
              layoutId={`flash-${item.id}`}
              src={item.img} 
              alt={item.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover/available:scale-105"
            />
            <div className="absolute top-3 left-3 font-mono z-20">
              <Badge variant="secondary" className="bg-black text-white">Disponível</Badge>
            </div>
            <button className="absolute bottom-3 right-3 bg-white/80 p-2 rounded-full opacity-0 group-hover/available:opacity-100 transition-opacity shadow-sm hover:bg-white z-20">
              <MagnifyingGlassPlusIcon size={18} />
            </button>
          </div>
        ) : (
          <DoneTattooCarousel item={item} onZoom={onZoom} />
        )}
        
        {/* Readability Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex justify-between items-end">
          <div className="space-y-0.5">
            <h3 className="text-xs font-sans uppercase tracking-wider font-bold text-black">{item.title}</h3>
            <p className="text-[10px] font-mono text-black/60 uppercase tracking-widest">{item.style}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Desktop Interactivity */}
            <div className="hidden md:block">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="cursor-pointer hover:text-black/60 outline-none text-black transition-colors">
                    <QuestionIcon size={22} />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64 bg-white/95 backdrop-blur-sm border-accent/20 p-5 shadow-2xl">
                  <FlashDetailsContent item={item} />
                </HoverCardContent>
              </HoverCard>
            </div>

            {/* Mobile Interactivity */}
            <div className="md:hidden block">
              <Drawer>
                <DrawerTrigger asChild>
                  <button className="cursor-pointer text-black/60 outline-none">
                    <QuestionIcon size={22} />
                  </button>
                </DrawerTrigger>
                <DrawerContent className="bg-white px-6 pb-12">
                  <DrawerHeader className="px-0 mb-4">
                    <DrawerTitle className="text-left font-bbh uppercase tracking-widest text-sm">{item.title}</DrawerTitle>
                  </DrawerHeader>
                  <FlashDetailsContent item={item} />
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const FlashTattooSection: React.FC<flashTattooSectionProps> = ({openModal, flashList}) => {

  const availableArt = flashList.filter(item => item.available);
  const tattoosDone = flashList.filter(item => !item.available);

  const [zoomedImage, setZoomedImage] = useState<ZoomedImage | null>(null);

  return (
    <section id="portfolio" className="flex flex-col items-center py-24 bg-white/30 px-5 overflow-hidden">
      <div className="container max-w-6xl space-y-12">
        
        <div className="text-center space-y-3">
          <span className="text-xs uppercase text-muted-foreground font-mono">Galeria ativa</span>
          <h2 className="text-xl sm:text-3xl font-display uppercase tracking-[0.15em] font-bbh">Portfolio & Flashes</h2>
          <div className="w-12 h-px bg-accent mx-auto mt-2"></div>
        </div>


        <Tabs defaultValue="done" className="w-full flex flex-col items-center justify-around">
          <TabsList className="mb-8" variant="line">
            <TabsTrigger value="done" className="uppercase tracking-widest text-[10px] md:text-xs px-1 md:px-6 font-mono">Tatuagens Feitas</TabsTrigger>
            <TabsTrigger value="available" className="uppercase tracking-widest text-[10px] md:text-xs px-1 md:px-6 font-mono text-">Desenhos Disponíveis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="done" className="w-full">
            <FlashGrid items={tattoosDone} onZoom={setZoomedImage} />
          </TabsContent>

          <TabsContent value="available" className="w-full">
            <FlashGrid items={availableArt} onZoom={setZoomedImage} />
          </TabsContent>
          
        </Tabs>
      </div>

      {/* Global Zoom Overlay */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 cursor-zoom-out"
            onClick={() => setZoomedImage(null)}
          >
            <motion.button 
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-110"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <XIcon size={32} />
            </motion.button>
            <motion.img 
              layoutId={zoomedImage.id}
              src={zoomedImage.url}
              alt={zoomedImage.title}
              className="max-w-[95vw] max-h-[95vh] object-contain shadow-2xl"
              initial={{ borderRadius: 0 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
