import React, { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Package, Tag, Layers, ArrowUpRight, Percent,
} from "lucide-react";
import { mockProdutos, mockPedidos, formatCurrency } from "@/data/mock";

export default function Produtos() {
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todos");

  const categorias = useMemo(() => {
    const cats = new Set(mockProdutos.map((p) => p.categoria));
    return ["todos", ...Array.from(cats)];
  }, []);

  const now = new Date();
  const mesAtual = now.getMonth();
  const anoAtual = now.getFullYear();

  // Aggregate sales per product
  const productSales = useMemo(() => {
    const map: Record<string, { nome: string; categoria: string; qty: number; revenue: number }> = {};
    mockPedidos
      .filter((p) => p.status === "concluido")
      .forEach((p) => {
        p.itens.forEach((item) => {
          if (!map[item.produto_id]) {
            const prod = mockProdutos.find((pr) => pr.id === item.produto_id);
            map[item.produto_id] = {
              nome: item.produto_nome,
              categoria: prod?.categoria || "Outros",
              qty: 0,
              revenue: 0,
            };
          }
          map[item.produto_id].qty += item.quantidade;
          map[item.produto_id].revenue += item.subtotal;
        });
      });
    return map;
  }, []);

  // Top 10 chart
  const top10Chart = useMemo(() => {
    return Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10)
      .map((p) => ({
        nome: p.nome.length > 20 ? p.nome.substring(0, 18) + "..." : p.nome,
        fullNome: p.nome,
        vendas: p.qty,
        revenue: p.revenue,
      }));
  }, [productSales]);

  // Products with sales data
  const productsGrid = useMemo(() => {
    return mockProdutos
      .map((p) => {
        const sales = productSales[p.id];
        return {
          ...p,
          totalVendido: sales?.qty || 0,
          totalRevenue: sales?.revenue || 0,
        };
      })
      .filter((p) => categoriaFilter === "todos" || p.categoria === categoriaFilter)
      .sort((a, b) => b.totalVendido - a.totalVendido);
  }, [productSales, categoriaFilter]);

  const totalProdutos = mockProdutos.length;
  const emPromocao = mockProdutos.filter((p) => p.em_promocao).length;
  const totalCategorias = new Set(mockProdutos.map((p) => p.categoria)).size;

  const kpis = [
    {
      title: "Total Produtos",
      value: String(totalProdutos),
      icon: Package,
      gradient: "from-sky-500 to-cyan-400",
      bgGlow: "bg-sky-500/20",
    },
    {
      title: "Em Promocao",
      value: String(emPromocao),
      icon: Percent,
      gradient: "from-emerald-500 to-green-400",
      bgGlow: "bg-emerald-500/20",
    },
    {
      title: "Categorias",
      value: String(totalCategorias),
      icon: Layers,
      gradient: "from-violet-500 to-purple-400",
      bgGlow: "bg-violet-500/20",
    },
  ];

  return (
    <DashboardLayout title="Produtos" subtitle="Catalogo e analytics de produtos">
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                </div>
                <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                <p className="text-3xl font-bold tracking-tight">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top 10 Bar Chart */}
        <Card className="glass animate-fade-in-up stagger-4">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
                <Package className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Top 10 Produtos</CardTitle>
                <CardDescription>Por volume de vendas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Chart} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    stroke="rgba(255,255,255,0.25)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={150}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="glass-strong rounded-xl p-3 text-sm shadow-2xl">
                            <p className="font-semibold mb-1">{data.fullNome}</p>
                            <p className="text-xs text-primary">{data.vendas} unidades</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(data.revenue)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="vendas" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 animate-fade-in-up stagger-5">
          {categorias.map((cat) => (
            <Button
              key={cat}
              variant={categoriaFilter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoriaFilter(cat)}
              className={
                categoriaFilter === cat
                  ? "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                  : "border-white/[0.08] text-muted-foreground hover:text-foreground hover:border-white/20"
              }
            >
              {cat === "todos" ? "Todos" : cat}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productsGrid.map((p, i) => (
            <Card
              key={p.id}
              className="glass overflow-hidden group hover:border-white/20 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${0.3 + i * 0.03}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.nome}</p>
                    <p className="text-[10px] text-muted-foreground">{p.categoria}</p>
                  </div>
                  {p.em_promocao && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 border-emerald-400/30 text-emerald-400 bg-emerald-400/10 shrink-0 ml-2"
                    >
                      Promo
                    </Badge>
                  )}
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-lg font-bold">{formatCurrency(p.preco_atual)}</p>
                    {p.em_promocao && p.preco_anterior !== p.preco_atual && (
                      <p className="text-[10px] text-muted-foreground line-through">
                        {formatCurrency(p.preco_anterior)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Vendidos</p>
                    <p className="text-sm font-bold text-primary">{p.totalVendido}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground animate-fade-in">
          <span>
            Exibindo {productsGrid.length} de {totalProdutos} produtos
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> {emPromocao} em promocao
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
