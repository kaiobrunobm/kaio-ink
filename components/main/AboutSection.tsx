import { ClockIcon, MapPinIcon, SparkleIcon } from "@phosphor-icons/react"


export const AboutSection = () => {
  return (
    <section id="como-funciona" className="flex flex-col items-center py-24 relative px-5">
        <div className="container max-w-4xl space-y-16">
          
          <div className="text-center space-y-3">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-mono">Estrutura</span>
            <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-[0.15em] font-bbh">Detalhes do studio</h2>
            <div className="w-12 h-px bg-accent mx-auto mt-2"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Estilo */}
            <div className="bg-white p-8 text-center space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 border border-accent/40 rounded-full flex items-center justify-center mx-auto text-accent">
                <SparkleIcon size={24}  color="black"/>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground block font-mono">Estilos</span>
                <h3 className="text-xs uppercase tracking-wider font-bold">Blackwork, Rastelado & Oldschool</h3>
              </div>
            </div>

            {/* Sessões */}
            <div className="bg-white p-8 text-center space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 border border-accent/40 rounded-full flex items-center justify-center mx-auto text-accent">
                <ClockIcon size={24} color="black" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono  uppercase tracking-widest text-muted-foreground block">Horarios</span>
                <h3 className="text-xs uppercase tracking-wider font-bold font-sans">14:00 - 21:30</h3>
              </div>
            </div>

            {/* Estúdio */}
            <a 
              href="https://www.google.com/maps/place/kaiotatua+studio/@-9.4688039,-40.7925877,19.37z/data=!4m6!3m5!1s0x773b100c75011a5:0xe757a54192474d28!8m2!3d-9.4689587!4d-40.7925214!16s%2Fg%2F11y7d5g98w?entry=ttu" target="_blank" rel="noopener noreferrer"
              className="bg-white flex flex-col itens-center justify-center p-8 text-center cursor-pointer hover:shadow-md transition-all duration-300 group shadow-sm"
            >
              <div className="w-10 h-10 border border-accent/40 rounded-full flex items-center justify-center mx-auto text-accent group-hover:bg-accent group-hover:text-white transition-all">
                <MapPinIcon size={24} color="black" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground block font-mono">Localização</span>
              </div>
              </a>
            </div>

          </div>
      </section>
  )
}
