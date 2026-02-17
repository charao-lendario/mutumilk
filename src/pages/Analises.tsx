import React, { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Search,
  Users,
  User,
  Zap,
  Calendar,
  ArrowUpRight,
  Brain,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAnalisesByVendedor,
  type MockAnalise,
} from "@/data/mock";

type TipoFilter = "todos" | "geral" | "individual";

const formatDate = (d: string) => {
  const date = new Date(d);
  return (
    date.toLocaleDateString("pt-BR") +
    " " +
    date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
};

export default function Analises() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>("todos");

  const analises = useMemo(() => {
    if (!user) return [];
    return getAnalisesByVendedor(user.id);
  }, [user]);

  const filtered = analises.filter((a) => {
    const matchSearch =
      a.resumo.toLowerCase().includes(search.toLowerCase());
    const matchTipo =
      tipoFilter === "todos" || a.tipo_analise === tipoFilter;
    return matchSearch && matchTipo;
  });

  const counts = {
    total: analises.length,
    geral: analises.filter((a) => a.tipo_analise === "geral").length,
    individual: analises.filter((a) => a.tipo_analise === "individual").length,
  };

  const stats = [
    {
      label: "Total Analises",
      value: counts.total,
      icon: Sparkles,
      color: "text-sky-400",
      bgGlow: "bg-sky-500/20",
    },
    {
      label: "Analises Gerais",
      value: counts.geral,
      icon: Users,
      color: "text-violet-400",
      bgGlow: "bg-violet-500/20",
    },
    {
      label: "Individuais",
      value: counts.individual,
      icon: User,
      color: "text-emerald-400",
      bgGlow: "bg-emerald-500/20",
    },
    {
      label: "Insights Gerados",
      value: counts.total * 5,
      icon: Brain,
      color: "text-amber-400",
      bgGlow: "bg-amber-500/20",
    },
  ];

  const filters: { label: string; value: TipoFilter }[] = [
    { label: "Todas", value: "todos" },
    { label: "Geral", value: "geral" },
    { label: "Individual", value: "individual" },
  ];

  return (
    <DashboardLayout
      title="Analises IA"
      subtitle="Historico de analises inteligentes"
      actions={
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-400/10 border border-violet-400/20">
          <Zap className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-violet-400">IA</span>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`glass p-4 rounded-xl relative overflow-hidden animate-fade-in-up stagger-${i + 1}`}
            >
              <div
                className={`absolute -top-8 -right-8 w-24 h-24 ${s.bgGlow} rounded-full blur-2xl`}
              />
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
              placeholder="Buscar por conteudo da analise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card/60 border-white/[0.08] focus:border-primary/40"
            />
          </div>
          <div className="flex gap-1.5">
            {filters.map((f) => (
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
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      a.tipo_analise === "geral"
                        ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20"
                        : "bg-gradient-to-br from-sky-500 to-cyan-600 shadow-lg shadow-sky-500/20"
                    }`}
                  >
                    {a.tipo_analise === "geral" ? (
                      <Users className="h-5 w-5 text-white" />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          a.tipo_analise === "geral"
                            ? "bg-violet-400/10 text-violet-400 border-violet-400/20"
                            : "bg-sky-400/10 text-sky-400 border-sky-400/20"
                        }`}
                      >
                        {a.tipo_analise === "geral" ? "GERAL" : "INDIVIDUAL"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                      {a.resumo}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />{" "}
                        {formatDate(a.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhuma analise encontrada
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground animate-fade-in">
          <span>
            Exibindo {filtered.length} de {analises.length} analises
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> Powered by IA
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
