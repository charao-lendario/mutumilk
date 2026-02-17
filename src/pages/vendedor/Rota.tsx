import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Phone,
  Building2,
  FileText,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Package,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getRoteiroByVendedor,
  getDiasSemCompra,
  getStatusCliente,
  getClienteById,
  getPedidosByCliente,
  getProdutosEmPromocao,
  formatCurrency,
  type MockRoteiro,
  type MockVisita,
  type MockCliente,
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
  const location = useLocation();
  const [gerando, setGerando] = useState(false);
  const [roteiroGerado, setRoteiroGerado] = useState(false);
  const [planejandoAmanha, setPlanejandoAmanha] = useState(
    () => !!(location.state as Record<string, unknown>)?.gerarAmanha
  );

  const roteiro = useMemo(() => {
    if (!user) return null;
    return getRoteiroByVendedor(user.id);
  }, [user]);

  const rotaConcluida = useMemo(() => {
    if (!roteiro) return false;
    const visitas = roteiro.visitas.map((v) => getVisitaComUpdate(v));
    return visitas.length > 0 && visitas.every((v) => v.status !== "pendente");
  }, [roteiro]);

  const temRota = (roteiro !== null && !planejandoAmanha) || roteiroGerado;

  const visitasAtualizadas = useMemo(() => {
    if (!roteiro) return [];
    return roteiro.visitas.map((v) => getVisitaComUpdate(v));
  }, [roteiro]);

  const concluidas = visitasAtualizadas.filter((v) => v.status !== "pendente").length;
  const totalVisitas = visitasAtualizadas.length;
  const valorEstimado = visitasAtualizadas.reduce((s, v) => s + v.ai_sugestao.valorEstimado, 0);
  const percentConcluido = totalVisitas > 0 ? Math.round((concluidas / totalVisitas) * 100) : 0;

  const [selectedVisita, setSelectedVisita] = useState<string | null>(null);

  const selectedData = useMemo(() => {
    if (!selectedVisita) return null;
    const visita = visitasAtualizadas.find((v) => v.id === selectedVisita);
    if (!visita) return null;
    const cliente = getClienteById(visita.cliente_id);
    if (!cliente) return null;
    const status = getStatusCliente(cliente);
    const dias = getDiasSemCompra(cliente);
    const pedidos = getPedidosByCliente(cliente.id).slice(0, 5);
    const promocoes = getProdutosEmPromocao().slice(0, 4);
    return { visita, cliente, status, dias, pedidos, promocoes };
  }, [selectedVisita, visitasAtualizadas]);

  const handleGerarRota = () => {
    setGerando(true);
    setTimeout(() => {
      setGerando(false);
      setRoteiroGerado(true);
    }, 2000);
  };

  const statusConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
    ativo: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", label: "Ativo" },
    risco: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", label: "Em Risco" },
    critico: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", label: "Critico" },
  };

  if (!temRota) {
    return (
      <DashboardLayout title="Minha Rota" subtitle={planejandoAmanha ? "Planeje o roteiro de amanha" : "Roteiro inteligente do dia"}>
        <div className="max-w-[800px] mx-auto">
          <Card className="glass animate-fade-in-up stagger-1">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-sky-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">
                    {planejandoAmanha ? "Gerar Rota de Amanha" : "Rota Inteligente com IA"}
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    {planejandoAmanha
                      ? "A IA vai analisar os resultados de hoje, as justificativas registradas e o historico da sua carteira para gerar o melhor roteiro para amanha."
                      : "Nossa IA analisa sua carteira de clientes, identifica prioridades e cria um roteiro otimizado para maximizar suas vendas e recuperar clientes em risco."
                    }
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
                      {planejandoAmanha ? "Gerando rota de amanha..." : "Gerando rota..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {planejandoAmanha ? "Gerar Rota de Amanha com IA" : "Gerar Rota com IA"}
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

        {/* Start Button or Completed State */}
        {roteiro && concluidas < totalVisitas && (
          <div className="animate-fade-in-up stagger-5">
            <Button
              onClick={() => navigate(`/rota/${roteiro.id}/executar`)}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-emerald-500/20 h-12 text-base"
            >
              <Play className="h-5 w-5 mr-2" />
              {concluidas > 0 ? "Continuar Execucao" : "Iniciar Execucao"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {roteiro && concluidas >= totalVisitas && totalVisitas > 0 && (
          <Card className="glass overflow-hidden animate-fade-in-up stagger-5">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-green-500" />
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold mb-1">Rota de Hoje Finalizada!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Todas as {totalVisitas} visitas foram concluidas. Prepare sua rota de amanha.
              </p>
              <Button
                onClick={() => setPlanejandoAmanha(true)}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/20"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Planejar Rota de Amanha
              </Button>
            </CardContent>
          </Card>
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
                className={`glass hover:border-white/20 transition-all duration-300 animate-fade-in-up cursor-pointer active:scale-[0.99] ${
                  visita.status !== "pendente" ? "opacity-70" : ""
                }`}
                style={{ animationDelay: `${0.3 + i * 0.05}s` }}
                onClick={() => setSelectedVisita(visita.id)}
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
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate">
                            {visita.cliente_nome}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-md bg-white/[0.05] text-muted-foreground capitalize">
                              {visita.cliente_tipo}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {diasSemCompra}d sem compra
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

      {/* Client Detail Dialog */}
      <Dialog open={!!selectedVisita} onOpenChange={(open) => !open && setSelectedVisita(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0 mx-4 sm:mx-auto overflow-hidden">
          {selectedData && (() => {
            const { visita, cliente, status, dias, pedidos, promocoes } = selectedData;
            const prio = prioridadeConfig[visita.ai_sugestao.prioridade];
            const sc = statusConfig[status];
            return (
              <>
                {/* Header gradient bar */}
                <div className={`h-1.5 ${
                  status === "critico" ? "bg-gradient-to-r from-red-500 to-red-400"
                  : status === "risco" ? "bg-gradient-to-r from-amber-500 to-amber-400"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                }`} />

                <ScrollArea className="max-h-[calc(90vh-2rem)]">
                  <div className="p-5 space-y-5">
                    {/* Client Header */}
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${sc.bg} ${sc.border} border`}>
                        <Building2 className={`h-5 w-5 ${sc.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold truncate">{cliente.nome}</h2>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-md bg-white/[0.05] text-muted-foreground capitalize">
                            {cliente.tipo}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${sc.bg} ${sc.color} ${sc.border}`}>
                            {sc.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Dias sem compra</span>
                        </div>
                        <p className={`text-lg font-bold ${dias > 60 ? "text-red-400" : dias > 30 ? "text-amber-400" : "text-emerald-400"}`}>
                          {dias === 999 ? "Nunca" : `${dias} dias`}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Ticket medio</span>
                        </div>
                        <p className="text-lg font-bold text-sky-400">{formatCurrency(cliente.ticket_medio)}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Contato</span>
                        </div>
                        <p className="text-sm font-medium">{cliente.contato}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">CNPJ</span>
                        </div>
                        <p className="text-sm font-medium">{cliente.cnpj}</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-sm text-muted-foreground">{cliente.endereco}</p>
                    </div>

                    {/* AI Recommendation */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/5 to-blue-600/5 border border-sky-500/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-sky-400" />
                        <span className="text-sm font-semibold text-sky-400">Orientacao da IA</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Por que visitar</span>
                          <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                            {visita.ai_sugestao.motivoVisita}
                          </p>
                        </div>

                        <div className="border-t border-white/[0.06] pt-3">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Como abordar</span>
                          <p className="text-sm leading-relaxed mt-0.5">
                            {visita.ai_sugestao.abordagem}
                          </p>
                        </div>

                        <div className="border-t border-white/[0.06] pt-3">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Valor estimado</span>
                          <p className="text-xl font-bold text-emerald-400 mt-0.5">
                            {formatCurrency(visita.ai_sugestao.valorEstimado)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Products to Offer */}
                    {promocoes.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-semibold">Oferte em Promocao</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {promocoes.map((p) => (
                            <div key={p.id} className="p-2.5 rounded-lg bg-emerald-400/5 border border-emerald-400/10">
                              <p className="text-xs font-medium truncate">{p.nome}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs font-bold text-emerald-400">{formatCurrency(p.preco_atual)}</span>
                                {p.preco_anterior !== p.preco_atual && (
                                  <span className="text-[10px] text-muted-foreground line-through">{formatCurrency(p.preco_anterior)}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Orders */}
                    {pedidos.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <ShoppingCart className="h-4 w-4 text-sky-400" />
                          <span className="text-sm font-semibold">Ultimos Pedidos</span>
                        </div>
                        <div className="space-y-1.5">
                          {pedidos.map((ped) => (
                            <div key={ped.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(ped.data_pedido).toLocaleDateString("pt-BR")}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {ped.itens.length} {ped.itens.length === 1 ? "item" : "itens"}
                                </p>
                              </div>
                              <span className={`text-sm font-bold ${ped.status === "concluido" ? "text-emerald-400" : "text-muted-foreground"}`}>
                                {formatCurrency(ped.valor_total)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pedidos.length === 0 && (
                      <div className="p-4 rounded-xl bg-red-400/5 border border-red-400/10 text-center">
                        <AlertTriangle className="h-5 w-5 text-red-400 mx-auto mb-2" />
                        <p className="text-xs text-red-400 font-semibold">Nenhum pedido registrado</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Cliente nunca comprou ou sem historico</p>
                      </div>
                    )}

                    {/* Action Button */}
                    {roteiro && visita.status === "pendente" && (
                      <Button
                        onClick={() => {
                          setSelectedVisita(null);
                          navigate(`/rota/${roteiro.id}/executar`);
                        }}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-emerald-500/20 h-11"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Visita
                      </Button>
                    )}
                  </div>
                </ScrollArea>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
