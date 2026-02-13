import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp, Users, DollarSign, Target, Sparkles, UserSearch,
  ArrowUpRight, ArrowDownRight, AlertTriangle, AlertOctagon, TrendingDown,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { AnaliseDialog } from "@/components/AnaliseDialog";
import { AnaliseGeralDialog } from "@/components/AnaliseGeralDialog";
import { ClienteSelectorDialog } from "@/components/ClienteSelectorDialog";
import { ClientesListDialog } from "@/components/ClientesListDialog";
import { AdminDashboard } from "@/components/AdminDashboard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const vendedorRevenueData = [
  { mes: "Ago", vendas: 28500 },
  { mes: "Set", vendas: 32100 },
  { mes: "Out", vendas: 29800 },
  { mes: "Nov", vendas: 38200 },
  { mes: "Dez", vendas: 45600 },
  { mes: "Jan", vendas: 35400 },
  { mes: "Fev", vendas: 42300 },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default function Index() {
  const { user, isLoading, userRole } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalClientes: 0,
    clientesAtivos: 0,
    clientesInativos: 0,
    clientesEmRisco: 0,
    clientesCriticos: 0,
    vendasMes: 0,
    ticketMedio: 0,
    ticketMedioBaixo: 0,
  });
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [analiseGeralOpen, setAnaliseGeralOpen] = useState(false);
  const [analiseIndividualOpen, setAnaliseIndividualOpen] = useState(false);
  const [clienteSelectorOpen, setClienteSelectorOpen] = useState(false);
  const [sugestoesGerais, setSugestoesGerais] = useState<any[] | null>(null);
  const [analiseIndividual, setAnaliseIndividual] = useState<string | null>(null);
  const [isLoadingAnalise, setIsLoadingAnalise] = useState(false);
  const [clientesListOpen, setClientesListOpen] = useState(false);
  const [clientesList, setClientesList] = useState<any[]>([]);
  const [clientesListTitle, setClientesListTitle] = useState("");
  const [clientesListDescription, setClientesListDescription] = useState("");
  const [todosClientes, setTodosClientes] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user && userRole === "vendedor") {
      loadMetrics();
    }
  }, [user, userRole]);

  const loadMetrics = async () => {
    if (!user) return;

    setIsLoadingMetrics(true);
    try {
      const { data: clientes } = await supabase
        .from("clientes")
        .select("*, pedidos(valor_total, data_pedido)")
        .eq("vendedor_id", user.id);

      if (!clientes) return;

      setTodosClientes(clientes);

      const agora = new Date();
      const mesAtual = agora.getMonth();
      const anoAtual = agora.getFullYear();
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(agora.getDate() - 30);
      const sessentaDiasAtras = new Date();
      sessentaDiasAtras.setDate(agora.getDate() - 60);

      const clientesAtivos = clientes.filter(c =>
        c.ultima_compra && new Date(c.ultima_compra) > trintaDiasAtras
      ).length;

      const clientesEmRisco = clientes.filter(c =>
        c.ultima_compra &&
        new Date(c.ultima_compra) <= trintaDiasAtras &&
        new Date(c.ultima_compra) > sessentaDiasAtras
      ).length;

      const clientesCriticos = clientes.filter(c =>
        !c.ultima_compra || new Date(c.ultima_compra) <= sessentaDiasAtras
      ).length;

      const clientesInativos = clientesCriticos;

      let vendasMes = 0;
      clientes.forEach(cliente => {
        if (cliente.pedidos && Array.isArray(cliente.pedidos)) {
          cliente.pedidos.forEach((pedido: any) => {
            const dataPedido = new Date(pedido.data_pedido);
            if (dataPedido.getMonth() === mesAtual && dataPedido.getFullYear() === anoAtual) {
              vendasMes += Number(pedido.valor_total);
            }
          });
        }
      });

      const totalTickets = clientes.reduce((sum, c) => sum + Number(c.ticket_medio || 0), 0);
      const ticketMedio = clientes.length > 0 ? totalTickets / clientes.length : 0;

      const ticketMedioBaixo = clientes.filter(c => Number(c.ticket_medio || 0) < 200).length;

      setMetrics({
        totalClientes: clientes.length,
        clientesAtivos,
        clientesInativos,
        clientesEmRisco,
        clientesCriticos,
        vendasMes,
        ticketMedio,
        ticketMedioBaixo,
      });
    } catch (error) {
      console.error("Erro ao carregar metricas:", error);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const handleAnaliseGeral = async () => {
    if (!user) return;

    setAnaliseGeralOpen(true);
    setIsLoadingAnalise(true);
    setSugestoesGerais(null);

    try {
      const { data, error } = await supabase.functions.invoke('analise-geral', {
        body: {}
      });

      if (error) throw error;

      setSugestoesGerais(data.sugestoesClientes);
      toast.success("Analise gerada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao gerar analise geral:", error);
      toast.error("Erro ao gerar analise: " + (error.message || "Erro desconhecido"));
    } finally {
      setIsLoadingAnalise(false);
    }
  };

  const handleAnaliseIndividual = async (clienteId: string) => {
    if (!user) return;

    setAnaliseIndividualOpen(true);
    setIsLoadingAnalise(true);
    setAnaliseIndividual(null);
    setClienteSelectorOpen(false);

    try {
      const { data, error } = await supabase.functions.invoke('analise-individual', {
        body: { clienteId }
      });

      if (error) throw error;

      setAnaliseIndividual(data.analise);
      toast.success("Analise individual gerada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao gerar analise individual:", error);
      toast.error("Erro ao gerar analise: " + (error.message || "Erro desconhecido"));
    } finally {
      setIsLoadingAnalise(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const performance = metrics.totalClientes > 0
    ? ((metrics.clientesAtivos / metrics.totalClientes) * 100).toFixed(1)
    : "0";

  const kpiCards = [
    {
      title: "Total de Clientes",
      value: isLoadingMetrics ? "..." : String(metrics.totalClientes),
      subtitle: `${metrics.clientesAtivos} ativos / ${metrics.clientesInativos} inativos`,
      icon: Users,
      gradient: "from-sky-500 to-cyan-400",
      bgGlow: "bg-sky-500/20",
      trend: "+4.2%",
      trendUp: true,
    },
    {
      title: "Vendas do Mes",
      value: isLoadingMetrics ? "..." : formatCurrency(metrics.vendasMes),
      subtitle: "Ultimos 30 dias",
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-400",
      bgGlow: "bg-emerald-500/20",
      trend: "+11.8%",
      trendUp: true,
    },
    {
      title: "Ticket Medio",
      value: isLoadingMetrics ? "..." : formatCurrency(metrics.ticketMedio),
      subtitle: "Por cliente",
      icon: Target,
      gradient: "from-violet-500 to-purple-400",
      bgGlow: "bg-violet-500/20",
      trend: "+3.5%",
      trendUp: true,
    },
    {
      title: "Performance",
      value: isLoadingMetrics ? "..." : `${performance}%`,
      subtitle: "Taxa de atividade",
      icon: TrendingUp,
      gradient: "from-blue-500 to-indigo-400",
      bgGlow: "bg-blue-500/20",
      trend: "+2.1%",
      trendUp: true,
    },
  ];

  const alertCards = [
    {
      title: "Em Risco",
      value: metrics.clientesEmRisco,
      subtitle: "30-60 dias sem comprar",
      icon: AlertTriangle,
      color: "amber",
      onClick: () => {
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(new Date().getDate() - 30);
        const sessentaDiasAtras = new Date();
        sessentaDiasAtras.setDate(new Date().getDate() - 60);
        const filtered = todosClientes.filter(c =>
          c.ultima_compra &&
          new Date(c.ultima_compra) <= trintaDiasAtras &&
          new Date(c.ultima_compra) > sessentaDiasAtras
        );
        setClientesList(filtered);
        setClientesListTitle("Clientes em Risco");
        setClientesListDescription("Clientes que nao compram ha 30-60 dias");
        setClientesListOpen(true);
      }
    },
    {
      title: "Criticos",
      value: metrics.clientesCriticos,
      subtitle: "+60 dias sem comprar",
      icon: AlertOctagon,
      color: "red",
      onClick: () => {
        const sessentaDiasAtras = new Date();
        sessentaDiasAtras.setDate(new Date().getDate() - 60);
        const filtered = todosClientes.filter(c =>
          !c.ultima_compra || new Date(c.ultima_compra) <= sessentaDiasAtras
        );
        setClientesList(filtered);
        setClientesListTitle("Clientes Criticos");
        setClientesListDescription("Clientes que nao compram ha mais de 60 dias");
        setClientesListOpen(true);
      }
    },
    {
      title: "Ticket Baixo",
      value: metrics.ticketMedioBaixo,
      subtitle: "Abaixo de R$ 200",
      icon: TrendingDown,
      color: "orange",
      onClick: () => {
        const filtered = todosClientes.filter(c =>
          Number(c.ticket_medio || 0) < 200
        );
        setClientesList(filtered);
        setClientesListTitle("Clientes com Ticket Baixo");
        setClientesListDescription("Clientes com ticket medio abaixo de R$ 200");
        setClientesListOpen(true);
      }
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-white/[0.06] bg-card/30 backdrop-blur-xl sticky top-0 z-10 shrink-0">
            <div className="px-4 md:px-6 lg:px-8 py-4 flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-bold tracking-tight">
                  {userRole === "admin" ? "Painel Administrativo" : "Dashboard"}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {userRole === "admin"
                    ? "Visao geral de toda a operacao"
                    : "Gestao da sua carteira de clientes"
                  }
                </p>
              </div>
              {userRole === "admin" && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-primary">Sistema Online</span>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            {userRole === "vendedor" ? (
              <div className="space-y-6 max-w-[1400px] mx-auto">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {kpiCards.map((kpi, index) => (
                    <Card
                      key={kpi.title}
                      className={`glass overflow-hidden relative group hover:border-white/20 transition-all duration-500 animate-fade-in-up stagger-${index + 1}`}
                    >
                      <div className={`absolute -top-12 -right-12 w-40 h-40 ${kpi.bgGlow} rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700`} />
                      <CardContent className="p-5 relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2 rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-lg shadow-black/20`}>
                            <kpi.icon className="h-4 w-4 text-white" />
                          </div>
                          <div className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            kpi.trendUp
                              ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'
                              : 'text-red-400 bg-red-400/10 border border-red-400/20'
                          }`}>
                            {kpi.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {kpi.trend}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-0.5">{kpi.title}</p>
                        <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{kpi.subtitle}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Alert Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {alertCards.map((alert, i) => {
                    const colorMap: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
                      amber: {
                        border: "border-amber-500/30",
                        bg: "bg-amber-500/5 hover:bg-amber-500/10",
                        text: "text-amber-400",
                        iconBg: "bg-amber-500/20",
                      },
                      red: {
                        border: "border-red-500/30",
                        bg: "bg-red-500/5 hover:bg-red-500/10",
                        text: "text-red-400",
                        iconBg: "bg-red-500/20",
                      },
                      orange: {
                        border: "border-orange-500/30",
                        bg: "bg-orange-500/5 hover:bg-orange-500/10",
                        text: "text-orange-400",
                        iconBg: "bg-orange-500/20",
                      },
                    };
                    const colors = colorMap[alert.color];
                    return (
                      <Card
                        key={alert.title}
                        className={`${colors.border} ${colors.bg} cursor-pointer transition-all duration-300 animate-fade-in-up`}
                        style={{ animationDelay: `${0.25 + i * 0.05}s` }}
                        onClick={alert.onClick}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${colors.iconBg}`}>
                            <alert.icon className={`h-5 w-5 ${colors.text}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">{alert.title}</p>
                            <p className={`text-2xl font-bold ${colors.text}`}>
                              {isLoadingMetrics ? "..." : alert.value}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{alert.subtitle}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Revenue Chart */}
                <Card className="glass animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">Evolucao de Vendas</CardTitle>
                        <CardDescription>Faturamento mensal - Ultimos 7 meses</CardDescription>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                        <ArrowUpRight className="h-3 w-3" />
                        +18.5% YoY
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={vendedorRevenueData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="mes" stroke="rgba(255,255,255,0.25)" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload?.[0]) {
                                return (
                                  <div className="glass-strong rounded-xl p-3 text-sm shadow-2xl">
                                    <p className="font-semibold mb-1">{label}</p>
                                    <p className="text-xs text-primary">{formatCurrency(payload[0].value as number)}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area type="monotone" dataKey="vendas" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#colorVendas)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Analysis Section */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <Card className="glass gradient-border overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-violet-500 shadow-lg shadow-sky-500/20">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">Analise Geral do Dia</CardTitle>
                          <CardDescription className="text-xs">Visao estrategica da sua carteira</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={handleAnaliseGeral}
                        className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/20 transition-all duration-300"
                        size="lg"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Gerar Analise com IA
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass gradient-border overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.55s' }}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                          <UserSearch className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">Analise Individual</CardTitle>
                          <CardDescription className="text-xs">Analise profunda de um cliente</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => setClienteSelectorOpen(true)}
                        variant="outline"
                        className="w-full border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300"
                        size="lg"
                      >
                        <UserSearch className="h-4 w-4 mr-2" />
                        Selecionar Cliente
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <AdminDashboard />
            )}
          </main>
        </div>
      </div>

      <AnaliseGeralDialog
        open={analiseGeralOpen}
        onOpenChange={setAnaliseGeralOpen}
        sugestoes={sugestoesGerais}
        isLoading={isLoadingAnalise}
      />

      <AnaliseDialog
        open={analiseIndividualOpen}
        onOpenChange={setAnaliseIndividualOpen}
        titulo="Analise Individual de Cliente"
        descricao="Analise detalhada e acoes recomendadas"
        analise={analiseIndividual}
        isLoading={isLoadingAnalise}
      />

      <ClienteSelectorDialog
        open={clienteSelectorOpen}
        onOpenChange={setClienteSelectorOpen}
        onSelect={handleAnaliseIndividual}
        userId={user?.id || ""}
      />

      <ClientesListDialog
        open={clientesListOpen}
        onOpenChange={setClientesListOpen}
        clientes={clientesList}
        title={clientesListTitle}
        description={clientesListDescription}
      />
    </SidebarProvider>
  );
}
