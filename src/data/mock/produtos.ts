export interface MockProduto {
  id: string;
  nome: string;
  categoria: string;
  preco_atual: number;
  preco_anterior: number;
  unidade: string;
  em_promocao: boolean;
}

export const mockProdutos: MockProduto[] = [
  { id: "prod-001", nome: "Queijo Mussarela 5kg", categoria: "Queijos", preco_atual: 89.90, preco_anterior: 94.90, unidade: "peca", em_promocao: true },
  { id: "prod-002", nome: "Queijo Prato 4kg", categoria: "Queijos", preco_atual: 79.90, preco_anterior: 79.90, unidade: "peca", em_promocao: false },
  { id: "prod-003", nome: "Queijo Minas Frescal 1kg", categoria: "Queijos", preco_atual: 32.90, preco_anterior: 34.90, unidade: "peca", em_promocao: true },
  { id: "prod-004", nome: "Requeijao Cremoso 400g", categoria: "Derivados", preco_atual: 12.90, preco_anterior: 12.90, unidade: "unidade", em_promocao: false },
  { id: "prod-005", nome: "Leite Integral 1L", categoria: "Leites", preco_atual: 5.49, preco_anterior: 5.49, unidade: "unidade", em_promocao: false },
  { id: "prod-006", nome: "Leite Desnatado 1L", categoria: "Leites", preco_atual: 5.29, preco_anterior: 5.29, unidade: "unidade", em_promocao: false },
  { id: "prod-007", nome: "Iogurte Natural 1kg", categoria: "Iogurtes", preco_atual: 14.90, preco_anterior: 16.90, unidade: "unidade", em_promocao: true },
  { id: "prod-008", nome: "Iogurte Grego 500g", categoria: "Iogurtes", preco_atual: 11.90, preco_anterior: 11.90, unidade: "unidade", em_promocao: false },
  { id: "prod-009", nome: "Manteiga Extra 500g", categoria: "Manteigas", preco_atual: 24.90, preco_anterior: 24.90, unidade: "unidade", em_promocao: false },
  { id: "prod-010", nome: "Manteiga com Sal 200g", categoria: "Manteigas", preco_atual: 12.50, preco_anterior: 12.50, unidade: "unidade", em_promocao: false },
  { id: "prod-011", nome: "Creme de Leite 200g", categoria: "Derivados", preco_atual: 4.90, preco_anterior: 4.90, unidade: "unidade", em_promocao: false },
  { id: "prod-012", nome: "Leite Condensado 395g", categoria: "Derivados", preco_atual: 7.90, preco_anterior: 8.50, unidade: "unidade", em_promocao: true },
  { id: "prod-013", nome: "Queijo Coalho 500g", categoria: "Queijos", preco_atual: 22.90, preco_anterior: 22.90, unidade: "peca", em_promocao: false },
  { id: "prod-014", nome: "Bebida Lactea 1L", categoria: "Iogurtes", preco_atual: 6.90, preco_anterior: 6.90, unidade: "unidade", em_promocao: false },
  { id: "prod-015", nome: "Doce de Leite 600g", categoria: "Derivados", preco_atual: 18.90, preco_anterior: 18.90, unidade: "unidade", em_promocao: false },
];

export const getProdutoById = (id: string) => mockProdutos.find((p) => p.id === id);
export const getProdutosPorCategoria = (cat: string) => mockProdutos.filter((p) => p.categoria === cat);
export const getProdutosEmPromocao = () => mockProdutos.filter((p) => p.em_promocao);
