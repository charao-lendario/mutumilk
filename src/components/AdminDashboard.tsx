import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, TrendingUp, DollarSign, Sparkles, Award } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VendedorMetrics {
  id: string;
  nome: string;
  totalClientes: number;
  clientesAtivos: number;
  vendasMes: number;
  ticketMedio: number;
  analisesGeradas: number;
}

export function AdminDashboard() {
  const [vendedores, setVendedores] = useState<VendedorMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totais, setTotais] = useState({
    totalVendedores: 0,
    totalClientes: 0,
    totalVendasMes: 0,
    totalAnalises: 0,
  });

  useEffect(() => {
    loadAdminMetrics();
  }, []);

  const loadAdminMetrics = async () => {
    setIsLoading(true);
    
    // Simular delay de carregamento
    await new Promise(resolve => setTimeout(resolve, 800));

    // Dados mockados de vendedores
    const mockVendedores: VendedorMetrics[] = [
      {
        id: "1",
        nome: "Carlos Silva",
        totalClientes: 12,
        clientesAtivos: 10,
        vendasMes: 48500.00,
        ticketMedio: 3850.00,
        analisesGeradas: 18,
      },
      {
        id: "2",
        nome: "Ana Paula Santos",
        totalClientes: 10,
        clientesAtivos: 9,
        vendasMes: 42300.00,
        ticketMedio: 4100.00,
        analisesGeradas: 15,
      },
      {
        id: "3",
        nome: "Roberto Oliveira",
        totalClientes: 11,
        clientesAtivos: 8,
        vendasMes: 38700.00,
        ticketMedio: 3520.00,
        analisesGeradas: 12,
      },
      {
        id: "4",
        nome: "Mariana Costa",
        totalClientes: 9,
        clientesAtivos: 8,
        vendasMes: 35200.00,
        ticketMedio: 3900.00,
        analisesGeradas: 14,
      },
      {
        id: "5",
        nome: "Pedro Almeida",
        totalClientes: 8,
        clientesAtivos: 6,
        vendasMes: 28900.00,
        ticketMedio: 3610.00,
        analisesGeradas: 9,
      },
    ];

    setVendedores(mockVendedores);

    // Calcular totais
    const totais = mockVendedores.reduce(
      (acc, v) => ({
        totalVendedores: acc.totalVendedores + 1,
        totalClientes: acc.totalClientes + v.totalClientes,
        totalVendasMes: acc.totalVendasMes + v.vendasMes,
        totalAnalises: acc.totalAnalises + v.analisesGeradas,
      }),
      { totalVendedores: 0, totalClientes: 0, totalVendasMes: 0, totalAnalises: 0 }
    );

    setTotais(totais);
    setIsLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="h-24 bg-muted" />
              <CardContent className="h-16 bg-muted/50" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Totais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totais.totalVendedores}</div>
            <p className="text-xs text-muted-foreground">Time ativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totais.totalClientes}</div>
            <p className="text-xs text-muted-foreground">Base de clientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totais.totalVendasMes)}</div>
            <p className="text-xs text-muted-foreground">Faturamento mensal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análises IA</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totais.totalAnalises}</div>
            <p className="text-xs text-muted-foreground">Total geradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Vendedores */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle>Ranking de Vendedores</CardTitle>
          </div>
          <CardDescription>Performance do mês atual ordenada por vendas</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-right">Clientes</TableHead>
                  <TableHead className="text-right">Ativos</TableHead>
                  <TableHead className="text-right">Vendas Mês</TableHead>
                  <TableHead className="text-right">Ticket Médio</TableHead>
                  <TableHead className="text-right">Análises IA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendedores.map((vendedor, index) => (
                  <TableRow key={vendedor.id}>
                    <TableCell className="font-medium">
                      {index === 0 && <span className="text-yellow-500">🥇</span>}
                      {index === 1 && <span className="text-gray-400">🥈</span>}
                      {index === 2 && <span className="text-amber-600">🥉</span>}
                      {index > 2 && <span className="text-muted-foreground">{index + 1}</span>}
                    </TableCell>
                    <TableCell className="font-medium">{vendedor.nome}</TableCell>
                    <TableCell className="text-right">{vendedor.totalClientes}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600 font-medium">{vendedor.clientesAtivos}</span>
                      <span className="text-muted-foreground text-xs">
                        {vendedor.totalClientes > 0 
                          ? ` (${Math.round((vendedor.clientesAtivos / vendedor.totalClientes) * 100)}%)`
                          : ' (0%)'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(vendedor.vendasMes)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(vendedor.ticketMedio)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span>{vendedor.analisesGeradas}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
