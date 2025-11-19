import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface Cliente {
  id: string;
  nome: string;
  tipo: string;
  cnpj: string;
  ticket_medio: number;
  ultima_compra: string | null;
}

interface ClientesListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientes: Cliente[];
  title: string;
  description: string;
}

export function ClientesListDialog({
  open,
  onOpenChange,
  clientes,
  title,
  description,
}: ClientesListDialogProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "Nunca comprou";
    const d = new Date(date);
    return new Intl.DateTimeFormat("pt-BR").format(d);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          {clientes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum cliente nesta categoria
            </div>
          ) : (
            <div className="space-y-3">
              {clientes.map((cliente) => (
                <Card key={cliente.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {cliente.tipo}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          CNPJ: {cliente.cnpj}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(cliente.ticket_medio)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ticket médio
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        Última compra: {formatDate(cliente.ultima_compra)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
