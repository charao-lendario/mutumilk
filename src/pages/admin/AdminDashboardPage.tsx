import React, { useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, Users, Target, UserCheck,
  ArrowUpRight, Award, Package, Activity,
  ShoppingCart, Sparkles, Clock,
} from "lucide-react";
import {
  mockPedidos, mockClientes, mockRoteiros, mockAnalises,
  mockProdutos, getVendedores, formatCurrency,
} from "@/data/mock";
import { getVisitaComUpdate } from "@/stores/mockStore";

const VENDEDOR_COLORS: Record<string, string> = {
  "vendedor-001": "#0ea5e9",
  "vendedor-002": "#8b5cf6",
  "vendedor-003": "#22c55e",
  "vendedor-004": "#f59e0b",
  "vendedor-005": "#f43f5e",
};

const revenueData = [
  { mes: "Ago", receita: 145200, meta: 130000 },
  { mes: "Set", receita: 168400, meta: 150000 },
  { mes: "Out", receita: 189300, meta: 170000 },
  { mes: "Nov", receita: 215800, meta: 190000 },
  { mes: "Dez", receita: 278500, meta: 220000 },
  { mes: "Jan", receita: 198700, meta: 200000 },
  { mes: "Fev", receita: 247850, meta: 210000 },
];

interface TooltipPayloadEntry {
  name: string;
  value: number | string;
  color?: string;
  stroke?: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-xl p-3 text-sm shadow-2xl">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-xs mt-0.5" style={{ color: entry.color || entry.stroke }}>
            {entry.name}: {typeof entry.value === "number" && entry.value > 1000
              ? formatCurrency(entry.value)
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const vendedores = getVendedores();

  const now = new Date();
  const mesAtual = now.getMonth();
  const anoAtual = now.getFullYear();

  const pedidosConcluidosMes = useMemo(
    () =>
      mockPedidos.filter((p) => {
        const d = new Date(p.data_pedido);
        return p.status === "concluido" && d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
      }),
    [mesAtual, anoAtual],
  );

  const faturamentoTotal = useMemo(
    () => pedidosConcluidosMes.reduce((sum, p) => sum + p.valor_total, 0),
    [pedidosConcluidosMes],
  );

  const clientesAtivos = useMemo(() => {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    return mockClientes.filter(
      (c) => c.ultima_compra && new Date(c.ultima_compra) > trintaDiasAtras,
    ).length;
  }, []);

  const ticketMedio = useMemo(
    () => (pedidosConcluidosMes.length > 0 ? faturamentoTotal / pedidosConcluidosMes.length : 0),
    [faturamentoTotal, pedidosConcluidosMes],
  );

  const vendedoresAtivos = vendedores.length;

  // Vendedores strip with route completion
  const vendedoresStrip = useMemo(
    () =>
      vendedores.map((v) => {
        const roteiro = mockRoteiros.find((r) => r.vendedor_id === v.id);
        const totalVisitas = roteiro?.visitas.length ?? 0;
        const concluidas = roteiro
          ? roteiro.visitas.filter((vis) => {
              const updated = getVisitaComUpdate(vis);
              return updated.status !== "pendente";
            }).length
          : 0;
        const pct = totalVisitas > 0 ? Math.round((concluidas / totalVisitas) * 100) : 0;
        return { ...v, totalVisitas, concluidas, pct, color: VENDEDOR_COLORS[v.id] };
      }),
    [vendedores],
  );

  // Client distribution by tipo
  const clientDistribution = useMemo(() => {
    const tipoColors: Record<string, string> = {
      supermercado: "#0ea5e9",
      padaria: "#3b82f6",
      restaurante: "#8b5cf6",
      mercado: "#22c55e",
      lanchonete: "#f59e0b",
      confeitaria: "#f43f5e",
    };
    const counts: Record<string, number> = {};
    mockClientes.forEach((c) => {
      counts[c.tipo] = (counts[c.tipo] || 0) + 1;
    });
    return Object.entries(counts).map(([tipo, value]) => ({
      name: tipo.charAt(0).toUpperCase() + tipo.slice(1),
      value,
      color: tipoColors[tipo] || "#64748b",
    }));
  }, []);

  // Vendedores ranking
  const vendedoresRanking = useMemo(() => {
    return vendedores
      .map((v) => {
        const vendas = pedidosConcluidosMes
          .filter((p) => p.vendedor_id === v.id)
          .reduce((sum, p) => sum + p.valor_total, 0);
        return { nome: v.full_name.split(" ").map((n, i) => (i === 0 ? n : n[0] + ".")).join(" "), vendas, id: v.id };
      })
      .sort((a, b) => b.vendas - a.vendas);
  }, [vendedores, pedidosConcluidosMes]);

  // Top 5 products
  const topProducts = useMemo(() => {
    const prodMap: Record<string, { nome: string; qty: number; revenue: number }> = {};
    pedidosConcluidosMes.forEach((p) => {
      p.itens.forEach((item) => {
        if (!prodMap[item.produto_id]) {
          prodMap[item.produto_id] = { nome: item.produto_nome, qty: 0, revenue: 0 };
        }
        prodMap[item.produto_id].qty += item.quantidade;
        prodMap[item.produto_id].revenue += item.subtotal;
      });
    });
    return Object.values(prodMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [pedidosConcluidosMes]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const items: { tipo: string; texto: string; valor: string; tempo: string }[] = [];
    const recentPedidos = mockPedidos.slice(0, 3);
    recentPedidos.forEach((p) => {
      const horasAtras = Math.max(
        1,
        Math.round((Date.now() - new Date(p.data_pedido).getTime()) / (1000 * 60 * 60)),
      );
      items.push({
        tipo: "pedido",
        texto: `Pedido ${p.id} - ${p.cliente_nome}`,
        valor: formatCurrency(p.valor_total),
        tempo: horasAtras < 24 ? `${horasAtras}h` : `${Math.round(horasAtras / 24)}d`,
      });
    });
    const recentAnalises = mockAnalises.slice(0, 2);
    recentAnalises.forEach((a) => {
      const v = vendedores.find((vd) => vd.id === a.vendedor_id);
      items.push({
        tipo: "analise",
        texto: `Analise IA - ${v?.full_name || "Vendedor"}`,
        valor: a.tipo_analise === "geral" ? "Carteira" : "Individual",
        tempo: "Hoje",
      });
    });
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpis = [
    {
      title: "Faturamento Total",
      value: formatCurrency(faturamentoTotal),
      icon: DollarSign,
      gradient: "from-sky-500 to-cyan-400",
      bgGlow: "bg-sky-500/20",
      trend: "+12.5%",
    },
    {
      title: "Clientes Ativos",
      value: String(clientesAtivos),
      icon: Users,
      gradient: "from-violet-500 to-purple-400",
      bgGlow: "bg-violet-500/20",
      trend: "+8.3%",
    },
    {
      title: "Ticket Medio",
      value: formatCurrency(ticketMedio),
      icon: Target,
      gradient: "from-emerald-500 to-green-400",
      bgGlow: "bg-emerald-500/20",
      trend: "+5.2%",
    },
    {
      title: "Vendedores Ativos",
      value: String(vendedoresAtivos),
      icon: UserCheck,
      gradient: "from-amber-500 to-orange-400",
      bgGlow: "bg-amber-500/20",
      trend: "100%",
    },
  ];

  return (
    <DashboardLayout title="Painel Administrativo" subtitle="Visao geral de toda a operacao">
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <Card
              key={kpi.title}
              className={`glass overflow-hidden relative group hover:border-white/20 transition-all duration-500 animate-fade-in-up stagger-${index + 1}`}
            >
              <div
                className={`absolute -top-12 -right-12 w-40 h-40 ${kpi.bgGlow} rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700`}
              />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-lg shadow-black/20`}
                  >
                    <kpi.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                    <ArrowUpRight className="h-3 w-3" />
                    {kpi.trend}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                <p className="text-3xl font-bold tracking-tight">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Vendedores Ativos Hoje Strip */}
        <Card className="glass animate-fade-in-up stagger-5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Vendedores Ativos Hoje</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="flex gap-3 pb-2">
                {vendedoresStrip.map((v) => (
                  <div
                    key={v.id}
                    className="flex-shrink-0 w-[200px] p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: v.color }}
                      >
                        {v.avatar_initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{v.full_name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {v.concluidas}/{v.totalVisitas} visitas
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${v.pct}%`, backgroundColor: v.color }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 text-right">{v.pct}%</p>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Charts Row 1: Revenue + Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="glass lg:col-span-2 animate-fade-in-up stagger-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Receita Mensal</CardTitle>
                  <CardDescription>Faturamento vs Meta - Ultimos 7 meses</CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span className="text-muted-foreground">Receita</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500/60" />
                    <span className="text-muted-foreground">Meta</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminColorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="adminColorMeta" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="mes" stroke="rgba(255,255,255,0.25)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="meta" name="Meta" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="6 4" fill="url(#adminColorMeta)" />
                    <Area type="monotone" dataKey="receita" name="Receita" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#adminColorReceita)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Client Distribution Pie */}
          <Card className="glass animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Clientes por Segmento</CardTitle>
              <CardDescription>Distribuicao da base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {clientDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload?.[0]) {
                          const data = payload[0].payload;
                          return (
                            <div className="glass-strong rounded-xl p-2.5 text-xs shadow-2xl">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                                <span className="font-medium">{data.name}</span>
                              </div>
                              <p className="mt-1 text-muted-foreground">{data.value} clientes</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                {clientDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground truncate">{item.name}</span>
                    <span className="ml-auto font-semibold tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2: Vendedores Bar + Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="glass lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
                  <Award className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Ranking de Vendedores</CardTitle>
                  <CardDescription>Faturamento do mes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendedoresRanking} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="nome" stroke="rgba(255,255,255,0.25)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="vendas" name="Vendas" radius={[6, 6, 0, 0]}>
                      {vendedoresRanking.map((entry) => (
                        <Cell key={entry.id} fill={VENDEDOR_COLORS[entry.id] || "#0ea5e9"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 border-t border-white/[0.06] pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {vendedoresRanking.map((v, i) => {
                    const medals = ["text-amber-400", "text-gray-300", "text-amber-600"];
                    return (
                      <div
                        key={v.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                      >
                        <span className={`text-sm font-bold ${medals[i] || "text-muted-foreground"}`}>
                          {i < 3 ? ["#1", "#2", "#3"][i] : `#${i + 1}`}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{v.nome}</p>
                          <p className="text-[10px] text-muted-foreground">{formatCurrency(v.vendas)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {/* Top Products */}
            <Card className="glass animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">Top 5 Produtos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2.5">
                  {topProducts.map((product, i) => (
                    <div
                      key={product.nome}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-sky-400">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{product.nome}</p>
                        <p className="text-[10px] text-muted-foreground">{product.qty} vendidos</p>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="glass animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">Atividade Recente</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Agora
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {recentActivity.map((item, i) => {
                    const colors: Record<string, string> = {
                      pedido: "bg-sky-500",
                      analise: "bg-violet-500",
                    };
                    const icons: Record<string, React.ReactNode> = {
                      pedido: <ShoppingCart className="h-3 w-3 text-white" />,
                      analise: <Sparkles className="h-3 w-3 text-white" />,
                    };
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                      >
                        <div className={`p-1.5 rounded-lg ${colors[item.tipo]} shrink-0 mt-0.5`}>
                          {icons[item.tipo]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.texto}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-semibold text-primary">{item.valor}</span>
                            <span className="text-[10px] text-muted-foreground">{item.tempo}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
