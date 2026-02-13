import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart, Search, CheckCircle2, Clock, XCircle,
  DollarSign, ArrowUpRight, Package,
} from "lucide-react";

const mockPedidos = [
  { id: 1247, cliente: "Supermercado Bom Preco", vendedor: "Carlos Silva", data: "2026-02-13", valor: 3450, status: "concluido", itens: 8 },
  { id: 1246, cliente: "Rest. Sabor & Cia", vendedor: "Roberto Oliveira", data: "2026-02-12", valor: 5200, status: "concluido", itens: 12 },
  { id: 1245, cliente: "Padaria Central", vendedor: "Ana Paula", data: "2026-02-12", valor: 1280, status: "pendente", itens: 5 },
  { id: 1244, cliente: "Supermercado Familia", vendedor: "Ana Paula", data: "2026-02-11", valor: 4800, status: "concluido", itens: 10 },
  { id: 1243, cliente: "Confeitaria Doce Mel", vendedor: "Mariana Costa", data: "2026-02-11", valor: 920, status: "concluido", itens: 4 },
  { id: 1242, cliente: "Lanchonete Quick Bite", vendedor: "Pedro Almeida", data: "2026-02-10", valor: 680, status: "pendente", itens: 3 },
  { id: 1241, cliente: "Restaurante Villa Italia", vendedor: "Mariana Costa", data: "2026-02-10", valor: 6100, status: "concluido", itens: 15 },
  { id: 1240, cliente: "Mercado Economico", vendedor: "Pedro Almeida", data: "2026-02-09", valor: 1950, status: "concluido", itens: 7 },
  { id: 1239, cliente: "Supermercado Extra Plus", vendedor: "Carlos Silva", data: "2026-02-09", valor: 7800, status: "concluido", itens: 18 },
  { id: 1238, cliente: "Padaria Pao de Ouro", vendedor: "Ana Paula", data: "2026-02-08", valor: 1650, status: "concluido", itens: 6 },
  { id: 1237, cliente: "Padaria Trigo Dourado", vendedor: "Ana Paula", data: "2026-02-08", valor: 1100, status: "cancelado", itens: 4 },
  { id: 1236, cliente: "Rest. Tempero Mineiro", vendedor: "Pedro Almeida", data: "2026-02-07", valor: 3800, status: "concluido", itens: 9 },
  { id: 1235, cliente: "Mercado Central", vendedor: "Carlos Silva", data: "2026-02-07", valor: 2890, status: "pendente", itens: 8 },
  { id: 1234, cliente: "Confeitaria Arte Doce", vendedor: "Mariana Costa", data: "2026-02-06", valor: 1350, status: "concluido", itens: 5 },
  { id: 1233, cliente: "Supermercado Bom Preco", vendedor: "Carlos Silva", data: "2026-02-05", valor: 4100, status: "concluido", itens: 11 },
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const formatDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR");

type StatusFilter = "todos" | "concluido" | "pendente" | "cancelado";

export default function Pedidos() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");

  const filtered = mockPedidos.filter(p => {
    const matchSearch = p.cliente.toLowerCase().includes(search.toLowerCase()) ||
      p.vendedor.toLowerCase().includes(search.toLowerCase()) ||
      String(p.id).includes(search);
    const matchStatus = statusFilter === "todos" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: mockPedidos.length,
    concluidos: mockPedidos.filter(p => p.status === "concluido").length,
    pendentes: mockPedidos.filter(p => p.status === "pendente").length,
    cancelados: mockPedidos.filter(p => p.status === "cancelado").length,
  };

  const faturamento = mockPedidos
    .filter(p => p.status === "concluido")
    .reduce((s, p) => s + p.valor, 0);

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string; icon: React.ElementType }> = {
      concluido: { cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", label: "Concluido", icon: CheckCircle2 },
      pendente: { cls: "bg-amber-400/10 text-amber-400 border-amber-400/20", label: "Pendente", icon: Clock },
      cancelado: { cls: "bg-red-400/10 text-red-400 border-red-400/20", label: "Cancelado", icon: XCircle },
    };
    const s = map[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${s.cls}`}>
        <s.icon className="h-3 w-3" />
        {s.label}
      </span>
    );
  };

  const filters: { label: string; value: StatusFilter; count: number; icon: React.ElementType; color: string }[] = [
    { label: "Todos", value: "todos", count: counts.total, icon: ShoppingCart, color: "text-sky-400" },
    { label: "Concluidos", value: "concluido", count: counts.concluidos, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Pendentes", value: "pendente", count: counts.pendentes, icon: Clock, color: "text-amber-400" },
    { label: "Cancelados", value: "cancelado", count: counts.cancelados, icon: XCircle, color: "text-red-400" },
  ];

  return (
    <DashboardLayout
      title="Pedidos"
      subtitle="Historico e acompanhamento de pedidos"
      actions={
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
          <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">{formatCurrency(faturamento)}</span>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filters.map((f, i) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`glass p-4 rounded-xl text-left transition-all duration-300 animate-fade-in-up stagger-${i + 1} ${
                statusFilter === f.value ? "border-primary/40 bg-primary/5" : "hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <f.icon className={`h-4 w-4 ${f.color}`} />
                {statusFilter === f.value && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <p className="text-2xl font-bold">{f.count}</p>
              <p className="text-xs text-muted-foreground">{f.label}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative animate-fade-in-up stagger-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, vendedor ou numero do pedido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card/60 border-white/[0.08] focus:border-primary/40"
          />
        </div>

        {/* Table */}
        <Card className="glass animate-fade-in-up stagger-6">
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground">Pedido</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">Vendedor</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">Data</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell text-center">Itens</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">Valor</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id} className="border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors">
                      <TableCell>
                        <span className="font-mono text-sm font-semibold text-primary">#{p.id}</span>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{p.cliente}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{p.vendedor}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{formatDate(p.data)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-center">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Package className="h-3 w-3" /> {p.itens}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold">{formatCurrency(p.valor)}</TableCell>
                      <TableCell className="text-center">{statusBadge(p.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-xs text-muted-foreground animate-fade-in">
          <span>Exibindo {filtered.length} de {mockPedidos.length} pedidos</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> +15.2% vs mes anterior
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
