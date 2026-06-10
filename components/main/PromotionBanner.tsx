"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export const PromotionBanner = () => {
  const [promo, setPromo] = useState<any>(null);

  useEffect(() => {
    const fetchPromo = async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('active', true)
        .limit(1)
        .single();

      if (!error && data) {
        setPromo(data);
      }
    };
    fetchPromo();
  }, []);

  if (!promo) return null;

  const scrollText = `${promo.title}: ${promo.description} • `.repeat(10);

  return (
    <div className="bg-black text-white py-2 overflow-hidden whitespace-nowrap border-b border-white/10 relative z-[60]">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="inline-block"
      >
        <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.3em] px-4">
          {scrollText}
        </span>
      </motion.div>
    </div>
  );
};
