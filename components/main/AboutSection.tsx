import { ClockIcon, MapPinIcon, SparkleIcon } from "@phosphor-icons/react"
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

export const AboutSection = () => {
  return (
    <section id="como-funciona" className="flex flex-col items-center py-24 relative px-5 overflow-hidden">
        <div className="container max-w-4xl space-y-16">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-mono">Estrutura</span>
            <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-[0.15em] font-bbh">Detalhes do studio</h2>
            <div className="w-12 h-px bg-accent mx-auto mt-2"></div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            
            {/* Estilo */}
            <motion.div variants={itemVariants} className="bg-white p-8 text-center space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 border border-accent/40 rounded-full flex items-center justify-center mx-auto text-accent">
                <SparkleIcon size={24}  color="black"/>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground block font-mono">Estilos</span>
                <h3 className="text-xs uppercase tracking-wider font-bold">Blackwork, Rastelado & Oldschool</h3>
              </div>
            </motion.div>

            {/* Sessões */}
            <motion.div variants={itemVariants} className="bg-white p-8 text-center space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 border border-accent/40 rounded-full flex items-center justify-center mx-auto text-accent">
                <ClockIcon size={24} color="black" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono  uppercase tracking-widest text-muted-foreground block">Horarios</span>
                <h3 className="text-xs uppercase tracking-wider font-bold font-sans">07:00 - 10:00 | 18:00 - 22:00</h3>
              </div>
            </motion.div>

            {/* Estúdio */}
            <motion.a 
              variants={itemVariants}
              href="https://www.google.com/maps/place/kaiotatua+studio/@-9.4688039,-40.7925877,19.37z/data=!4m6!3m5!1s0x773b100c75011a5:0xe757a54192474d28!8m2!3d-9.4689587!4d-40.7925214!16s%2Fg%2F11y7d5g98w?entry=ttu" target="_blank" rel="noopener noreferrer"
              className="bg-white flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:shadow-md transition-all duration-300 group shadow-sm"
            >
              <div className="w-10 h-10 border border-accent/40 rounded-full flex items-center justify-center mx-auto text-accent group-hover:bg-accent group-hover:text-white transition-all">
                <MapPinIcon size={24} color="black" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground block font-mono">Localização</span>
              </div>
            </motion.a>
          </motion.div>

        </div>
      </section>
  )
}
