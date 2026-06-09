"use client";
import React, { useState, useEffect } from "react";
import { 
  XIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  CalendarIcon, 
  UserIcon, 
  FileTextIcon, 
  StarIcon,
  CheckIcon
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { portfolioItems, bookedDates } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

interface BookingFunnelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  nome: string;
  idade: string;
  whatsapp: string;
  tipoTattoo: "Flash Disponível" | "Projeto Autoral Personalizado" | "";
  flashSelecionado: string[];
  ideia: string;
  referenciaImagem: File | null;
  sessao_data: Date | undefined;
  sessao_periodo: "Manhã" | "Noite" | "";
  formaPagamento: "Pix" | "Dinheiro" | "Cartão de Débito" | "Cartão de Crédito" | "";
  bandeiraCartao: string;
  parcelasCredito: string;
  termoSinal: boolean;
  termoAnamnese: boolean;
  termoMenorIdade: boolean;
}

const initialFormData: FormData = {
  nome: "",
  idade: "",
  whatsapp: "",
  tipoTattoo: "",
  flashSelecionado: [],
  ideia: "",
  referenciaImagem: null,
  sessao_data: undefined,
  sessao_periodo: "",
  formaPagamento: "",
  bandeiraCartao: "",
  parcelasCredito: "1",
  termoSinal: false,
  termoAnamnese: false,
  termoMenorIdade: false,
};

const BANDEIRAS = ["Visa", "Mastercard", "Elo", "American Express", "Hipercard", "Outra"];

export default function BookingFunnel({ isOpen, onClose }: BookingFunnelProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [bookingCode, setBookingCode] = useState<string>("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Generate a unique booking code when the modal opens
      setBookingCode(`#INK-${Math.floor(Math.random() * 9000) + 1000}`);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length > 11) value = value.slice(0, 11); // Limit to 11 digits

    // Apply mask (XX) XXXXX-XXXX
    let formatted = value;
    if (value.length > 2) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 7) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    }

    setFormData(prev => ({ ...prev, whatsapp: formatted }));
  };

  const isMinor = () => {
    const ageNum = parseInt(formData.idade, 10);
    return !isNaN(ageNum) && ageNum < 18;
  };

  const nextStep = () => {
    // Dismiss keyboard on mobile
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (step === 1) {
      if (!formData.termoSinal || !formData.termoAnamnese) {
        toast.error("Você precisa aceitar os termos para continuar.");
        return;
      }
    }
    if (step === 2) {
      if (!formData.nome || !formData.idade || !formData.whatsapp || !formData.tipoTattoo) {
        toast.error("Preencha todos os campos obrigatórios.");
        return;
      }
      if (formData.tipoTattoo === "Flash Disponível" && formData.flashSelecionado.length === 0) {
        toast.error("Selecione pelo menos um flash.");
        return;
      }
      if (formData.tipoTattoo === "Projeto Autoral Personalizado" && !formData.ideia) {
        toast.error("Descreva sua ideia.");
        return;
      }
      if (isMinor() && !formData.termoMenorIdade) {
        toast.error("Confirme a autorização dos responsáveis.");
        return;
      }
    }
    if (step === 3) {
      if (!formData.sessao_data || !formData.sessao_periodo) {
        toast.error("Selecione a data e o horário.");
        return;
      }
      if (!formData.formaPagamento) {
        toast.error("Selecione a forma de pagamento.");
        return;
      }
      if (formData.formaPagamento === "Cartão de Crédito" && (!formData.bandeiraCartao || !formData.parcelasCredito)) {
        toast.error("Informe a bandeira e as parcelas.");
        return;
      }
    }
    setStep(prev => (prev + 1) as any);
  };

  const prevStep = () => {
    // Dismiss keyboard on mobile
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setStep(prev => (prev - 1) as any);
  };

  const formatWhatsAppMessage = () => {
    const formattedDate = formData.sessao_data ? format(formData.sessao_data, "dd/MM/yyyy") : "";
    const periodoText = formData.sessao_periodo === "Manhã" ? "Manhã (09h-13h)" : "Noite (18h-22h)";
    
    let tattooDetail = "";
    if (formData.tipoTattoo === "Flash Disponível") {
      const selectedFlashes = portfolioItems.filter(f => formData.flashSelecionado.includes(String(f.id)));
      const flashTitles = selectedFlashes.map(f => f.title).join(", ");
      tattooDetail = `Flashes Selecionados: ${flashTitles || "Nenhum"}\n *Nota:* Desenhos flash não estão sujeitos a alterações e possuem valor fixo.`;
    } else {
      tattooDetail = `Projeto Autoral Personalizado: ${formData.ideia}`;
    }

    let pagMsg = `\n *FORMA DE PAGAMENTO*\n- Método: ${formData.formaPagamento}`;
    if (formData.formaPagamento === "Cartão de Crédito") {
      pagMsg += ` (${formData.bandeiraCartao} - ${formData.parcelasCredito}x)`;
    }

    let minorMsg = "";
    if (isMinor()) {
      minorMsg = `\n *AUTORIZAÇÃO DE MENOR DE IDADE*\n- [X] Confirmo que apresentarei permissão legal.`;
    }
    
    return `Olá! Gostaria de solicitar um agendamento.
Protocolo: *${bookingCode}*

 *DADOS DO CLIENTE*
- Nome: ${formData.nome}
- Idade: ${formData.idade} anos${minorMsg}

 *DETALHES DA TATUAGEM*
- Tipo: ${formData.tipoTattoo}
- ${tattooDetail}

 *PREFERÊNCIA DE HORÁRIO*
- Sessão sugerida: ${formattedDate} (${periodoText})${pagMsg}

 *TERMOS*
- [X] Li e concordo com o Contrato.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // Upload reference image if it exists
      if (formData.referenciaImagem) {
        const fileExt = formData.referenciaImagem.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('references')
          .upload(filePath, formData.referenciaImagem);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('references')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      // Insert into bookings table
      const { error: insertError } = await supabase
        .from('bookings')
        .insert([{
          nome: formData.nome,
          idade: formData.idade,
          whatsapp: formData.whatsapp,
          tipo_tattoo: formData.tipoTattoo,
          flash_selecionado: formData.flashSelecionado,
          ideia: formData.ideia,
          referencia_imagem_url: imageUrl,
          sessao_data: formData.sessao_data ? format(formData.sessao_data, "yyyy-MM-dd") : null,
          sessao_periodo: formData.sessao_periodo,
          forma_pagamento: formData.formaPagamento,
          bandeira_cartao: formData.bandeiraCartao,
          parcelas_credito: formData.parcelasCredito,
          termo_sinal: formData.termoSinal,
          termo_anamnese: formData.termoAnamnese,
          termo_menor_idade: formData.termoMenorIdade,
          status: 'pendente'
        }]);

      if (insertError) throw insertError;

      setStep(5);
      toast.success("Redirecionando para o WhatsApp...");
      window.open(`https://wa.me/5575998002423?text=${encodeURIComponent(formatWhatsAppMessage())}`, "_blank");
      
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      toast.error("Ocorreu um erro ao enviar seu agendamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableFlashes = portfolioItems.filter(item => item.available);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-card border border-border max-w-2xl w-full my-4 md:my-8 relative flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="border-b border-border/40 p-4 md:p-6 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-bbh uppercase tracking-[0.15em]">Agendar sessao</h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-mono">Passo {step} de 5</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-accent/10">
                <XIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="h-0.5 bg-black/20 w-full">
              <div 
                className="h-full bg-black transition-all duration-500 ease-in-out" 
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>

            {/* Body */}
            <div className="p-5 md:p-8 grow max-h-[55vh] md:max-h-[70vh] overflow-y-auto bg-white">
              
              {/* STEP 1: Contract */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                    <FileTextIcon size={24} color="black" />
                    <h3 className="text-xs font-bbh uppercase tracking-widest">Contrato de agendamento</h3>
                  </div>

                  <div className="bg-[#fbfcfb] border border-black/10 p-5 text-xs space-y-4 text-muted-foreground leading-relaxed font-sans">
                    <p className="font-mono font-bold text-black">Termos e Condições:</p>
                    <p>1. O valor mínimo é de <strong className="text-black">R$ 85,00</strong>. Orçamento final via WhatsApp.</p>
                    <p>2. O sinal é obrigatório para reserva de data e início do projeto.</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-black/10">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="termoSinal" 
                        checked={formData.termoSinal} 
                        onCheckedChange={(checked) => setFormData(p => ({ ...p, termoSinal: !!checked }))}
                      />
                      <Label htmlFor="termoSinal" className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                        Li e concordo com os termos do contrato e valor mínimo.
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="termoAnamnese" 
                        checked={formData.termoAnamnese} 
                        onCheckedChange={(checked) => setFormData(p => ({ ...p, termoAnamnese: !!checked }))}
                      />
                      <Label htmlFor="termoAnamnese" className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                        Estou ciente da ficha de Anamnese no dia da sessão.
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Details */}
              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                    <UserIcon className="w-5 h-5 text-primary" />
                    <h3 className="text-xs font-bbh uppercase tracking-widest">SEUS DADOS & ESCOLHA</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-mono">Nome Completo</Label>
                      <input 
                        name="nome" value={formData.nome} onChange={handleInputChange}
                        placeholder="Nome completo"
                        className="w-full bg-background border border-border p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-mono">Idade</Label>
                      <input 
                        type="number" name="idade" value={formData.idade} onChange={handleInputChange}
                        placeholder="00"
                        className="w-full bg-background border border-border p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-mono">WhatsApp (com DDD)</Label>
                      <input 
                        name="whatsapp" value={formData.whatsapp} onChange={handleWhatsAppChange}
                        type="tel"
                        inputMode="numeric"
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="w-full bg-background border border-border p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    {isMinor() && (
                      <div className="md:col-span-2 bg-destructive/5 border border-destructive/20 p-4 space-y-3">
                        <p className="text-[11px] font-bold text-destructive uppercase tracking-widest">Atenção: Menor de Idade</p>
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            id="minor" checked={formData.termoMenorIdade} 
                            onCheckedChange={(c) => setFormData(p => ({ ...p, termoMenorIdade: !!c }))}
                          />
                          <Label htmlFor="minor" className="text-xs font-bold">Confirmo autorização dos responsáveis.</Label>
                        </div>
                      </div>
                    )}

                    <div className="md:col-span-2 space-y-4">
                      <Label className="text-[10px] uppercase tracking-widest font-mono">Tipo de Tatuagem</Label>
                      <Select 
                        value={formData.tipoTattoo} 
                        onValueChange={(v: "Flash Disponível" | "Projeto Autoral Personalizado" | "") => setFormData(p => ({ ...p, tipoTattoo: v }))}
                      >
                        <SelectTrigger >
                          <SelectValue placeholder="Selecione o tipo..." />
                        </SelectTrigger>
                        <SelectContent className="px-3 py-2">
                          <SelectItem value="Flash Disponível">Flash Disponível</SelectItem>
                          <SelectItem value="Projeto Autoral Personalizado">Projeto Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.tipoTattoo === "Flash Disponível" && (
                      <div className="md:col-span-2 space-y-4 pt-4">
                        <Label className="text-[10px] uppercase tracking-widest font-mono block mb-2">Escolha seu Flash (pode selecionar mais de um)</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {availableFlashes.map((flash) => {
                            const isSelected = formData.flashSelecionado.includes(String(flash.id));
                            return (
                              <div 
                                key={flash.id}
                                onClick={() => setFormData(p => {
                                  const alreadySelected = p.flashSelecionado.includes(String(flash.id));
                                  if (alreadySelected) {
                                    return { ...p, flashSelecionado: p.flashSelecionado.filter(id => id !== String(flash.id)) };
                                  }
                                  return { ...p, flashSelecionado: [...p.flashSelecionado, String(flash.id)] };
                                })}
                                className={cn(
                                  "cursor-pointer aspect-[3/4] relative overflow-hidden transition-all group/flash",
                                  isSelected 
                                    ? "ring-2 ring-primary border-primary bg-primary/10" 
                                    : "border border-border hover:border-primary/50"
                                )}
                              >
                                <img 
                                  src={flash.img} 
                                  alt={flash.title} 
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover/flash:scale-105" 
                                />
                                
                                {/* Readability Gradient */}
                                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/40 to-transparent z-10 pointer-events-none" />

                                {/* Title Overlay */}
                                <p className="absolute bottom-2 left-2 right-2 z-20 text-[8px] uppercase tracking-wider text-center font-bold line-clamp-1 text-black">
                                  {flash.title}
                                </p>

                                {isSelected && (
                                  <div className="absolute top-2 right-2 bg-primary text-white p-1 z-30 shadow-sm">
                                    <CheckIcon size={10} weight="bold" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {formData.tipoTattoo === "Projeto Autoral Personalizado" && (
                      <div className="md:col-span-2 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-widest font-mono">Descrição do Projeto</Label>
                          <textarea 
                            name="ideia" value={formData.ideia} onChange={handleInputChange}
                            placeholder="Local do corpo, tamanho em cm e detalhes da ideia..."
                            rows={4}
                            className="w-full bg-background border border-border p-3 text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-widest font-mono">Imagem de Referência (Opcional)</Label>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border hover:bg-accent/5 cursor-pointer transition-colors relative overflow-hidden">
                              {formData.referenciaImagem ? (
                                <div className="absolute inset-0 p-2">
                                  <img 
                                    src={URL.createObjectURL(formData.referenciaImagem)} 
                                    alt="Preview" 
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <FileTextIcon size={24} className="text-muted-foreground mb-2" />
                                  <p className="text-xs text-muted-foreground">Clique para fazer upload</p>
                                </div>
                              )}
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setFormData(p => ({ ...p, referenciaImagem: file }));
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Date & Payment */}
              {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <h3 className="text-xs font-bbh uppercase tracking-widest">DATA & PAGAMENTO</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 flex flex-col">
                        <Label className="text-[10px] uppercase tracking-widest font-mono mb-1">Selecione a Data</Label>
                        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full h-12 justify-start text-left font-normal rounded-none border-border",
                                !formData.sessao_data && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.sessao_data ? format(formData.sessao_data, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.sessao_data}
                              onSelect={(date) => {
                                setFormData(p => ({ ...p, sessao_data: date, sessao_periodo: "" }));
                                setIsDatePickerOpen(false);
                                // Dismiss keyboard if any input is still focused
                                if (document.activeElement instanceof HTMLElement) {
                                  document.activeElement.blur();
                                }
                              }}
                              disabled={(date) => {
                                const dateStr = format(date, "yyyy-MM-dd");
                                const bookedSlots = bookedDates[dateStr] || [];
                                const isFullyBooked = bookedSlots.length >= 2;
                                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                                const isSunday = date.getDay() === 0;
                                return isPast || isSunday || isFullyBooked;
                              }}
                              onDayClick={(date) => {
                                const isSunday = date.getDay() === 0;
                                const dateStr = format(date, "yyyy-MM-dd");
                                const bookedSlots = bookedDates[dateStr] || [];
                                const isFullyBooked = bookedSlots.length >= 2;
                                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                                if (isSunday) {
                                  toast.error("Não atendemos aos domingos.");
                                  return;
                                }

                                if (isPast) {
                                  toast.error("Esta data já passou.");
                                  return;
                                }

                                if (isFullyBooked) {
                                  toast.error("Esta data já está totalmente reservada.");
                                }
                              }}
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest font-mono mb-1">Período</Label>
                        <ToggleGroup 
                          type="single" 
                          value={formData.sessao_periodo}
                          onValueChange={(v: "Manhã" | "Noite" | "") => {
                            if (formData.sessao_data) {
                              const day = formData.sessao_data.getDay();
                              if (v === "Manhã" && day >= 1 && day <= 5) {
                                toast.error("Período da manhã disponível apenas aos finais de semana.");
                                return;
                              }
                              const dateStr = format(formData.sessao_data, "yyyy-MM-dd");
                              const bookedSlots = bookedDates[dateStr] || [];
                              if (bookedSlots.includes(v as any)) {
                                toast.error(`O período da ${v.toLowerCase()} já está reservado para esta data.`);
                                return;
                              }
                            }
                            setFormData(p => ({ ...p, sessao_periodo: v }));
                          }}
                          className="justify-start gap-2"
                        >
                          <ToggleGroupItem 
                            value="Manhã" 
                            disabled={formData.sessao_data ? (
                              (bookedDates[format(formData.sessao_data, "yyyy-MM-dd")] || []).includes("Manhã") || 
                              (formData.sessao_data.getDay() >= 1 && formData.sessao_data.getDay() <= 5)
                            ) : false}
                            className="h-12 border border-border px-6 flex-1 rounded-none data-[state=on]:bg-primary data-[state=on]:text-white"
                          >
                            Manhã
                          </ToggleGroupItem>
                          <ToggleGroupItem 
                            value="Noite" 
                            disabled={formData.sessao_data ? (bookedDates[format(formData.sessao_data, "yyyy-MM-dd")] || []).includes("Noite") : false}
                            className="h-12 border border-border px-6 flex-1 rounded-none data-[state=on]:bg-primary data-[state=on]:text-white"
                          >
                            Noite
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/40 space-y-4">
                      <Label className="text-[10px] uppercase tracking-widest font-mono block">Forma de Pagamento</Label>
                      <RadioGroup 
                        value={formData.formaPagamento} 
                        onValueChange={(v: "Pix" | "Dinheiro" | "Cartão de Débito" | "Cartão de Crédito" | "") => setFormData(p => ({ ...p, formaPagamento: v }))}
                        className="grid grid-cols-2 gap-4"
                      >
                        {["Pix", "Dinheiro", "Cartão de Débito", "Cartão de Crédito"].map((m) => (
                          <div
                            key={m}
                            className={cn(
                              "flex items-center space-x-2 border border-border p-4 transition-colors cursor-pointer",
                              formData.formaPagamento === m && "border-primary bg-primary/5"
                            )}
                            onClick={() => setFormData(p => ({ ...p, formaPagamento: m as "Pix" | "Dinheiro" | "Cartão de Débito" | "Cartão de Crédito" }))}
                            tabIndex={0}
                            role="button"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                setFormData(p => ({ ...p, formaPagamento: m as "Pix" | "Dinheiro" | "Cartão de Débito" | "Cartão de Crédito" }));
                              }
                         
                            }}
                          >
                            <RadioGroupItem value={m} id={m} className="border-border text-primary" />
                            <Label htmlFor={m} className="text-xs uppercase font-bold cursor-pointer">{m}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                 

                      {formData.formaPagamento === "Cartão de Crédito" && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          className="grid grid-cols-2 gap-4 pt-2"
                        >
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-mono">Bandeira</Label>
                            <Select 
                              value={formData.bandeiraCartao} 
                              onValueChange={(v) => setFormData(p => ({ ...p, bandeiraCartao: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Bandeira" />
                              </SelectTrigger>
                              <SelectContent className="px-3 py-2">
                                {BANDEIRAS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-mono">Parcelas</Label>
                            <Select 
                              value={formData.parcelasCredito} 
                              onValueChange={(v) => setFormData(p => ({ ...p, parcelasCredito: v }))}
      
                      
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Parcelas" />
                              </SelectTrigger>
                              <SelectContent  className="px-3 py-2" side="top">
                                {[...Array(12)].map((_, i) => (
                                  <SelectItem key={i+1} value={String(i+1)}>{i+1}x</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                       
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Confirmation */}
              {step === 4 && (
                <div className="space-y-8 text-center py-6 animate-in zoom-in-95">
                <div className="w-16 h-16 border border-primary text-primary flex items-center justify-center mx-auto rounded-full">
                    <StarIcon className="w-8 h-8" weight="fill" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bbh uppercase tracking-widest">Quase la!</h3>
                    <p className="text-muted-foreground text-xs max-w-sm mx-auto mt-2">Revise seu agendamento abaixo e confirme para abrir o WhatsApp.</p>
                  </div>
                  <div className="bg-muted/50 border border-border p-6 text-left space-y-3 font-mono text-[10px] uppercase">
                    <div className="border-b border-border pb-2 flex justify-between">
                      <span className="font-bold text-primary">Resumo</span>
                      <span className="opacity-50">{bookingCode}</span>
                    </div>
                    <p><strong className="text-foreground">Cliente:</strong> {formData.nome}</p>
                    <p><strong className="text-foreground">Tipo:</strong> {formData.tipoTattoo}</p>
                    {formData.tipoTattoo === "Flash Disponível" && (
                      <p><strong className="text-foreground">Flashes:</strong> {portfolioItems.filter(f => formData.flashSelecionado.includes(String(f.id))).map(f => f.title).join(", ")}</p>
                    )}
                    <p><strong className="text-foreground">Data:</strong> {formData.sessao_data && format(formData.sessao_data, "dd/MM/yyyy")} de {formData.sessao_periodo}</p>
                    <p><strong className="text-foreground">Pagamento:</strong> {formData.formaPagamento} {formData.formaPagamento === "Cartão de Crédito" && `(${formData.bandeiraCartao} ${formData.parcelasCredito}x)`}</p>
                  </div>
                </div>
              )}

              {/* STEP 5: Success */}
              {step === 5 && (
                <div className="space-y-8 text-center py-12 animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-green-500 text-white flex items-center justify-center mx-auto rounded-full shadow-lg">
                    <CheckIcon className="w-10 h-10" weight="bold" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bbh uppercase tracking-widest text-black">Agendamento enviado!</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                      Recebemos sua solicitação com sucesso. Nossa equipe entrará em contato com você pelo WhatsApp em breve para confirmar os detalhes.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 md:p-6 bg-background flex justify-between gap-4">
              {step > 1 && step < 5 ? (
                <button onClick={prevStep} className="px-8 py-4 border border-border bg-white/40 backdrop-blur-sm text-[10px] uppercase tracking-[0.25em] font-bold hover:border-black transition-all duration-150 flex items-center justify-center gap-2">
                  <ArrowLeftIcon className="mr-2" /> Voltar
                </button>
              ) : <div />}

              {step < 4 ? (
                <button onClick={nextStep} className="text-sm font-mono font-bold text-white bg-black px-6 py-2 transition-all duration-150 ease-in uppercase hover:bg-transparent hover:text-black hover:pb-0 hover:border-b-2 hover:border-black">
                  Próximo
                </button>
              ) : step === 4 ? (
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="text-sm font-mono font-bold text-white bg-black px-6 py-2 transition-all duration-150 ease-in uppercase hover:bg-transparent hover:text-black hover:pb-0 hover:border-b-2 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Agendamento"}
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setStep(1);
                    setFormData(initialFormData);
                    onClose();
                  }} 
                  className="text-sm font-mono font-bold text-white bg-black px-12 py-2 transition-all duration-150 ease-in uppercase hover:bg-transparent hover:text-black hover:pb-0 hover:border-b-2 hover:border-black w-full sm:w-auto"
                >
                  Fechar
                </button>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
