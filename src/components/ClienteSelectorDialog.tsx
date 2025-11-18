import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Cliente {
  id: string;
  nome: string;
  tipo: string;
  cnpj: string;
}

interface ClienteSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (clienteId: string) => void;
  userId: string;
}

export function ClienteSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  userId,
}: ClienteSelectorDialogProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open && userId) {
      loadClientes();
    }
  }, [open, userId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = clientes.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cnpj.includes(searchTerm)
      );
      setFilteredClientes(filtered);
    } else {
      setFilteredClientes(clientes);
    }
  }, [searchTerm, clientes]);

  const loadClientes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, tipo, cnpj")
        .eq("vendedor_id", userId)
        .order("nome");

      if (error) throw error;
      setClientes(data || []);
      setFilteredClientes(data || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (clienteId: string) => {
    onSelect(clienteId);
    onOpenChange(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selecione um Cliente</DialogTitle>
          <DialogDescription>
            Escolha o cliente que deseja analisar
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[400px] w-full rounded-md border">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Carregando clientes...
              </div>
            ) : filteredClientes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchTerm ? "Nenhum cliente encontrado" : "Você ainda não tem clientes cadastrados"}
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {filteredClientes.map((cliente) => (
                  <Button
                    key={cliente.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handleSelect(cliente.id)}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{cliente.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        {cliente.tipo} • {cliente.cnpj}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
