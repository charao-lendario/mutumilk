import React, { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  ShoppingCart,
  MessageSquare,
  ArrowUpRight,
  FileText,
  DollarSign,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  mockRoteiros,
  formatCurrency,
  type MockVisita,
} from "@/data/mock";
import { useMockStore, getVisitaComUpdate } from "@/stores/mockStore";

type StatusFilter = "todos" | "concluida" | "pendente";

export default function HistoricoVisitas() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const pedidosNovos = useMockStore((s) => s.pedidosNovos);

  const todasVisitas = useMemo(() => {
    if (!user) return [];
    const roteirosVendedor = mockRoteiros.filter((r) => r.vendedor_id === user.id);
    const visitas: (MockVisita & { data_roteiro: string })[] = [];

    roteirosVendedor.forEach((roteiro) => {
      roteiro.visitas.forEach((v) => {
        const updated = getVisitaComUpdate(v);
        visitas.push({ ...updated, data_roteiro: roteiro.data_roteiro });
      });
    });

    return visitas.sort((a, b) => {
      if (a.concluida_at && b.concluida_at) {
        return new Date(b.concluida_at).getTime() - new Date(a.concluida_at).getTime();
      }
      if (a.concluida_at) return -1;
      if (b.concluida_at) return 1;
      return b.ordem - a.ordem;
    });
  }, [user, pedidosNovos]);

  const filtered = todasVisitas.filter((v) => {
    const matchSearch = v.cliente_nome.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "todos" ||
      (statusFilter === "concluida" && v.status !== "pendente") ||
      (statusFilter === "pendente" && v.status === "pendente");
    return matchSearch && matchStatus;
  });

  const counts = {
    total: todasVisitas.length,
    concluidas: todasVisitas.filter((v) => v.status !== "pendente").length,
    pendentes: todasVisitas.filter((v) => v.status === "pendente").length,
  };

  const formatDate = (d: string | null) => {
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString("pt-BR");
  };

  const formatDateTime = (d: string | null) => {
    if (!d) return "-";
    const date = new Date(d);
    return (
      date.toLocaleDateString("pt-BR") +
      " " +
      date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getResultado = (visita: MockVisita & { data_roteiro: string }) => {
    if (visita.status === "pendente") return null;

    if (visita.pedido_id) {
      const pedidoNovo = pedidosNovos.find((p) => p.id === visita.pedido_id);
      if (pedidoNovo) {
        return {
          tipo: "venda" as const,
          valor: pedidoNovo.valorTotal,
          texto: `Vendeu ${formatCurrency(pedidoNovo.valorTotal)}`,
        };
      }
      return {
        tipo: "venda" as const,
        valor: 0,
        texto: "Venda registrada",
      };
    }

    if (visita.justificativa) {
      return {
        tipo: "justificativa" as const,
        valor: 0,
        texto: visita.justificativa,
      };
    }

    return {
      tipo: "concluida" as const,
      valor: 0,
      texto: "Concluida",
    };
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string; icon: React.ElementType }> = {
      pendente: {
        cls: "bg-white/[0.05] text-muted-foreground border-white/[0.08]",
        label: "Pendente",
        icon: Clock,
      },
      visita_concluida: {
        cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
        label: "Concluida",
        icon: CheckCircle2,
      },
      contato_realizado: {
        cls: "bg-sky-400/10 text-sky-400 border-sky-400/20",
        label: "Contato",
        icon: MessageSquare,
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

  const filters: { label: string; value: StatusFilter; count: number; icon: React.ElementType; color: string }[] = [
    { label: "Todas", value: "todos", count: counts.total, icon: MapPin, color: "text-sky-400" },
    { label: "Concluidas", value: "concluida", count: counts.concluidas, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Pendentes", value: "pendente", count: counts.pendentes, icon: Clock, color: "text-amber-400" },
  ];

  return (
    <DashboardLayout title="Historico de Visitas" subtitle="Registro de todas as suas visitas">
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Filter Tabs */}
        <div className="grid grid-cols-3 gap-3">
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
        <div className="relative animate-fade-in-up stagger-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card/60 border-white/[0.08] focus:border-primary/40"
          />
        </div>

        {/* Desktop Table */}
        <Card className="glass animate-fade-in-up stagger-5 hidden md:block">
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Data
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Cliente
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Resultado
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">
                      Valor
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((v) => {
                    const resultado = getResultado(v);
                    return (
                      <TableRow
                        key={v.id}
                        className="border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                      >
                        <TableCell className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {v.concluida_at ? formatDateTime(v.concluida_at) : formatDate(v.data_roteiro)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">{v.cliente_nome}</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{v.cliente_tipo}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          {statusBadge(v.status)}
                        </TableCell>
                        <TableCell>
                          {resultado ? (
                            <div className="flex items-center gap-1.5">
                              {resultado.tipo === "venda" ? (
                                <ShoppingCart className="h-3 w-3 text-emerald-400 shrink-0" />
                              ) : (
                                <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                              )}
                              <span className={`text-xs ${resultado.tipo === "venda" ? "text-emerald-400 font-semibold" : "text-muted-foreground"} truncate max-w-[200px]`}>
                                {resultado.texto}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {resultado && resultado.valor > 0 ? (
                            <span className="text-sm font-semibold text-emerald-400">
                              {formatCurrency(resultado.valor)}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Mobile Cards */}
        <div className="space-y-3 md:hidden">
          {filtered.map((v, i) => {
            const resultado = getResultado(v);
            return (
              <Card
                key={v.id}
                className="glass animate-fade-in-up"
                style={{ animationDelay: `${0.3 + i * 0.04}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">{v.cliente_nome}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{v.cliente_tipo}</p>
                    </div>
                    {statusBadge(v.status)}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {v.concluida_at ? formatDateTime(v.concluida_at) : formatDate(v.data_roteiro)}
                    </span>
                    {resultado && resultado.valor > 0 && (
                      <span className="text-sm font-semibold text-emerald-400">
                        {formatCurrency(resultado.valor)}
                      </span>
                    )}
                  </div>
                  {resultado && resultado.tipo === "justificativa" && (
                    <p className="text-[11px] text-muted-foreground mt-2 truncate">
                      {resultado.texto}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground animate-fade-in">
          <span>
            Exibindo {filtered.length} de {todasVisitas.length} visitas
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ArrowUpRight className="h-3 w-3" />
            {counts.concluidas} concluidas
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
