import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft, Users, MapPin, Target, DollarSign,
  ArrowUpRight, CheckCircle2, Clock, AlertTriangle,
  ShoppingCart, MessageSquare,
} from "lucide-react";
import {
  getUsuarioById, getClientesByVendedor, mockPedidos, mockRoteiros,
  formatCurrency, getStatusCliente,
} from "@/data/mock";
import { getVisitaComUpdate } from "@/stores/mockStore";

const VENDEDOR_COLORS: Record<string, string> = {
  "vendedor-001": "#0ea5e9",
  "vendedor-002": "#8b5cf6",
  "vendedor-003": "#22c55e",
  "vendedor-004": "#f59e0b",
  "vendedor-005": "#f43f5e",
};

// Static monthly revenue per vendedor (last 6 months)
const vendedorMonthlyData: Record<string, { mes: string; vendas: number }[]> = {
  "vendedor-001": [
    { mes: "Set", vendas: 32100 },
    { mes: "Out", vendas: 29800 },
    { mes: "Nov", vendas: 38200 },
    { mes: "Dez", vendas: 45600 },
    { mes: "Jan", vendas: 35400 },
    { mes: "Fev", vendas: 42300 },
  ],
  "vendedor-002": [
    { mes: "Set", vendas: 28500 },
    { mes: "Out", vendas: 31200 },
    { mes: "Nov", vendas: 35800 },
    { mes: "Dez", vendas: 41200 },
    { mes: "Jan", vendas: 33100 },
    { mes: "Fev", vendas: 38900 },
  ],
  "vendedor-003": [
    { mes: "Set", vendas: 25000 },
    { mes: "Out", vendas: 27500 },
    { mes: "Nov", vendas: 32000 },
    { mes: "Dez", vendas: 38500 },
    { mes: "Jan", vendas: 29800 },
    { mes: "Fev", vendas: 35200 },
  ],
  "vendedor-004": [
    { mes: "Set", vendas: 30200 },
    { mes: "Out", vendas: 33500 },
    { mes: "Nov", vendas: 37800 },
    { mes: "Dez", vendas: 44100 },
    { mes: "Jan", vendas: 36500 },
    { mes: "Fev", vendas: 41700 },
  ],
  "vendedor-005": [
    { mes: "Set", vendas: 22000 },
    { mes: "Out", vendas: 24800 },
    { mes: "Nov", vendas: 28500 },
    { mes: "Dez", vendas: 34200 },
    { mes: "Jan", vendas: 26900 },
    { mes: "Fev", vendas: 31500 },
  ],
};

export default function VendedorDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const vendedor = id ? getUsuarioById(id) : undefined;
  const color = id ? VENDEDOR_COLORS[id] || "#64748b" : "#64748b";

  const now = new Date();
  const mesAtual = now.getMonth();
  const anoAtual = now.getFullYear();

  const clientes = useMemo(() => (id ? getClientesByVendedor(id) : []), [id]);

  const clienteHealth = useMemo(() => {
    let ativos = 0;
    let emRisco = 0;
    let criticos = 0;
    clientes.forEach((c) => {
      const status = getStatusCliente(c);
      if (status === "ativo") ativos++;
      else if (status === "risco") emRisco++;
      else criticos++;
    });
    return { ativos, emRisco, criticos };
  }, [clientes]);

  const faturamentoMes = useMemo(
    () =>
      mockPedidos
        .filter((p) => {
          const d = new Date(p.data_pedido);
          return (
            p.vendedor_id === id &&
            p.status === "concluido" &&
            d.getMonth() === mesAtual &&
            d.getFullYear() === anoAtual
          );
        })
        .reduce((sum, p) => sum + p.valor_total, 0),
    [id, mesAtual, anoAtual],
  );

  const roteiro = useMemo(
    () => (id ? mockRoteiros.find((r) => r.vendedor_id === id) : undefined),
    [id],
  );

  const visitas = useMemo(
    () => (roteiro ? roteiro.visitas.map((v) => getVisitaComUpdate(v)) : []),
    [roteiro],
  );

  const visitasMes = useMemo(() => {
    return mockRoteiros
      .filter((r) => r.vendedor_id === id)
      .flatMap((r) => r.visitas)
      .length;
  }, [id]);

  const visitasComVenda = useMemo(
    () => visitas.filter((v) => v.pedido_id).length,
    [visitas],
  );

  const taxaConversao = useMemo(
    () => (visitas.length > 0 ? Math.round((visitasComVenda / visitas.length) * 100) : 0),
    [visitas, visitasComVenda],
  );

  const chartData = id ? vendedorMonthlyData[id] || [] : [];

  if (!vendedor) {
    return (
      <DashboardLayout title="Vendedor nao encontrado" subtitle="">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Vendedor nao encontrado.</p>
          <Button variant="outline" onClick={() => navigate("/admin/vendedores")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const kpis = [
    {
      title: "Clientes",
      value: String(clientes.length),
      icon: Users,
      gradient: "from-sky-500 to-cyan-400",
      bgGlow: "bg-sky-500/20",
    },
    {
      title: "Visitas Mes",
      value: String(visitasMes),
      icon: MapPin,
      gradient: "from-violet-500 to-purple-400",
      bgGlow: "bg-violet-500/20",
    },
    {
      title: "Taxa Conversao",
      value: `${taxaConversao}%`,
      icon: Target,
      gradient: "from-emerald-500 to-green-400",
      bgGlow: "bg-emerald-500/20",
    },
    {
      title: "Faturamento Mes",
      value: formatCurrency(faturamentoMes),
      icon: DollarSign,
      gradient: "from-amber-500 to-orange-400",
      bgGlow: "bg-amber-500/20",
    },
  ];

  return (
    <DashboardLayout title={vendedor.full_name} subtitle="Detalhe do vendedor">
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/vendedores")}
          className="text-muted-foreground hover:text-foreground animate-fade-in"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para vendedores
        </Button>

        {/* Header */}
        <Card className="glass gradient-border overflow-hidden animate-fade-in-up stagger-1">
          <CardContent className="p-6 flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg"
              style={{ backgroundColor: color, boxShadow: `0 8px 24px ${color}33` }}
            >
              {vendedor.avatar_initials}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{vendedor.full_name}</h2>
              <p className="text-sm text-muted-foreground">{vendedor.email}</p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: `${color}15`,
                borderColor: `${color}40`,
                color,
              }}
            >
              Vendedor
            </span>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <Card
              key={kpi.title}
              className={`glass overflow-hidden relative group hover:border-white/20 transition-all duration-500 animate-fade-in-up stagger-${index + 2}`}
            >
              <div
                className={`absolute -top-12 -right-12 w-40 h-40 ${kpi.bgGlow} rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700`}
              />
              <CardContent className="p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-2 rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-lg shadow-black/20`}
                  >
                    <kpi.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-0.5">{kpi.title}</p>
                <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Row: Chart + Client Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <Card className="glass lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Evolucao de Vendas</CardTitle>
              <CardDescription>Faturamento mensal - Ultimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`colorVendedor-${id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
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
                              <p className="text-xs" style={{ color }}>{formatCurrency(payload[0].value as number)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="vendas"
                      stroke={color}
                      strokeWidth={2.5}
                      fill={`url(#colorVendedor-${id})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Client Health */}
          <Card className="glass animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Saude da Carteira</CardTitle>
              <CardDescription>{clientes.length} clientes no total</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Ativos", count: clienteHealth.ativos, color: "#22c55e", icon: CheckCircle2 },
                { label: "Em Risco", count: clienteHealth.emRisco, color: "#f59e0b", icon: AlertTriangle },
                { label: "Criticos", count: clienteHealth.criticos, color: "#f43f5e", icon: AlertTriangle },
              ].map((item) => {
                const pct = clientes.length > 0 ? Math.round((item.count / clientes.length) * 100) : 0;
                return (
                  <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" style={{ color: item.color }} />
                        <span className="text-xs font-medium">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: item.color }}>
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 text-right">{pct}%</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Recent Visits Table */}
        <Card className="glass animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Visitas de Hoje</CardTitle>
            <CardDescription>Roteiro do dia com status atualizado</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[350px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground w-12">#</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitas.map((vis) => {
                    const isConcluida = vis.status !== "pendente";
                    return (
                      <TableRow key={vis.id} className="border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                        <TableCell>
                          <span className="text-xs font-bold text-muted-foreground">{vis.ordem}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{vis.cliente_nome}</p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{vis.cliente_endereco}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground capitalize">{vis.cliente_tipo}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {isConcluida ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                              <CheckCircle2 className="h-3 w-3" /> Concluida
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20">
                              <Clock className="h-3 w-3" /> Pendente
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {vis.pedido_id ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                              <ShoppingCart className="h-3 w-3" /> Venda
                            </span>
                          ) : vis.justificativa ? (
                            <span className="flex items-center gap-1 text-xs text-amber-400 max-w-[180px] truncate">
                              <MessageSquare className="h-3 w-3 shrink-0" /> {vis.justificativa}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {visitas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                        Nenhuma visita registrada hoje.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
