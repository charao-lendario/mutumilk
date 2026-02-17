import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  DollarSign,
  TrendingUp,
  Target,
  AlertTriangle,
  AlertOctagon,
  ArrowUpRight,
  MapPin,
  Clock,
  ChevronRight,
  Ticket,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getClientesByVendedor,
  getVendasMes,
  getStatusCliente,
  getDiasSemCompra,
  getRoteiroByVendedor,
  formatCurrency,
  type MockCliente,
} from "@/data/mock";

const revenueChartData = [
  { mes: "Ago", valor: 18500 },
  { mes: "Set", valor: 22400 },
  { mes: "Out", valor: 19800 },
  { mes: "Nov", valor: 28700 },
  { mes: "Dez", valor: 35200 },
  { mes: "Jan", valor: 24600 },
  { mes: "Fev", valor: 31400 },
];

interface AlertDialogState {
  open: boolean;
  title: string;
  description: string;
  clientes: MockCliente[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-strong rounded-xl p-3 text-sm shadow-2xl">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((e: any, i: number) => (
          <p key={i} className="text-xs mt-0.5" style={{ color: e.stroke }}>
            {e.name}: {formatCurrency(e.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alertDialog, setAlertDialog] = useState<AlertDialogState>({
    open: false,
    title: "",
    description: "",
    clientes: [],
  });

  const clientes = useMemo(() => {
    if (!user) return [];
    return getClientesByVendedor(user.id);
  }, [user]);

  const vendasMes = useMemo(() => {
    if (!user) return 0;
    return getVendasMes(user.id);
  }, [user]);

  const roteiro = useMemo(() => {
    if (!user) return null;
    return getRoteiroByVendedor(user.id);
  }, [user]);

  const clientesComStatus = useMemo(() => {
    return clientes.map((c) => ({
      ...c,
      status: getStatusCliente(c),
      diasSemCompra: getDiasSemCompra(c),
    }));
  }, [clientes]);

  const ativos = clientesComStatus.filter((c) => c.status === "ativo");
  const emRisco = clientesComStatus.filter((c) => c.status === "risco");
  const criticos = clientesComStatus.filter((c) => c.status === "critico");
  const ticketBaixo = clientesComStatus.filter((c) => c.ticket_medio < 200);

  const ticketMedio = clientes.length > 0
    ? clientes.reduce((sum, c) => sum + c.ticket_medio, 0) / clientes.length
    : 0;

  const performance = clientes.length > 0
    ? Math.round((ativos.length / clientes.length) * 100)
    : 0;

  const kpis = [
    {
      label: "Total Clientes",
      value: clientes.length,
      icon: Users,
      color: "text-sky-400",
      bgGlow: "bg-sky-500/20",
      detail: `${ativos.length} ativos`,
      detailColor: "text-emerald-400",
    },
    {
      label: "Vendas do Mes",
      value: formatCurrency(vendasMes),
      icon: DollarSign,
      color: "text-emerald-400",
      bgGlow: "bg-emerald-500/20",
      detail: "+12.5%",
      detailColor: "text-emerald-400",
    },
    {
      label: "Ticket Medio",
      value: formatCurrency(ticketMedio),
      icon: TrendingUp,
      color: "text-violet-400",
      bgGlow: "bg-violet-500/20",
      detail: "da carteira",
      detailColor: "text-muted-foreground",
    },
    {
      label: "Performance",
      value: `${performance}%`,
      icon: Target,
      color: "text-amber-400",
      bgGlow: "bg-amber-500/20",
      detail: "clientes ativos",
      detailColor: "text-amber-400",
    },
  ];

  const alerts = [
    {
      label: "Em Risco",
      count: emRisco.length,
      icon: AlertTriangle,
      color: "text-amber-400",
      borderColor: "border-amber-400/20",
      bgColor: "bg-amber-400/5",
      description: "Clientes entre 30 e 60 dias sem compra",
      clientes: emRisco,
    },
    {
      label: "Criticos",
      count: criticos.length,
      icon: AlertOctagon,
      color: "text-red-400",
      borderColor: "border-red-400/20",
      bgColor: "bg-red-400/5",
      description: "Clientes com mais de 60 dias sem compra",
      clientes: criticos,
    },
    {
      label: "Ticket Baixo",
      count: ticketBaixo.length,
      icon: Ticket,
      color: "text-orange-400",
      borderColor: "border-orange-400/20",
      bgColor: "bg-orange-400/5",
      description: "Clientes com ticket medio abaixo de R$ 200",
      clientes: ticketBaixo,
    },
  ];

  const handleAlertClick = (alert: (typeof alerts)[number]) => {
    setAlertDialog({
      open: true,
      title: `Clientes ${alert.label}`,
      description: alert.description,
      clientes: alert.clientes,
    });
  };

  const visitasConcluidas = roteiro
    ? roteiro.visitas.filter((v) => v.status !== "pendente").length
    : 0;

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Gestao da sua carteira de clientes"
    >
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <div
              key={kpi.label}
              className={`glass p-4 rounded-xl relative overflow-hidden animate-fade-in-up stagger-${i + 1}`}
            >
              <div
                className={`absolute -top-8 -right-8 w-24 h-24 ${kpi.bgGlow} rounded-full blur-2xl`}
              />
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <span
                  className={`flex items-center gap-0.5 text-[11px] font-semibold ${kpi.detailColor}`}
                >
                  {kpi.detail && kpi.detailColor === "text-emerald-400" && (
                    <ArrowUpRight className="h-3 w-3" />
                  )}
                  {kpi.detail}
                </span>
              </div>
              <p className="text-2xl font-bold relative">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {alerts.map((alert, i) => (
            <button
              key={alert.label}
              onClick={() => handleAlertClick(alert)}
              className={`glass p-4 rounded-xl text-left transition-all duration-300 hover:border-white/20 group animate-fade-in-up stagger-${i + 5}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-2 rounded-lg ${alert.bgColor} border ${alert.borderColor}`}
                >
                  <alert.icon className={`h-4 w-4 ${alert.color}`} />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold">{alert.count}</p>
              <p className="text-xs text-muted-foreground">{alert.label}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">
                {alert.description}
              </p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <Card className="glass lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Faturamento
                  </CardTitle>
                  <CardDescription>Ultimos 7 meses</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Ago 2025 - Fev 2026
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueChartData}
                    margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorValorDash"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#0ea5e9"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="#0ea5e9"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.04)"
                    />
                    <XAxis
                      dataKey="mes"
                      stroke="rgba(255,255,255,0.25)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.25)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="valor"
                      name="Faturamento"
                      stroke="#0ea5e9"
                      strokeWidth={2.5}
                      fill="url(#colorValorDash)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Minha Rota de Hoje */}
          <Card className="glass animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Minha Rota de Hoje
                  </CardTitle>
                  <CardDescription>Roteiro inteligente</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {roteiro ? (
                <div className="space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Clientes</span>
                      <span className="font-semibold">
                        {roteiro.visitas.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Concluidos</span>
                      <span className="font-semibold text-emerald-400">
                        {visitasConcluidas}/{roteiro.visitas.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Valor Estimado
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(
                          roteiro.visitas.reduce(
                            (s, v) => s + v.ai_sugestao.valorEstimado,
                            0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${roteiro.visitas.length > 0 ? (visitasConcluidas / roteiro.visitas.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {roteiro.resumo_ia}
                  </p>
                  <Button
                    onClick={() => navigate("/rota")}
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/20"
                    size="sm"
                  >
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                    Ver Rota Completa
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 rounded-xl bg-white/[0.03] mb-3">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">Sem roteiro</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Nenhum roteiro gerado para hoje
                  </p>
                  <Button
                    onClick={() => navigate("/rota")}
                    variant="outline"
                    size="sm"
                    className="border-white/10 hover:bg-white/[0.06]"
                  >
                    Gerar Rota
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alert Dialog */}
      <Dialog
        open={alertDialog.open}
        onOpenChange={(open) =>
          setAlertDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{alertDialog.title}</DialogTitle>
            <DialogDescription>{alertDialog.description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            {alertDialog.clientes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum cliente nesta categoria
              </div>
            ) : (
              <div className="space-y-3">
                {alertDialog.clientes.map((cliente) => {
                  const dias = getDiasSemCompra(cliente);
                  const status = getStatusCliente(cliente);
                  const statusColors: Record<string, string> = {
                    ativo: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
                    risco: "bg-amber-400/10 text-amber-400 border-amber-400/20",
                    critico: "bg-red-400/10 text-red-400 border-red-400/20",
                  };
                  const statusLabels: Record<string, string> = {
                    ativo: "Ativo",
                    risco: "Em Risco",
                    critico: "Critico",
                  };
                  return (
                    <div
                      key={cliente.id}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">
                            {cliente.nome}
                          </h3>
                          <p className="text-xs text-muted-foreground capitalize mt-0.5">
                            {cliente.tipo} - {cliente.cnpj}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[status]}`}
                        >
                          {statusLabels[status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/[0.04]">
                        <span className="text-xs text-muted-foreground">
                          Ticket: {formatCurrency(cliente.ticket_medio)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {dias} dias sem compra
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
