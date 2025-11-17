import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Milk, TrendingUp, Users, DollarSign, Target, Sparkles, UserSearch } from "lucide-react";

export default function Index() {
  const { user, isLoading, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalClientes: 0,
    clientesAtivos: 0,
    clientesInativos: 0,
    vendasMes: 0,
    ticketMedio: 0,
  });
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

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
      // Buscar clientes do vendedor
      const { data: clientes } = await supabase
        .from("clientes")
        .select("*, pedidos(valor_total, data_pedido)")
        .eq("vendedor_id", user.id);

      if (!clientes) return;

      // Calcular métricas
      const agora = new Date();
      const mesAtual = agora.getMonth();
      const anoAtual = agora.getFullYear();
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(agora.getDate() - 30);

      const clientesAtivos = clientes.filter(c => 
        c.ultima_compra && new Date(c.ultima_compra) > trintaDiasAtras
      ).length;

      const clientesInativos = clientes.length - clientesAtivos;

      // Calcular vendas do mês atual
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

      // Calcular ticket médio
      const totalTickets = clientes.reduce((sum, c) => sum + Number(c.ticket_medio || 0), 0);
      const ticketMedio = clientes.length > 0 ? totalTickets / clientes.length : 0;

      setMetrics({
        totalClientes: clientes.length,
        clientesAtivos,
        clientesInativos,
        vendasMes,
        ticketMedio,
      });
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
    } finally {
      setIsLoadingMetrics(false);
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Milk className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Gestão Comercial</h1>
              <p className="text-sm text-muted-foreground">
                {userRole === "admin" ? "Painel Administrativo" : "Dashboard do Vendedor"}
              </p>
            </div>
          </div>
          <Button onClick={signOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {userRole === "vendedor" ? (
          <div className="space-y-6">
            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    Em sua carteira
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    {isLoadingMetrics ? "..." : metrics.clientesAtivos}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Compraram nos últimos 30 dias
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes Inativos</CardTitle>
                  <Target className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">
                    {isLoadingMetrics ? "..." : metrics.clientesInativos}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mais de 30 dias sem comprar
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingMetrics ? "..." : `R$ ${metrics.vendasMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ticket médio: R$ {metrics.ticketMedio.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTAs principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Gestão Geral do Dia</CardTitle>
                      <CardDescription>
                        Análise completa da sua carteira com IA
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Receba insights inteligentes sobre todos os seus clientes, prioridades de contato, 
                    oportunidades de venda e alertas de risco.
                  </p>
                  <Button className="w-full" size="lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Iniciar Análise Geral
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-gradient-to-br from-secondary/30 to-secondary/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserSearch className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Análise Individual de Cliente</CardTitle>
                      <CardDescription>
                        Análise profunda de um cliente específico
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Selecione um cliente e receba recomendações personalizadas, perfil comportamental 
                    e script de abordagem ideal.
                  </p>
                  <Button variant="secondary" className="w-full" size="lg">
                    <UserSearch className="w-4 h-4 mr-2" />
                    Analisar Cliente
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Informações adicionais */}
            <Card>
              <CardHeader>
                <CardTitle>Recursos Disponíveis</CardTitle>
                <CardDescription>O que você pode fazer com este sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    <span><strong>Gestão Geral:</strong> Análise completa da carteira com prioridades e oportunidades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    <span><strong>Análise Individual:</strong> Insights profundos sobre comportamento de cada cliente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    <span><strong>IA Inteligente:</strong> Powered by OpenAI gpt-4.1-mini para análises precisas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    <span><strong>Alertas Automáticos:</strong> Identifica clientes em risco e oportunidades de venda</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Painel Administrativo</CardTitle>
              <CardDescription>Dashboard do admin será implementado</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Você está logado como: <strong>{user.email}</strong></p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
