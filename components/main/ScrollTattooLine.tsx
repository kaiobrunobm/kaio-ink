"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export const ScrollTattooLine = () => {
  const [pageHeight, setPageHeight] = useState(0);

  // Update page height on mount and resize
  useEffect(() => {
    const updateHeight = () => {
      setPageHeight(document.documentElement.scrollHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const { scrollYProgress } = useScroll();
  
  // Smooth out the scroll progress
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate opacity based on scroll - fade in after hero starts
  const opacity = useTransform(scrollYProgress, [0, 0.05], [0, 0.6]);

  // Generate a wavy path
  const generateWavyPath = () => {
    if (!pageHeight) return "";
    
    const startY = 400; // Start roughly in the middle of hero
    const endY = pageHeight - 300; // End near footer
    const width = 100; // SVG width for the waves
    const steps = 60; // Number of wave points
    const stepHeight = (endY - startY) / steps;
    
    let path = `M ${width / 2} ${startY}`;
    
    for (let i = 1; i <= steps; i++) {
      const y = startY + i * stepHeight;
      // More organic wave: combination of sine and some "noise"
      const x = width / 2 + Math.sin(i * 0.4) * 8 + Math.cos(i * 0.7) * 4;
      const cpY = y - stepHeight / 2;
      path += ` Q ${x} ${cpY}, ${width / 2 + Math.sin((i+1) * 0.4) * 8} ${y}`;
    }
    
    return path;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" style={{ height: pageHeight }}>
      <svg
        width="100%"
        height={pageHeight}
        viewBox={`0 0 100 ${pageHeight}`}
        preserveAspectRatio="none"
        className="opacity-80"
      >
        <defs>
          <filter id="ink-bleed" x="-20%" y="-20%" width="140%" height="140%">
            {/* Turbulence for the shaky/bleeding edge */}
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" result="displaced" />
            
            {/* Slight blur for the ink soak effect */}
            <feGaussianBlur in="displaced" stdDeviation="0.4" result="blurred" />
            
            {/* Combine for more texture */}
            <feComposite in="displaced" in2="blurred" operator="over" />
          </filter>
        </defs>

        <motion.path
          d={generateWavyPath()}
          fill="transparent"
          stroke="black"
          strokeWidth="0.6"
          filter="url(#ink-bleed)"
          style={{
            pathLength,
            opacity
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
      </svg>
    </div>
  );
};
