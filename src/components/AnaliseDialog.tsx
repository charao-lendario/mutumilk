import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Target, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnaliseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descricao: string;
  analise: string | null;
  isLoading: boolean;
}

const parseAnalise = (text: string) => {
  if (!text) return null;

  const sections = {
    prioridades: [] as string[],
    alertas: [] as string[],
    oportunidades: [] as string[],
    resumo: "",
    perfil: "",
    recomendados: [] as string[],
    estrategia: "",
    script: "",
  };

  // Split por seções usando títulos em negrito
  const lines = text.split('\n');
  let currentSection = "";

  lines.forEach(line => {
    const trimmed = line.trim();
    
    if (trimmed.match(/^\*\*.*PRIORIDADES.*\*\*$/i) || trimmed.match(/^#+ PRIORIDADES/i)) {
      currentSection = "prioridades";
    } else if (trimmed.match(/^\*\*.*ALERTAS.*\*\*$/i) || trimmed.match(/^#+ ALERTAS/i)) {
      currentSection = "alertas";
    } else if (trimmed.match(/^\*\*.*OPORTUNIDADES.*\*\*$/i) || trimmed.match(/^#+ OPORTUNIDADES/i)) {
      currentSection = "oportunidades";
    } else if (trimmed.match(/^\*\*.*RESUMO.*\*\*$/i) || trimmed.match(/^#+ RESUMO/i)) {
      currentSection = "resumo";
    } else if (trimmed.match(/^\*\*.*PERFIL.*\*\*$/i) || trimmed.match(/^#+ PERFIL/i)) {
      currentSection = "perfil";
    } else if (trimmed.match(/^\*\*.*RECOMENDADOS.*\*\*$/i) || trimmed.match(/^#+ PRODUTOS RECOMENDADOS/i)) {
      currentSection = "recomendados";
    } else if (trimmed.match(/^\*\*.*ESTRATÉGIA.*\*\*$/i) || trimmed.match(/^#+ ESTRATÉGIA/i)) {
      currentSection = "estrategia";
    } else if (trimmed.match(/^\*\*.*SCRIPT.*\*\*$/i) || trimmed.match(/^#+ SCRIPT/i)) {
      currentSection = "script";
    } else if (trimmed && !trimmed.match(/^#+\s/) && !trimmed.match(/^\*\*.*\*\*$/)) {
      // Remove markdown de lista (- ou *)
      const cleanLine = trimmed.replace(/^[-*]\s*/, "").replace(/^\d+\.\s*/, "");
      
      if (currentSection === "prioridades") {
        sections.prioridades.push(cleanLine);
      } else if (currentSection === "alertas") {
        sections.alertas.push(cleanLine);
      } else if (currentSection === "oportunidades") {
        sections.oportunidades.push(cleanLine);
      } else if (currentSection === "resumo") {
        sections.resumo += cleanLine + " ";
      } else if (currentSection === "perfil") {
        sections.perfil += cleanLine + " ";
      } else if (currentSection === "recomendados") {
        sections.recomendados.push(cleanLine);
      } else if (currentSection === "estrategia") {
        sections.estrategia += cleanLine + " ";
      } else if (currentSection === "script") {
        sections.script += cleanLine + " ";
      }
    }
  });

  return sections;
};

export function AnaliseDialog({
  open,
  onOpenChange,
  titulo,
  descricao,
  analise,
  isLoading,
}: AnaliseDialogProps) {
  const parsed = parseAnalise(analise || "");
  const isAnaliseGeral = parsed && (parsed.prioridades.length > 0 || parsed.alertas.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] w-full px-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <span className="text-lg text-muted-foreground">Analisando dados com IA...</span>
            </div>
          ) : parsed ? (
            <div className="space-y-6 p-4">
              {/* Análise Geral */}
              {isAnaliseGeral && (
                <>
                  {/* Resumo Executivo */}
                  {parsed.resumo && (
                    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Lightbulb className="w-5 h-5 text-primary" />
                          Resumo Executivo
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground leading-relaxed">{parsed.resumo.trim()}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Prioridades do Dia */}
                  {parsed.prioridades.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" />
                          Prioridades do Dia
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {parsed.prioridades.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                              <Badge className="mt-1">{idx + 1}</Badge>
                              <p className="flex-1 text-sm">{item}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Alertas */}
                  {parsed.alertas.length > 0 && (
                    <Card className="border-warning/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-warning">
                          <AlertTriangle className="w-5 h-5" />
                          Alertas Importantes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {parsed.alertas.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                              <p className="flex-1 text-sm">{item}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Oportunidades */}
                  {parsed.oportunidades.length > 0 && (
                    <Card className="border-success/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-success">
                          <TrendingUp className="w-5 h-5" />
                          Oportunidades de Vendas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {parsed.oportunidades.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                              <TrendingUp className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                              <p className="flex-1 text-sm">{item}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* Análise Individual */}
              {!isAnaliseGeral && (
                <>
                  {/* Perfil Comportamental */}
                  {parsed.perfil && (
                    <Card className="border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" />
                          Perfil Comportamental
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground leading-relaxed">{parsed.perfil.trim()}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Produtos Recomendados */}
                  {parsed.recomendados.length > 0 && (
                    <Card className="border-success/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-success">
                          <TrendingUp className="w-5 h-5" />
                          Produtos Recomendados
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {parsed.recomendados.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 rounded bg-success/10">
                              <div className="w-2 h-2 rounded-full bg-success" />
                              <p className="text-sm">{item}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Estratégia de Abordagem */}
                  {parsed.estrategia && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-primary" />
                          Estratégia de Abordagem
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground leading-relaxed">{parsed.estrategia.trim()}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Script de Contato */}
                  {parsed.script && (
                    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          💬 Script de Contato
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground leading-relaxed italic">{parsed.script.trim()}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Alertas (para análise individual também) */}
                  {parsed.alertas.length > 0 && (
                    <Card className="border-warning/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-warning">
                          <AlertTriangle className="w-5 h-5" />
                          Alertas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {parsed.alertas.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 rounded bg-warning/10 border border-warning/20">
                              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                              <p className="text-sm">{item}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              Nenhuma análise disponível
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
