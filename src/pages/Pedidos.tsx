import React, { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  ArrowUpRight,
  Package,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPedidosByVendedor,
  formatCurrency,
  type MockPedido,
} from "@/data/mock";
import { useMockStore } from "@/stores/mockStore";

type StatusFilter = "todos" | "concluido" | "pendente" | "cancelado";

const formatDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR");

export default function Pedidos() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const pedidosNovos = useMockStore((s) => s.pedidosNovos);

  const allPedidos = useMemo(() => {
    if (!user) return [];

    const pedidosMock = getPedidosByVendedor(user.id);

    const novosConvertidos: MockPedido[] = pedidosNovos
      .filter((p) => p.vendedorId === user.id)
      .map((p) => ({
        id: p.id,
        cliente_id: p.clienteId,
        cliente_nome: p.clienteNome,
        vendedor_id: p.vendedorId,
        data_pedido: p.dataPedido,
        valor_total: p.valorTotal,
        status: "concluido" as const,
        itens: p.itens.map((item, idx) => ({
          id: `${p.id}-item-${idx}`,
          pedido_id: p.id,
          produto_id: item.produtoId,
          produto_nome: item.produtoNome,
          quantidade: item.quantidade,
          preco_unitario: item.precoUnitario,
          subtotal: item.subtotal,
        })),
      }));

    return [...novosConvertidos, ...pedidosMock].sort(
      (a, b) => new Date(b.data_pedido).getTime() - new Date(a.data_pedido).getTime()
    );
  }, [user, pedidosNovos]);

  const filtered = allPedidos.filter((p) => {
    const matchSearch =
      p.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
      p.id.includes(search);
    const matchStatus = statusFilter === "todos" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: allPedidos.length,
    concluidos: allPedidos.filter((p) => p.status === "concluido").length,
    pendentes: allPedidos.filter((p) => p.status === "pendente").length,
    cancelados: allPedidos.filter((p) => p.status === "cancelado").length,
  };

  const faturamento = allPedidos
    .filter((p) => p.status === "concluido")
    .reduce((s, p) => s + p.valor_total, 0);

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string; icon: React.ElementType }> = {
      concluido: {
        cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
        label: "Concluido",
        icon: CheckCircle2,
      },
      pendente: {
        cls: "bg-amber-400/10 text-amber-400 border-amber-400/20",
        label: "Pendente",
        icon: Clock,
      },
      cancelado: {
        cls: "bg-red-400/10 text-red-400 border-red-400/20",
        label: "Cancelado",
        icon: XCircle,
      },
    };
    const s = map[status] || map.pendente;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${s.cls}`}
      >
        <s.icon className="h-3 w-3" />
        {s.label}
      </span>
    );
  };

  const filters: {
    label: string;
    value: StatusFilter;
    count: number;
    icon: React.ElementType;
    color: string;
  }[] = [
    { label: "Todos", value: "todos", count: counts.total, icon: ShoppingCart, color: "text-sky-400" },
    { label: "Concluidos", value: "concluido", count: counts.concluidos, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Pendentes", value: "pendente", count: counts.pendentes, icon: Clock, color: "text-amber-400" },
    { label: "Cancelados", value: "cancelado", count: counts.cancelados, icon: XCircle, color: "text-red-400" },
  ];

  return (
    <DashboardLayout
      title="Pedidos"
      subtitle="Historico de pedidos"
      actions={
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
          <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">
            {formatCurrency(faturamento)}
          </span>
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
                statusFilter === f.value
                  ? "border-primary/40 bg-primary/5"
                  : "hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <f.icon className={`h-4 w-4 ${f.color}`} />
                {statusFilter === f.value && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
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
            placeholder="Buscar por cliente ou numero do pedido..."
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
                    <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">
                      Data
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Cliente
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">
                      Valor
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell text-center">
                      Itens
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow
                      key={p.id}
                      className="border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors"
                    >
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {formatDate(p.data_pedido)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{p.cliente_nome}</p>
                        <p className="text-[11px] text-muted-foreground font-mono md:hidden">
                          {formatDate(p.data_pedido)}
                        </p>
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold">
                        {formatCurrency(p.valor_total)}
                      </TableCell>
                      <TableCell className="text-center">
                        {statusBadge(p.status)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-center">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Package className="h-3 w-3" /> {p.itens.length}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-xs text-muted-foreground animate-fade-in">
          <span>
            Exibindo {filtered.length} de {allPedidos.length} pedidos
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> {formatCurrency(faturamento)}{" "}
            faturado
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
