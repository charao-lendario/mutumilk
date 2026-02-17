import React, { useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Download, DollarSign, ShoppingCart, Users, TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import {
  mockPedidos, mockProdutos, getVendedores, formatCurrency,
} from "@/data/mock";

const revenueData = [
  { mes: "Ago", receita: 145200, meta: 130000 },
  { mes: "Set", receita: 168400, meta: 150000 },
  { mes: "Out", receita: 189300, meta: 170000 },
  { mes: "Nov", receita: 215800, meta: 190000 },
  { mes: "Dez", receita: 278500, meta: 220000 },
  { mes: "Jan", receita: 198700, meta: 200000 },
  { mes: "Fev", receita: 247850, meta: 210000 },
];

const VENDEDOR_COLORS: Record<string, string> = {
  "vendedor-001": "#0ea5e9",
  "vendedor-002": "#8b5cf6",
  "vendedor-003": "#22c55e",
  "vendedor-004": "#f59e0b",
  "vendedor-005": "#f43f5e",
};

const CATEGORY_COLORS: Record<string, string> = {
  Queijos: "#0ea5e9",
  Leites: "#3b82f6",
  Iogurtes: "#8b5cf6",
  Derivados: "#22c55e",
  Manteigas: "#f59e0b",
};

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

export default function Relatorios() {
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

  const totalPedidos = pedidosConcluidosMes.length;

  const ticketMedio = useMemo(
    () => (totalPedidos > 0 ? faturamentoTotal / totalPedidos : 0),
    [faturamentoTotal, totalPedidos],
  );

  // Revenue by category
  const revenueByCategory = useMemo(() => {
    const catMap: Record<string, number> = {};
    mockPedidos
      .filter((p) => p.status === "concluido")
      .forEach((p) => {
        p.itens.forEach((item) => {
          const prod = mockProdutos.find((pr) => pr.id === item.produto_id);
          const cat = prod?.categoria || "Outros";
          catMap[cat] = (catMap[cat] || 0) + item.subtotal;
        });
      });
    return Object.entries(catMap)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        color: CATEGORY_COLORS[name] || "#64748b",
      }))
      .sort((a, b) => b.value - a.value);
  }, []);

  // Vendedores comparison
  const vendedoresComparison = useMemo(() => {
    return vendedores
      .map((v) => {
        const vendas = pedidosConcluidosMes
          .filter((p) => p.vendedor_id === v.id)
          .reduce((sum, p) => sum + p.valor_total, 0);
        return {
          nome: v.full_name.split(" ").map((n, i) => (i === 0 ? n : n[0] + ".")).join(" "),
          vendas,
          id: v.id,
          color: VENDEDOR_COLORS[v.id] || "#64748b",
        };
      })
      .sort((a, b) => b.vendas - a.vendas);
  }, [vendedores, pedidosConcluidosMes]);

  // CSV Export
  const handleExportCSV = useCallback(() => {
    const headers = ["ID", "Cliente", "Vendedor", "Data", "Valor Total", "Status", "Itens"];
    const rows = mockPedidos.map((p) => [
      p.id,
      `"${p.cliente_nome}"`,
      p.vendedor_id,
      p.data_pedido,
      p.valor_total.toFixed(2),
      p.status,
      p.itens.length,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mutumilk-pedidos-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const kpis = [
    {
      title: "Faturamento Mes",
      value: formatCurrency(faturamentoTotal),
      icon: DollarSign,
      gradient: "from-sky-500 to-cyan-400",
      bgGlow: "bg-sky-500/20",
      trend: "+12.5%",
    },
    {
      title: "Total Pedidos",
      value: String(totalPedidos),
      icon: ShoppingCart,
      gradient: "from-violet-500 to-purple-400",
      bgGlow: "bg-violet-500/20",
      trend: "+8.3%",
    },
    {
      title: "Ticket Medio",
      value: formatCurrency(ticketMedio),
      icon: TrendingUp,
      gradient: "from-emerald-500 to-green-400",
      bgGlow: "bg-emerald-500/20",
      trend: "+5.2%",
    },
    {
      title: "Vendedores",
      value: String(vendedores.length),
      icon: Users,
      gradient: "from-amber-500 to-orange-400",
      bgGlow: "bg-amber-500/20",
      trend: "100%",
    },
  ];

  return (
    <DashboardLayout
      title="Relatorios"
      subtitle="Relatorios gerenciais"
      actions={
        <Button
          onClick={handleExportCSV}
          size="sm"
          className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      }
    >
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* KPIs */}
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

        {/* Revenue Trend */}
        <Card className="glass animate-fade-in-up stagger-5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Tendencia de Receita</CardTitle>
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
                    <linearGradient id="relColorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="relColorMeta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="mes" stroke="rgba(255,255,255,0.25)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="meta" name="Meta" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="6 4" fill="url(#relColorMeta)" />
                  <Area type="monotone" dataKey="receita" name="Receita" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#relColorReceita)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Category + Vendedores Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue by Category Pie */}
          <Card className="glass animate-fade-in-up stagger-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Receita por Categoria</CardTitle>
              <CardDescription>Distribuicao do faturamento por categoria de produto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[260px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {revenueByCategory.map((entry, index) => (
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
                              <p className="mt-1 text-muted-foreground">{formatCurrency(data.value)}</p>
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
                {revenueByCategory.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground truncate">{item.name}</span>
                    <span className="ml-auto font-semibold tabular-nums">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vendedores Comparison Bar */}
          <Card className="glass animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Comparativo de Vendedores</CardTitle>
              <CardDescription>Faturamento mensal por vendedor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendedoresComparison} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="nome" stroke="rgba(255,255,255,0.25)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="vendas" name="Vendas" radius={[6, 6, 0, 0]}>
                      {vendedoresComparison.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 border-t border-white/[0.06] pt-4">
                <div className="space-y-2">
                  {vendedoresComparison.map((v, i) => {
                    const medals = ["text-amber-400", "text-gray-300", "text-amber-600"];
                    return (
                      <div
                        key={v.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                      >
                        <span className={`text-sm font-bold w-6 ${medals[i] || "text-muted-foreground"}`}>
                          #{i + 1}
                        </span>
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: v.color }}
                        />
                        <span className="text-xs font-medium flex-1">{v.nome}</span>
                        <span className="text-xs font-bold tabular-nums">{formatCurrency(v.vendas)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
