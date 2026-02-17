import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Play,
  Loader2,
  Target,
  DollarSign,
  ArrowRight,
  ChevronRight,
  Zap,
  Route,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getRoteiroByVendedor,
  getDiasSemCompra,
  getClienteById,
  formatCurrency,
  type MockRoteiro,
} from "@/data/mock";
import { getVisitaComUpdate } from "@/stores/mockStore";

const prioridadeConfig: Record<string, { color: string; bgColor: string; borderColor: string; label: string; icon: React.ElementType }> = {
  CRITICO: { color: "text-red-400", bgColor: "bg-red-400/10", borderColor: "border-red-400/20", label: "Critico", icon: AlertOctagon },
  EM_RISCO: { color: "text-amber-400", bgColor: "bg-amber-400/10", borderColor: "border-amber-400/20", label: "Em Risco", icon: AlertTriangle },
  ATIVO: { color: "text-emerald-400", bgColor: "bg-emerald-400/10", borderColor: "border-emerald-400/20", label: "Ativo", icon: CheckCircle2 },
};

const statusVisitaConfig: Record<string, { color: string; bgColor: string; borderColor: string; label: string }> = {
  pendente: { color: "text-muted-foreground", bgColor: "bg-white/[0.05]", borderColor: "border-white/[0.08]", label: "Pendente" },
  visita_concluida: { color: "text-emerald-400", bgColor: "bg-emerald-400/10", borderColor: "border-emerald-400/20", label: "Concluida" },
  contato_realizado: { color: "text-sky-400", bgColor: "bg-sky-400/10", borderColor: "border-sky-400/20", label: "Contato" },
};

export default function Rota() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gerando, setGerando] = useState(false);
  const [roteiroGerado, setRoteiroGerado] = useState(false);

  const roteiro = useMemo(() => {
    if (!user) return null;
    return getRoteiroByVendedor(user.id);
  }, [user]);

  const temRota = roteiro !== null || roteiroGerado;

  const visitasAtualizadas = useMemo(() => {
    if (!roteiro) return [];
    return roteiro.visitas.map((v) => getVisitaComUpdate(v));
  }, [roteiro]);

  const concluidas = visitasAtualizadas.filter((v) => v.status !== "pendente").length;
  const totalVisitas = visitasAtualizadas.length;
  const valorEstimado = visitasAtualizadas.reduce((s, v) => s + v.ai_sugestao.valorEstimado, 0);
  const percentConcluido = totalVisitas > 0 ? Math.round((concluidas / totalVisitas) * 100) : 0;

  const handleGerarRota = () => {
    setGerando(true);
    setTimeout(() => {
      setGerando(false);
      setRoteiroGerado(true);
    }, 2000);
  };

  if (!temRota) {
    return (
      <DashboardLayout title="Minha Rota" subtitle="Roteiro inteligente do dia">
        <div className="max-w-[800px] mx-auto">
          <Card className="glass animate-fade-in-up stagger-1">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-sky-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Rota Inteligente com IA</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Nossa IA analisa sua carteira de clientes, identifica prioridades e cria
                    um roteiro otimizado para maximizar suas vendas e recuperar clientes em risco.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                  {[
                    { icon: Target, label: "Priorizacao", desc: "Clientes criticos primeiro" },
                    { icon: Route, label: "Otimizacao", desc: "Menor rota possivel" },
                    { icon: Zap, label: "Sugestoes", desc: "Abordagem personalizada" },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <item.icon className="h-5 w-5 text-sky-400 mb-2 mx-auto" />
                      <p className="text-xs font-semibold">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleGerarRota}
                  disabled={gerando}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/20 px-8"
                  size="lg"
                >
                  {gerando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando rota...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar Rota com IA
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Minha Rota" subtitle="Roteiro inteligente do dia">
      <div className="space-y-6 max-w-[1000px] mx-auto">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Clientes", value: totalVisitas, icon: MapPin, color: "text-sky-400", bgGlow: "bg-sky-500/20" },
            { label: "Valor Estimado", value: formatCurrency(valorEstimado), icon: DollarSign, color: "text-emerald-400", bgGlow: "bg-emerald-500/20" },
            { label: "Concluidos", value: `${concluidas}/${totalVisitas}`, icon: CheckCircle2, color: "text-violet-400", bgGlow: "bg-violet-500/20" },
            { label: "Progresso", value: `${percentConcluido}%`, icon: Target, color: "text-amber-400", bgGlow: "bg-amber-500/20" },
          ].map((s, i) => (
            <div key={s.label} className={`glass p-4 rounded-xl relative overflow-hidden animate-fade-in-up stagger-${i + 1}`}>
              <div className={`absolute -top-8 -right-8 w-24 h-24 ${s.bgGlow} rounded-full blur-2xl`} />
              <s.icon className={`h-4 w-4 ${s.color} mb-2`} />
              <p className="text-2xl font-bold relative">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Start Button */}
        {roteiro && concluidas < totalVisitas && (
          <div className="animate-fade-in-up stagger-5">
            <Button
              onClick={() => navigate(`/rota/${roteiro.id}/executar`)}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-emerald-500/20 h-12 text-base"
            >
              <Play className="h-5 w-5 mr-2" />
              Iniciar Execucao
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Visit Cards */}
        <div className="space-y-3">
          {visitasAtualizadas.map((visita, i) => {
            const prio = prioridadeConfig[visita.ai_sugestao.prioridade];
            const statusVis = statusVisitaConfig[visita.status];
            const cliente = getClienteById(visita.cliente_id);
            const diasSemCompra = cliente ? getDiasSemCompra(cliente) : 0;

            return (
              <Card
                key={visita.id}
                className={`glass hover:border-white/20 transition-all duration-300 animate-fade-in-up ${
                  visita.status !== "pendente" ? "opacity-70" : ""
                }`}
                style={{ animationDelay: `${0.3 + i * 0.05}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Order Number */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        visita.status !== "pendente"
                          ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                          : "bg-gradient-to-br from-sky-500/20 to-blue-600/20 text-sky-400"
                      }`}>
                        {visita.status !== "pendente" ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          visita.ordem
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm">
                            {visita.cliente_nome}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-md bg-white/[0.05] text-muted-foreground capitalize">
                              {visita.cliente_tipo}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {diasSemCompra} dias sem compra
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${prio.bgColor} ${prio.color} ${prio.borderColor}`}>
                            {prio.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusVis.bgColor} ${statusVis.color} ${statusVis.borderColor}`}>
                            {statusVis.label}
                          </span>
                        </div>
                      </div>

                      {/* AI Recommendation */}
                      <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">
                        {visita.ai_sugestao.motivoVisita}
                      </p>

                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/[0.04]">
                        <span className="text-xs font-semibold text-sky-400">
                          {formatCurrency(visita.ai_sugestao.valorEstimado)}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {visita.cliente_endereco}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
