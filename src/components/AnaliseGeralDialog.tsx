import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface PedidoItem {
  produto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

interface SugestaoCliente {
  nomeCliente: string;
  situacao: "ATIVO" | "EM RISCO" | "CRÍTICO";
  diasSemComprar: number;
  pedidoSugerido: PedidoItem[];
  valorTotal: number;
  justificativa: string;
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
      return <Badge className="bg-green-500">✅ Ativo</Badge>;
    case "EM RISCO":
      return <Badge className="bg-yellow-500">⚠️ Em Risco</Badge>;
    case "CRÍTICO":
      return <Badge className="bg-red-500">🚨 Crítico</Badge>;
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
      <DialogContent className="max-w-6xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">📊 Sugestões de Pedidos - Análise Geral</DialogTitle>
          <DialogDescription>
            Sugestões personalizadas de pedidos baseadas no histórico de cada cliente
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] w-full px-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <span className="text-lg text-muted-foreground">Gerando sugestões com IA...</span>
            </div>
          ) : sugestoes && sugestoes.length > 0 ? (
            <div className="space-y-8 p-6">
              {sugestoes.map((sugestao, idx) => (
                <div key={idx} className="border rounded-lg p-6 bg-card shadow-sm">
                  {/* Cabeçalho do Cliente */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-foreground">{sugestao.nomeCliente}</h3>
                      {getSituacaoBadge(sugestao.situacao)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {sugestao.diasSemComprar} dias sem comprar
                    </span>
                  </div>

                  {/* Tabela de Produtos Sugeridos */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                      Pedido Sugerido:
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                          <TableHead className="text-right">Preço Unit.</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sugestao.pedidoSugerido.map((item, itemIdx) => (
                          <TableRow key={itemIdx}>
                            <TableCell className="font-medium">{item.produto}</TableCell>
                            <TableCell className="text-right">{item.quantidade}</TableCell>
                            <TableCell className="text-right">
                              R$ {item.precoUnitario.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              R$ {item.subtotal.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50">
                          <TableCell colSpan={3} className="font-bold text-right">
                            Valor Total:
                          </TableCell>
                          <TableCell className="text-right font-bold text-lg text-primary">
                            R$ {sugestao.valorTotal.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Justificativa */}
                  <div className="bg-muted/30 rounded-md p-4 border-l-4 border-primary">
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      💡 Estratégia:
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {sugestao.justificativa}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhuma sugestão disponível.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
