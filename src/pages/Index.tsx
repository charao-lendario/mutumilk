import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Target, Sparkles, UserSearch } from "lucide-react";
import { toast } from "sonner";
import { AnaliseDialog } from "@/components/AnaliseDialog";
import { ClienteSelectorDialog } from "@/components/ClienteSelectorDialog";
import { AdminDashboard } from "@/components/AdminDashboard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

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
  const [analiseGeral, setAnaliseGeral] = useState<string | null>(null);
  const [analiseIndividual, setAnaliseIndividual] = useState<string | null>(null);
  const [isLoadingAnalise, setIsLoadingAnalise] = useState(false);

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

      const agora = new Date();
      const mesAtual = agora.getMonth();
      const anoAtual = agora.getFullYear();
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(agora.getDate() - 30);
      const sessentaDiasAtras = new Date();
      sessentaDiasAtras.setDate(agora.getDate() - 60);

      // CLIENTES ATIVOS: Última compra nos últimos 30 dias
      const clientesAtivos = clientes.filter(c => 
        c.ultima_compra && new Date(c.ultima_compra) > trintaDiasAtras
      ).length;

      // CLIENTES EM RISCO: Última compra entre 30-60 dias (precisa atenção!)
      const clientesEmRisco = clientes.filter(c =>
        c.ultima_compra && 
        new Date(c.ultima_compra) <= trintaDiasAtras &&
        new Date(c.ultima_compra) > sessentaDiasAtras
      ).length;

      // CLIENTES CRÍTICOS/INATIVOS: Última compra há mais de 60 dias (urgente!)
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

      // Identificar clientes com ticket médio BAIXO (abaixo de R$ 200)
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
      console.error("Erro ao carregar métricas:", error);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const handleAnaliseGeral = async () => {
    if (!user) return;
    
    setAnaliseGeralOpen(true);
    setIsLoadingAnalise(true);
    setAnaliseGeral(null);

    try {
      const { data, error } = await supabase.functions.invoke('analise-geral', {
        body: {}
      });

      if (error) throw error;

      setAnaliseGeral(data.analise);
      toast.success("Análise gerada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao gerar análise:", error);
      toast.error("Erro ao gerar análise: " + (error.message || "Erro desconhecido"));
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
      toast.success("Análise individual gerada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao gerar análise individual:", error);
      toast.error("Erro ao gerar análise: " + (error.message || "Erro desconhecido"));
    } finally {
      setIsLoadingAnalise(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shrink-0">
            <div className="px-3 md:px-6 py-3 flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex-1 min-w-0">
                <h1 className="text-base md:text-xl font-bold truncate">Gestão Comercial</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  {userRole === "admin" ? "Painel Administrativo" : "Dashboard do Vendedor"}
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-3 md:p-6 lg:p-8 overflow-auto">
            {userRole === "vendedor" ? (
              <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
                {/* Métricas */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {isLoadingMetrics ? "..." : metrics.totalClientes}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {metrics.clientesAtivos} ativos / {metrics.clientesInativos} inativos
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-500/50 bg-yellow-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">⚠️ Em Risco</CardTitle>
                      <Users className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        {isLoadingMetrics ? "..." : metrics.clientesEmRisco}
                      </div>
                      <p className="text-xs text-muted-foreground">30-60 dias sem comprar</p>
                    </CardContent>
                  </Card>

                  <Card className="border-red-500/50 bg-red-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">🚨 Críticos</CardTitle>
                      <Users className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {isLoadingMetrics ? "..." : metrics.clientesCriticos}
                      </div>
                      <p className="text-xs text-muted-foreground">+60 dias sem comprar</p>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-500/50 bg-orange-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">📉 Ticket Baixo</CardTitle>
                      <DollarSign className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {isLoadingMetrics ? "..." : metrics.ticketMedioBaixo}
                      </div>
                      <p className="text-xs text-muted-foreground">Abaixo de R$ 200</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {isLoadingMetrics ? "..." : new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(metrics.vendasMes)}
                      </div>
                      <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {isLoadingMetrics ? "..." : new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(metrics.ticketMedio)}
                      </div>
                      <p className="text-xs text-muted-foreground">Por cliente</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Performance</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {isLoadingMetrics ? "..." : ((metrics.clientesAtivos / Math.max(metrics.totalClientes, 1)) * 100).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Taxa de atividade</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">🎯 Prioridade</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {isLoadingMetrics ? "..." : metrics.clientesEmRisco + metrics.clientesCriticos}
                      </div>
                      <p className="text-xs text-muted-foreground">Clientes precisam atenção</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Ações IA */}
                <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
                  <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                        <Sparkles className="h-5 w-5" />
                        Análise Geral do Dia
                      </CardTitle>
                      <CardDescription className="text-xs md:text-sm">
                        Visão estratégica completa da sua carteira de clientes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={handleAnaliseGeral}
                        className="w-full"
                        size="lg"
                      >
                        Gerar Análise Geral
                      </Button>
                    </CardContent>
                  </Card>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl md:text-2xl font-bold">
                        {isLoadingMetrics ? "..." : `R$ ${metrics.vendasMes.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </div>
                      <p className="text-xs text-muted-foreground">Faturamento</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Ações IA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base md:text-lg">Análise Geral do Dia</CardTitle>
                      </div>
                      <CardDescription className="text-xs md:text-sm">
                        IA analisa sua carteira e gera plano de ação
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={handleAnaliseGeral} className="w-full" size="lg">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar Análise
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <UserSearch className="h-5 w-5 text-secondary" />
                        <CardTitle className="text-base md:text-lg">Análise Individual</CardTitle>
                      </div>
                      <CardDescription className="text-xs md:text-sm">
                        Análise de cliente com roteiro de abordagem
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => setClienteSelectorOpen(true)} 
                        variant="secondary" 
                        className="w-full" 
                        size="lg"
                      >
                        <UserSearch className="mr-2 h-4 w-4" />
                        Analisar Cliente
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto">
                <AdminDashboard />
              </div>
            )}
          </main>
        </div>
      </div>

      <AnaliseDialog
        open={analiseGeralOpen}
        onOpenChange={setAnaliseGeralOpen}
        titulo="Análise Geral do Dia"
        descricao="Análise estratégica completa da sua carteira"
        analise={analiseGeral}
        isLoading={isLoadingAnalise}
      />

      <AnaliseDialog
        open={analiseIndividualOpen}
        onOpenChange={setAnaliseIndividualOpen}
        titulo="Análise Individual de Cliente"
        descricao="Estratégia personalizada para este cliente"
        analise={analiseIndividual}
        isLoading={isLoadingAnalise}
      />

      <ClienteSelectorDialog
        open={clienteSelectorOpen}
        onOpenChange={setClienteSelectorOpen}
        onSelect={handleAnaliseIndividual}
        userId={user.id}
      />
    </SidebarProvider>
  );
}
