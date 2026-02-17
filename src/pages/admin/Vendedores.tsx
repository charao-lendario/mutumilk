import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, TrendingUp } from "lucide-react";
import {
  getVendedores, mockPedidos, mockRoteiros, formatCurrency,
} from "@/data/mock";
import { getVisitaComUpdate } from "@/stores/mockStore";

const VENDEDOR_COLORS: Record<string, string> = {
  "vendedor-001": "#0ea5e9",
  "vendedor-002": "#8b5cf6",
  "vendedor-003": "#22c55e",
  "vendedor-004": "#f59e0b",
  "vendedor-005": "#f43f5e",
};

const META_MENSAL = 50000;

export default function Vendedores() {
  const navigate = useNavigate();
  const vendedores = getVendedores();

  const now = new Date();
  const mesAtual = now.getMonth();
  const anoAtual = now.getFullYear();

  const vendedoresData = useMemo(() => {
    return vendedores
      .map((v) => {
        // Visitas hoje
        const roteiro = mockRoteiros.find((r) => r.vendedor_id === v.id);
        const visitas = roteiro ? roteiro.visitas.map((vis) => getVisitaComUpdate(vis)) : [];
        const visitasHoje = visitas.length;
        const visitasConcluidas = visitas.filter((vis) => vis.status !== "pendente").length;
        const vendasHoje = visitas.filter((vis) => vis.pedido_id).length;

        // Faturamento mes
        const faturamentoMes = mockPedidos
          .filter((p) => {
            const d = new Date(p.data_pedido);
            return (
              p.vendedor_id === v.id &&
              p.status === "concluido" &&
              d.getMonth() === mesAtual &&
              d.getFullYear() === anoAtual
            );
          })
          .reduce((sum, p) => sum + p.valor_total, 0);

        const pctMeta = Math.round((faturamentoMes / META_MENSAL) * 100);

        return {
          ...v,
          visitasHoje,
          visitasConcluidas,
          vendasHoje,
          faturamentoMes,
          pctMeta,
          color: VENDEDOR_COLORS[v.id] || "#64748b",
        };
      })
      .sort((a, b) => b.faturamentoMes - a.faturamentoMes);
  }, [vendedores, mesAtual, anoAtual]);

  const getMedalColor = (rank: number) => {
    if (rank === 0) return "text-amber-400";
    if (rank === 1) return "text-gray-300";
    if (rank === 2) return "text-amber-600";
    return "text-muted-foreground";
  };

  const getMedalBg = (rank: number) => {
    if (rank === 0) return "bg-amber-400/10 border-amber-400/20";
    if (rank === 1) return "bg-gray-300/10 border-gray-300/20";
    if (rank === 2) return "bg-amber-600/10 border-amber-600/20";
    return "bg-white/[0.03] border-white/[0.06]";
  };

  return (
    <DashboardLayout title="Vendedores" subtitle="Equipe de representantes">
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Summary strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {vendedoresData.slice(0, 3).map((v, i) => (
            <Card
              key={v.id}
              className={`glass overflow-hidden cursor-pointer hover:border-white/20 transition-all duration-300 animate-fade-in-up stagger-${i + 1}`}
              onClick={() => navigate(`/admin/vendedores/${v.id}`)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${getMedalBg(i)}`}>
                  <Trophy className={`h-5 w-5 ${getMedalColor(i)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{["Ouro", "Prata", "Bronze"][i]}</p>
                  <p className="text-sm font-semibold truncate">{v.full_name}</p>
                  <p className="text-xs font-medium text-primary">{formatCurrency(v.faturamentoMes)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card className="glass animate-fade-in-up stagger-4">
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="min-w-[640px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground w-16">Rank</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Vendedor</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center">Visitas Hoje</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center">Vendas Hoje</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">Faturamento Mes</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center">% Meta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendedoresData.map((v, i) => (
                    <TableRow
                      key={v.id}
                      className="border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/vendedores/${v.id}`)}
                    >
                      <TableCell>
                        <span className={`text-sm font-bold ${getMedalColor(i)}`}>
                          #{i + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ backgroundColor: v.color }}
                          >
                            {v.avatar_initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{v.full_name}</p>
                            <p className="text-[10px] text-muted-foreground">{v.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium">
                          {v.visitasConcluidas}/{v.visitasHoje}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-semibold text-emerald-400">{v.vendasHoje}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-semibold">{formatCurrency(v.faturamentoMes)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(v.pctMeta, 100)}%`,
                                backgroundColor: v.pctMeta >= 100 ? "#22c55e" : v.pctMeta >= 70 ? "#f59e0b" : "#f43f5e",
                              }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold tabular-nums ${
                              v.pctMeta >= 100 ? "text-emerald-400" : v.pctMeta >= 70 ? "text-amber-400" : "text-red-400"
                            }`}
                          >
                            {v.pctMeta}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-xs text-muted-foreground animate-fade-in">
          <span>{vendedoresData.length} vendedores ativos</span>
          <span className="flex items-center gap-1 text-primary">
            <TrendingUp className="h-3 w-3" /> Meta mensal: {formatCurrency(META_MENSAL)}
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
