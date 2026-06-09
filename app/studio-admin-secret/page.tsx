"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ChartLineUp, 
  Users, 
  Package, 
  Calendar, 
  Tag, 
  Calculator,
  SignOut,
  CheckCircle,
  XCircle,
  Plus,
  Trash,
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const [session, setSession] = useState<any>(null);
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
                <Tag size={16} className="mr-2" /> Flashes
              </TabsTrigger>
              <TabsTrigger value="calculator" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-none px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold font-mono">
                <Calculator size={16} className="mr-2" /> Calculadora
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
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0 });

  useEffect(() => {
    fetchFinancialData();
  }, []);

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
    const chartData: any = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    records.forEach(record => {
      const date = format(new Date(record.created_at), 'dd/MM');
      if (!chartData[date]) chartData[date] = { date, income: 0, expense: 0 };
      
      if (record.type === 'income') {
        chartData[date].income = Number((chartData[date].income + Number(record.amount)).toFixed(2));
        totalIncome += Number(record.amount);
      } else {
        chartData[date].expense = Number((chartData[date].expense + Number(record.amount)).toFixed(2));
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
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip 
                cursor={{ fill: '#f4f4f5' }}
                contentStyle={{ border: '1px solid #e4e4e7', borderRadius: '0', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
              />
              <Bar dataKey="income" fill="#000" radius={[2, 2, 0, 0]} barSize={40} />
              <Bar dataKey="expense" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

function BookingsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  
  // Form States for Modals
  const [agreedPrice, setAgreedPrice] = useState("");
  const [sinalAmount, setSinalAmount] = useState("");
  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('sessao_data', { ascending: true });
    
    if (error) toast.error("Erro ao carregar agendamentos.");
    else setBookings(data || []);
    setLoading(false);
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
        description: `Sinal retido (Cancelamento): ${selectedBooking.nome}`,
        category: 'booking_studio_cut'
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
    if (!newDate) return;
    const { error } = await supabase
      .from('bookings')
      .update({ sessao_data: newDate })
      .eq('id', selectedBooking.id);

    if (error) {
      toast.error("Erro ao remarcar.");
    } else {
      toast.success("Data atualizada.");
      setIsRescheduleModalOpen(false);
      fetchBookings();
    }
  };

  const handleCompleteBooking = async (b: any) => {
    const total = Number(b.agreed_price);
    const studioCut = total * 0.70;

    await supabase.from('financial_records').insert({
      type: 'income',
      amount: studioCut,
      description: `Booking concluído: ${b.nome} (Total: R$ ${total})`,
      category: 'booking_studio_cut'
    });

    const { error } = await supabase.from('bookings').update({ status: 'concluido' }).eq('id', b.id);
    if (error) toast.error("Erro ao concluir.");
    else {
      toast.success("Trabalho concluído e financeiro atualizado!");
      fetchBookings();
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este registro?")) return;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) toast.error("Erro ao excluir.");
    else {
      toast.success("Registro removido.");
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
      className="bg-white border border-border overflow-hidden"
    >
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
                    {b.referencia_imagem_url ? (
                      <a 
                        href={b.referencia_imagem_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-12 h-12 border border-border overflow-hidden hover:border-black transition-colors block"
                      >
                        <img 
                          src={b.referencia_imagem_url} 
                          alt="Referência" 
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ) : (
                      <span className="text-[9px] uppercase font-mono text-muted-foreground">Sem ref</span>
                    )}
                    {b.ideia && (
                      <p className="text-[10px] leading-tight text-zinc-600 line-clamp-2" title={b.ideia}>
                        {b.ideia}
                      </p>
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
                            setIsRescheduleModalOpen(true);
                          }} 
                          className="p-1.5 hover:bg-zinc-100 text-zinc-600 rounded-full" 
                          title="Remarcar"
                        >
                          <Calendar size={18} />
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
                    <button onClick={() => deleteBooking(b.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-full" title="Excluir"><Trash size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Modals --- */}
      
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 max-w-sm w-full space-y-6"
            >
              <h3 className="text-xs font-bbh uppercase tracking-widest">Remarcar Sessão</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-mono">Nova Data</Label>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full border p-3 text-sm outline-none" />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={() => setIsRescheduleModalOpen(false)}>Sair</Button>
                  <Button className="flex-1 rounded-none text-[10px] uppercase font-bold" onClick={handleReschedule}>Atualizar</Button>
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
    </motion.div>
  );
}

function InventoryTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

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

  const addStock = async (id: string, currentQty: number, costPerUnit: number) => {
    const qty = window.prompt("Quantas unidades deseja adicionar?");
    if (!qty) return;
    
    const amountAdded = Number(qty);
    const totalCost = amountAdded * costPerUnit;

    const { error: updateError } = await supabase
      .from('inventory')
      .update({ quantity: currentQty + amountAdded })
      .eq('id', id);

    if (updateError) {
      toast.error("Erro ao atualizar estoque.");
      return;
    }

    // Log expense
    await supabase.from('financial_records').insert({
      type: 'expense',
      amount: totalCost,
      description: `Reposição de estoque (${qty} unidades)`,
      category: 'inventory_restock'
    });

    toast.success("Estoque atualizado e despesa registrada!");
    fetchInventory();
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
        <Button size="sm" className="rounded-none text-[10px] uppercase font-bold tracking-widest">
          <Plus size={16} className="mr-2" /> Novo Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white border border-border p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-[11px] font-bold uppercase">{item.item_name}</h4>
                <p className="text-[9px] text-muted-foreground uppercase font-mono">{item.category}</p>
              </div>
              <span className={cn(
                "text-[10px] font-mono px-2 py-1",
                item.quantity <= item.min_quantity ? "bg-red-100 text-red-700 font-bold" : "bg-zinc-100 text-zinc-600"
              )}>
                {item.quantity} un
              </span>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
              <span className="text-[10px] text-muted-foreground font-mono">Custo/Un: R$ {Number(item.cost_per_unit).toFixed(2)}</span>
              <button 
                onClick={() => addStock(item.id, item.quantity, item.cost_per_unit)}
                className="text-[10px] font-bold uppercase text-primary hover:underline"
              >
                Repor Estoque
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function CalculatorTab() {
  const [hours, setHours] = useState(1);
  const [cartridges, setCartridges] = useState(1);
  const [discount, setDiscount] = useState(0);

  const baseMaterial = 40;
  const hourRate = 40;
  const cartridgeRate = 11;

  const totalPrice = (hours * hourRate) + baseMaterial + (cartridges * cartridgeRate);
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
        <h3 className="text-xs font-bbh uppercase tracking-widest">Orçamento Técnico</h3>
        
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
            <Label className="text-[10px] uppercase tracking-widest font-mono">Quantidade de Cartuchos</Label>
            <input 
              type="number" 
              value={cartridges} 
              onChange={(e) => setCartridges(Number(e.target.value))}
              className="w-full border border-border p-3 text-sm focus:ring-1 focus:ring-black outline-none"
            />
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
        <h3 className="text-xs font-bbh uppercase tracking-widest text-zinc-400">Distribuição de Valores</h3>
        
        <div className="space-y-6">
          <div className="flex justify-between items-baseline border-b border-zinc-800 pb-4">
            <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-400">Preço Total</span>
            <span className="text-3xl font-bbh tracking-widest text-accent">R$ {discountedPrice.toFixed(2)}</span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-400">Kaio (30%)</span>
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
              * Base material: R$ 40,00 | Hora: R$ 40,00 | Cartucho: R$ 11,00/un.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FlashesTab() {
  return (
    <div className="p-12 text-center bg-white border border-border border-dashed">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Gerenciamento de flashes em desenvolvimento...</p>
    </div>
  );
}

// Utility
function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
