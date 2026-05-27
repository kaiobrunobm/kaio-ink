import { InstagramLogoIcon } from "@phosphor-icons/react"

export const Footer = () => {
  return (
    <footer className="flex flex-col items-center py-16 bg-[#111111] text-[#fbfbf9] relative overflow-hidden">
    <div className="container max-w-5xl space-y-12 relative z-10">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-[#fbfbf9]/10 pb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 overflow-hidden bg-white p-1 rounded-full">
            <div className="w-full h-full bg-black rounded-full" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display text-xs uppercase tracking-[0.25em] font-black leading-none">KAIO INK</span>
            <span className="text-[9px] uppercase tracking-widest text-[#fbfbf9]/50 mt-1">STUDIO</span>
          </div>
        </div>

        <div className="flex gap-6">
          <a 
            href="https://instagram.com/kaioink" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 border border-[#fbfbf9]/10 hover:border-accent hover:text-accent transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-semibold"
          >
            <InstagramLogoIcon size={16} />
            @kaiotatua
          </a>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] uppercase tracking-widest text-[#fbfbf9]/40">
        <p>© {new Date().getFullYear()} KAIO INK STUDIO. TODOS OS DIREITOS RESERVADOS.</p>
        <p className="font-light">Sobradinho - BA, Brasil</p>
      </div>

    </div>
  </footer>
  )
}
