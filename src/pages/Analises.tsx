import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sparkles, Search, Users, User, Zap, Calendar,
  ArrowUpRight, Brain, TrendingUp, Clock,
} from "lucide-react";

const mockAnalises = [
  { id: 1, tipo: "geral", vendedor: "Carlos Silva", data: "2026-02-13T14:30:00", clientes: 6, resumo: "Identificados 3 clientes criticos com potencial de recuperacao de R$ 12.400. Sugeridos pedidos especiais com mix estrategico de queijos e iogurtes." },
  { id: 2, tipo: "individual", vendedor: "Carlos Silva", data: "2026-02-13T11:15:00", clientes: 1, clienteNome: "Supermercado Bom Preco", resumo: "Cliente ativo com tendencia de crescimento. Oportunidade de cross-sell em iogurtes gregos e queijos especiais. Meta sugerida: R$ 5.200." },
  { id: 3, tipo: "geral", vendedor: "Ana Paula", data: "2026-02-12T16:45:00", clientes: 6, resumo: "Carteira saudavel com 80% ativos. 2 clientes em risco necessitam contato urgente. Potencial de recuperacao: R$ 8.600." },
  { id: 4, tipo: "individual", vendedor: "Roberto Oliveira", data: "2026-02-12T10:20:00", clientes: 1, clienteNome: "Rest. Sabor & Cia", resumo: "Restaurante em risco - 45 dias sem compra. Historico de pedidos altos. Sugerido contato imediato com oferta especial de requeijao e creme de leite." },
  { id: 5, tipo: "geral", vendedor: "Mariana Costa", data: "2026-02-11T15:00:00", clientes: 6, resumo: "Performance acima da media. Destaque para Confeitaria Doce Mel com aumento de 25% no ticket. Sugerido programa de fidelidade." },
  { id: 6, tipo: "individual", vendedor: "Ana Paula", data: "2026-02-11T09:30:00", clientes: 1, clienteNome: "Padaria Pao de Ouro", resumo: "Padaria com potencial de aumento de volume. Atual: 6 itens/pedido. Meta: 10 itens. Oportunidade em manteigas e leite condensado." },
  { id: 7, tipo: "geral", vendedor: "Pedro Almeida", data: "2026-02-10T14:00:00", clientes: 6, resumo: "3 clientes inativos identificados. Estrategia de reativacao com descontos progressivos. Potencial total: R$ 6.200." },
  { id: 8, tipo: "individual", vendedor: "Carlos Silva", data: "2026-02-10T11:45:00", clientes: 1, clienteNome: "Mercado Central", resumo: "Cliente critico - 60+ dias sem compra. Ultimo pedido: R$ 2.890. Sugerido visita presencial com catalogo atualizado e condicoes especiais." },
  { id: 9, tipo: "geral", vendedor: "Roberto Oliveira", data: "2026-02-09T16:30:00", clientes: 6, resumo: "Identificado padrao de queda em restaurantes. Sugerida revisao de mix para incluir mais cremosos e iogurtes em embalagens profissionais." },
  { id: 10, tipo: "individual", vendedor: "Mariana Costa", data: "2026-02-09T10:00:00", clientes: 1, clienteNome: "Confeitaria Arte Doce", resumo: "Confeitaria com alto potencial. Especialidade em sobremesas requer mais queijo mascarpone e creme de leite fresco. Sugerido pedido premium." },
];

type TipoFilter = "todos" | "geral" | "individual";

const formatDate = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

export default function Analises() {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>("todos");

  const filtered = mockAnalises.filter(a => {
    const matchSearch = a.vendedor.toLowerCase().includes(search.toLowerCase()) ||
      a.resumo.toLowerCase().includes(search.toLowerCase()) ||
      (a.clienteNome || "").toLowerCase().includes(search.toLowerCase());
    const matchTipo = tipoFilter === "todos" || a.tipo === tipoFilter;
    return matchSearch && matchTipo;
  });

  const counts = {
    total: mockAnalises.length,
    geral: mockAnalises.filter(a => a.tipo === "geral").length,
    individual: mockAnalises.filter(a => a.tipo === "individual").length,
  };

  const stats = [
    { label: "Total Analises", value: counts.total, icon: Sparkles, color: "text-sky-400", bgGlow: "bg-sky-500/20" },
    { label: "Analises Gerais", value: counts.geral, icon: Users, color: "text-violet-400", bgGlow: "bg-violet-500/20" },
    { label: "Individuais", value: counts.individual, icon: User, color: "text-emerald-400", bgGlow: "bg-emerald-500/20" },
    { label: "Insights Gerados", value: "47", icon: Brain, color: "text-amber-400", bgGlow: "bg-amber-500/20" },
  ];

  const filters: { label: string; value: TipoFilter }[] = [
    { label: "Todas", value: "todos" },
    { label: "Geral", value: "geral" },
    { label: "Individual", value: "individual" },
  ];

  return (
    <DashboardLayout
      title="Analises IA"
      subtitle="Historico de analises geradas por inteligencia artificial"
      actions={
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-400/10 border border-violet-400/20">
          <Zap className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-violet-400">GPT-4o-mini</span>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <div key={s.label} className={`glass p-4 rounded-xl relative overflow-hidden animate-fade-in-up stagger-${i + 1}`}>
              <div className={`absolute -top-8 -right-8 w-24 h-24 ${s.bgGlow} rounded-full blur-2xl`} />
              <s.icon className={`h-4 w-4 ${s.color} mb-2`} />
              <p className="text-2xl font-bold relative">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up stagger-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por vendedor, cliente ou conteudo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card/60 border-white/[0.08] focus:border-primary/40"
            />
          </div>
          <div className="flex gap-1.5">
            {filters.map(f => (
              <button
                key={f.value}
                onClick={() => setTipoFilter(f.value)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  tipoFilter === f.value
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] border border-white/[0.06]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Cards */}
        <div className="space-y-3">
          {filtered.map((a, i) => (
            <Card
              key={a.id}
              className="glass hover:border-white/20 transition-all duration-300 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${0.3 + i * 0.04}s` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    a.tipo === "geral"
                      ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20"
                      : "bg-gradient-to-br from-sky-500 to-cyan-600 shadow-lg shadow-sky-500/20"
                  }`}>
                    {a.tipo === "geral"
                      ? <Users className="h-5 w-5 text-white" />
                      : <User className="h-5 w-5 text-white" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        a.tipo === "geral"
                          ? "bg-violet-400/10 text-violet-400 border-violet-400/20"
                          : "bg-sky-400/10 text-sky-400 border-sky-400/20"
                      }`}>
                        {a.tipo === "geral" ? "GERAL" : "INDIVIDUAL"}
                      </span>
                      <span className="text-xs font-medium">{a.vendedor}</span>
                      {a.clienteNome && (
                        <span className="text-xs text-muted-foreground">- {a.clienteNome}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">{a.resumo}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3" /> {formatDate(a.data)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Users className="h-3 w-3" /> {a.clientes} {a.clientes === 1 ? "cliente" : "clientes"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground animate-fade-in">
          <span>Exibindo {filtered.length} de {mockAnalises.length} analises</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> +23% analises este mes
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
