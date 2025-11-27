import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, Target, AlertCircle, CheckCircle } from "lucide-react";

interface PedidoItem {
  produto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  justificativaProduto?: string;
}

interface SugestaoCliente {
  nomeCliente: string;
  situacao: "ATIVO" | "EM RISCO" | "CRÍTICO";
  diasSemComprar: number;
  analiseComportamental?: string;
  pedidoSugerido: PedidoItem[];
  valorTotal: number;
  justificativa?: string;
  estrategiaComercial?: string;
  potencialRecuperacao?: string;
  proximasAcoes?: string;
}

interface AnaliseGeralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sugestoes: SugestaoCliente[] | null;
  isLoading: boolean;
}

const getSituacaoBadge = (situacao: string) => {
  switch (situacao) {
    case "ATIVO":
      return <Badge className="bg-green-500 text-white">✅ Ativo</Badge>;
    case "EM RISCO":
      return <Badge className="bg-yellow-500 text-white">⚠️ Em Risco</Badge>;
    case "CRÍTICO":
      return <Badge className="bg-red-500 text-white">🚨 Crítico</Badge>;
    default:
      return <Badge>{situacao}</Badge>;
  }
};

export function AnaliseGeralDialog({
  open,
  onOpenChange,
  sugestoes,
  isLoading,
}: AnaliseGeralDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">📊 Análise Estratégica de Vendas</DialogTitle>
          <DialogDescription className="text-base">
            Inteligência comercial completa com estratégias personalizadas por cliente
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[75vh] w-full px-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <span className="text-xl text-muted-foreground font-semibold">
                Gerando análise estratégica com IA...
              </span>
              <span className="text-sm text-muted-foreground">
                Analisando padrões de comportamento e criando estratégias personalizadas
              </span>
            </div>
          ) : sugestoes && sugestoes.length > 0 ? (
            <div className="space-y-8 p-4">
              {sugestoes.map((sugestao, idx) => (
                <Card key={idx} className="p-6 border-2 shadow-lg">
                  {/* Cabeçalho do Cliente */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b-2">
                    <div className="flex items-center gap-4">
                      <h3 className="text-2xl font-bold text-foreground">{sugestao.nomeCliente}</h3>
                      {getSituacaoBadge(sugestao.situacao)}
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground block">Última compra</span>
                      <span className="text-lg font-bold text-red-600">
                        {sugestao.diasSemComprar} dias atrás
                      </span>
                    </div>
                  </div>

                  {/* Análise Comportamental */}
                  {sugestao.analiseComportamental && (
                    <div className="mb-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                            📈 Análise Comportamental
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed whitespace-pre-line">
                            {sugestao.analiseComportamental}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pedido Sugerido */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                      🛒 Pedido Estratégico Sugerido
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-bold">Produto</TableHead>
                            <TableHead className="text-right font-bold">Qtd.</TableHead>
                            <TableHead className="text-right font-bold">Preço/kg</TableHead>
                            <TableHead className="text-right font-bold">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sugestao.pedidoSugerido.map((item, itemIdx) => (
                            <>
                              <TableRow key={itemIdx} className="hover:bg-muted/30">
                                <TableCell className="font-medium">{item.produto}</TableCell>
                                <TableCell className="text-right font-semibold">{item.quantidade}</TableCell>
                                <TableCell className="text-right">
                                  R$ {item.precoUnitario.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right font-bold text-primary">
                                  R$ {item.subtotal.toFixed(2)}
                                </TableCell>
                              </TableRow>
                              {item.justificativaProduto && (
                                <TableRow key={`just-${itemIdx}`}>
                                  <TableCell colSpan={4} className="bg-muted/20 text-xs italic py-2 pl-8">
                                    💡 {item.justificativaProduto}
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          ))}
                          <TableRow className="bg-primary/10 border-t-2">
                            <TableCell colSpan={3} className="font-bold text-right text-lg">
                              Valor Total do Pedido:
                            </TableCell>
                            <TableCell className="text-right font-bold text-2xl text-primary">
                              R$ {sugestao.valorTotal.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Estratégia Comercial */}
                  {sugestao.estrategiaComercial && (
                    <div className="mb-6 bg-purple-50 dark:bg-purple-950/20 rounded-lg p-5 border-l-4 border-purple-500">
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2">
                            🎯 Estratégia Comercial
                          </h4>
                          <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed whitespace-pre-line">
                            {sugestao.estrategiaComercial}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Potencial de Recuperação */}
                  {sugestao.potencialRecuperacao && (
                    <div className="mb-6 bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border-l-4 border-green-500">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-green-900 dark:text-green-100 mb-2">
                            💰 Potencial de Recuperação
                          </h4>
                          <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                            {sugestao.potencialRecuperacao}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Próximas Ações */}
                  {sugestao.proximasAcoes && (
                    <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-5 border-l-4 border-orange-500">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-2">
                            ✅ Próximas Ações Imediatas
                          </h4>
                          <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed whitespace-pre-line">
                            {sugestao.proximasAcoes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Justificativa antiga (fallback) */}
                  {sugestao.justificativa && !sugestao.estrategiaComercial && (
                    <div className="bg-muted/30 rounded-md p-4 border-l-4 border-primary">
                      <p className="text-sm font-semibold text-muted-foreground mb-1">
                        💡 Estratégia:
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {sugestao.justificativa}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
              <AlertCircle className="w-16 h-16" />
              <span className="text-lg">Nenhuma sugestão disponível.</span>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
