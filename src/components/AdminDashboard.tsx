import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Users, DollarSign, TrendingUp, Sparkles,
  Package, ArrowUpRight, Activity, Award,
  ShoppingCart, Target, Zap, Clock,
} from "lucide-react";

const revenueData = [
  { mes: "Ago", receita: 145200, meta: 130000 },
  { mes: "Set", receita: 168400, meta: 150000 },
  { mes: "Out", receita: 189300, meta: 170000 },
  { mes: "Nov", receita: 215800, meta: 190000 },
  { mes: "Dez", receita: 278500, meta: 220000 },
  { mes: "Jan", receita: 198700, meta: 200000 },
  { mes: "Fev", receita: 247850, meta: 210000 },
];

const clientDistribution = [
  { name: "Supermercado", value: 171, color: "#0ea5e9" },
  { name: "Padaria", value: 122, color: "#3b82f6" },
  { name: "Restaurante", value: 73, color: "#8b5cf6" },
  { name: "Mercado", value: 58, color: "#22c55e" },
  { name: "Lanchonete", value: 39, color: "#f59e0b" },
  { name: "Confeitaria", value: 24, color: "#f43f5e" },
];

const vendedoresData = [
  { nome: "Carlos S.", vendas: 48500, meta: 40000 },
  { nome: "Ana Paula", vendas: 42300, meta: 38000 },
  { nome: "Roberto O.", vendas: 38700, meta: 35000 },
  { nome: "Mariana C.", vendas: 35200, meta: 32000 },
  { nome: "Pedro A.", vendas: 28900, meta: 30000 },
];

const topProducts = [
  { nome: "Queijo Mussarela 5kg", vendas: 234, trend: "+12%" },
  { nome: "Leite Integral 1L", vendas: 189, trend: "+8%" },
  { nome: "Iogurte Natural 1kg", vendas: 156, trend: "+15%" },
  { nome: "Manteiga Extra 500g", vendas: 142, trend: "+5%" },
  { nome: "Requeijao Cremoso 400g", vendas: 128, trend: "+3%" },
];

const recentActivity = [
  { tipo: "pedido", texto: "Pedido #1247 - Supermercado Bom Preco", valor: "R$ 3.450", tempo: "12 min" },
  { tipo: "analise", texto: "Analise IA - Carlos Silva gerou analise", valor: "6 clientes", tempo: "25 min" },
  { tipo: "cliente", texto: "Novo cliente - Padaria Sabor do Pao", valor: "Cadastrado", tempo: "1h" },
  { tipo: "pedido", texto: "Pedido #1246 - Rest. Sabor & Cia", valor: "R$ 5.200", tempo: "2h" },
  { tipo: "alerta", texto: "Cliente em risco - Mercado Central", valor: "45 dias", tempo: "3h" },
];

const weeklyData = [
  { dia: "Seg", pedidos: 18 },
  { dia: "Ter", pedidos: 24 },
  { dia: "Qua", pedidos: 21 },
  { dia: "Qui", pedidos: 28 },
  { dia: "Sex", pedidos: 32 },
  { dia: "Sab", pedidos: 15 },
  { dia: "Dom", pedidos: 5 },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-xl p-3 text-sm shadow-2xl">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs mt-0.5" style={{ color: entry.color || entry.stroke }}>
            {entry.name}: {typeof entry.value === 'number' && entry.value > 1000
              ? formatCurrency(entry.value)
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AdminDashboard() {
  const kpis = [
    {
      title: "Faturamento Mensal",
      value: "R$ 247.850",
      trend: "+12.5%",
      description: "vs. mes anterior",
      icon: DollarSign,
      gradient: "from-sky-500 to-cyan-400",
      bgGlow: "bg-sky-500/20",
    },
    {
      title: "Clientes Ativos",
      value: "412",
      trend: "+8.3%",
      description: "de 487 cadastrados",
      icon: Users,
      gradient: "from-violet-500 to-purple-400",
      bgGlow: "bg-violet-500/20",
    },
    {
      title: "Ticket Medio",
      value: "R$ 2.560",
      trend: "+5.2%",
      description: "por pedido",
      icon: Target,
      gradient: "from-emerald-500 to-green-400",
      bgGlow: "bg-emerald-500/20",
    },
    {
      title: "Analises IA",
      value: "342",
      trend: "+23%",
      description: "geradas este mes",
      icon: Zap,
      gradient: "from-amber-500 to-orange-400",
      bgGlow: "bg-amber-500/20",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card
            key={kpi.title}
            className={`glass overflow-hidden relative group hover:border-white/20 transition-all duration-500 animate-fade-in-up stagger-${index + 1}`}
          >
            <div className={`absolute -top-12 -right-12 w-40 h-40 ${kpi.bgGlow} rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700`} />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-lg shadow-black/20`}>
                  <kpi.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                  <ArrowUpRight className="h-3 w-3" />
                  {kpi.trend}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
              <p className="text-3xl font-bold tracking-tight">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1: Revenue + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Area Chart */}
        <Card className="glass lg:col-span-2 animate-fade-in-up stagger-5">
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
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="mes" stroke="rgba(255,255,255,0.25)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="meta" name="Meta" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="6 4" fill="url(#colorMeta)" />
                  <Area type="monotone" dataKey="receita" name="Receita" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#colorReceita)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Client Distribution Pie */}
        <Card className="glass animate-fade-in-up stagger-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Clientes por Segmento</CardTitle>
            <CardDescription>Distribuicao da base ativa</CardDescription>
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

      {/* Charts Row 2: Vendedores Bar + Side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vendedores Bar Chart */}
        <Card className="glass lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
                <Award className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Ranking de Vendedores</CardTitle>
                <CardDescription>Vendas vs Meta mensal</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendedoresData} barGap={6} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="nome" stroke="rgba(255,255,255,0.25)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="vendas" name="Vendas" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="meta" name="Meta" fill="rgba(139, 92, 246, 0.35)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Vendedores mini ranking below chart */}
            <div className="mt-4 border-t border-white/[0.06] pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {vendedoresData.map((v, i) => {
                  const medals = ["text-amber-400", "text-gray-300", "text-amber-600"];
                  const pct = ((v.vendas / v.meta) * 100).toFixed(0);
                  return (
                    <div key={v.nome} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                      <span className={`text-sm font-bold ${medals[i] || 'text-muted-foreground'}`}>
                        {i < 3 ? ['#1', '#2', '#3'][i] : `#${i + 1}`}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{v.nome}</p>
                        <p className="text-[10px] text-muted-foreground">{formatCurrency(v.vendas)}</p>
                      </div>
                      <span className={`text-xs font-bold ${Number(pct) >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Products + Activity */}
        <div className="space-y-4">
          {/* Weekly Orders Mini Chart */}
          <Card className="glass animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Pedidos da Semana</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="pedidos" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload?.[0]) {
                          return (
                            <div className="glass-strong rounded-lg p-2 text-xs shadow-2xl">
                              <span className="font-medium">{label}: </span>
                              <span className="text-primary font-bold">{payload[0].value} pedidos</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-muted-foreground">Total: <span className="font-semibold text-foreground">143 pedidos</span></span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" /> +18%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="glass animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Top Produtos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5">
                {topProducts.map((product, i) => (
                  <div key={product.nome} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-sky-400">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{product.nome}</p>
                      <p className="text-[10px] text-muted-foreground">{product.vendas} vendas</p>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400">{product.trend}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Feed - Full Width */}
      <Card className="glass animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Atividade Recente</CardTitle>
                <CardDescription>Ultimas acoes no sistema</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Atualizado agora
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {recentActivity.map((item, i) => {
              const colors: Record<string, string> = {
                pedido: "bg-sky-500",
                analise: "bg-violet-500",
                cliente: "bg-emerald-500",
                alerta: "bg-amber-500",
              };
              const icons: Record<string, React.ReactNode> = {
                pedido: <ShoppingCart className="h-3.5 w-3.5 text-white" />,
                analise: <Sparkles className="h-3.5 w-3.5 text-white" />,
                cliente: <Users className="h-3.5 w-3.5 text-white" />,
                alerta: <TrendingUp className="h-3.5 w-3.5 text-white" />,
              };
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/[0.04]">
                  <div className={`p-1.5 rounded-lg ${colors[item.tipo]} shrink-0 mt-0.5`}>
                    {icons[item.tipo]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.texto}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-primary">{item.valor}</span>
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
  );
}
