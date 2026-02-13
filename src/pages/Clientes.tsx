import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users, Search, UserCheck, AlertTriangle, AlertOctagon,
  Phone, Mail, MapPin, ArrowUpRight,
} from "lucide-react";

const mockClientes = [
  { id: 1, nome: "Supermercado Bom Preco", tipo: "Supermercado", cnpj: "12.345.678/0001-90", contato: "(11) 98765-4321", vendedor: "Carlos Silva", ticketMedio: 4520, ultimaCompra: "2026-02-10", status: "ativo" },
  { id: 2, nome: "Padaria Pao de Ouro", tipo: "Padaria", cnpj: "23.456.789/0001-01", contato: "(11) 91234-5678", vendedor: "Ana Paula", ticketMedio: 1850, ultimaCompra: "2026-02-08", status: "ativo" },
  { id: 3, nome: "Restaurante Sabor & Cia", tipo: "Restaurante", cnpj: "34.567.890/0001-12", contato: "(11) 99876-5432", vendedor: "Roberto Oliveira", ticketMedio: 3200, ultimaCompra: "2026-01-15", status: "risco" },
  { id: 4, nome: "Mercado Central", tipo: "Mercado", cnpj: "45.678.901/0001-23", contato: "(11) 93456-7890", vendedor: "Carlos Silva", ticketMedio: 2890, ultimaCompra: "2025-12-20", status: "critico" },
  { id: 5, nome: "Confeitaria Doce Mel", tipo: "Confeitaria", cnpj: "56.789.012/0001-34", contato: "(11) 92345-6789", vendedor: "Mariana Costa", ticketMedio: 980, ultimaCompra: "2026-02-12", status: "ativo" },
  { id: 6, nome: "Lanchonete Quick Bite", tipo: "Lanchonete", cnpj: "67.890.123/0001-45", contato: "(11) 98765-1234", vendedor: "Pedro Almeida", ticketMedio: 650, ultimaCompra: "2026-01-28", status: "risco" },
  { id: 7, nome: "Supermercado Familia", tipo: "Supermercado", cnpj: "78.901.234/0001-56", contato: "(11) 91234-8765", vendedor: "Ana Paula", ticketMedio: 5100, ultimaCompra: "2026-02-11", status: "ativo" },
  { id: 8, nome: "Padaria Central", tipo: "Padaria", cnpj: "89.012.345/0001-67", contato: "(11) 99876-2345", vendedor: "Roberto Oliveira", ticketMedio: 1420, ultimaCompra: "2025-11-10", status: "critico" },
  { id: 9, nome: "Restaurante Villa Italia", tipo: "Restaurante", cnpj: "90.123.456/0001-78", contato: "(11) 93456-1234", vendedor: "Mariana Costa", ticketMedio: 4200, ultimaCompra: "2026-02-09", status: "ativo" },
  { id: 10, nome: "Mercado Economico", tipo: "Mercado", cnpj: "01.234.567/0001-89", contato: "(11) 92345-9876", vendedor: "Pedro Almeida", ticketMedio: 1750, ultimaCompra: "2026-01-05", status: "risco" },
  { id: 11, nome: "Supermercado Extra Plus", tipo: "Supermercado", cnpj: "11.222.333/0001-44", contato: "(11) 97654-3210", vendedor: "Carlos Silva", ticketMedio: 6800, ultimaCompra: "2026-02-13", status: "ativo" },
  { id: 12, nome: "Padaria Trigo Dourado", tipo: "Padaria", cnpj: "22.333.444/0001-55", contato: "(11) 96543-2109", vendedor: "Ana Paula", ticketMedio: 1100, ultimaCompra: "2026-02-06", status: "ativo" },
  { id: 13, nome: "Lanchonete do Ze", tipo: "Lanchonete", cnpj: "33.444.555/0001-66", contato: "(11) 95432-1098", vendedor: "Roberto Oliveira", ticketMedio: 420, ultimaCompra: "2025-12-01", status: "critico" },
  { id: 14, nome: "Confeitaria Arte Doce", tipo: "Confeitaria", cnpj: "44.555.666/0001-77", contato: "(11) 94321-0987", vendedor: "Mariana Costa", ticketMedio: 1350, ultimaCompra: "2026-01-20", status: "risco" },
  { id: 15, nome: "Restaurante Tempero Mineiro", tipo: "Restaurante", cnpj: "55.666.777/0001-88", contato: "(11) 93210-9876", vendedor: "Pedro Almeida", ticketMedio: 3800, ultimaCompra: "2026-02-07", status: "ativo" },
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const formatDate = (d: string) => {
  const date = new Date(d + "T12:00:00");
  return date.toLocaleDateString("pt-BR");
};

type StatusFilter = "todos" | "ativo" | "risco" | "critico";

export default function Clientes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");

  const filtered = mockClientes.filter(c => {
    const matchSearch = c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.cnpj.includes(search) ||
      c.vendedor.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: mockClientes.length,
    ativos: mockClientes.filter(c => c.status === "ativo").length,
    risco: mockClientes.filter(c => c.status === "risco").length,
    criticos: mockClientes.filter(c => c.status === "critico").length,
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ativo: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
      risco: "bg-amber-400/10 text-amber-400 border-amber-400/20",
      critico: "bg-red-400/10 text-red-400 border-red-400/20",
    };
    const labels: Record<string, string> = { ativo: "Ativo", risco: "Em Risco", critico: "Critico" };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${map[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const filters: { label: string; value: StatusFilter; count: number; icon: React.ElementType; color: string }[] = [
    { label: "Todos", value: "todos", count: counts.total, icon: Users, color: "text-sky-400" },
    { label: "Ativos", value: "ativo", count: counts.ativos, icon: UserCheck, color: "text-emerald-400" },
    { label: "Em Risco", value: "risco", count: counts.risco, icon: AlertTriangle, color: "text-amber-400" },
    { label: "Criticos", value: "critico", count: counts.criticos, icon: AlertOctagon, color: "text-red-400" },
  ];

  return (
    <DashboardLayout title="Clientes" subtitle="Gestao da base de clientes">
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Filter Tabs */}
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
            placeholder="Buscar por nome, CNPJ ou vendedor..."
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
                    <TableHead className="text-xs font-semibold text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">Tipo</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">CNPJ</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">Vendedor</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">Ticket Medio</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">Ultima Compra</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id} className="border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{c.nome}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" /> {c.contato}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs px-2 py-1 rounded-md bg-white/[0.05] text-muted-foreground">{c.tipo}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground font-mono">{c.cnpj}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{c.vendedor}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{formatCurrency(c.ticketMedio)}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{formatDate(c.ultimaCompra)}</TableCell>
                      <TableCell className="text-center">{statusBadge(c.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-xs text-muted-foreground animate-fade-in">
          <span>Exibindo {filtered.length} de {mockClientes.length} clientes</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> +8.3% este mes
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
