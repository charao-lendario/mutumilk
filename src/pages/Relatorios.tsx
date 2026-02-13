import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Download, FileText, BarChart3, TrendingUp, DollarSign,
  Calendar, ArrowUpRight, Users, Printer,
} from "lucide-react";
import { toast } from "sonner";

const revenueByMonth = [
  { mes: "Jul", valor: 128000 },
  { mes: "Ago", valor: 145200 },
  { mes: "Set", valor: 168400 },
  { mes: "Out", valor: 189300 },
  { mes: "Nov", valor: 215800 },
  { mes: "Dez", valor: 278500 },
  { mes: "Jan", valor: 198700 },
  { mes: "Fev", valor: 247850 },
];

const revenueByCategory = [
  { name: "Queijos", value: 98400, color: "#0ea5e9" },
  { name: "Leites", value: 45200, color: "#3b82f6" },
  { name: "Iogurtes", value: 38600, color: "#8b5cf6" },
  { name: "Manteigas", value: 28900, color: "#22c55e" },
  { name: "Cremosos", value: 22100, color: "#f59e0b" },
  { name: "Especiais", value: 14650, color: "#f43f5e" },
];

const vendedoresComparativo = [
  { nome: "Carlos S.", jan: 42000, fev: 48500 },
  { nome: "Ana Paula", jan: 38000, fev: 42300 },
  { nome: "Roberto", jan: 35000, fev: 38700 },
  { nome: "Mariana", jan: 31000, fev: 35200 },
  { nome: "Pedro", jan: 26000, fev: 28900 },
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-strong rounded-xl p-3 text-sm shadow-2xl">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((e: any, i: number) => (
          <p key={i} className="text-xs mt-0.5" style={{ color: e.color || e.stroke }}>
            {e.name}: {typeof e.value === "number" && e.value > 100 ? formatCurrency(e.value) : e.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Relatorios() {
  const handleExport = (tipo: string) => {
    toast.success(`Relatorio ${tipo} exportado com sucesso!`);
  };

  const kpis = [
    { label: "Faturamento Total", value: "R$ 1.571.750", trend: "+18.5%", icon: DollarSign, color: "text-sky-400", bgGlow: "bg-sky-500/20" },
    { label: "Ticket Medio", value: "R$ 2.560", trend: "+5.2%", icon: TrendingUp, color: "text-emerald-400", bgGlow: "bg-emerald-500/20" },
    { label: "Clientes Ativos", value: "412", trend: "+8.3%", icon: Users, color: "text-violet-400", bgGlow: "bg-violet-500/20" },
    { label: "Pedidos Mes", value: "143", trend: "+15.2%", icon: BarChart3, color: "text-amber-400", bgGlow: "bg-amber-500/20" },
  ];

  return (
    <DashboardLayout
      title="Relatorios"
      subtitle="Relatorios gerenciais e exportacao de dados"
      actions={
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 hover:bg-white/[0.06] text-xs"
            onClick={() => handleExport("PDF")}
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Imprimir
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs shadow-lg shadow-sky-500/20"
            onClick={() => handleExport("CSV")}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Exportar CSV
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <div key={kpi.label} className={`glass p-4 rounded-xl relative overflow-hidden animate-fade-in-up stagger-${i + 1}`}>
              <div className={`absolute -top-8 -right-8 w-24 h-24 ${kpi.bgGlow} rounded-full blur-2xl`} />
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" /> {kpi.trend}
                </span>
              </div>
              <p className="text-2xl font-bold relative">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Trend */}
          <Card className="glass lg:col-span-2 animate-fade-in-up stagger-5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Evolucao do Faturamento</CardTitle>
                  <CardDescription>Ultimos 8 meses</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Jul 2025 - Fev 2026
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueByMonth} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValorRel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="mes" stroke="rgba(255,255,255,0.25)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="valor" name="Faturamento" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#colorValorRel)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Category */}
          <Card className="glass animate-fade-in-up stagger-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Receita por Categoria</CardTitle>
              <CardDescription>Distribuicao do faturamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
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
                              <p className="font-medium">{data.name}</p>
                              <p className="text-primary mt-0.5">{formatCurrency(data.value)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
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
        </div>

        {/* Vendedores Comparativo */}
        <Card className="glass animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Comparativo de Vendedores</CardTitle>
                <CardDescription>Janeiro vs Fevereiro 2026</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500/60" />
                  <span className="text-muted-foreground">Janeiro</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="text-muted-foreground">Fevereiro</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendedoresComparativo} barGap={4} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="nome" stroke="rgba(255,255,255,0.25)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="jan" name="Janeiro" fill="rgba(59, 130, 246, 0.4)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="fev" name="Fevereiro" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <Card className="glass animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Exportar Relatorios</CardTitle>
                <CardDescription>Baixe relatorios completos em diferentes formatos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Relatorio Geral", desc: "Visao completa do periodo", format: "PDF" },
                { label: "Base de Clientes", desc: "Dados de todos os clientes", format: "CSV" },
                { label: "Historico Pedidos", desc: "Todos os pedidos do periodo", format: "CSV" },
                { label: "Performance Equipe", desc: "Metricas por vendedor", format: "PDF" },
              ].map((r) => (
                <button
                  key={r.label}
                  onClick={() => handleExport(r.format)}
                  className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-bold text-muted-foreground bg-white/[0.06] px-1.5 py-0.5 rounded">{r.format}</span>
                  </div>
                  <p className="text-sm font-medium">{r.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
