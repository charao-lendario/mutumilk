import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface AnaliseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descricao: string;
  analise: string | null;
  isLoading: boolean;
}

const formatAnaliseText = (text: string) => {
  if (!text) return [];

  const lines = text.split('\n');
  const formatted: { type: string; content: string; level?: number }[] = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Detectar títulos H2 (##)
    if (trimmed.match(/^##\s+/)) {
      formatted.push({
        type: 'heading',
        content: trimmed.replace(/^##\s+/, ''),
        level: 2
      });
    }
    // Detectar títulos H3 (###)
    else if (trimmed.match(/^###\s+/)) {
      formatted.push({
        type: 'heading',
        content: trimmed.replace(/^###\s+/, ''),
        level: 3
      });
    }
    // Detectar listas
    else if (trimmed.match(/^[-*]\s+/)) {
      formatted.push({
        type: 'list',
        content: trimmed.replace(/^[-*]\s+/, '')
      });
    }
    // Detectar negrito
    else if (trimmed.match(/^\*\*.*\*\*$/)) {
      formatted.push({
        type: 'bold',
        content: trimmed.replace(/^\*\*|\*\*$/g, '')
      });
    }
    // Linha separadora
    else if (trimmed === '---') {
      formatted.push({ type: 'separator', content: '' });
    }
    // Texto normal
    else if (trimmed) {
      formatted.push({
        type: 'text',
        content: trimmed
      });
    }
  });

  return formatted;
};

export function AnaliseDialog({
  open,
  onOpenChange,
  titulo,
  descricao,
  analise,
  isLoading,
}: AnaliseDialogProps) {
  const formatted = formatAnaliseText(analise || "");

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
          ) : formatted.length > 0 ? (
            <div className="space-y-4 p-6">
              {formatted.map((item, idx) => {
                if (item.type === 'heading' && item.level === 2) {
                  return (
                    <h2 key={idx} className="text-2xl font-bold text-primary mt-6 mb-3 flex items-center gap-2">
                      {item.content}
                    </h2>
                  );
                }
                if (item.type === 'heading' && item.level === 3) {
                  return (
                    <h3 key={idx} className="text-xl font-semibold text-foreground mt-4 mb-2">
                      {item.content}
                    </h3>
                  );
                }
                if (item.type === 'list') {
                  return (
                    <div key={idx} className="flex items-start gap-3 pl-6 py-1">
                      <span className="text-primary mt-1 font-bold">•</span>
                      <p className="flex-1 text-sm text-foreground leading-relaxed">{item.content}</p>
                    </div>
                  );
                }
                if (item.type === 'bold') {
                  return (
                    <p key={idx} className="font-semibold text-foreground py-1 text-base">
                      {item.content}
                    </p>
                  );
                }
                if (item.type === 'separator') {
                  return <hr key={idx} className="my-4 border-border" />;
                }
                if (item.type === 'text') {
                  return (
                    <p key={idx} className="text-sm text-foreground/90 leading-relaxed">
                      {item.content}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhuma análise disponível.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
