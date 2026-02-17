import { mockClientes } from "./clientes";
import { mockProdutos } from "./produtos";

export interface MockItemPedido {
  id: string;
  pedido_id: string;
  produto_id: string;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface MockPedido {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  vendedor_id: string;
  data_pedido: string;
  valor_total: number;
  status: "concluido" | "pendente" | "cancelado";
  itens: MockItemPedido[];
}

const hoje = new Date();
const diasAtras = (dias: number) => {
  const d = new Date(hoje);
  d.setDate(d.getDate() - dias);
  return d.toISOString().split("T")[0];
};

let pedidoCounter = 0;
let itemCounter = 0;

function gerarPedido(clienteId: string, clienteNome: string, vendedorId: string, diasAgo: number, valorBase: number): MockPedido {
  pedidoCounter++;
  const pid = `ped-${String(pedidoCounter).padStart(3, "0")}`;
  const numItens = 2 + Math.floor(Math.random() * 4);
  const itens: MockItemPedido[] = [];
  let total = 0;

  const produtosUsados = new Set<number>();
  for (let i = 0; i < numItens; i++) {
    let idx: number;
    do { idx = Math.floor(Math.random() * mockProdutos.length); } while (produtosUsados.has(idx));
    produtosUsados.add(idx);
    const prod = mockProdutos[idx];
    const qty = 1 + Math.floor(Math.random() * 20);
    const subtotal = +(prod.preco_atual * qty).toFixed(2);
    total += subtotal;
    itemCounter++;
    itens.push({
      id: `item-${String(itemCounter).padStart(4, "0")}`,
      pedido_id: pid,
      produto_id: prod.id,
      produto_nome: prod.nome,
      quantidade: qty,
      preco_unitario: prod.preco_atual,
      subtotal,
    });
  }

  return {
    id: pid,
    cliente_id: clienteId,
    cliente_nome: clienteNome,
    vendedor_id: vendedorId,
    data_pedido: diasAtras(diasAgo),
    valor_total: +total.toFixed(2),
    status: Math.random() > 0.08 ? "concluido" : Math.random() > 0.5 ? "pendente" : "cancelado",
    itens,
  };
}

function gerarHistoricoPedidos(): MockPedido[] {
  const pedidos: MockPedido[] = [];

  mockClientes.forEach((cliente) => {
    const diasUltimaCompra = cliente.ultima_compra
      ? Math.floor((Date.now() - new Date(cliente.ultima_compra).getTime()) / (1000 * 60 * 60 * 24))
      : 200;

    let numPedidos: number;
    if (diasUltimaCompra <= 15) numPedidos = 6 + Math.floor(Math.random() * 5);
    else if (diasUltimaCompra <= 30) numPedidos = 4 + Math.floor(Math.random() * 3);
    else if (diasUltimaCompra <= 60) numPedidos = 3 + Math.floor(Math.random() * 2);
    else numPedidos = 1 + Math.floor(Math.random() * 2);

    for (let i = 0; i < numPedidos; i++) {
      const diasOffset = diasUltimaCompra + i * (10 + Math.floor(Math.random() * 20));
      pedidos.push(gerarPedido(cliente.id, cliente.nome, cliente.vendedor_id, diasOffset, cliente.ticket_medio));
    }
  });

  return pedidos.sort((a, b) => new Date(b.data_pedido).getTime() - new Date(a.data_pedido).getTime());
}

export const mockPedidos = gerarHistoricoPedidos();

export const getPedidosByVendedor = (vendedorId: string) =>
  mockPedidos.filter((p) => p.vendedor_id === vendedorId);

export const getPedidosByCliente = (clienteId: string) =>
  mockPedidos.filter((p) => p.cliente_id === clienteId);

export const getVendasMes = (vendedorId: string) => {
  const agora = new Date();
  const mesAtual = agora.getMonth();
  const anoAtual = agora.getFullYear();
  return mockPedidos
    .filter((p) => {
      const d = new Date(p.data_pedido);
      return p.vendedor_id === vendedorId && p.status === "concluido" && d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    })
    .reduce((sum, p) => sum + p.valor_total, 0);
};
