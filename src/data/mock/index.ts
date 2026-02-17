export { mockUsuarios, getVendedores, getUsuarioByEmail, getUsuarioById } from "./usuarios";
export type { MockUsuario } from "./usuarios";

export { mockClientes, getClientesByVendedor, getClienteById, getStatusCliente, getDiasSemCompra } from "./clientes";
export type { MockCliente, TipoCliente, StatusCliente } from "./clientes";

export { mockProdutos, getProdutoById, getProdutosPorCategoria, getProdutosEmPromocao } from "./produtos";
export type { MockProduto } from "./produtos";

export { mockPedidos, getPedidosByVendedor, getPedidosByCliente, getVendasMes } from "./pedidos";
export type { MockPedido, MockItemPedido } from "./pedidos";

export { mockRoteiros, getRoteiroByVendedor, getRoteiroById } from "./roteiros";
export type { MockRoteiro, MockVisita, StatusVisita } from "./roteiros";

export { mockAnalises, getAnalisesByVendedor } from "./analises";
export type { MockAnalise } from "./analises";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
