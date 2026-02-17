import React, { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Search,
  UserCheck,
  AlertTriangle,
  AlertOctagon,
  Phone,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getClientesByVendedor,
  getStatusCliente,
  getDiasSemCompra,
  formatCurrency,
  type MockCliente,
  type StatusCliente,
} from "@/data/mock";

type StatusFilter = "todos" | "ativo" | "risco" | "critico";

const formatDate = (d: string | null) => {
  if (!d) return "Nunca";
  const date = new Date(d);
  return date.toLocaleDateString("pt-BR");
};

export default function Clientes() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");

  const clientes = useMemo(() => {
    if (!user) return [];
    return getClientesByVendedor(user.id);
  }, [user]);

  const clientesComStatus = useMemo(() => {
    return clientes.map((c) => ({
      ...c,
      status: getStatusCliente(c),
      diasSemCompra: getDiasSemCompra(c),
    }));
  }, [clientes]);

  const filtered = clientesComStatus.filter((c) => {
    const matchSearch =
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.cnpj.includes(search);
    const matchStatus = statusFilter === "todos" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: clientesComStatus.length,
    ativos: clientesComStatus.filter((c) => c.status === "ativo").length,
    risco: clientesComStatus.filter((c) => c.status === "risco").length,
    criticos: clientesComStatus.filter((c) => c.status === "critico").length,
  };

  const statusBadge = (status: StatusCliente) => {
    const map: Record<StatusCliente, string> = {
      ativo: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
      risco: "bg-amber-400/10 text-amber-400 border-amber-400/20",
      critico: "bg-red-400/10 text-red-400 border-red-400/20",
    };
    const labels: Record<StatusCliente, string> = {
      ativo: "Ativo",
      risco: "Em Risco",
      critico: "Critico",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${map[status]}`}
      >
        {labels[status]}
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
    { label: "Todos", value: "todos", count: counts.total, icon: Users, color: "text-sky-400" },
    { label: "Ativos", value: "ativo", count: counts.ativos, icon: UserCheck, color: "text-emerald-400" },
    { label: "Em Risco", value: "risco", count: counts.risco, icon: AlertTriangle, color: "text-amber-400" },
    { label: "Criticos", value: "critico", count: counts.criticos, icon: AlertOctagon, color: "text-red-400" },
  ];

  return (
    <DashboardLayout title="Clientes" subtitle="Sua carteira de clientes">
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Filter Tabs */}
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
            placeholder="Buscar por nome ou CNPJ..."
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
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Cliente
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">
                      Tipo
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                      CNPJ
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">
                      Ticket Medio
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">
                      Ultima Compra
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell text-right">
                      Dias s/ Compra
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{c.nome}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" /> {c.contato}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs px-2 py-1 rounded-md bg-white/[0.05] text-muted-foreground capitalize">
                          {c.tipo}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground font-mono">
                        {c.cnpj}
                      </TableCell>
                      <TableCell className="text-center">
                        {statusBadge(c.status)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold">
                        {formatCurrency(c.ticket_medio)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {formatDate(c.ultima_compra)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right">
                        <span
                          className={`text-xs font-semibold flex items-center gap-1 justify-end ${
                            c.diasSemCompra > 60
                              ? "text-red-400"
                              : c.diasSemCompra > 30
                                ? "text-amber-400"
                                : "text-muted-foreground"
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {c.diasSemCompra}d
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
            Exibindo {filtered.length} de {clientesComStatus.length} clientes
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> {counts.ativos} ativos
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
