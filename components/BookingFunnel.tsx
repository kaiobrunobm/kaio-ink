import React, { useState } from "react";
import { 
  XIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  CalendarIcon, 
  UserIcon, 
  FileTextIcon, 
  StarIcon,
  InfoIcon
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { portfolioItems } from "@/lib/data";

interface BookingFunnelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  nome: string;
  idade: string;
  whatsapp: string;
  tipoTattoo: "Flash Disponível" | "Projeto Autoral Personalizado" | "";
  flashSelecionado: string; // ID of flash if "Flash Disponível"
  ideia: string;
  
  // Date selection (Restricted to a single session now)
  sessao_data: string;
  sessao_periodo: "Tarde" | "Noite" | "";

  formaPagamento: "Pix" | "Cartão de Débito" | "Cartão de Crédito" | "";
  parcelasCredito: string; // 1x, 2x, 3x, etc.

  termoSinal: boolean;
  termoAnamnese: boolean;
  termoMenorIdade: boolean; // Custom check for minors
}

const initialFormData: FormData = {
  nome: "",
  idade: "",
  whatsapp: "",
  tipoTattoo: "",
  flashSelecionado: "",
  ideia: "",
  
  sessao_data: "",
  sessao_periodo: "",

  formaPagamento: "",
  parcelasCredito: "1",

  termoSinal: false,
  termoAnamnese: false,
  termoMenorIdade: false,
};

interface SessionSlot {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  dayOfMonth: string;
  month: string;
  slots: {
    Tarde: { available: boolean; time: "14:00 - 18:00" };
    Noite: { available: boolean; time: "18:00 - 21:30" };
  };
}

const AVAILABLE_DATES: SessionSlot[] = [
  {
    date: "2026-05-26",
    dayOfWeek: "Ter",
    dayOfMonth: "26",
    month: "Mai",
    slots: {
      Tarde: { available: false, time: "14:00 - 18:00" },
      Noite: { available: true, time: "18:00 - 21:30" }
    }
  },
  {
    date: "2026-05-27",
    dayOfWeek: "Qua",
    dayOfMonth: "27",
    month: "Mai",
    slots: {
      Tarde: { available: true, time: "14:00 - 18:00" },
      Noite: { available: true, time: "18:00 - 21:30" }
    }
  },
  {
    date: "2026-05-28",
    dayOfWeek: "Qui",
    dayOfMonth: "28",
    month: "Mai",
    slots: {
      Tarde: { available: true, time: "14:00 - 18:00" },
      Noite: { available: false, time: "18:00 - 21:30" }
    }
  },
  {
    date: "2026-05-29",
    dayOfWeek: "Sex",
    dayOfMonth: "29",
    month: "Mai",
    slots: {
      Tarde: { available: false, time: "14:00 - 18:00" },
      Noite: { available: false, time: "18:00 - 21:30" }
    }
  },
  {
    date: "2026-06-01",
    dayOfWeek: "Seg",
    dayOfMonth: "01",
    month: "Jun",
    slots: {
      Tarde: { available: true, time: "14:00 - 18:00" },
      Noite: { available: true, time: "18:00 - 21:30" }
    }
  },
  {
    date: "2026-06-02",
    dayOfWeek: "Ter",
    dayOfMonth: "02",
    month: "Jun",
    slots: {
      Tarde: { available: true, time: "14:00 - 18:00" },
      Noite: { available: true, time: "18:00 - 21:30" }
    }
  }
];

// Helper to mask Brazilian phone numbers: (00) 00000-0000
const maskPhone = (value: string) => {
  // Remove all non-digits
  const cleanValue = value.replace(/\D/g, "");
  
  if (cleanValue.length === 0) return "";
  if (cleanValue.length <= 2) return `(${cleanValue}`;
  if (cleanValue.length <= 7) return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
  return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7, 11)}`;
};

export default function BookingFunnel({ isOpen, onClose }: BookingFunnelProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "whatsapp") {
      // Allow only digits to be processed, and mask
      const masked = maskPhone(value);
      setFormData(prev => ({ ...prev, whatsapp: masked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (name: "termoSinal" | "termoAnamnese" | "termoMenorIdade") => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const selectSessaoDate = (index: number, dateStr: string) => {
    setSelectedSlotIndex(index);
    setFormData(prev => ({ ...prev, sessao_data: dateStr, sessao_periodo: "" }));
  };

  const handlePeriodoSelect = (periodo: "Tarde" | "Noite") => {
    if (selectedSlotIndex === null) return;
    const slot = AVAILABLE_DATES[selectedSlotIndex];
    if (!slot.slots[periodo].available) {
      toast.error("Este período já está esgotado.");
      return;
    }
    setFormData(prev => ({ ...prev, sessao_periodo: periodo }));
  };

  const isMinor = () => {
    const ageNum = parseInt(formData.idade, 10);
    return !isNaN(ageNum) && ageNum < 18;
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.termoSinal || !formData.termoAnamnese) {
        toast.error("Você precisa aceitar os termos do contrato e o termo de anamnese para continuar.");
        return;
      }
    }
    if (step === 2) {
      if (!formData.nome || !formData.idade || !formData.whatsapp || !formData.tipoTattoo) {
        toast.error("Por favor, preencha todos os campos obrigatórios.");
        return;
      }
      // Check phone validity (Brazilian mask length is 15: (00) 00000-0000)
      if (formData.whatsapp.length < 14) {
        toast.error("Por favor, digite um número de WhatsApp válido.");
        return;
      }
      if (formData.tipoTattoo === "Flash Disponível" && !formData.flashSelecionado) {
        toast.error("Por favor, selecione um dos flashes disponíveis.");
        return;
      }
      if (formData.tipoTattoo === "Projeto Autoral Personalizado" && !formData.ideia) {
        toast.error("Por favor, descreva sua ideia para o projeto personalizado.");
        return;
      }
      if (isMinor() && !formData.termoMenorIdade) {
        toast.error("Menores de idade precisam confirmar a autorização legal dos responsáveis.");
        return;
      }
    }
    if (step === 3) {
      if (!formData.sessao_data || !formData.sessao_periodo) {
        toast.error("Por favor, selecione o horário da sessão.");
        return;
      }
      if (!formData.formaPagamento) {
        toast.error("Por favor, selecione uma forma de pagamento.");
        return;
      }
    }
    setStep(prev => (prev + 1) as any);
  };

  const prevStep = () => {
    setStep(prev => (prev - 1) as any);
  };

  const formatWhatsAppMessage = () => {
    const formattedDate = formData.sessao_data.split("-").reverse().join("/");
    const periodoText = formData.sessao_periodo === "Tarde" ? "Tarde (14h-18h)" : "Noite (18h-21h30)";
    
    let tattooDetail = "";
    if (formData.tipoTattoo === "Flash Disponível") {
      const selectedFlash = portfolioItems.find(f => String(f.id) === formData.flashSelecionado);
 
      tattooDetail = `Flash Selecionado: ${selectedFlash?.title || "Não especificado"}\n *Nota:* Desenhos flash não estão sujeitos a alterações e possuem valor fixo.`;
    } else {
      tattooDetail = `Projeto Autoral Personalizado: ${formData.ideia}`;
    }

    let pagMsg = `\n *FORMA DE PAGAMENTO*\n- Método: ${formData.formaPagamento}`;
    if (formData.formaPagamento === "Cartão de Crédito") {
      pagMsg += ` (Parcelado em ${formData.parcelasCredito}x)`;
    }

    let minorMsg = "";
    if (isMinor()) {
      minorMsg = `\n *AUTORIZAÇÃO DE MENOR DE IDADE*\n- [X] Confirmo que apresentarei a permissão legal assinada pela minha mãe/responsável, cópias de RG e CPF, ou que ela estará presente no dia do procedimento.`;
    }
    
    return `Olá! Gostaria de solicitar um agendamento de tatuagem. Seguem os meus dados e a preferência de data para orçamento:

📌 *DADOS DO CLIENTE*
- Nome: ${formData.nome}
- Idade: ${formData.idade} anos
- WhatsApp: ${formData.whatsapp}${minorMsg}

🎨 *DETALHES DA TATUAGEM*
- Tipo: ${formData.tipoTattoo}
- ${tattooDetail}
- _*Enviarei as imagens de referência logo abaixo nesta conversa para fecharmos o orçamento._

📅 *PREFERÊNCIA DE HORÁRIO*
- Sessão sugerida: ${formattedDate} (${periodoText})
${pagMsg}

⚖️ *TERMOS E CONTRATO*
- [X] Li e concordo com o Contrato de Agendamento (Valor mínimo: R$ 85,00).
- [X] Estou ciente da obrigatoriedade de preencher e assinar a ficha de Anamnese no dia da sessão.`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = formatWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    
    const artistPhone = "5575998002423"; 
    const whatsappUrl = `https://wa.me/${artistPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    toast.success("Redirecionando para o WhatsApp...");
    
    setFormData(initialFormData);
    setSelectedSlotIndex(null);
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-card border border-border max-w-2xl w-full my-8 relative flex flex-col">
        
        {/* Modal Header */}
        <div className="border-b border-border/40 p-6 flex justify-between items-center bg-background">
          <div>
            <h2 className="text-xl font-display uppercase tracking-[0.15em]">AGENDAR</h2>
            <p className="text-[10px] text-accent uppercase tracking-widest mt-1">Passo {step} de 4</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 border border-border hover:border-accent hover:text-accent transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="h-px bg-border/40 w-full flex">
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 grow max-h-[65vh] overflow-y-auto">
          
          {/* STEP 1: Contract with $85 Minimum Price */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <FileTextIcon className="w-5 h-5 text-accent" />
                <h3 className="text-sm font-display uppercase tracking-wider">CONTRATO DE AGENDAMENTO</h3>
              </div>

              {/* Scrollable Contract Content */}
              <div className="bg-background border border-border p-4 h-64 overflow-y-auto text-xs space-y-4 text-muted-foreground leading-relaxed font-light">
                <p className="font-bold text-foreground">De um lado, o estúdio Kaio Ink Studio, e de outro o CLIENTE.</p>
                
                <h4 className="font-bold text-foreground uppercase tracking-widest text-[10px]">1. Serviço e valores</h4>
                <p>O orçamento final da arte será negociado e fechado de forma personalizada diretamente pelo WhatsApp após o envio das referências. O valor mínimo de qualquer procedimento de tatuagem no estúdio é de <strong className="text-foreground">R$ 85,00</strong>.</p>

                <h4 className="font-bold text-foreground uppercase tracking-widest text-[10px]">2. Sinal (reserva)</h4>
                <p>Um sinal é necessário para garantir sua data e iniciar o desenho. Descontado do total no dia. Não comparecer sem aviso prévio resultará na perda integral do sinal.</p>

                <h4 className="font-bold text-foreground uppercase tracking-widest text-[10px]">3. Horários e atrasos</h4>
                <p>Tarde (14:00–18:00) e Noite (18:00–21:30). Tolerância máxima de atraso: 30 minutos.</p>

                <h4 className="font-bold text-foreground uppercase tracking-widest text-[10px]">4. Cancelamento</h4>
                <p>Para remarcar sem perder o sinal, avise com 48h de antecedência. É permitida apenas 1 remarcação sem necessidade de um novo sinal.</p>

                <h4 className="font-bold text-foreground uppercase tracking-widest text-[10px]">5. Saúde e Menores de Idade</h4>
                <p>No dia você preencherá a Ficha de Anamnese. Você é totalmente responsável pelas informações fornecidas. Menores de 18 anos devem apresentar autorização legal assinada pela mãe/responsável acompanhada de cópias de RG e CPF, ou contar com a presença física do responsável durante o procedimento.</p>
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.termoSinal}
                    onChange={() => handleCheckboxChange("termoSinal")}
                    className="mt-1 accent-accent w-4 h-4 rounded-none border border-border bg-background focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-foreground/80 group-hover:text-foreground leading-tight select-none font-light">
                    Li e concordo com os termos do contrato de agendamento, incluindo o valor mínimo de R$ 85,00 e regras de sinal. <span className="text-accent">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.termoAnamnese}
                    onChange={() => handleCheckboxChange("termoAnamnese")}
                    className="mt-1 accent-accent w-4 h-4 rounded-none border border-border bg-background focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-foreground/80 group-hover:text-foreground leading-tight select-none font-light">
                    Estou ciente de que deverei preencher e assinar a Ficha de Anamnese de saúde no dia da sessão. <span className="text-accent">*</span>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Client Info & Visual Flash Selector */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <UserIcon className="w-5 h-5 text-accent" />
                <h3 className="text-sm font-display uppercase tracking-wider">SEUS DADOS & ESCOLHA DA TATTOO</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nome Completo <span className="text-accent">*</span></label>
                  <input 
                    type="text" 
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Seu nome completo"
                    className="w-full bg-background border border-border p-3 text-sm focus:border-accent outline-none font-light"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Idade <span className="text-accent">*</span></label>
                  <input 
                    type="number" 
                    name="idade"
                    value={formData.idade}
                    onChange={handleInputChange}
                    placeholder="Sua idade real"
                    className="w-full bg-background border border-border p-3 text-sm focus:border-accent outline-none font-light"
                    required
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">WhatsApp (Apenas Números) <span className="text-accent">*</span></label>
                  <input 
                    type="tel" 
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-background border border-border p-3 text-sm focus:border-accent outline-none font-light"
                    required
                  />
                </div>

                {/* Minor Age Warning Checkbox */}
                {isMinor() && (
                  <div className="md:col-span-2 bg-accent/5 border border-accent/20 p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2 text-accent">
                      {/* <AlertTriangle className="w-4 h-4" /> */}
                      <span className="text-[10px] uppercase tracking-widest font-bold">Confirmação de Menor de Idade</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-light">
                      Detectamos que você é menor de 18 anos. Para prosseguir com o agendamento, você precisará apresentar uma **permissão legal assinada pela sua mãe ou responsável legal**, cópia do RG e CPF do responsável, ou contar com a presença dela no local no dia do procedimento.
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer group pt-1">
                      <input 
                        type="checkbox" 
                        checked={formData.termoMenorIdade}
                        onChange={() => handleCheckboxChange("termoMenorIdade")}
                        className="mt-0.5 accent-accent w-4 h-4 rounded-none border border-border bg-background focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-foreground/80 group-hover:text-foreground leading-tight select-none font-semibold">
                        Confirmo que apresentarei a documentação assinada ou que minha mãe estará presente no dia da sessão. <span className="text-accent">*</span>
                      </span>
                    </label>
                  </div>
                )}

                <div className="space-y-1.5 md:col-span-2 border-t border-border/40 pt-4">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">O que você quer tatuar? <span className="text-accent">*</span></label>
                  <select 
                    name="tipoTattoo"
                    value={formData.tipoTattoo}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border p-3 text-sm focus:border-accent outline-none font-light"
                    required
                  >
                    <option value="">Selecione uma opção...</option>
                    <option value="Flash Disponível">Quero um Flash Disponível do site</option>
                    <option value="Projeto Autoral Personalizado">Quero criar um Projeto Personalizado</option>
                  </select>
                </div>

                {/* VISUAL FLASH SELECTOR */}
                {formData.tipoTattoo === "Flash Disponível" && (
                  <div className="md:col-span-2 space-y-3 animate-fade-in">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground block font-bold">Selecione o Flash Desejado <span className="text-accent">*</span></label>
                    <div className="grid grid-cols-3 gap-4">
                      {portfolioItems.map((flash) => {
                        const isSelected = formData.flashSelecionado === String(flash.id);
                   
                        return (
                          <div 
                            key={flash.id}
                            onClick={() => setFormData(prev => ({ ...prev, flashSelecionado: String(flash.id) }))}
                       
                            className={`cursor-pointer border p-2 flex flex-col items-center space-y-2 bg-background transition-all ${
                              isSelected 
                                ? 'border-accent ring-1 ring-accent/20 bg-accent/5' 
                                : 'border-border hover:border-primary'
                            }`}
                          >
                            <div className="aspect-3/4 w-full overflow-hidden bg-background border border-border/20">
                              <img src={flash.img} alt={flash.title} className="w-full h-full object-contain p-1" />
                            </div>
                            <span className="text-[9px] text-center uppercase tracking-wider font-semibold line-clamp-1">{flash.title}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Static Flash Warning Text */}
                    <div className="flex items-start gap-2 bg-accent/5 border border-accent/10 p-3 text-muted-foreground mt-2">
                      <InfoIcon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <p className="text-[10px] leading-relaxed font-light">
                        <strong className="text-foreground">Importante:</strong> Desenhos flash são autorais e exclusivos, por isso <strong className="text-foreground">não estão sujeitos a alterações</strong> de traço ou composição e possuem <strong className="text-foreground">valor fixo</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {/* PERSONALIZED IDEA TEXTAREA */}
                {formData.tipoTattoo === "Projeto Autoral Personalizado" && (
                  <div className="space-y-1.5 md:col-span-2 animate-fade-in">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Descreva sua ideia, local do corpo e tamanho aproximado (cm) <span className="text-accent">*</span></label>
                    <textarea 
                      name="ideia"
                      value={formData.ideia}
                      onChange={handleInputChange}
                      placeholder="Ex: Tigre no estilo Blackwork no antebraço, com aproximadamente 15cm. Detalhes em rastelado sutil."
                      rows={3}
                      className="w-full bg-background border border-border p-3 text-sm focus:border-accent outline-none resize-none font-light"
                      required
                    ></textarea>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Dates & Payment Method (Restricted to Single Session) */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <CalendarIcon className="w-5 h-5 text-accent" />
                <h3 className="text-sm font-display uppercase tracking-wider">DATAS & PAGAMENTO</h3>
              </div>

              {/* SINGLE SESSION DATE SELECTOR */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground block font-bold">Selecione a Data Desejada</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {AVAILABLE_DATES.map((slot, index) => {
                    const isSelected = selectedSlotIndex === index;
                    const allSoldOut = !slot.slots.Tarde.available && !slot.slots.Noite.available;
                    
                    return (
                      <button
                        key={`s-${slot.date}`}
                        type="button"
                        disabled={allSoldOut}
                        onClick={() => selectSessaoDate(index, slot.date)}
                        className={`p-2 border flex flex-col items-center justify-center transition-all ${
                          allSoldOut 
                            ? 'border-border/20 bg-background/20 opacity-30 cursor-not-allowed' 
                            : isSelected 
                              ? 'border-accent bg-accent/10 text-accent font-semibold' 
                              : 'border-border/60 bg-background hover:border-primary'
                        }`}
                      >
                        <span className="text-[8px] uppercase tracking-widest text-muted-foreground">{slot.dayOfWeek}</span>
                        <span className="text-base font-display my-0.5">{slot.dayOfMonth}</span>
                        <span className="text-[8px] uppercase tracking-wider">{slot.month}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedSlotIndex !== null && (
                  <div className="grid grid-cols-2 gap-3 pt-1 animate-fade-in">
                    <button
                      type="button"
                      disabled={!AVAILABLE_DATES[selectedSlotIndex].slots.Tarde.available}
                      onClick={() => handlePeriodoSelect("Tarde")}
                      className={`p-2.5 border text-center transition-all ${
                        !AVAILABLE_DATES[selectedSlotIndex].slots.Tarde.available
                          ? 'border-border/20 bg-background/20 opacity-30 cursor-not-allowed'
                          : formData.sessao_periodo === "Tarde"
                            ? 'border-accent bg-accent/10 text-accent font-semibold'
                            : 'border-border/60 bg-background hover:border-primary'
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-widest block font-semibold">Tarde (14h-18h)</span>
                    </button>

                    <button
                      type="button"
                      disabled={!AVAILABLE_DATES[selectedSlotIndex].slots.Noite.available}
                      onClick={() => handlePeriodoSelect("Noite")}
                      className={`p-2.5 border text-center transition-all ${
                        !AVAILABLE_DATES[selectedSlotIndex].slots.Noite.available
                          ? 'border-border/20 bg-background/20 opacity-30 cursor-not-allowed'
                          : formData.sessao_periodo === "Noite"
                            ? 'border-accent bg-accent/10 text-accent font-semibold'
                            : 'border-border/60 bg-background hover:border-primary'
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-widest block font-semibold">Noite (18h-21h30)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* PAYMENT OPTIONS */}
              <div className="pt-4 border-t border-border/40 space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground block font-bold">Forma de Pagamento <span className="text-accent">*</span></label>
                <div className="grid grid-cols-3 gap-3">
                  {["Pix", "Cartão de Débito", "Cartão de Crédito"].map((metodo) => {
                    const isSelected = formData.formaPagamento === metodo;
                    return (
                      <button
                        key={metodo}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, formaPagamento: metodo as any }))}
                        className={`p-3 border text-center text-xs uppercase tracking-wider transition-all ${
                          isSelected
                            ? 'border-accent bg-accent/10 text-accent font-semibold'
                            : 'border-border/60 bg-background hover:border-primary'
                        }`}
                      >
                        {metodo}
                      </button>
                    );
                  })}
                </div>

                {formData.formaPagamento === "Cartão de Crédito" && (
                  <div className="space-y-1.5 pt-2 animate-fade-in max-w-xs">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Número de Parcelas (para cálculo de juros)</label>
                    <select 
                      name="parcelasCredito"
                      value={formData.parcelasCredito}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border p-2.5 text-sm focus:border-accent outline-none font-light"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={String(i+1)}>{i+1}x</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 4: WhatsApp Redirect Pre-confirmation */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in text-center py-4">
              <div className="w-12 h-12 border border-accent text-accent flex items-center justify-center mx-auto mb-6">
                <StarIcon className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-display uppercase tracking-widest">SOLICITAÇÃO PRONTA</h3>
              <p className="text-muted-foreground text-xs max-w-md mx-auto font-light leading-relaxed">
                Tudo pronto! Suas preferências foram validadas. Ao clicar no botão abaixo, abriremos seu WhatsApp com a proposta formatada. <strong className="text-foreground">Lembre-se de enviar as imagens de referência logo em seguida na conversa para fecharmos o orçamento.</strong>
              </p>

              {/* Data Preview */}
              <div className="bg-background border border-border p-4 text-left text-xs space-y-2 max-w-md mx-auto font-mono text-muted-foreground">
                <div className="border-b border-border pb-2 mb-2 flex justify-between">
                  <span className="font-bold text-foreground">RESUMO DO AGENDAMENTO</span>
                  <span className="text-accent font-bold">PRONTO</span>
                </div>
                <p><strong className="text-foreground">Cliente:</strong> {formData.nome} ({formData.idade} anos)</p>
                {isMinor() && <p className="text-accent font-bold"><strong className="text-foreground">Autorização:</strong> Mãe/Responsável confirmada</p>}
                <p><strong className="text-foreground">Tatuagem:</strong> {formData.tipoTattoo}</p>
                {formData.tipoTattoo === "Flash Disponível" && (
                  <p>
                    <strong className="text-foreground">Flash:</strong> {portfolioItems.find(f => String(f.id) === formData.flashSelecionado)?.title}
                  </p>
             
                )}
                <p><strong className="text-foreground">Sessão:</strong> {formData.sessao_data.split("-").reverse().join("/")} às {formData.sessao_periodo === "Tarde" ? "14h" : "18h"}</p>
                <p><strong className="text-foreground">Pagamento:</strong> {formData.formaPagamento} {formData.formaPagamento === "Cartão de Crédito" ? `(${formData.parcelasCredito}x)` : ""}</p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer / Navigation Buttons */}
        <div className="border-t border-border p-6 bg-background flex justify-between gap-4">
          {step > 1 ? (
            <button 
              onClick={prevStep}
              className="px-6 py-3 border border-border text-[10px] uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              Voltar
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button 
              onClick={nextStep}
              className="px-6 py-3 bg-primary text-primary-foreground border border-primary text-[10px] uppercase tracking-widest hover:bg-transparent hover:text-primary transition-all duration-300 flex items-center gap-2"
            >
              Continuar
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="px-6 py-3 bg-accent text-accent-foreground border border-accent text-[10px] uppercase tracking-widest hover:bg-transparent hover:text-accent transition-all duration-300 flex items-center gap-2"
            >
              Confirmar via WhatsApp
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
