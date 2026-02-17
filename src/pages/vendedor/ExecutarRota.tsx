import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MapPin,
  Phone,
  CheckCircle2,
  MessageSquare,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  Minus,
  Trophy,
  ChevronRight,
  Package,
  DollarSign,
  FileText,
  Navigation,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getRoteiroById,
  mockProdutos,
  formatCurrency,
  type MockProduto,
} from "@/data/mock";
import { useMockStore, getVisitaComUpdate } from "@/stores/mockStore";

const justificativaChips = [
  "Cliente ausente",
  "Sem necessidade no momento",
  "Preferiu concorrente",
  "Aguardando pagamento anterior",
  "Outro",
];

interface ProdutoQuantidade {
  produto: MockProduto;
  quantidade: number;
}

export default function ExecutarRota() {
  const { rotaId } = useParams<{ rotaId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateVisita, addPedido } = useMockStore();

  const roteiro = useMemo(() => {
    if (!rotaId) return null;
    return getRoteiroById(rotaId);
  }, [rotaId]);

  const visitasAtualizadas = useMemo(() => {
    if (!roteiro) return [];
    return roteiro.visitas.map((v) => getVisitaComUpdate(v));
  }, [roteiro]);

  const [currentIndex, setCurrentIndex] = useState(() => {
    const firstPendente = visitasAtualizadas.findIndex((v) => v.status === "pendente");
    return firstPendente >= 0 ? firstPendente : 0;
  });

  const [showVendaDialog, setShowVendaDialog] = useState(false);
  const [showProdutosDialog, setShowProdutosDialog] = useState(false);
  const [showJustificativaDialog, setShowJustificativaDialog] = useState(false);
  const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoQuantidade[]>([]);
  const [justificativaTexto, setJustificativaTexto] = useState("");
  const [justificativaSelecionada, setJustificativaSelecionada] = useState("");
  const [concluido, setConcluido] = useState(false);
  const [tipoAcao, setTipoAcao] = useState<"visita" | "contato">("visita");

  if (!roteiro || visitasAtualizadas.length === 0) {
    return (
      <DashboardLayout title="Executar Rota" subtitle="Acompanhe suas visitas">
        <div className="max-w-[600px] mx-auto text-center py-16">
          <p className="text-muted-foreground">Roteiro nao encontrado</p>
          <Button
            variant="outline"
            onClick={() => navigate("/rota")}
            className="mt-4 border-white/10"
          >
            Voltar para Rota
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const totalVisitas = visitasAtualizadas.length;
  const visitasConcluidas = visitasAtualizadas.filter((v) => v.status !== "pendente").length;
  const currentVisita = visitasAtualizadas[currentIndex];
  const isCurrentConcluida = currentVisita?.status !== "pendente";

  const handleAcao = (tipo: "visita" | "contato") => {
    setTipoAcao(tipo);
    setShowVendaDialog(true);
  };

  const handleVendaSim = () => {
    setShowVendaDialog(false);
    setProdutosSelecionados([]);
    setShowProdutosDialog(true);
  };

  const handleVendaNao = () => {
    setShowVendaDialog(false);
    setJustificativaTexto("");
    setJustificativaSelecionada("");
    setShowJustificativaDialog(true);
  };

  const handleQuantidadeChange = (produtoId: string, delta: number) => {
    setProdutosSelecionados((prev) => {
      const existing = prev.find((p) => p.produto.id === produtoId);
      if (existing) {
        const newQty = Math.max(0, existing.quantidade + delta);
        if (newQty === 0) {
          return prev.filter((p) => p.produto.id !== produtoId);
        }
        return prev.map((p) =>
          p.produto.id === produtoId ? { ...p, quantidade: newQty } : p
        );
      }
      if (delta > 0) {
        const produto = mockProdutos.find((p) => p.id === produtoId);
        if (produto) {
          return [...prev, { produto, quantidade: 1 }];
        }
      }
      return prev;
    });
  };

  const getProdutoQty = (produtoId: string): number => {
    const found = produtosSelecionados.find((p) => p.produto.id === produtoId);
    return found ? found.quantidade : 0;
  };

  const totalPedido = produtosSelecionados.reduce(
    (sum, p) => sum + p.produto.preco_atual * p.quantidade,
    0
  );

  const handleConfirmarPedido = () => {
    if (!user || !currentVisita) return;

    const pedidoId = `ped-new-${Date.now()}`;

    addPedido({
      id: pedidoId,
      clienteId: currentVisita.cliente_id,
      clienteNome: currentVisita.cliente_nome,
      vendedorId: user.id,
      valorTotal: totalPedido,
      itens: produtosSelecionados.map((p) => ({
        produtoId: p.produto.id,
        produtoNome: p.produto.nome,
        quantidade: p.quantidade,
        precoUnitario: p.produto.preco_atual,
        subtotal: p.produto.preco_atual * p.quantidade,
      })),
      dataPedido: new Date().toISOString().split("T")[0],
    });

    updateVisita({
      visitaId: currentVisita.id,
      status: tipoAcao === "visita" ? "visita_concluida" : "contato_realizado",
      pedidoId,
      concluidaAt: new Date().toISOString(),
    });

    setShowProdutosDialog(false);
    avancarVisita();
  };

  const handleConfirmarJustificativa = () => {
    if (!currentVisita) return;

    const textoFinal = justificativaSelecionada === "Outro"
      ? justificativaTexto
      : justificativaSelecionada || justificativaTexto;

    updateVisita({
      visitaId: currentVisita.id,
      status: tipoAcao === "visita" ? "visita_concluida" : "contato_realizado",
      justificativa: textoFinal,
      concluidaAt: new Date().toISOString(),
    });

    setShowJustificativaDialog(false);
    avancarVisita();
  };

  const avancarVisita = () => {
    const updatedVisitas = visitasAtualizadas.map((v, i) =>
      i === currentIndex ? { ...v, status: "visita_concluida" as const } : v
    );
    const newConcluidas = updatedVisitas.filter((v) => v.status !== "pendente").length;

    if (newConcluidas >= totalVisitas) {
      setConcluido(true);
    } else {
      const nextPendente = visitasAtualizadas.findIndex(
        (v, i) => i > currentIndex && v.status === "pendente"
      );
      if (nextPendente >= 0) {
        setCurrentIndex(nextPendente);
      } else {
        const firstPendente = visitasAtualizadas.findIndex(
          (v, i) => i !== currentIndex && v.status === "pendente"
        );
        if (firstPendente >= 0) {
          setCurrentIndex(firstPendente);
        } else {
          setConcluido(true);
        }
      }
    }
  };

  // Summary stats for completion
  const pedidosNovos = useMockStore.getState().pedidosNovos.filter(
    (p) => roteiro.visitas.some((v) => v.cliente_id === p.clienteId)
  );
  const totalVendido = pedidosNovos.reduce((s, p) => s + p.valorTotal, 0);
  const visitasComVenda = pedidosNovos.length;
  const visitasSemVenda = visitasConcluidas - visitasComVenda;

  if (concluido) {
    return (
      <DashboardLayout title="Executar Rota" subtitle="Acompanhe suas visitas">
        <div className="max-w-[600px] mx-auto animate-fade-in-up">
          <Card className="glass overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-500" />
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center mb-6">
                <Trophy className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Rota Concluida!</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Parabens! Voce finalizou todas as visitas do roteiro de hoje.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: "Visitas", value: totalVisitas, color: "text-sky-400" },
                  { label: "Com Venda", value: visitasComVenda, color: "text-emerald-400" },
                  { label: "Sem Venda", value: visitasSemVenda, color: "text-amber-400" },
                  { label: "Total Vendido", value: formatCurrency(totalVendido), color: "text-emerald-400" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  onClick={() => navigate("/rota")}
                  variant="outline"
                  className="flex-1 border-white/10 hover:bg-white/[0.06]"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ver Resumo da Rota
                </Button>
                <Button
                  onClick={() => navigate("/rota", { state: { gerarAmanha: true } })}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/20"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Planejar Rota de Amanha
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const prioridadeColors: Record<string, { color: string; bg: string; border: string }> = {
    CRITICO: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
    EM_RISCO: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
    ATIVO: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  };
  const prio = prioridadeColors[currentVisita.ai_sugestao.prioridade];

  return (
    <DashboardLayout title="Executar Rota" subtitle="Acompanhe suas visitas">
      <div className="space-y-6 max-w-[800px] mx-auto">
        {/* Progress Bar */}
        <div className="glass p-4 rounded-xl animate-fade-in-up stagger-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Progresso do Roteiro</span>
            <span className="text-sm text-muted-foreground">
              {visitasConcluidas}/{totalVisitas} concluidos
            </span>
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-3">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${totalVisitas > 0 ? (visitasConcluidas / totalVisitas) * 100 : 0}%`,
              }}
            />
          </div>
          {/* Mini indicators */}
          <div className="flex gap-1.5 mt-3">
            {visitasAtualizadas.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setCurrentIndex(i)}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  i === currentIndex
                    ? "bg-sky-400"
                    : v.status !== "pendente"
                      ? "bg-emerald-400/60"
                      : "bg-white/[0.08]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Current Visit Card */}
        <Card className="glass overflow-hidden animate-fade-in-up stagger-2">
          <div className={`h-1.5 ${
            currentVisita.ai_sugestao.prioridade === "CRITICO"
              ? "bg-gradient-to-r from-red-500 to-red-400"
              : currentVisita.ai_sugestao.prioridade === "EM_RISCO"
                ? "bg-gradient-to-r from-amber-500 to-amber-400"
                : "bg-gradient-to-r from-emerald-500 to-emerald-400"
          }`} />
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center shrink-0">
                  <span className="text-base sm:text-lg font-bold text-sky-400">{currentVisita.ordem}</span>
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg truncate">{currentVisita.cliente_nome}</CardTitle>
                  <CardDescription className="capitalize">{currentVisita.cliente_tipo}</CardDescription>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${prio.bg} ${prio.color} ${prio.border}`}>
                {currentVisita.ai_sugestao.prioridade.replace("_", " ")}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Client Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">{currentVisita.cliente_endereco}</p>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">Contato do cliente</p>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/5 to-blue-600/5 border border-sky-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-semibold text-sky-400">Recomendacao IA</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                {currentVisita.ai_sugestao.motivoVisita}
              </p>
              <p className="text-sm leading-relaxed">
                {currentVisita.ai_sugestao.abordagem}
              </p>
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <span className="text-xs text-muted-foreground">Valor estimado: </span>
                <span className="text-sm font-bold text-emerald-400">
                  {formatCurrency(currentVisita.ai_sugestao.valorEstimado)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {!isCurrentConcluida && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={() => handleAcao("visita")}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-emerald-500/20 h-12"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Visita Concluida
                </Button>
                <Button
                  onClick={() => handleAcao("contato")}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/20 h-12"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contato Realizado
                </Button>
              </div>
            )}

            {isCurrentConcluida && (
              <div className="p-4 rounded-xl bg-emerald-400/5 border border-emerald-400/20 text-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-400">
                  Visita ja concluida
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between animate-fade-in-up stagger-3">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="border-white/10 hover:bg-white/[0.06]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} de {totalVisitas}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(Math.min(totalVisitas - 1, currentIndex + 1))}
            disabled={currentIndex === totalVisitas - 1}
            className="border-white/10 hover:bg-white/[0.06]"
          >
            Proximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Venda Dialog */}
      <Dialog open={showVendaDialog} onOpenChange={setShowVendaDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Realizou venda?</DialogTitle>
            <DialogDescription>
              Informe se houve pedido nesta visita
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button
              onClick={handleVendaSim}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white h-14"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Sim
            </Button>
            <Button
              onClick={handleVendaNao}
              variant="outline"
              className="border-white/10 hover:bg-white/[0.06] h-14"
            >
              <X className="h-5 w-5 mr-2" />
              Nao
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Produtos Dialog */}
      <Dialog open={showProdutosDialog} onOpenChange={setShowProdutosDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Produtos</DialogTitle>
            <DialogDescription>
              Adicione os produtos do pedido
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {mockProdutos.map((produto) => {
                const qty = getProdutoQty(produto.id);
                return (
                  <div
                    key={produto.id}
                    className={`p-3 rounded-xl border transition-all ${
                      qty > 0
                        ? "bg-sky-400/5 border-sky-400/20"
                        : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{produto.nome}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(produto.preco_atual)}/{produto.unidade}
                          </span>
                          {produto.em_promocao && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                              PROMO
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {qty > 0 && (
                          <span className="text-xs font-semibold text-sky-400 min-w-[60px] text-right">
                            {formatCurrency(produto.preco_atual * qty)}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuantidadeChange(produto.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleQuantidadeChange(produto.id, 1)}
                            className="w-7 h-7 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 flex items-center justify-center transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div className="border-t border-white/[0.06] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {produtosSelecionados.length} {produtosSelecionados.length === 1 ? "produto" : "produtos"}
              </span>
              <span className="text-lg font-bold text-emerald-400">
                {formatCurrency(totalPedido)}
              </span>
            </div>
            <Button
              onClick={handleConfirmarPedido}
              disabled={produtosSelecionados.length === 0}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-emerald-500/20"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Confirmar Pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Justificativa Dialog */}
      <Dialog open={showJustificativaDialog} onOpenChange={setShowJustificativaDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Motivo da nao venda</DialogTitle>
            <DialogDescription>
              Selecione ou descreva o motivo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {justificativaChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setJustificativaSelecionada(chip)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    justificativaSelecionada === chip
                      ? "bg-sky-400/20 text-sky-400 border border-sky-400/30"
                      : "bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] border border-white/[0.06]"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            {(justificativaSelecionada === "Outro" || !justificativaSelecionada) && (
              <Textarea
                placeholder="Descreva o motivo..."
                value={justificativaTexto}
                onChange={(e) => setJustificativaTexto(e.target.value)}
                className="bg-card/60 border-white/[0.08] focus:border-primary/40 min-h-[80px]"
              />
            )}
            <Button
              onClick={handleConfirmarJustificativa}
              disabled={!justificativaSelecionada && !justificativaTexto}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white"
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
