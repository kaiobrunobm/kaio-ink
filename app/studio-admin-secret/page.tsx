"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { 
  ChartLineUp, 
  Users, 
  Package, 
  Calendar as CalendarIcon, 
  Tag, 
  Calculator,
  SignOut,
  CheckCircle,
  XCircle,
  Plus,
  Trash,
  Pencil,
  ArrowUp,
  ArrowDown
} from "@phosphor-icons/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// --- Interfaces ---

interface Booking {
  id: string;
  nome: string;
  idade: string;
  whatsapp: string;
  tipo_tattoo: string;
  flash_selecionado: string[] | null;
  ideia: string;
  referencia_imagem_url: string;
  sessao_data: string;
  sessao_periodo: string;
  forma_pagamento: string;
  bandeira_cartao: string;
  parcelas_credito: string;
  termo_sinal: boolean;
  termo_anamnese: boolean;
  termo_menor_idade: boolean;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido' | 'remarcado';
  agreed_price?: number;
  sinal_amount?: number;
  final_price?: number;
  session_hours?: number;
  created_at: string;
}

interface Flash {
  id: string;
  title: string;
  style: string;
  size: string;
  value: number;
  recommended_body_part: string;
  img_url: string;
  available: boolean;
  img_fresh?: string;
  img_healed?: string;
  done_date?: string;
  healed_time?: string;
  created_at: string;
}

interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit: string;
  cost_per_unit: number;
  created_at: string;
}

interface CalendarEvent {
  id: string;
  date: string;
  end_date: string;
  type: 'block' | 'promotion';
  title: string;
  discount_percentage?: number;
  created_at: string;
}

interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  created_at: string;
}

// --- Components ---

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("Erro ao fazer login: " + error.message);
    } else {
      toast.success("Login realizado com sucesso!");
      onLogin();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 max-w-md w-full shadow-2xl space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bbh uppercase tracking-widest text-black">Kaio.ink</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Painel Administrativo Secreto</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-mono">Email</Label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border p-3 text-sm focus:ring-1 focus:ring-black outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-mono">Senha</Label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border p-3 text-sm focus:ring-1 focus:ring-black outline-none"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white p-4 font-mono font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Acessar Painel"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada.");
  };

  if (loading) return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!session) return <AdminLogin onLogin={() => {}} />;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border p-4 md:px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bbh text-xl">K</div>
          <div>
            <h1 className="text-sm font-bbh uppercase tracking-widest leading-none">Admin Dashboard</h1>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">Bem-vindo, {session.user.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500 hover:text-red-500"
          title="Sair"
        >
          <SignOut size={20} />
        </button>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <Tabs defaultValue="overview" className="space-y-8">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="bg-white border border-border h-auto p-1 rounded-none inline-flex">
              <TabsTrigger value="overview" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-none px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold font-mono">
                <ChartLineUp size={16} className="mr-2" /> Visão Geral
              </TabsTrigger>
              <TabsTrigger value="bookings" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-none px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold font-mono">
                <Users size={16} className="mr-2" /> Agendamentos
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-none px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold font-mono">
                <Package size={16} className="mr-2" /> Estoque
              </TabsTrigger>
              <TabsTrigger value="flashes" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-none px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold font-mono">
                <Tag size={16} className="mr-2" /> Autorais
              </TabsTrigger>
              <TabsTrigger value="calculator" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-none px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold font-mono">
                <Calculator size={16} className="mr-2" /> Calculadora
              </TabsTrigger>
              <TabsTrigger value="promotions" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-none px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold font-mono hidden">
                <Tag size={16} className="mr-2" /> Promoções
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <TabsContent key="overview" value="overview">
              <OverviewTab />
            </TabsContent>
            <TabsContent key="bookings" value="bookings">
              <BookingsTab />
            </TabsContent>
            <TabsContent key="inventory" value="inventory">
              <InventoryTab />
            </TabsContent>
            <TabsContent key="flashes" value="flashes">
              <FlashesTab />
            </TabsContent>
            <TabsContent key="calculator" value="calculator">
              <CalculatorTab />
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </main>
    </div>
  );
}

// --- Tab Implementations ---

function OverviewTab() {
  const [data, setData] = useState<{data: string, Faturamento: number, Despesas: number}[]>([]);
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0 });

  const fetchFinancialData = async () => {
    const { data: records, error } = await supabase
      .from('financial_records')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      // 42P01 means table does not exist
      if (error.code !== '42P01') {
        toast.error("Erro ao carregar dados financeiros.");
      }
      return;
    }

    // Process data for chart (grouped by date)
    const chartData: Record<string, { data: string, Faturamento: number, Despesas: number }> = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    (records as FinancialRecord[]).forEach(record => {
      const date = format(new Date(record.created_at), 'dd/MM');
      if (!chartData[date]) chartData[date] = { data: date, Faturamento: 0, Despesas: 0 };
      
      if (record.type === 'income') {
        chartData[date].Faturamento = Number((chartData[date].Faturamento + Number(record.amount)).toFixed(2));
        totalIncome += Number(record.amount);
      } else {
        chartData[date].Despesas = Number((chartData[date].Despesas + Number(record.amount)).toFixed(2));
        totalExpenses += Number(record.amount);
      }
    });

    setData(Object.values(chartData));
    setStats({
      income: Number(totalIncome.toFixed(2)),
      expenses: Number(totalExpenses.toFixed(2)),
      balance: Number((totalIncome - totalExpenses).toFixed(2))
    });
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-border p-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">Faturamento (70%)</span>
            <div className="p-1.5 bg-green-50 text-green-600 rounded-full">
              <ArrowUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-bbh tracking-widest">R$ {stats.income.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-border p-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">Despesas Materiais</span>
            <div className="p-1.5 bg-red-50 text-red-600 rounded-full">
              <ArrowDown size={16} />
            </div>
          </div>
          <p className="text-2xl font-bbh tracking-widest">R$ {stats.expenses.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-border p-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">Saldo Studio</span>
          </div>
          <p className={cn("text-2xl font-bbh tracking-widest", stats.balance >= 0 ? "text-black" : "text-red-600")}>
            R$ {stats.balance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white border border-border p-6 md:p-8 space-y-6">
        <h3 className="text-xs font-bbh uppercase tracking-widest">Fluxo Financeiro</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip 
                cursor={{ fill: '#f4f4f5' }}
                contentStyle={{ border: '1px solid #e4e4e7', borderRadius: '0', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                formatter={(value: number, name: string) => [`R$ ${value.toFixed(2)}`, name]}
              />
              <Bar dataKey="Faturamento" fill="#000" radius={[2, 2, 0, 0]} barSize={40} />
              <Bar dataKey="Despesas" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  
  // Calendar Event States
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [eventData, setEventData] = useState({
    id: "",
    type: "block" as "block" | "promotion",
    title: "",
    discount_percentage: "",
    end_date: undefined as Date | undefined
  });

  // Modal States
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  // Form States for Modals
  const [agreedPrice, setAgreedPrice] = useState("");
  const [sinalAmount, setSinalAmount] = useState("");
  const [newDate, setNewDate] = useState<Date | undefined>(new Date());
  const [newSessions, setNewSessions] = useState<string[]>([]);

  // Completion Form States
  const [sessionHours, setSessionHours] = useState("1");
  const [usedCartridges, setUsedCartridges] = useState<{id: string, qty: number}[]>([]);
  const [finalChargedPrice, setFinalChargedPrice] = useState("");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('sessao_data', { ascending: true });
    
    if (error) toast.error("Erro ao carregar agendamentos.");
    else setBookings(data || []);
    setLoading(false);
  };

  const fetchCalendarEvents = async () => {
    const { data } = await supabase.from('calendar_events').select('*');
    if (data) setCalendarEvents(data);
  };

  const fetchFlashes = async () => {
    const { data } = await supabase.from('flashes').select('id, title');
    if (data) setFlashes(data as unknown as Flash[]);
  };

  const fetchInventoryForModals = async () => {
    const { data } = await supabase.from('inventory').select('*');
    if (data) setInventoryItems(data);
  };

  useEffect(() => {
    fetchBookings();
    fetchInventoryForModals();
    fetchFlashes();
    fetchCalendarEvents();
  }, []);

  const handleSaveEvent = async () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const payload = {
      date: dateStr,
      end_date: eventData.end_date ? format(eventData.end_date, 'yyyy-MM-dd') : dateStr,
      type: eventData.type,
      title: eventData.title,
      discount_percentage: eventData.type === 'promotion' ? Number(eventData.discount_percentage) : null
    };

    let error;
    if (eventData.id) {
      const { error: err } = await supabase.from('calendar_events').update(payload).eq('id', eventData.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('calendar_events').insert([payload]);
      error = err;
    }

    if (error) toast.error("Erro ao salvar evento.");
    else {
      toast.success("Evento salvo!");
      setIsEventModalOpen(false);
      fetchCalendarEvents();
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Excluir este evento?")) return;
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (error) toast.error("Erro ao excluir.");
    else {
      toast.success("Evento removido.");
      fetchCalendarEvents();
    }
  };

  const calculateSetupCost = () => {
    if (inventoryItems.length === 0) return 40; // Fallback

    const descartaveis = inventoryItems.filter(i => i.category === 'Descartáveis');
    const costDescartaveis = descartaveis.reduce((acc, i) => acc + Number(i.cost_per_unit), 0);

    const tintas = inventoryItems.filter(i => i.category === 'Tintas');
    const avgTinta = tintas.length > 0 ? tintas.reduce((acc, i) => acc + Number(i.cost_per_unit), 0) / tintas.length : 0;
    
    const limpeza = inventoryItems.filter(i => i.category === 'Limpeza/Sabões');
    const avgLimpeza = limpeza.length > 0 ? limpeza.reduce((acc, i) => acc + Number(i.cost_per_unit), 0) / limpeza.length : 0;

    const cremes = inventoryItems.filter(i => i.category === 'Cremes/Pomadas');
    const avgCremes = cremes.length > 0 ? cremes.reduce((acc, i) => acc + Number(i.cost_per_unit), 0) / cremes.length : 0;

    return costDescartaveis + (avgTinta * 4) + (avgLimpeza * 10) + (avgCremes * 5);
  };

  const handleConfirmBooking = async () => {
    if (!agreedPrice || !sinalAmount) {
      toast.error("Preencha os valores acordados.");
      return;
    }

    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: 'confirmado',
        agreed_price: Number(agreedPrice),
        sinal_amount: Number(sinalAmount)
      })
      .eq('id', selectedBooking.id);

    if (error) {
      toast.error("Erro ao confirmar agendamento.");
    } else {
      // If it's a Flash booking, mark the flashes as unavailable
      if (selectedBooking.tipo_tattoo === "Flash Disponível" && selectedBooking.flash_selecionado) {
        for (const flashId of selectedBooking.flash_selecionado) {
          await supabase.from('flashes').update({ available: false }).eq('id', flashId);
        }
      }
      toast.success("Agendamento confirmado!");
      setIsConfirmModalOpen(false);
      fetchBookings();
    }
  };

  const handleCancelBooking = async (keepSinal: boolean) => {
    if (keepSinal && selectedBooking.sinal_amount > 0) {
      // Log the sinal as income (100% since it's non-refundable)
      await supabase.from('financial_records').insert({
        type: 'income',
        amount: selectedBooking.sinal_amount,
        description: `Sinal retido (Cancelamento): ${selectedBooking.nome} - Ref: ${selectedBooking.id}`,
        category: 'booking_studio_cut',
        created_at: `${selectedBooking.sessao_data}T12:00:00Z`
      });
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelado' })
      .eq('id', selectedBooking.id);

    if (error) {
      toast.error("Erro ao cancelar agendamento.");
    } else {
      toast.success(keepSinal ? "Cancelado com sinal retido." : "Cancelado.");
      setIsCancelModalOpen(false);
      fetchBookings();
    }
  };

  const handleReschedule = async () => {
    if (!selectedBooking || !newDate || newSessions.length === 0) {
      toast.error("Selecione a data e pelo menos uma sessão.");
      return;
    }
    
    const dateStr = format(newDate, 'yyyy-MM-dd');
    const sessionsStr = newSessions.join(", ");

    const { error } = await supabase
      .from('bookings')
      .update({ 
        sessao_data: dateStr, 
        sessao_periodo: sessionsStr
      })
      .eq('id', selectedBooking.id);

    if (error) {
      console.error("Supabase Error details:", error);
      toast.error("Erro ao remarcar: " + error.message);
    } else {
      toast.success("Agendamento atualizado!");
      setIsRescheduleModalOpen(false);
      fetchBookings();
    }
  };

  const handleCompleteSubmit = async () => {
    if (!finalChargedPrice) {
      toast.error("Informe o preço cobrado.");
      return;
    }

    const total = Number(finalChargedPrice);
    const studioCut = total * 0.70;

    // 1. Deduct Cartridges from Inventory
    for (const cart of usedCartridges) {
      const item = inventoryItems.find(i => i.id === cart.id);
      if (item) {
        await supabase
          .from('inventory')
          .update({ quantity: Number(item.quantity) - cart.qty })
          .eq('id', cart.id);
      }
    }

    // 2. Log financial income
    await supabase.from('financial_records').insert({
      type: 'income',
      amount: studioCut,
      description: `Booking concluído: ${selectedBooking.nome} (Total: R$ ${total}) - Ref: ${selectedBooking.id}`,
      category: 'booking_studio_cut',
      created_at: `${selectedBooking.sessao_data}T12:00:00Z`
    });

    // 3. Update status
    const { error } = await supabase.from('bookings').update({ status: 'concluido' }).eq('id', selectedBooking.id);
    
    if (error) {
      toast.error("Erro ao concluir.");
    } else {
      toast.success("Tattoo finalizada e estoque atualizado!");
      setIsCompleteModalOpen(false);
      fetchBookings();
    }
  };

  const handleCompleteBooking = (b: Booking) => {
    setSelectedBooking(b);
    setFinalChargedPrice(String(b.agreed_price || ""));
    setSessionHours("1");
    setUsedCartridges([]);
    setIsCompleteModalOpen(true);
  };

  const deleteBooking = async (b: Booking) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este registro e seu histórico financeiro?")) return;
    
    // Delete associated financial records
    const { error: finError } = await supabase
      .from('financial_records')
      .delete()
      .like('description', `%${b.id}%`);

    if (finError) {
      console.error("Erro ao excluir registros financeiros:", finError);
    }

    const { error } = await supabase.from('bookings').delete().eq('id', b.id);
    if (error) toast.error("Erro ao excluir agendamento.");
    else {
      toast.success("Registro e financeiro removidos.");
      fetchBookings();
    }
  };

  const isWithin48h = (dateStr: string) => {
    const bookingDate = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const diff = bookingDate.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);
    return hours > 0 && hours <= 48;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center bg-white border border-border p-2">
        <div className="flex gap-1">
          <button 
            onClick={() => setViewMode("list")}
            className={cn(
              "px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-colors",
              viewMode === "list" ? "bg-black text-white" : "bg-transparent text-zinc-400 hover:bg-zinc-50"
            )}
          >
            Lista
          </button>
          <button 
            onClick={() => setViewMode("calendar")}
            className={cn(
              "px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-colors",
              viewMode === "calendar" ? "bg-black text-white" : "bg-transparent text-zinc-400 hover:bg-zinc-50"
            )}
          >
            Calendário
          </button>
        </div>
        
        {viewMode === "calendar" && (
          <p className="text-[10px] uppercase font-mono text-muted-foreground mr-4 hidden md:block">
            Clique em um dia para ver detalhes ou gerenciar folgas/promoções.
          </p>
        )}
      </div>

      {viewMode === "list" ? (
        <div className="bg-white border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-border">
              <th className="p-4 text-[10px] uppercase tracking-widest font-mono font-bold">Data/Hora</th>
              <th className="p-4 text-[10px] uppercase tracking-widest font-mono font-bold">Cliente</th>
              <th className="p-4 text-[10px] uppercase tracking-widest font-mono font-bold">WhatsApp</th>
              <th className="p-4 text-[10px] uppercase tracking-widest font-mono font-bold">Tipo</th>
              <th className="p-4 text-[10px] uppercase tracking-widest font-mono font-bold">Detalhes/Ref</th>
              <th className="p-4 text-[10px] uppercase tracking-widest font-mono font-bold">Status</th>
              <th className="p-4 text-[10px] uppercase tracking-widest font-mono font-bold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map(b => (
              <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold font-sans">{format(new Date(b.sessao_data + 'T12:00:00'), 'dd/MM/yyyy')}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">{b.sessao_periodo}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-[11px] font-medium">{b.nome}</span>
                </td>
                <td className="p-4">
                  <a href={`https://wa.me/${b.whatsapp.replace(/\D/g, '')}`} target="_blank" className="text-[11px] text-zinc-500 hover:text-black underline">{b.whatsapp}</a>
                </td>
                <td className="p-4">
                  <span className="text-[10px] uppercase tracking-widest border px-2 py-0.5 rounded-none">{b.tipo_tattoo === "Flash Disponível" ? "Flash" : "Autoral"}</span>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-2 max-w-[200px]">
                    {b.tipo_tattoo === "Flash Disponível" ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-mono text-muted-foreground mb-1">Flashes:</span>
                        {b.flash_selecionado?.map((id: string) => {
                          const flash = flashes.find(f => String(f.id) === id);
                          return (
                            <span key={id} className="text-[10px] font-bold leading-tight border-l-2 border-black pl-2 py-0.5">
                              {flash ? flash.title : `Flash #${id}`}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-1">
                          {(() => {
                            try {
                              const urls = JSON.parse(b.referencia_imagem_url);
                              if (Array.isArray(urls)) {
                                return urls.map((url, i) => (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-border overflow-hidden hover:border-black transition-colors">
                                    <img src={url} alt="Ref" className="w-full h-full object-cover" />
                                  </a>
                                ));
                              }
                            } catch (e) {}

                            // Fallback for single image string
                            if (b.referencia_imagem_url) {
                              return (
                                <a href={b.referencia_imagem_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-border overflow-hidden hover:border-black transition-colors">
                                  <img src={b.referencia_imagem_url} alt="Ref" className="w-full h-full object-cover" />
                                </a>
                              );
                            }
                            return <span className="text-[9px] uppercase font-mono text-muted-foreground col-span-2">Sem ref</span>;
                          })()}
                        </div>
                        {b.ideia && (
                          <p className="text-[10px] leading-tight text-zinc-600 line-clamp-2" title={b.ideia}>
                            {b.ideia}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className={cn(
                      "text-[9px] uppercase tracking-widest font-bold px-2 py-1 inline-block w-fit",
                      b.status === 'pendente' ? "bg-amber-100 text-amber-700" :
                      b.status === 'confirmado' ? "bg-blue-100 text-blue-700" :
                      b.status === 'concluido' ? "bg-green-100 text-green-700" :
                      "bg-zinc-100 text-zinc-700"
                    )}>
                      {b.status}
                    </span>
                    {b.status === 'confirmado' && isWithin48h(b.sessao_data) && (
                      <span className="text-[8px] bg-red-500 text-white px-2 py-0.5 uppercase font-bold animate-pulse">48h Restantes</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {b.status === 'pendente' && (
                      <button 
                        onClick={() => {
                          setSelectedBooking(b);
                          setIsConfirmModalOpen(true);
                        }} 
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-full" 
                        title="Confirmar"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {b.status === 'confirmado' && (
                      <>
                        <button 
                          onClick={() => handleCompleteBooking(b)} 
                          className="p-1.5 hover:bg-green-50 text-green-600 rounded-full" 
                          title="Concluir"
                        >
                          <CheckCircle size={18} weight="fill" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedBooking(b);
                            setNewDate(b.sessao_data ? new Date(b.sessao_data + 'T12:00:00') : new Date());
                            setNewSessions(b.sessao_periodo ? b.sessao_periodo.split(", ") : []);
                            setIsRescheduleModalOpen(true);
                          }} 
                          className="p-1.5 hover:bg-zinc-100 text-zinc-600 rounded-full" 
                          title="Remarcar"
                        >
                          <CalendarIcon size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedBooking(b);
                            setIsCancelModalOpen(true);
                          }} 
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-full" 
                          title="Cancelar"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    <button onClick={() => deleteBooking(b)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-full" title="Excluir"><Trash size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-border p-8 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ptBR}
            className="w-full h-full scale-110"
            modifiers={{
              fullSession: (date) => {
                const d = format(date, 'yyyy-MM-dd');
                if (selectedDate && format(selectedDate, 'yyyy-MM-dd') === d) return false;
                
                const dayBookings = bookings.filter(b => b.sessao_data === d && ['confirmado', 'remarcado'].includes(b.status));
                const day = date.getDay();
                const periods = dayBookings.flatMap(b => b.sessao_periodo.split(", "));
                
                if (periods.includes("Manhã") && periods.includes("Noite")) return true;
                if (day >= 1 && day <= 5) return periods.includes("Noite");
                return false;
              },
              morningSession: (date) => {
                const d = format(date, 'yyyy-MM-dd');
                if (selectedDate && format(selectedDate, 'yyyy-MM-dd') === d) return false;
                
                const dayBookings = bookings.filter(b => b.sessao_data === d && ['confirmado', 'remarcado'].includes(b.status));
                const periods = dayBookings.flatMap(b => b.sessao_periodo.split(", "));
                return date.getDay() === 6 && periods.includes("Manhã") && !periods.includes("Noite");
              },
              nightSession: (date) => {
                const d = format(date, 'yyyy-MM-dd');
                if (selectedDate && format(selectedDate, 'yyyy-MM-dd') === d) return false;
                
                const dayBookings = bookings.filter(b => b.sessao_data === d && ['confirmado', 'remarcado'].includes(b.status));
                const periods = dayBookings.flatMap(b => b.sessao_periodo.split(", "));
                return date.getDay() === 6 && periods.includes("Noite") && !periods.includes("Manhã");
              },
              isBlock: (date) => {
                const d = format(date, 'yyyy-MM-dd');
                if (selectedDate && format(selectedDate, 'yyyy-MM-dd') === d) return false;
                return calendarEvents.some(e => e.type === 'block' && d >= e.date && d <= (e.end_date || e.date));
              },
              isPromo: (date) => {
                const d = format(date, 'yyyy-MM-dd');
                if (selectedDate && format(selectedDate, 'yyyy-MM-dd') === d) return false;
                return calendarEvents.some(e => e.type === 'promotion' && d >= e.date && d <= (e.end_date || e.date));
              },
            }}
            modifiersStyles={{
              fullSession: { 
                border: '2px solid #ef4444', 
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                borderRadius: '8px'
              },
              morningSession: {
                borderLeft: '4px solid #ef4444',
                backgroundColor: '#fff1f2',
                borderRadius: '8px'
              },
              nightSession: {
                borderRight: '4px solid #ef4444',
                backgroundColor: '#fff1f2',
                borderRadius: '8px'
              },
              isBlock: { backgroundColor: '#f4f4f5', color: '#71717a', borderRadius: '8px', opacity: 0.5 },
              isPromo: { backgroundColor: '#d1fae5', color: '#10b981', borderRadius: '8px' },
            }}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border p-6 space-y-4">
            <h3 className="text-xs font-bbh uppercase tracking-widest border-b pb-4">
              Dia {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}
            </h3>

            {/* Day Actions */}
            <div className="flex gap-2">
              <Button 
                size="sm" variant="outline" className="flex-1 rounded-none text-[9px] uppercase"
                onClick={() => {
                  setEventData({ id: "", type: "block", title: "Folga / Fechado", discount_percentage: "" });
                  setIsEventModalOpen(true);
                }}
              >
                Bloquear Dia
              </Button>
              <Button 
                size="sm" variant="outline" className="flex-1 rounded-none text-[9px] uppercase"
                onClick={() => {
                  setEventData({ id: "", type: "promotion", title: "", discount_percentage: "10" });
                  setIsEventModalOpen(true);
                }}
              >
                Add Promoção
              </Button>
            </div>

            {/* Day Content */}
            <div className="space-y-4 pt-4">
              {/* Events */}
              {calendarEvents.filter(e => e.date === (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '')).map(e => (
                <div key={e.id} className={cn(
                  "p-3 border flex justify-between items-center",
                  e.type === 'block' ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"
                )}>
                  <div>
                    <p className="text-[10px] font-bold uppercase">{e.title || (e.type === 'block' ? 'Bloqueado' : 'Promoção')}</p>
                    {e.discount_percentage && <p className="text-[9px] font-mono">{e.discount_percentage}% OFF</p>}
                  </div>
                  <button onClick={() => handleDeleteEvent(e.id)} className="text-zinc-400 hover:text-red-500">
                    <Trash size={14} />
                  </button>
                </div>
              ))}

              {/* Bookings for the day */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-mono text-muted-foreground border-b pb-2">Agendamentos</h4>
                {bookings.filter(b => b.sessao_data === (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '')).map(b => (
                  <div key={b.id} className="border border-border p-4 space-y-3 hover:border-black transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[11px] font-bold">{b.nome}</p>
                        <p className="text-[9px] uppercase font-mono text-muted-foreground">{b.sessao_periodo}</p>
                      </div>
                      <span className={cn(
                        "text-[8px] uppercase font-bold px-1.5 py-0.5",
                        b.status === 'confirmado' ? "bg-blue-100 text-blue-700" : "bg-zinc-100"
                      )}>{b.status}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      {(() => {
                        try {
                          const urls = JSON.parse(b.referencia_imagem_url);
                          if (Array.isArray(urls)) {
                            return urls.map((url, i) => (
                              <img key={i} src={url} className="w-full aspect-square object-cover border border-border" alt="Ref" />
                            ));
                          }
                        } catch(e) {}
                        if (b.referencia_imagem_url) return <img src={b.referencia_imagem_url} className="w-full aspect-square object-cover border border-border" alt="Ref" />;
                        return null;
                      })()}
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Button 
                        asChild size="sm" className="flex-1 rounded-none text-[9px] uppercase h-8 bg-green-600 hover:bg-green-700"
                      >
                        <a href={`https://wa.me/${b.whatsapp.replace(/\D/g, '')}`} target="_blank">WhatsApp</a>
                      </Button>
                      <Button 
                        size="sm" variant="outline" className="rounded-none text-[9px] uppercase h-8"
                        onClick={() => {
                          setSelectedBooking(b);
                          setIsDetailsModalOpen(true);
                        }}
                      >
                        Ver Tudo
                      </Button>
                    </div>
                  </div>
                ))}
                {bookings.filter(b => b.sessao_data === (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '')).length === 0 && (
                  <p className="text-[10px] uppercase font-mono text-zinc-400 text-center py-4 italic">Nenhum agendamento para este dia.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Booking Details Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 overflow-y-auto backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-white max-w-2xl w-full relative shadow-2xl"
            >
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-zinc-100 transition-colors z-10"
              >
                <XCircle size={24} />
              </button>

              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-xs font-bbh uppercase tracking-widest border-b pb-4">Detalhes do Agendamento</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6">
                    <div>
                      <p className="text-[10px] uppercase font-mono text-muted-foreground">Cliente</p>
                      <p className="text-sm font-bold">{selectedBooking.nome}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-muted-foreground">Idade</p>
                      <p className="text-sm font-bold">{selectedBooking.idade} anos</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-muted-foreground">Status</p>
                      <span className={cn(
                        "text-[9px] uppercase font-bold px-2 py-0.5 inline-block mt-1",
                        selectedBooking.status === 'confirmado' ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-600"
                      )}>{selectedBooking.status}</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-muted-foreground">Data</p>
                      <p className="text-sm font-bold">{selectedBooking.sessao_data ? format(new Date(selectedBooking.sessao_data + 'T12:00:00'), 'dd/MM/yyyy') : 'Não definida'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-muted-foreground">Período</p>
                      <p className="text-sm font-bold">{selectedBooking.sessao_periodo}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-muted-foreground">Tipo</p>
                      <p className="text-sm font-bold">{selectedBooking.tipo_tattoo}</p>
                    </div>
                  </div>
                </div>

                {selectedBooking.ideia && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-mono text-muted-foreground">Ideia / Descrição</p>
                    <div className="bg-zinc-50 border border-zinc-100 p-4 text-sm leading-relaxed whitespace-pre-wrap italic">
                      "{selectedBooking.ideia}"
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-[10px] uppercase font-mono text-muted-foreground">Referências Visual</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(() => {
                      try {
                        const urls = JSON.parse(selectedBooking.referencia_imagem_url);
                        if (Array.isArray(urls)) {
                          return urls.map((url, i) => (
                            <div 
                              key={i} 
                              onClick={() => setZoomedImage(url)}
                              className="aspect-square border border-border overflow-hidden cursor-zoom-in hover:border-black transition-all group"
                            >
                              <img src={url} alt="Ref" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            </div>
                          ));
                        }
                      } catch(e) {}
                      if (selectedBooking.referencia_imagem_url) {
                        return (
                          <div 
                            onClick={() => setZoomedImage(selectedBooking.referencia_imagem_url)}
                            className="aspect-square border border-border overflow-hidden cursor-zoom-in hover:border-black transition-all group"
                          >
                            <img src={selectedBooking.referencia_imagem_url} alt="Ref" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          </div>
                        );
                      }
                      return <p className="text-[10px] uppercase font-mono text-zinc-400 italic">Nenhuma imagem enviada.</p>;
                    })()}
                  </div>
                </div>

                <div className="pt-6 border-t flex gap-4">
                  <Button 
                    asChild className="flex-1 rounded-none text-[10px] uppercase font-bold bg-green-600 hover:bg-green-700"
                  >
                    <a href={`https://wa.me/${selectedBooking.whatsapp.replace(/\D/g, '')}`} target="_blank">Chat no WhatsApp</a>
                  </Button>
                  <Button 
                    variant="outline" className="flex-1 rounded-none text-[10px] uppercase font-bold"
                    onClick={() => setIsDetailsModalOpen(false)}
                  >
                    Fechar Detalhes
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox / Zoomed Image */}
      <AnimatePresence>
        {zoomedImage && (
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 md:p-12"
            onClick={() => setZoomedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full h-full flex items-center justify-center"
            >
              <img src={zoomedImage} className="max-w-full max-h-full object-contain shadow-2xl" alt="Zoomed" />
              <button 
                onClick={() => setZoomedImage(null)}
                className="absolute top-0 right-0 m-4 text-white p-2 hover:bg-white/10 rounded-full"
              >
                <XCircle size={32} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Event Management Modal */}
      <AnimatePresence>
      {isEventModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white p-8 max-w-2xl w-full space-y-6">
            <h3 className="text-xs font-bbh uppercase tracking-widest border-b pb-4">Gerenciar Dia</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Tipo de Evento</Label>
                  <select 
                    value={eventData.type} 
                    onChange={e => setEventData(p => ({ ...p, type: e.target.value as 'block' | 'promotion' }))}
                    className="w-full border p-3 text-sm outline-none bg-white"
                  >
                    <option value="block">Bloquear Dia (Folga)</option>
                    <option value="promotion">Promoção</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-mono">Data de Início</Label>
                    <div className="border border-border flex justify-center p-2 bg-zinc-50 grayscale opacity-70 cursor-not-allowed">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        locale={ptBR}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-mono">Data de Fim (Opcional)</Label>
                    <div className="border border-border flex justify-center p-2 bg-white">
                      <Calendar
                        mode="single"
                        selected={eventData.end_date}
                        onSelect={d => setEventData(p => ({ ...p, end_date: d }))}
                        locale={ptBR}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Título / Motivo</Label>
                  <input 
                    value={eventData.title} 
                    onChange={e => setEventData(p => ({ ...p, title: e.target.value }))}
                    className="w-full border p-3 text-sm outline-none" 
                    placeholder="Ex: Feriado / Flash Day"
                  />
                </div>
              {eventData.type === 'promotion' && (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Desconto (%)</Label>
                  <input 
                    type="number"
                    value={eventData.discount_percentage} 
                    onChange={e => setEventData(p => ({ ...p, discount_percentage: e.target.value }))}
                    className="w-full border p-3 text-sm outline-none" 
                  />
                </div>
              )}
              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={() => setIsEventModalOpen(false)}>Cancelar</Button>
                <Button className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={handleSaveEvent}>Salvar</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
      
      {/* Confirm Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 max-w-sm w-full space-y-6"
            >
              <h3 className="text-xs font-bbh uppercase tracking-widest">Confirmar Agendamento</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Preço Acordado (Total)</Label>
                  <input type="number" value={agreedPrice} onChange={e => setAgreedPrice(e.target.value)} className="w-full border p-3 text-sm outline-none" placeholder="Ex: 500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Valor do Sinal (Pago)</Label>
                  <input type="number" value={sinalAmount} onChange={e => setSinalAmount(e.target.value)} className="w-full border p-3 text-sm outline-none" placeholder="Ex: 100" />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={() => setIsConfirmModalOpen(false)}>Sair</Button>
                  <Button className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={handleConfirmBooking}>Confirmar</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {isRescheduleModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 max-w-md w-full space-y-6 my-8"
            >
              <h3 className="text-xs font-bbh uppercase tracking-widest border-b pb-4">Remarcar Sessão</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Nova Data</Label>
                  <div className="border border-border flex justify-center p-2 bg-zinc-50">
                    <Calendar
                      mode="single"
                      selected={newDate}
                      onSelect={setNewDate}
                      locale={ptBR}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Sessões</Label>
                  <div className="flex gap-2">
                    {["Manhã", "Noite"].map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          setNewSessions(prev => 
                            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                          );
                        }}
                        className={cn(
                          "flex-1 py-3 text-[10px] uppercase font-bold tracking-widest border transition-all",
                          newSessions.includes(s) 
                            ? "bg-black text-white border-black" 
                            : "bg-white text-zinc-400 border-border hover:border-zinc-300"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={() => setIsRescheduleModalOpen(false)}>Sair</Button>
                  <Button className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={handleReschedule}>Confirmar Mudança</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 max-w-sm w-full space-y-6"
            >
              <h3 className="text-xs font-bbh uppercase tracking-widest">Cancelar Agendamento</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Deseja reter o sinal de **R$ {selectedBooking?.sinal_amount}** como faturamento do studio?
              </p>
              <div className="pt-4 flex flex-col gap-3">
                <Button className="rounded-none text-[10px] uppercase font-bold bg-red-600 hover:bg-red-700" onClick={() => handleCancelBooking(true)}>Sim, Reter Sinal</Button>
                <Button variant="outline" className="rounded-none text-[10px] uppercase font-bold" onClick={() => handleCancelBooking(false)}>Não, Devolver Tudo</Button>
                <Button variant="ghost" className="rounded-none text-[10px] uppercase font-bold" onClick={() => setIsCancelModalOpen(false)}>Voltar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Complete Session Modal */}
      <AnimatePresence>
        {isCompleteModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 max-w-lg w-full space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="border-b pb-4">
                <h3 className="text-xs font-bbh uppercase tracking-widest">Finalizar Trabalho</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-mono mt-1">Cliente: {selectedBooking.nome}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-mono">Tempo de Sessão (Horas)</Label>
                    <input 
                      type="number" value={sessionHours} onChange={e => setSessionHours(e.target.value)}
                      className="w-full border p-3 text-sm outline-none" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-mono block">Cartuchos Utilizados</Label>
                    <select 
                      className="w-full border p-3 text-sm outline-none bg-white mb-2"
                      onChange={(e) => {
                        const id = e.target.value;
                        if (!id) return;
                        if (!usedCartridges.find(c => c.id === id)) {
                          setUsedCartridges(prev => [...prev, { id, qty: 1 }]);
                        }
                      }}
                      value=""
                    >
                      <option value="">+ Selecionar Cartucho</option>
                      {inventoryItems.filter(i => i.category === 'Agulhas/Cartuchos').map(i => (
                        <option key={i.id} value={i.id}>{i.item_name} (Estoque: {i.quantity})</option>
                      ))}
                    </select>

                    <div className="space-y-2">
                      {usedCartridges.map(cart => {
                        const item = inventoryItems.find(i => i.id === cart.id);
                        return (
                          <div key={cart.id} className="flex items-center justify-between bg-zinc-50 p-2 border">
                            <span className="text-[10px] uppercase font-bold">{item?.item_name}</span>
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" value={cart.qty}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setUsedCartridges(prev => prev.map(c => c.id === cart.id ? { ...c, qty: val } : c));
                                }}
                                className="w-12 border p-1 text-center text-xs"
                              />
                              <button onClick={() => setUsedCartridges(prev => prev.filter(c => c.id !== cart.id))} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                <Trash size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-black text-white p-6 space-y-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-mono text-zinc-400">Resumo de Custos</h4>
                  <div className="space-y-2 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span>Setup Base:</span>
                      <span>R$ {calculateSetupCost().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mão de obra:</span>
                      <span>R$ {(Number(sessionHours) * 40).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cartuchos:</span>
                      <span>R$ {usedCartridges.reduce((acc, c) => {
                        const item = inventoryItems.find(i => i.id === c.id);
                        return acc + (Number(item?.cost_per_unit || 0) * c.qty);
                      }, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-800 pt-2 font-bold text-accent">
                      <span>Sugerido:</span>
                      <span>R$ {(
                        calculateSetupCost() + 
                        (Number(sessionHours) * 40) + 
                        usedCartridges.reduce((acc, c) => {
                          const item = inventoryItems.find(i => i.id === c.id);
                          return acc + (Number(item?.cost_per_unit || 0) * c.qty);
                        }, 0)
                      ).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-mono text-zinc-400">Preço Final Cobrado (R$)</Label>
                    <input 
                      type="number" value={finalChargedPrice} onChange={e => setFinalChargedPrice(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 p-3 text-sm outline-none text-white focus:border-accent transition-colors" 
                    />
                  </div>

                  <div className="pt-4 border-t border-zinc-800 space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-mono">
                      <span className="text-zinc-400">Divisão Studio (70%):</span>
                      <span className="font-bold text-accent">R$ {(Number(finalChargedPrice) * 0.70).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase font-mono">
                      <span className="text-zinc-400">Sua Parte (30%):</span>
                      <span className="font-bold">R$ {(Number(finalChargedPrice) * 0.30).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={() => setIsCompleteModalOpen(false)}>Cancelar</Button>
                <Button className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={handleCompleteSubmit}>Concluir e Baixar Estoque</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InventoryTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [isConsumeModalOpen, setIsConsumeModalOpen] = useState(false);

  const [newItemData, setNewItemData] = useState({
    item_name: "",
    category: "Agulhas/Cartuchos",
    quantity: "0",
    min_quantity: "5",
    unit: "un",
    purchase_price: "0" // Helper for calculation
  });
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [consumingItem, setConsumingItem] = useState<InventoryItem | null>(null);
  const [consumeAmount, setConsumeAmount] = useState("");

  const categories = [
    "Agulhas/Cartuchos",
    "Tintas",
    "Descartáveis",
    "Cremes/Pomadas",
    "Limpeza/Sabões",
    "Outros"
  ];

  const fetchInventory = async () => {
    const { data, error } = await supabase.from('inventory').select('*').order('item_name', { ascending: true });
    if (error) {
      if (error.code !== '42P01') {
        toast.error("Erro ao carregar estoque.");
      }
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleCreateItem = async () => {
    if (!newItemData.item_name) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }

    const qty = Number(newItemData.quantity);
    const totalPrice = Number(newItemData.purchase_price);
    const calculatedCost = qty > 0 ? Number((totalPrice / qty).toFixed(4)) : 0;

    const { error } = await supabase
      .from('inventory')
      .insert([{
        item_name: newItemData.item_name,
        category: newItemData.category,
        quantity: qty,
        min_quantity: Number(newItemData.min_quantity),
        cost_per_unit: calculatedCost,
        unit: newItemData.unit
      }]);

    if (error) {
      toast.error("Erro ao criar item.");
    } else {
      if (totalPrice > 0) {
        await supabase.from('financial_records').insert({
          type: 'expense',
          amount: totalPrice,
          description: `Estoque inicial: ${newItemData.item_name}`,
          category: 'inventory_restock'
        });
      }

      toast.success("Item adicionado ao estoque!");
      setIsNewItemModalOpen(false);
      setNewItemData({
        item_name: "",
        category: "Agulhas/Cartuchos",
        quantity: "0",
        min_quantity: "5",
        unit: "un",
        purchase_price: "0"
      });
      fetchInventory();
    }
  };

  const handleEditItem = async () => {
    if (!editingItem.item_name) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }

    const { error } = await supabase
      .from('inventory')
      .update({
        item_name: editingItem.item_name,
        category: editingItem.category,
        min_quantity: Number(editingItem.min_quantity),
        cost_per_unit: Number(editingItem.cost_per_unit),
        unit: editingItem.unit
      })
      .eq('id', editingItem.id);

    if (error) {
      toast.error("Erro ao atualizar item.");
    } else {
      toast.success("Item atualizado!");
      setIsEditItemModalOpen(false);
      setEditingItem(null);
      fetchInventory();
    }
  };

  const addStock = async (id: string, currentQty: number, item: InventoryItem) => {
    const qtyInput = window.prompt(`Quantidade comprada (${item.unit}):`);
    if (!qtyInput) return;
    
    const priceInput = window.prompt("Valor total pago (R$):");
    if (!priceInput) return;

    const amountAdded = Number(qtyInput);
    const totalPrice = Number(priceInput);
    const newCostPerUnit = Number((totalPrice / amountAdded).toFixed(4));

    const { error: updateError } = await supabase
      .from('inventory')
      .update({ 
        quantity: currentQty + amountAdded,
        cost_per_unit: newCostPerUnit
      })
      .eq('id', id);

    if (updateError) {
      toast.error("Erro ao atualizar estoque.");
      return;
    }

    await supabase.from('financial_records').insert({
      type: 'expense',
      amount: totalPrice,
      description: `Reposição: ${item.item_name} (${amountAdded}${item.unit})`,
      category: 'inventory_restock'
    });

    toast.success("Estoque atualizado e despesa registrada!");
    fetchInventory();
  };

  const handleConsume = async (amount: number, overrideItem?: InventoryItem) => {
    const targetItem = overrideItem || consumingItem;
    
    if (!targetItem || targetItem.quantity < amount) {
      toast.error("Quantidade insuficiente no estoque.");
      return;
    }
    
    const { error } = await supabase
      .from('inventory')
      .update({ quantity: Number((targetItem.quantity - amount).toFixed(2)) })
      .eq('id', targetItem.id);

    if (error) {
      toast.error("Erro ao atualizar.");
    } else {
      setIsConsumeModalOpen(false);
      setConsumingItem(null);
      setConsumeAmount("");
      fetchInventory();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bbh uppercase tracking-widest">Controle de Materiais</h3>
        <Button 
          size="sm" 
          className="rounded-none text-[10px] uppercase font-bold tracking-widest"
          onClick={() => setIsNewItemModalOpen(true)}
        >
          <Plus size={16} className="mr-2" /> Novo Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => {
          const isLow = item.quantity <= item.min_quantity;
          const isCritical = item.quantity <= item.min_quantity / 2;
          const totalInvested = Number(item.quantity) * Number(item.cost_per_unit);
          
          return (
            <div key={item.id} className="bg-white border border-border p-6 space-y-4 relative group">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[11px] font-bold uppercase">{item.item_name}</h4>
                  <p className="text-[9px] text-muted-foreground uppercase font-mono">{item.category}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={cn(
                    "text-[10px] font-mono px-2 py-1 font-bold",
                    isCritical ? "bg-red-500 text-white" : 
                    isLow ? "bg-amber-400 text-white" : 
                    "bg-green-500 text-white"
                  )}>
                    {item.quantity} <span className="text-[8px] opacity-70 uppercase">{(item.category === 'Tintas' && (item.unit === 'un' || !item.unit)) ? 'ml' : (item.unit || 'un')}</span>
                  </span>
                  <button 
                    onClick={() => {
                      setEditingItem(item);
                      setIsEditItemModalOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-100 rounded transition-all text-zinc-400 hover:text-black"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted-foreground font-mono uppercase">Custo: R$ {Number(item.cost_per_unit).toFixed(2)}/{(item.category === 'Tintas' && (item.unit === 'un' || !item.unit)) ? 'ml' : (item.unit || 'un')}</span>
                  <span className="text-[10px] font-bold font-mono text-zinc-800">Total: R$ {totalInvested.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      if (item.unit === 'un' || !item.unit) {
                        setConsumingItem(item);
                        handleConsume(1, item);
                      } else {
                        setConsumingItem(item);
                        setIsConsumeModalOpen(true);
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center border border-border hover:bg-zinc-100 transition-colors"
                  >
                    <ArrowDown size={14} className="text-red-500" />
                  </button>
                  <button 
                    onClick={() => addStock(item.id, item.quantity, item)}
                    className="w-8 h-8 flex items-center justify-center border border-border hover:bg-zinc-100 transition-colors"
                  >
                    <Plus size={14} className="text-green-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Item Modal */}
      <AnimatePresence>
        {isNewItemModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 max-w-md w-full space-y-6"
            >
              <h3 className="text-xs font-bbh uppercase tracking-widest border-b pb-4">Cadastrar Novo Material</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Nome do Item</Label>
                  <input 
                    value={newItemData.item_name} 
                    onChange={e => setNewItemData(p => ({ ...p, item_name: e.target.value }))}
                    className="w-full border p-3 text-sm outline-none" 
                    placeholder="Ex: Cartucho RL 03" 
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Categoria</Label>
                  <select 
                    value={newItemData.category}
                    onChange={e => {
                      const cat = e.target.value;
                      setNewItemData(p => ({ 
                        ...p, 
                        category: cat,
                        unit: (cat === 'Tintas' || cat === 'Limpeza/Sabões') ? 'ml' : (cat === 'Cremes/Pomadas' ? 'g' : 'un')
                      }));
                    }}
                    className="w-full border p-3 text-sm outline-none bg-white"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Unidade de Medida</Label>
                  <select 
                    value={newItemData.unit}
                    onChange={e => setNewItemData(p => ({ ...p, unit: e.target.value }))}
                    className="w-full border p-3 text-sm outline-none bg-white"
                  >
                    <option value="un">Unidade (un)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="g">Gramas (g)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Qtd Inicial / Tamanho</Label>
                  <input 
                    type="number" 
                    value={newItemData.quantity} 
                    onChange={e => setNewItemData(p => ({ ...p, quantity: e.target.value }))}
                    className="w-full border p-3 text-sm outline-none" 
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Qtd Mínima Alerta</Label>
                  <input 
                    type="number" 
                    value={newItemData.min_quantity} 
                    onChange={e => setNewItemData(p => ({ ...p, min_quantity: e.target.value }))}
                    className="w-full border p-3 text-sm outline-none" 
                    placeholder="5"
                  />
                </div>
                <div className="col-span-2 space-y-2 bg-zinc-50 p-4 border border-zinc-200">
                  <Label className="text-[10px] uppercase tracking-widest font-mono font-bold">Assistente de Custo</Label>
                  <div className="flex gap-2 items-center mt-2">
                    <div className="flex-1 space-y-1">
                      <span className="text-[9px] uppercase font-mono text-muted-foreground">Valor Total Pago (R$)</span>
                      <input 
                        type="number" 
                        value={newItemData.purchase_price} 
                        onChange={e => setNewItemData(p => ({ ...p, purchase_price: e.target.value }))}
                        className="w-full border p-2 text-sm outline-none bg-white" 
                        placeholder="0.00"
                      />
                    </div>
                    <div className="text-[10px] font-mono pt-4">= R$ {(Number(newItemData.purchase_price) / (Number(newItemData.quantity) || 1)).toFixed(2)}/{newItemData.unit}</div>
                  </div>
                </div>
                <div className="col-span-2 pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={() => setIsNewItemModalOpen(false)}>Sair</Button>
                  <Button className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={handleCreateItem}>Cadastrar</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {isEditItemModalOpen && editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 max-w-md w-full space-y-6"
            >
              <h3 className="text-xs font-bbh uppercase tracking-widest border-b pb-4">Editar Material</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Nome do Item</Label>
                  <input 
                    value={editingItem.item_name} 
                    onChange={e => setEditingItem(p => p ? ({ ...p, item_name: e.target.value }) : null)}
                    className="w-full border p-3 text-sm outline-none" 
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Categoria</Label>
                  <select 
                    value={editingItem.category}
                    onChange={e => setEditingItem(p => p ? ({ ...p, category: e.target.value }) : null)}
                    className="w-full border p-3 text-sm outline-none bg-white"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Unidade de Medida</Label>
                  <select 
                    value={editingItem.unit}
                    onChange={e => setEditingItem(p => p ? ({ ...p, unit: e.target.value }) : null)}
                    className="w-full border p-3 text-sm outline-none bg-white"
                  >
                    <option value="un">Unidade (un)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="g">Gramas (g)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Qtd Mínima</Label>
                  <input 
                    type="number" 
                    value={editingItem.min_quantity} 
                    onChange={e => setEditingItem(p => p ? ({ ...p, min_quantity: Number(e.target.value) }) : null)}
                    className="w-full border p-3 text-sm outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Custo por Unidade (R$)</Label>
                  <input 
                    type="number" 
                    value={editingItem.cost_per_unit} 
                    onChange={e => setEditingItem(p => p ? ({ ...p, cost_per_unit: Number(e.target.value) }) : null)}
                    className="w-full border p-3 text-sm outline-none" 
                  />
                </div>
                <div className="col-span-2 pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={() => setIsEditItemModalOpen(false)}>Sair</Button>
                  <Button className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={handleEditItem}>Salvar Alterações</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Consume Modal (Smart Consumption) */}
      <AnimatePresence>
        {isConsumeModalOpen && consumingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 max-w-sm w-full space-y-6 text-center"
            >
              <div className="space-y-2">
                <h3 className="text-xs font-bbh uppercase tracking-widest">Consumir Material</h3>
                <p className="text-[10px] uppercase font-mono text-muted-foreground">{consumingItem.item_name} ({consumingItem.quantity}{consumingItem.unit})</p>
              </div>

              {/* Presets based on Categoria/Nome */}
              <div className="grid grid-cols-1 gap-3">
                {consumingItem.category === 'Tintas' && (
                  <>
                    <Button variant="outline" className="rounded-none text-[10px] uppercase font-bold border-zinc-200" onClick={() => handleConsume(2)}>Batoque M (2ml)</Button>
                    <Button variant="outline" className="rounded-none text-[10px] uppercase font-bold border-zinc-200" onClick={() => handleConsume(4)}>Batoque G (4ml)</Button>
                  </>
                )}
                {consumingItem.category === 'Limpeza/Sabões' || consumingItem.item_name.toLowerCase().includes('soap') ? (
                  <Button variant="outline" className="rounded-none text-[10px] uppercase font-bold border-zinc-200" onClick={() => handleConsume(250)}>Refil Foamer (250ml)</Button>
                ) : null}
                
                {/* Custom Input */}
                <div className="pt-4 space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono block">Quantidade Customizada ({consumingItem.unit})</Label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={consumeAmount} 
                      onChange={e => setConsumeAmount(e.target.value)}
                      className="flex-1 border p-2 text-sm outline-none text-center" 
                      placeholder="0.00"
                    />
                    <Button className="rounded-none text-[10px] uppercase font-bold" onClick={() => handleConsume(Number(consumeAmount))}>Ok</Button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="ghost" className="w-full rounded-none text-[10px] uppercase font-bold text-muted-foreground" onClick={() => {
                  setIsConsumeModalOpen(false);
                  setConsumingItem(null);
                  setConsumeAmount("");
                }}>Cancelar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CalculatorTab() {
  const [hours, setHours] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedCartridges, setSelectedCartridges] = useState<{id: string, qty: number}[]>([]);

  const fetchInventory = async () => {
    const { data } = await supabase.from('inventory').select('*');
    if (data) setInventoryItems(data);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const calculateSetupCost = () => {
    if (inventoryItems.length === 0) return 40;
    const descartaveis = inventoryItems.filter(i => i.category === 'Descartáveis');
    const costDescartaveis = descartaveis.reduce((acc, i) => acc + Number(i.cost_per_unit), 0);
    const tintas = inventoryItems.filter(i => i.category === 'Tintas');
    const avgTinta = tintas.length > 0 ? tintas.reduce((acc, i) => acc + Number(i.cost_per_unit), 0) / tintas.length : 0;
    const limpeza = inventoryItems.filter(i => i.category === 'Limpeza/Sabões');
    const avgLimpeza = limpeza.length > 0 ? limpeza.reduce((acc, i) => acc + Number(i.cost_per_unit), 0) / limpeza.length : 0;
    const cremes = inventoryItems.filter(i => i.category === 'Cremes/Pomadas');
    const avgCremes = cremes.length > 0 ? cremes.reduce((acc, i) => acc + Number(i.cost_per_unit), 0) / cremes.length : 0;
    return costDescartaveis + (avgTinta * 4) + (avgLimpeza * 10) + (avgCremes * 5);
  };

  const baseMaterial = calculateSetupCost();
  const hourRate = 40;

  const cartridgesCost = selectedCartridges.reduce((acc, c) => {
    const item = inventoryItems.find(i => i.id === c.id);
    return acc + (Number(item?.cost_per_unit || 0) * c.qty);
  }, 0);

  const totalPrice = (hours * hourRate) + baseMaterial + cartridgesCost;
  const discountedPrice = totalPrice * (1 - discount / 100);

  const artistCut = discountedPrice * 0.30;
  const studioCut = discountedPrice * 0.50;
  const savings = discountedPrice * 0.20;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      <div className="bg-white border border-border p-8 space-y-8">
        <h3 className="text-xs font-bbh uppercase tracking-widest">Orcamento Tecnico</h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-mono">Tempo Estimado (Horas)</Label>
            <input 
              type="number" 
              value={hours} 
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full border border-border p-3 text-sm focus:ring-1 focus:ring-black outline-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-mono block">Cartuchos</Label>
            <select 
              className="w-full border p-3 text-sm outline-none bg-white mb-2"
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                if (!selectedCartridges.find(c => c.id === id)) {
                  setSelectedCartridges(prev => [...prev, { id, qty: 1 }]);
                }
              }}
              value=""
            >
              <option value="">+ Adicionar Cartucho</option>
              {inventoryItems.filter(i => i.category === 'Agulhas/Cartuchos').map(i => (
                <option key={i.id} value={i.id}>{i.item_name}</option>
              ))}
            </select>
            <div className="space-y-2">
              {selectedCartridges.map(cart => {
                const item = inventoryItems.find(i => i.id === cart.id);
                return (
                  <div key={cart.id} className="flex items-center justify-between bg-zinc-50 p-2 border">
                    <span className="text-[10px] uppercase font-bold">{item?.item_name}</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" value={cart.qty}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setSelectedCartridges(prev => prev.map(c => c.id === cart.id ? { ...c, qty: val } : c));
                        }}
                        className="w-12 border p-1 text-center text-xs"
                      />
                      <button onClick={() => setSelectedCartridges(prev => prev.filter(c => c.id !== cart.id))} className="text-red-500">
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-mono">Desconto (%)</Label>
            <input 
              type="number" 
              value={discount} 
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full border border-border p-3 text-sm focus:ring-1 focus:ring-black outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-black text-white p-8 space-y-8">
        <h3 className="text-xs font-bbh uppercase tracking-widest text-zinc-400">Distribuicao de Valores</h3>
        
        <div className="space-y-6">
          <div className="flex justify-between items-baseline border-b border-zinc-800 pb-4">
            <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-400">Preço Total</span>
            <span className="text-3xl font-bbh tracking-widest text-accent">R$ {discountedPrice.toFixed(2)}</span>
          </div>

          <div className="space-y-4 text-[11px] font-mono border-b border-zinc-800 pb-4 mb-4">
            <div className="flex justify-between text-zinc-500">
              <span>Setup (Dinâmico):</span>
              <span>R$ {baseMaterial.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Mão de obra:</span>
              <span>R$ {(hours * 40).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Cartuchos:</span>
              <span>R$ {cartridgesCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-400">Sua Parte (30%)</span>
              <span className="font-bold">R$ {artistCut.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-400">Studio (50%)</span>
              <span className="font-bold">R$ {studioCut.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-accent">
              <span className="text-[10px] uppercase tracking-widest font-mono">Reservas (20%)</span>
              <span className="font-bold">R$ {savings.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-8 space-y-2">
            <p className="text-[9px] text-zinc-500 uppercase font-mono leading-relaxed">
              * Setup Base calculado em tempo real com base nos seus preços de estoque.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FlashesTab() {
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewFlashModalOpen, setIsNewFlashModalOpen] = useState(false);
  const [isEditFlashModalOpen, setIsEditFlashModalOpen] = useState(false);
  const [isDoneModalOpen, setIsDoneModalOpen] = useState(false);
  const [isHealedModalOpen, setIsHealedModalOpen] = useState(false);
  
  const [selectedFlash, setSelectedFlash] = useState<Flash | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [newFlashData, setNewFlashData] = useState({
    title: "",
    style: "Blackwork",
    size: "",
    value: "",
    recommended_body_part: "",
    image: null as File | null
  });

  const [editFlashData, setEditFlashData] = useState({
    title: "",
    style: "",
    size: "",
    value: "",
    recommended_body_part: ""
  });

  const [doneData, setDoneData] = useState({
    done_date: new Date(),
    image_fresh: null as File | null
  });

  const [healedData, setHealedData] = useState({
    healed_time: "",
    image_healed: null as File | null
  });

  const fetchFlashes = async () => {
    const { data, error } = await supabase.from('flashes').select('*').order('created_at', { ascending: true });
    if (error) toast.error("Erro ao carregar flashes.");
    else setFlashes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFlashes();
  }, []);

  const uploadImage = async (file: File, bucket: string = 'references') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl;
  };

  const handleCreateFlash = async () => {
    if (!newFlashData.title || !newFlashData.image) {
      toast.error("Título e imagem são obrigatórios.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(newFlashData.image);
      const { error } = await supabase.from('flashes').insert([{
        title: newFlashData.title,
        style: newFlashData.style,
        size: newFlashData.size,
        value: Number(newFlashData.value),
        recommended_body_part: newFlashData.recommended_body_part,
        img_url: url,
        available: true
      }]);
      if (error) throw error;
      toast.success("Flash adicionado!");
      setIsNewFlashModalOpen(false);
      setNewFlashData({ title: "", style: "Blackwork", size: "", value: "", recommended_body_part: "", image: null });
      fetchFlashes();
    } catch (e: unknown) {
      toast.error("Erro: " + (e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleEditFlash = async () => {
    if (!editFlashData.title) {
      toast.error("Título é obrigatório.");
      return;
    }
    setUploading(true);
    try {
      const { error } = await supabase.from('flashes').update({
        title: editFlashData.title,
        style: editFlashData.style,
        size: editFlashData.size,
        value: Number(editFlashData.value),
        recommended_body_part: editFlashData.recommended_body_part
      }).eq('id', selectedFlash.id);
      
      if (error) throw error;
      toast.success("Informações atualizadas!");
      setIsEditFlashModalOpen(false);
      fetchFlashes();
    } catch (e: unknown) {
      toast.error("Erro: " + (e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleMarkAsDone = async () => {
    if (!doneData.image_fresh || !doneData.done_date) {
      toast.error("A foto e a data são obrigatórias.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(doneData.image_fresh);
      const formattedDate = format(doneData.done_date, "MMM yyyy", { locale: ptBR });
      
      const { error } = await supabase.from('flashes').update({
        available: false,
        img_fresh: url,
        done_date: formattedDate
      }).eq('id', selectedFlash.id);

      if (error) throw error;
      toast.success("Tattoo marcada como feita!");
      setIsDoneModalOpen(false);
      fetchFlashes();
    } catch (e: unknown) {
      toast.error("Erro: " + (e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddHealed = async () => {
    if (!healedData.image_healed) {
      toast.error("A foto cicatrizada é obrigatória.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(healedData.image_healed);
      const { error } = await supabase.from('flashes').update({
        img_healed: url,
        healed_time: healedData.healed_time
      }).eq('id', selectedFlash.id);
      if (error) throw error;
      toast.success("Foto cicatrizada adicionada!");
      setIsHealedModalOpen(false);
      fetchFlashes();
    } catch (e: unknown) {
      toast.error("Erro: " + (e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const deleteFlash = async (id: string) => {
    if (!confirm("Excluir permanentemente este flash/portfólio?")) return;
    const { error } = await supabase.from('flashes').delete().eq('id', id);
    if (error) toast.error("Erro ao excluir.");
    else {
      toast.success("Removido.");
      fetchFlashes();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bbh uppercase tracking-widest">Flashes & Portfolio</h3>
        <Button size="sm" className="rounded-none text-[10px] uppercase font-bold tracking-widest" onClick={() => setIsNewFlashModalOpen(true)}>
          <Plus size={16} className="mr-2" /> Novo Flash
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {flashes.map(f => (
          <div key={f.id} className="bg-white border border-border overflow-hidden flex flex-col group relative">
            <div className="aspect-[3/4] relative overflow-hidden bg-zinc-100">
              <img src={f.img_url} alt={f.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              {!f.available && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
                  <span className="text-[10px] text-white border border-white px-3 py-1 uppercase tracking-[0.2em] font-bold">Tattoo Feita</span>
                </div>
              )}
              {/* Quick Edit Button */}
              <button 
                onClick={() => {
                  setSelectedFlash(f);
                  setEditFlashData({
                    title: f.title,
                    style: f.style,
                    size: f.size,
                    value: String(f.value),
                    recommended_body_part: f.recommended_body_part
                  });
                  setIsEditFlashModalOpen(true);
                }}
                className="absolute top-2 left-2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
              >
                <Pencil size={14} className="text-black" />
              </button>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h4 className="text-[11px] font-bold uppercase truncate">{f.title}</h4>
              <p className="text-[9px] text-muted-foreground uppercase font-mono mt-1">{f.style} • {f.size}</p>
              
              <div className="mt-auto pt-4 flex gap-2">
                {f.available ? (
                  <Button variant="outline" size="sm" className="flex-1 rounded-none text-[9px] uppercase font-bold" onClick={() => { setSelectedFlash(f); setIsDoneModalOpen(true); }}>
                    Marcar Feita
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1 rounded-none text-[9px] uppercase font-bold" onClick={() => { setSelectedFlash(f); setIsHealedModalOpen(true); }}>
                    {f.img_healed ? "Edit Cicatriz" : "+ Cicatrizada"}
                  </Button>
                )}
                <button onClick={() => deleteFlash(f.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                  <Trash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Flash Modal */}
      <AnimatePresence>
        {isNewFlashModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white p-8 max-w-md w-full space-y-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xs font-bbh uppercase tracking-widest border-b pb-4">Novo Flash Disponivel</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Título do Flash</Label>
                  <input value={newFlashData.title} onChange={e => setNewFlashData(p => ({ ...p, title: e.target.value }))} className="w-full border p-3 text-sm outline-none" placeholder="Ex: Garça Imperial" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-mono">Tamanho (cm)</Label>
                    <input value={newFlashData.size} onChange={e => setNewFlashData(p => ({ ...p, size: e.target.value }))} className="w-full border p-3 text-sm outline-none" placeholder="15cm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-mono">Valor (R$)</Label>
                    <input type="number" value={newFlashData.value} onChange={e => setNewFlashData(p => ({ ...p, value: e.target.value }))} className="w-full border p-3 text-sm outline-none" placeholder="250" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Estilo</Label>
                  <input value={newFlashData.style} onChange={e => setNewFlashData(p => ({ ...p, style: e.target.value }))} className="w-full border p-3 text-sm outline-none" placeholder="Blackwork / Oldschool" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Locais Recomendados</Label>
                  <input value={newFlashData.recommended_body_part} onChange={e => setNewFlashData(p => ({ ...p, recommended_body_part: e.target.value }))} className="w-full border p-3 text-sm outline-none" placeholder="Panturrilha - Braço" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Desenho do Flash</Label>
                  <input type="file" accept="image/*" onChange={e => setNewFlashData(p => ({ ...p, image: e.target.files?.[0] || null }))} className="w-full text-xs font-mono" />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={() => setIsNewFlashModalOpen(false)}>Sair</Button>
                  <Button className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={handleCreateFlash} disabled={uploading}>{uploading ? "Fazendo Upload..." : "Publicar Flash"}</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Flash Modal */}
      <AnimatePresence>
        {isEditFlashModalOpen && selectedFlash && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white p-8 max-w-md w-full space-y-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xs font-bbh uppercase tracking-widest border-b pb-4">Editar Flash / Trabalho</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Título</Label>
                  <input value={editFlashData.title} onChange={e => setEditFlashData(p => ({ ...p, title: e.target.value }))} className="w-full border p-3 text-sm outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-mono">Tamanho</Label>
                    <input value={editFlashData.size} onChange={e => setEditFlashData(p => ({ ...p, size: e.target.value }))} className="w-full border p-3 text-sm outline-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-mono">Valor (R$)</Label>
                    <input type="number" value={editFlashData.value} onChange={e => setEditFlashData(p => ({ ...p, value: e.target.value }))} className="w-full border p-3 text-sm outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Estilo</Label>
                  <input value={editFlashData.style} onChange={e => setEditFlashData(p => ({ ...p, style: e.target.value }))} className="w-full border p-3 text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Locais</Label>
                  <input value={editFlashData.recommended_body_part} onChange={e => setEditFlashData(p => ({ ...p, recommended_body_part: e.target.value }))} className="w-full border p-3 text-sm outline-none" />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={() => setIsEditFlashModalOpen(false)}>Cancelar</Button>
                  <Button className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={handleEditFlash} disabled={uploading}>Salvar Alterações</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mark as Done Modal */}
      <AnimatePresence>
        {isDoneModalOpen && selectedFlash && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white p-8 max-w-sm w-full space-y-6">
              <h3 className="text-xs font-bbh uppercase tracking-widest border-b pb-4">Concluir Tattoo</h3>
              <div className="space-y-4">
                <div className="space-y-2 flex flex-col">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Data de Realização</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal rounded-none border-border",
                          !doneData.done_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {doneData.done_date ? format(doneData.done_date, "PPP", { locale: ptBR }) : <span>Escolha a data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[110]" align="start">
                      <Calendar
                        mode="single"
                        selected={doneData.done_date}
                        onSelect={(date) => setDoneData(p => ({ ...p, done_date: date || new Date() }))}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Foto da Tattoo Feita (Fresh)</Label>
                  <input type="file" accept="image/*" onChange={e => setDoneData(p => ({ ...p, image_fresh: e.target.files?.[0] || null }))} className="w-full text-xs font-mono" />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={() => setIsDoneModalOpen(false)}>Sair</Button>
                  <Button className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={handleMarkAsDone} disabled={uploading}>{uploading ? "Salvando..." : "Confirmar Conclusão"}</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Healed Modal */}
      <AnimatePresence>
        {isHealedModalOpen && selectedFlash && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white p-8 max-w-sm w-full space-y-6">
              <h3 className="text-xs font-bbh uppercase tracking-widest border-b pb-4">Foto Cicatrizada</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Tempo de Cicatriz (ex: 3 meses)</Label>
                  <input value={healedData.healed_time} onChange={e => setHealedData(p => ({ ...p, healed_time: e.target.value }))} className="w-full border p-3 text-sm outline-none" placeholder="Ex: 6 meses" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Upload Foto Cicatrizada</Label>
                  <input type="file" accept="image/*" onChange={e => setHealedData(p => ({ ...p, image_healed: e.target.files?.[0] || null }))} className="w-full text-xs font-mono" />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={() => setIsHealedModalOpen(false)}>Sair</Button>
                  <Button className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={handleAddHealed} disabled={uploading}>{uploading ? "Enviando..." : "Salvar Foto"}</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


