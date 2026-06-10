import { QuestionIcon, CaretLeftIcon, CaretRightIcon, MagnifyingGlassPlusIcon, XIcon } from "@phosphor-icons/react";
import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

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
  id: string;
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
}

const DoneTattooCarousel = React.memo(function DoneTattooCarousel({ 
  item, 
  onZoom 
}: { 
  item: flash; 
  onZoom: (image: ZoomedImage) => void 
}) {
  // 1. Prepare stable slide list
  const slides = useMemo(() => {
    const list = [];
    
    // Always show Design first
    list.push({ 
      url: item.img, 
      label: "Arte Indisponível" 
    });
    
    // Fresh tattoo
    if (item.imgFresh) {
      list.push({ 
        url: item.imgFresh, 
        label: item.doneDate ? `Feita em ${item.doneDate}` : "Tatuagem" 
      });
    }
    
    // Healed tattoo
    if (item.imgHealed) {
      list.push({ 
        url: item.imgHealed, 
        label: item.healedTime ? `Cicatrizada • ${item.healedTime}` : "Cicatrizada" 
      });
    }
    
    return list;
  }, [item.img, item.imgFresh, item.imgHealed, item.doneDate, item.healedTime]);

  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Navigation handlers
  const scrollTo = useCallback((newIndex: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({ left: width * newIndex, behavior: "smooth" });
      setIndex(newIndex);
    }
  }, []);

  const onNext = useCallback(() => {
    if (index < slides.length - 1) scrollTo(index + 1);
  }, [index, slides.length, scrollTo]);

  const onPrev = useCallback(() => {
    if (index > 0) scrollTo(index - 1);
  }, [index, scrollTo]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollRef.current.scrollLeft / width);
      if (newIndex !== index) setIndex(newIndex);
    }
  }, [index]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-neutral-100 select-none">
      {/* Main Slide Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {slides.map((slide, idx) => (
          <div key={idx} className="relative w-full h-full shrink-0 snap-center snap-always">
            <motion.img
              layoutId={`flash-${item.id}-${idx}`}
              src={slide.url}
              alt={`${item.title} - ${slide.label}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => onZoom({ 
                id: `flash-${item.id}-${idx}`, 
                url: slide.url, 
                title: item.title 
              })}
            />
            
            {/* Meta Chip (Label) */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none">
              <Badge 
                variant="secondary" 
                className="bg-black/80 text-white border-none backdrop-blur-sm py-1 px-3 text-[10px] font-mono whitespace-nowrap"
              >
                {slide.label}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Navigation Buttons */}
      <div className="hidden md:block">
        {index > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/90 p-1.5 rounded-full shadow-md hover:bg-white transition-all duration-200"
          >
            <CaretLeftIcon size={18} weight="bold" />
          </button>
        )}

        {index < slides.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/90 p-1.5 rounded-full shadow-md hover:bg-white transition-all duration-200"
          >
            <CaretRightIcon size={18} weight="bold" />
          </button>
        )}
      </div>

      {/* Instagram-style Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-18 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === index ? "w-4 bg-black/80" : "w-1.5 bg-black/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

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

const FlashGrid = React.memo(function FlashGrid({ 
  items, 
  onZoom 
}: { 
  items: flash[]; 
  onZoom: (image: ZoomedImage) => void 
}) {
  return (
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
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white to-transparent z-10 pointer-events-none" />

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
});

export const FlashTattooSection: React.FC<flashTattooSectionProps> = ({openModal}) => {
  const [flashList, setFlashList] = useState<flash[]>([]);
  const [activePromo, setActivePromo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Flashes
      const { data: flashes, error: fError } = await supabase
        .from('flashes')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch Active Promo
      const { data: promo } = await supabase
        .from('promotions')
        .select('*')
        .eq('active', true)
        .limit(1)
        .single();

      if (fError) {
        console.error("Erro ao carregar flashes:", fError);
      } else {
        const mappedData: flash[] = flashes.map(f => ({
          id: f.id,
          title: f.title,
          style: f.style,
          img: f.img_url,
          imgFresh: f.img_fresh,
          imgHealed: f.img_healed,
          size: f.size,
          available: f.available,
          value: f.value,
          recommendedBodyPart: f.recommended_body_part,
          doneDate: f.done_date,
          healedTime: f.healed_time
        }));
        setFlashList(mappedData);
      }
      
      if (promo) setActivePromo(promo);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const availableArt = useMemo(() => flashList.filter(item => item.available), [flashList]);
  const tattoosDone = useMemo(() => flashList.filter(item => !item.available), [flashList]);

  const [zoomedImage, setZoomedImage] = useState<ZoomedImage | null>(null);

  if (loading) return (
    <div className="py-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const calculateDiscountedValue = (value?: number) => {
    if (!value || !activePromo || activePromo.discount_percentage <= 0) return value;
    return Number((value * (1 - activePromo.discount_percentage / 100)).toFixed(0));
  };

  return (
    <section id="portfolio" className="flex flex-col items-center py-24 bg-white/30 px-5 overflow-hidden">
      <div className="container max-w-6xl space-y-12">
        
        <div className="text-center space-y-3">
          <span className="text-xs uppercase text-muted-foreground font-mono">Galeria ativa</span>
          <h2 className="text-xl sm:text-3xl font-display uppercase tracking-[0.15em] font-bbh">Portfolio & Flashes</h2>
          {activePromo && (
            <div className="bg-black text-white text-[10px] uppercase tracking-widest px-4 py-1.5 inline-block font-mono font-bold animate-pulse mt-2">
              {activePromo.title}: {activePromo.discount_percentage}% de Desconto
            </div>
          )}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {availableArt.map((item) => {
                const discountedPrice = calculateDiscountedValue(item.value);
                const hasDiscount = discountedPrice && item.value && discountedPrice < item.value;

                return (
                  <div key={item.id} className="group relative aspect-3/4 w-full overflow-hidden bg-gray-100 rounded-sm">
                    <div 
                      className="w-full h-full relative cursor-pointer group/available"
                      onClick={() => setZoomedImage({ id: `flash-${item.id}`, url: item.img, title: item.title })}
                    >
                      <motion.img 
                        layoutId={`flash-${item.id}`}
                        src={item.img} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/available:scale-105"
                      />
                      <div className="absolute top-3 left-3 font-mono z-20 flex flex-col gap-2">
                        <Badge variant="secondary" className="bg-black text-white">Disponível</Badge>
                        {hasDiscount && (
                          <Badge variant="secondary" className="bg-red-600 text-white border-none">-{activePromo.discount_percentage}%</Badge>
                        )}
                      </div>
                      <button className="absolute bottom-3 right-3 bg-white/80 p-2 rounded-full opacity-0 group-hover/available:opacity-100 transition-opacity shadow-sm hover:bg-white z-20">
                        <MagnifyingGlassPlusIcon size={18} />
                      </button>
                    </div>
                    
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white to-transparent z-10 pointer-events-none" />

                    <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex justify-between items-end">
                      <div className="space-y-0.5">
                        <h3 className="text-xs font-sans uppercase tracking-wider font-bold text-black">{item.title}</h3>
                        <p className="text-[10px] font-mono text-black/60 uppercase tracking-widest">{item.style}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <button className="cursor-pointer hover:text-black/60 outline-none text-black transition-colors">
                              <QuestionIcon size={22} />
                            </button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-64 bg-white/95 backdrop-blur-sm border-accent/20 p-5 shadow-2xl">
                            <div className="space-y-4 text-black">
                              <div className="flex justify-between items-start border-b border-muted pb-3">
                                <div>
                                  <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">Valor estimado</h4>
                                  {hasDiscount ? (
                                    <div className="flex items-baseline gap-2">
                                      <p className="text-lg font-bbh uppercase leading-none">R$ {discountedPrice}</p>
                                      <p className="text-xs line-through text-muted-foreground">R$ {item.value}</p>
                                    </div>
                                  ) : (
                                    <p className="text-lg font-bbh uppercase leading-none">R$ {item.value || "---"}</p>
                                  )}
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
                    </div>
                  </div>
                );
              })}
            </div>
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
