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

export function AnaliseDialog({
  open,
  onOpenChange,
  titulo,
  descricao,
  analise,
  isLoading,
}: AnaliseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Analisando dados...</span>
            </div>
          ) : analise ? (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {analise}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Nenhuma análise disponível
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
