export interface MockAnalise {
  id: string;
  vendedor_id: string;
  cliente_id: string | null;
  tipo_analise: "geral" | "individual";
  resumo: string;
  created_at: string;
}

const hoje = new Date();
const diasAtras = (dias: number) => {
  const d = new Date(hoje);
  d.setDate(d.getDate() - dias);
  return d.toISOString();
};

export const mockAnalises: MockAnalise[] = [
  { id: "an-001", vendedor_id: "vendedor-001", cliente_id: null, tipo_analise: "geral", resumo: "Carteira com 10 clientes analisada. 3 criticos identificados. Foco em recuperacao do Supermercado Estrela e Padaria Trigal Dourado.", created_at: diasAtras(0) },
  { id: "an-002", vendedor_id: "vendedor-001", cliente_id: "cli-007", tipo_analise: "individual", resumo: "Supermercado Estrela - 65 dias sem compra. Historico de alto volume. Possivel migracao para concorrente. Acao urgente recomendada.", created_at: diasAtras(0) },
  { id: "an-003", vendedor_id: "vendedor-001", cliente_id: null, tipo_analise: "geral", resumo: "Performance geral positiva. Ticket medio subiu 8% no ultimo mes. 2 clientes recuperados da zona de risco.", created_at: diasAtras(1) },
  { id: "an-004", vendedor_id: "vendedor-002", cliente_id: null, tipo_analise: "geral", resumo: "Carteira com bom desempenho. Supermercado Max Atacado e Padaria Real Sabor necessitam atencao imediata.", created_at: diasAtras(0) },
  { id: "an-005", vendedor_id: "vendedor-002", cliente_id: "cli-017", tipo_analise: "individual", resumo: "Supermercado Max Atacado - Alto potencial de recuperacao. Sugere-se oferta especial com desconto de 10% no primeiro pedido de retorno.", created_at: diasAtras(1) },
  { id: "an-006", vendedor_id: "vendedor-003", cliente_id: null, tipo_analise: "geral", resumo: "Zona Leste com crescimento de 12% em vendas. Foco em expansao de mix no Supermercado Penha Center.", created_at: diasAtras(0) },
  { id: "an-007", vendedor_id: "vendedor-003", cliente_id: "cli-027", tipo_analise: "individual", resumo: "Penha Center - Ultimas compras concentradas em queijos. Oportunidade de cross-sell com iogurtes e manteigas.", created_at: diasAtras(2) },
  { id: "an-008", vendedor_id: "vendedor-004", cliente_id: null, tipo_analise: "geral", resumo: "Zona Oeste apresenta melhor performance. Restaurante Chef Gourmet com maior ticket medio. Confeitaria Francesa precisa reativacao.", created_at: diasAtras(0) },
  { id: "an-009", vendedor_id: "vendedor-005", cliente_id: null, tipo_analise: "geral", resumo: "ABC com carteira estavel. 2 clientes criticos no ABC. Supermercado Maua Plus com queda significativa.", created_at: diasAtras(0) },
  { id: "an-010", vendedor_id: "vendedor-005", cliente_id: "cli-047", tipo_analise: "individual", resumo: "Supermercado Maua Plus - Comprava em alto volume ate 70 dias atras. Investigar causa da parada. Possivel problema logistico.", created_at: diasAtras(1) },
];

export const getAnalisesByVendedor = (vendedorId: string) =>
  mockAnalises.filter((a) => a.vendedor_id === vendedorId);
