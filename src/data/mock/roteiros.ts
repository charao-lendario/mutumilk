import { mockClientes, getStatusCliente, getDiasSemCompra } from "./clientes";

export type StatusVisita = "pendente" | "visita_concluida" | "contato_realizado";

export interface MockVisita {
  id: string;
  roteiro_id: string;
  vendedor_id: string;
  cliente_id: string;
  cliente_nome: string;
  cliente_tipo: string;
  cliente_endereco: string;
  ordem: number;
  status: StatusVisita;
  pedido_id: string | null;
  justificativa: string | null;
  latitude: number;
  longitude: number;
  ai_sugestao: {
    prioridade: "CRITICO" | "EM_RISCO" | "ATIVO";
    motivoVisita: string;
    abordagem: string;
    valorEstimado: number;
  };
  concluida_at: string | null;
}

export interface MockRoteiro {
  id: string;
  vendedor_id: string;
  data_roteiro: string;
  status: "ativo" | "concluido";
  visitas: MockVisita[];
  resumo_ia: string;
}

const hoje = new Date().toISOString().split("T")[0];

const sugestoesIA: Record<string, { motivo: string; abordagem: string }> = {
  CRITICO: {
    motivo: "Cliente sem compras ha mais de 60 dias. Risco alto de perda para concorrencia. Necessita atencao imediata.",
    abordagem: "Leve catalogo de promocoes ativas. Oferte condicoes especiais de retorno (desconto progressivo ou bonificacao). Pergunte sobre insatisfacoes e ouça atentamente.",
  },
  EM_RISCO: {
    motivo: "Cliente com frequencia de compra reduzida. Intervalo entre pedidos aumentando. Prevencao de churn necessaria.",
    abordagem: "Apresente novos produtos do mix. Oferte degustacao. Revise o pedido sugerido com base no historico de compras anteriores.",
  },
  ATIVO: {
    motivo: "Cliente ativo com potencial de aumento de ticket. Otima oportunidade de cross-sell e upsell.",
    abordagem: "Foque em expandir o mix de produtos. Apresente produtos complementares. Sugira aumento de volume com desconto por quantidade.",
  },
};

function gerarRoteiro(vendedorId: string): MockRoteiro {
  const clientes = mockClientes
    .filter((c) => c.vendedor_id === vendedorId)
    .map((c) => ({ ...c, status: getStatusCliente(c), dias: getDiasSemCompra(c) }))
    .sort((a, b) => {
      const prioridadeMap = { critico: 0, risco: 1, ativo: 2 };
      return prioridadeMap[a.status] - prioridadeMap[b.status] || b.dias - a.dias;
    })
    .slice(0, 6);

  const roteiroId = `rot-${vendedorId}-${hoje}`;

  const visitas: MockVisita[] = clientes.map((c, i) => {
    const prioridadeKey = c.status === "critico" ? "CRITICO" : c.status === "risco" ? "EM_RISCO" : "ATIVO";
    const sugestao = sugestoesIA[prioridadeKey];

    // Simulação: primeiros 2 clientes do vendedor-001 já foram visitados
    const jaVisitado = vendedorId === "vendedor-001" && i < 2;
    const vendeu = jaVisitado && i === 0;

    return {
      id: `vis-${vendedorId}-${i + 1}`,
      roteiro_id: roteiroId,
      vendedor_id: vendedorId,
      cliente_id: c.id,
      cliente_nome: c.nome,
      cliente_tipo: c.tipo,
      cliente_endereco: c.endereco,
      ordem: i + 1,
      status: jaVisitado ? "visita_concluida" : "pendente",
      pedido_id: vendeu ? `ped-visit-${vendedorId}-${i}` : null,
      justificativa: jaVisitado && !vendeu ? "Cliente sem budget este mes, prometeu comprar na proxima semana" : null,
      latitude: c.latitude,
      longitude: c.longitude,
      ai_sugestao: {
        prioridade: prioridadeKey as "CRITICO" | "EM_RISCO" | "ATIVO",
        motivoVisita: sugestao.motivo,
        abordagem: sugestao.abordagem,
        valorEstimado: Math.round(c.ticket_medio * (0.8 + Math.random() * 0.4)),
      },
      concluida_at: jaVisitado ? new Date(Date.now() - (3 - i) * 3600000).toISOString() : null,
    };
  });

  return {
    id: roteiroId,
    vendedor_id: vendedorId,
    data_roteiro: hoje,
    status: "ativo",
    visitas,
    resumo_ia: `Roteiro otimizado com ${clientes.length} clientes priorizados. Foco em recuperacao de clientes criticos e manutencao dos ativos. Valor estimado total: R$ ${visitas.reduce((s, v) => s + v.ai_sugestao.valorEstimado, 0).toLocaleString("pt-BR")}.`,
  };
}

export const mockRoteiros: MockRoteiro[] = [
  gerarRoteiro("vendedor-001"),
  gerarRoteiro("vendedor-002"),
  gerarRoteiro("vendedor-003"),
  gerarRoteiro("vendedor-004"),
  gerarRoteiro("vendedor-005"),
];

export const getRoteiroByVendedor = (vendedorId: string, data?: string) =>
  mockRoteiros.find((r) => r.vendedor_id === vendedorId && r.data_roteiro === (data || hoje));

export const getRoteiroById = (id: string) =>
  mockRoteiros.find((r) => r.id === id);
