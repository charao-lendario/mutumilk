export type TipoCliente = "supermercado" | "mercado" | "padaria" | "confeitaria" | "lanchonete" | "restaurante";
export type StatusCliente = "ativo" | "risco" | "critico";

export interface MockCliente {
  id: string;
  nome: string;
  tipo: TipoCliente;
  cnpj: string;
  contato: string;
  endereco: string;
  vendedor_id: string;
  data_cadastro: string;
  ultima_compra: string | null;
  ticket_medio: number;
  latitude: number;
  longitude: number;
}

const hoje = new Date();
const diasAtras = (dias: number) => {
  const d = new Date(hoje);
  d.setDate(d.getDate() - dias);
  return d.toISOString();
};

export const mockClientes: MockCliente[] = [
  // Vendedor 1 - Carlos Silva (Zona Sul SP)
  { id: "cli-001", nome: "Supermercado Bom Preco", tipo: "supermercado", cnpj: "12.345.678/0001-01", contato: "(11) 98765-0001", endereco: "Av. Santo Amaro, 1500 - Santo Amaro", vendedor_id: "vendedor-001", data_cadastro: "2024-03-15", ultima_compra: diasAtras(3), ticket_medio: 3450, latitude: -23.6530, longitude: -46.6980 },
  { id: "cli-002", nome: "Padaria Sabor do Pao", tipo: "padaria", cnpj: "12.345.678/0001-02", contato: "(11) 98765-0002", endereco: "Rua Vergueiro, 2300 - Vila Mariana", vendedor_id: "vendedor-001", data_cadastro: "2024-04-10", ultima_compra: diasAtras(8), ticket_medio: 890, latitude: -23.5890, longitude: -46.6340 },
  { id: "cli-003", nome: "Restaurante Sabor & Cia", tipo: "restaurante", cnpj: "12.345.678/0001-03", contato: "(11) 98765-0003", endereco: "Rua Oscar Freire, 800 - Jardins", vendedor_id: "vendedor-001", data_cadastro: "2024-02-20", ultima_compra: diasAtras(15), ticket_medio: 5200, latitude: -23.5630, longitude: -46.6720 },
  { id: "cli-004", nome: "Mercado Central Vila Mariana", tipo: "mercado", cnpj: "12.345.678/0001-04", contato: "(11) 98765-0004", endereco: "Rua Domingos de Morais, 1700 - Vila Mariana", vendedor_id: "vendedor-001", data_cadastro: "2024-05-05", ultima_compra: diasAtras(35), ticket_medio: 1250, latitude: -23.5950, longitude: -46.6370 },
  { id: "cli-005", nome: "Confeitaria Doce Sonho", tipo: "confeitaria", cnpj: "12.345.678/0001-05", contato: "(11) 98765-0005", endereco: "Rua Augusta, 2100 - Consolacao", vendedor_id: "vendedor-001", data_cadastro: "2024-01-15", ultima_compra: diasAtras(42), ticket_medio: 780, latitude: -23.5560, longitude: -46.6600 },
  { id: "cli-006", nome: "Lanchonete Point do Lanche", tipo: "lanchonete", cnpj: "12.345.678/0001-06", contato: "(11) 98765-0006", endereco: "Av. Paulista, 1800 - Bela Vista", vendedor_id: "vendedor-001", data_cadastro: "2024-06-01", ultima_compra: diasAtras(5), ticket_medio: 420, latitude: -23.5612, longitude: -46.6560 },
  { id: "cli-007", nome: "Supermercado Estrela", tipo: "supermercado", cnpj: "12.345.678/0001-07", contato: "(11) 98765-0007", endereco: "Av. Interlagos, 3200 - Interlagos", vendedor_id: "vendedor-001", data_cadastro: "2024-03-25", ultima_compra: diasAtras(65), ticket_medio: 2800, latitude: -23.6810, longitude: -46.6770 },
  { id: "cli-008", nome: "Padaria Trigal Dourado", tipo: "padaria", cnpj: "12.345.678/0001-08", contato: "(11) 98765-0008", endereco: "Rua Funchal, 500 - Vila Olimpia", vendedor_id: "vendedor-001", data_cadastro: "2024-07-10", ultima_compra: diasAtras(72), ticket_medio: 650, latitude: -23.5960, longitude: -46.6870 },
  { id: "cli-009", nome: "Restaurante Villa Italia", tipo: "restaurante", cnpj: "12.345.678/0001-09", contato: "(11) 98765-0009", endereco: "Rua Amauri, 300 - Itaim Bibi", vendedor_id: "vendedor-001", data_cadastro: "2024-04-18", ultima_compra: diasAtras(12), ticket_medio: 4100, latitude: -23.5820, longitude: -46.6760 },
  { id: "cli-010", nome: "Mercado Familia Feliz", tipo: "mercado", cnpj: "12.345.678/0001-10", contato: "(11) 98765-0010", endereco: "Av. Ibirapuera, 2500 - Moema", vendedor_id: "vendedor-001", data_cadastro: "2024-08-01", ultima_compra: diasAtras(90), ticket_medio: 980, latitude: -23.6060, longitude: -46.6650 },

  // Vendedor 2 - Ana Paula Costa (Zona Norte SP)
  { id: "cli-011", nome: "Supermercado Norte Sul", tipo: "supermercado", cnpj: "23.456.789/0001-01", contato: "(11) 97654-0001", endereco: "Av. Tucuruvi, 800 - Tucuruvi", vendedor_id: "vendedor-002", data_cadastro: "2024-02-10", ultima_compra: diasAtras(2), ticket_medio: 4200, latitude: -23.4780, longitude: -46.6080 },
  { id: "cli-012", nome: "Padaria Pao Quente", tipo: "padaria", cnpj: "23.456.789/0001-02", contato: "(11) 97654-0002", endereco: "Rua Voluntarios da Patria, 2800 - Santana", vendedor_id: "vendedor-002", data_cadastro: "2024-03-20", ultima_compra: diasAtras(10), ticket_medio: 720, latitude: -23.5080, longitude: -46.6280 },
  { id: "cli-013", nome: "Restaurante Tempero Caseiro", tipo: "restaurante", cnpj: "23.456.789/0001-03", contato: "(11) 97654-0003", endereco: "Av. Edu Chaves, 1200 - Jacanã", vendedor_id: "vendedor-002", data_cadastro: "2024-04-05", ultima_compra: diasAtras(18), ticket_medio: 3800, latitude: -23.4630, longitude: -46.5850 },
  { id: "cli-014", nome: "Mercado Popular Santana", tipo: "mercado", cnpj: "23.456.789/0001-04", contato: "(11) 97654-0004", endereco: "Rua Alfredo Pujol, 500 - Santana", vendedor_id: "vendedor-002", data_cadastro: "2024-05-15", ultima_compra: diasAtras(38), ticket_medio: 1580, latitude: -23.5020, longitude: -46.6250 },
  { id: "cli-015", nome: "Confeitaria Bella Torta", tipo: "confeitaria", cnpj: "23.456.789/0001-05", contato: "(11) 97654-0005", endereco: "Av. Casa Verde, 900 - Casa Verde", vendedor_id: "vendedor-002", data_cadastro: "2024-06-20", ultima_compra: diasAtras(50), ticket_medio: 920, latitude: -23.5150, longitude: -46.6580 },
  { id: "cli-016", nome: "Lanchonete Express Norte", tipo: "lanchonete", cnpj: "23.456.789/0001-06", contato: "(11) 97654-0006", endereco: "Av. Nova Cantareira, 2000 - Tucuruvi", vendedor_id: "vendedor-002", data_cadastro: "2024-07-01", ultima_compra: diasAtras(7), ticket_medio: 380, latitude: -23.4720, longitude: -46.6120 },
  { id: "cli-017", nome: "Supermercado Max Atacado", tipo: "supermercado", cnpj: "23.456.789/0001-07", contato: "(11) 97654-0007", endereco: "Rua Maria Amalia, 400 - Tremembé", vendedor_id: "vendedor-002", data_cadastro: "2024-02-25", ultima_compra: diasAtras(70), ticket_medio: 5100, latitude: -23.4580, longitude: -46.6280 },
  { id: "cli-018", nome: "Padaria Real Sabor", tipo: "padaria", cnpj: "23.456.789/0001-08", contato: "(11) 97654-0008", endereco: "Av. Gen. Ataliba Leonel, 1500 - Carandiru", vendedor_id: "vendedor-002", data_cadastro: "2024-08-10", ultima_compra: diasAtras(85), ticket_medio: 560, latitude: -23.5200, longitude: -46.6200 },
  { id: "cli-019", nome: "Restaurante Sabor Mineiro", tipo: "restaurante", cnpj: "23.456.789/0001-09", contato: "(11) 97654-0009", endereco: "Rua Salete, 700 - Santana", vendedor_id: "vendedor-002", data_cadastro: "2024-03-30", ultima_compra: diasAtras(14), ticket_medio: 2900, latitude: -23.5050, longitude: -46.6300 },
  { id: "cli-020", nome: "Mercado Bairro Limao", tipo: "mercado", cnpj: "23.456.789/0001-10", contato: "(11) 97654-0010", endereco: "Av. Otaviano A. de Lima, 1800 - Limão", vendedor_id: "vendedor-002", data_cadastro: "2024-09-01", ultima_compra: diasAtras(100), ticket_medio: 1100, latitude: -23.5080, longitude: -46.6650 },

  // Vendedor 3 - Roberto Almeida (Zona Leste SP)
  { id: "cli-021", nome: "Supermercado Leste Lar", tipo: "supermercado", cnpj: "34.567.890/0001-01", contato: "(11) 96543-0001", endereco: "Av. Aricanduva, 3000 - Aricanduva", vendedor_id: "vendedor-003", data_cadastro: "2024-01-20", ultima_compra: diasAtras(4), ticket_medio: 3900, latitude: -23.5610, longitude: -46.5120 },
  { id: "cli-022", nome: "Padaria Bom Dia", tipo: "padaria", cnpj: "34.567.890/0001-02", contato: "(11) 96543-0002", endereco: "Rua Serra de Bragança, 800 - Tatuapé", vendedor_id: "vendedor-003", data_cadastro: "2024-02-15", ultima_compra: diasAtras(6), ticket_medio: 950, latitude: -23.5420, longitude: -46.5710 },
  { id: "cli-023", nome: "Restaurante Bom Prato", tipo: "restaurante", cnpj: "34.567.890/0001-03", contato: "(11) 96543-0003", endereco: "Av. Celso Garcia, 2200 - Belém", vendedor_id: "vendedor-003", data_cadastro: "2024-03-10", ultima_compra: diasAtras(20), ticket_medio: 2700, latitude: -23.5340, longitude: -46.5900 },
  { id: "cli-024", nome: "Mercado Vila Prudente", tipo: "mercado", cnpj: "34.567.890/0001-04", contato: "(11) 96543-0004", endereco: "Rua do Orfanato, 600 - Vila Prudente", vendedor_id: "vendedor-003", data_cadastro: "2024-04-25", ultima_compra: diasAtras(45), ticket_medio: 1400, latitude: -23.5830, longitude: -46.5750 },
  { id: "cli-025", nome: "Confeitaria Doce Mel", tipo: "confeitaria", cnpj: "34.567.890/0001-05", contato: "(11) 96543-0005", endereco: "Rua Tuiuti, 1500 - Tatuapé", vendedor_id: "vendedor-003", data_cadastro: "2024-05-10", ultima_compra: diasAtras(55), ticket_medio: 680, latitude: -23.5380, longitude: -46.5650 },
  { id: "cli-026", nome: "Lanchonete Mooca Lanches", tipo: "lanchonete", cnpj: "34.567.890/0001-06", contato: "(11) 96543-0006", endereco: "Rua da Mooca, 2800 - Mooca", vendedor_id: "vendedor-003", data_cadastro: "2024-06-15", ultima_compra: diasAtras(9), ticket_medio: 350, latitude: -23.5590, longitude: -46.5940 },
  { id: "cli-027", nome: "Supermercado Penha Center", tipo: "supermercado", cnpj: "34.567.890/0001-07", contato: "(11) 96543-0007", endereco: "Av. Penha de Franca, 1600 - Penha", vendedor_id: "vendedor-003", data_cadastro: "2024-03-05", ultima_compra: diasAtras(68), ticket_medio: 3200, latitude: -23.5280, longitude: -46.5420 },
  { id: "cli-028", nome: "Padaria Grão de Ouro", tipo: "padaria", cnpj: "34.567.890/0001-08", contato: "(11) 96543-0008", endereco: "Av. Sapopemba, 4500 - São Mateus", vendedor_id: "vendedor-003", data_cadastro: "2024-07-20", ultima_compra: diasAtras(78), ticket_medio: 520, latitude: -23.6120, longitude: -46.4880 },
  { id: "cli-029", nome: "Restaurante Cozinha da Vovo", tipo: "restaurante", cnpj: "34.567.890/0001-09", contato: "(11) 96543-0009", endereco: "Rua Apucarana, 900 - Tatuapé", vendedor_id: "vendedor-003", data_cadastro: "2024-04-12", ultima_compra: diasAtras(11), ticket_medio: 3500, latitude: -23.5450, longitude: -46.5780 },
  { id: "cli-030", nome: "Mercado Itaquera Popular", tipo: "mercado", cnpj: "34.567.890/0001-10", contato: "(11) 96543-0010", endereco: "Av. do Contorno, 2200 - Itaquera", vendedor_id: "vendedor-003", data_cadastro: "2024-08-05", ultima_compra: diasAtras(95), ticket_medio: 870, latitude: -23.5420, longitude: -46.4530 },

  // Vendedor 4 - Juliana Ferreira (Zona Oeste SP)
  { id: "cli-031", nome: "Supermercado Pinheiros", tipo: "supermercado", cnpj: "45.678.901/0001-01", contato: "(11) 95432-0001", endereco: "Rua dos Pinheiros, 1200 - Pinheiros", vendedor_id: "vendedor-004", data_cadastro: "2024-02-01", ultima_compra: diasAtras(2), ticket_medio: 4800, latitude: -23.5670, longitude: -46.6910 },
  { id: "cli-032", nome: "Padaria Artesanal", tipo: "padaria", cnpj: "45.678.901/0001-02", contato: "(11) 95432-0002", endereco: "Rua Cardeal Arcoverde, 800 - Pinheiros", vendedor_id: "vendedor-004", data_cadastro: "2024-03-15", ultima_compra: diasAtras(5), ticket_medio: 1100, latitude: -23.5580, longitude: -46.6870 },
  { id: "cli-033", nome: "Restaurante Chef Gourmet", tipo: "restaurante", cnpj: "45.678.901/0001-03", contato: "(11) 95432-0003", endereco: "Rua Butanta, 500 - Butanta", vendedor_id: "vendedor-004", data_cadastro: "2024-04-20", ultima_compra: diasAtras(22), ticket_medio: 6200, latitude: -23.5720, longitude: -46.7280 },
  { id: "cli-034", nome: "Mercado Lapa Center", tipo: "mercado", cnpj: "45.678.901/0001-04", contato: "(11) 95432-0004", endereco: "Rua Guaicurus, 900 - Lapa", vendedor_id: "vendedor-004", data_cadastro: "2024-05-25", ultima_compra: diasAtras(40), ticket_medio: 1800, latitude: -23.5240, longitude: -46.7050 },
  { id: "cli-035", nome: "Confeitaria Francesa", tipo: "confeitaria", cnpj: "45.678.901/0001-05", contato: "(11) 95432-0005", endereco: "Av. Reboucas, 1600 - Pinheiros", vendedor_id: "vendedor-004", data_cadastro: "2024-06-10", ultima_compra: diasAtras(48), ticket_medio: 1350, latitude: -23.5620, longitude: -46.6800 },
  { id: "cli-036", nome: "Lanchonete Perdizes Grill", tipo: "lanchonete", cnpj: "45.678.901/0001-06", contato: "(11) 95432-0006", endereco: "Rua Monte Alegre, 700 - Perdizes", vendedor_id: "vendedor-004", data_cadastro: "2024-07-05", ultima_compra: diasAtras(7), ticket_medio: 480, latitude: -23.5330, longitude: -46.6870 },
  { id: "cli-037", nome: "Supermercado Osasco Premium", tipo: "supermercado", cnpj: "45.678.901/0001-07", contato: "(11) 95432-0007", endereco: "Av. dos Autonomistas, 3500 - Osasco", vendedor_id: "vendedor-004", data_cadastro: "2024-02-20", ultima_compra: diasAtras(62), ticket_medio: 3600, latitude: -23.5320, longitude: -46.7920 },
  { id: "cli-038", nome: "Padaria Recanto do Pao", tipo: "padaria", cnpj: "45.678.901/0001-08", contato: "(11) 95432-0008", endereco: "Rua Cleo, 200 - Jaguaré", vendedor_id: "vendedor-004", data_cadastro: "2024-08-15", ultima_compra: diasAtras(75), ticket_medio: 620, latitude: -23.5560, longitude: -46.7450 },
  { id: "cli-039", nome: "Restaurante Trattoria Bella", tipo: "restaurante", cnpj: "45.678.901/0001-09", contato: "(11) 95432-0009", endereco: "Rua Fradique Coutinho, 1200 - Vila Madalena", vendedor_id: "vendedor-004", data_cadastro: "2024-04-28", ultima_compra: diasAtras(13), ticket_medio: 4500, latitude: -23.5530, longitude: -46.6930 },
  { id: "cli-040", nome: "Mercado Vila Sonia", tipo: "mercado", cnpj: "45.678.901/0001-10", contato: "(11) 95432-0010", endereco: "Rua Prof. Francisco Morato, 4500 - Vila Sonia", vendedor_id: "vendedor-004", data_cadastro: "2024-09-01", ultima_compra: diasAtras(88), ticket_medio: 950, latitude: -23.5980, longitude: -46.7380 },

  // Vendedor 5 - Pedro Oliveira (ABC/Grande SP)
  { id: "cli-041", nome: "Supermercado ABC Lar", tipo: "supermercado", cnpj: "56.789.012/0001-01", contato: "(11) 94321-0001", endereco: "Av. Industrial, 2000 - Santo André", vendedor_id: "vendedor-005", data_cadastro: "2024-01-10", ultima_compra: diasAtras(3), ticket_medio: 3700, latitude: -23.6500, longitude: -46.5280 },
  { id: "cli-042", nome: "Padaria Santo Andre", tipo: "padaria", cnpj: "56.789.012/0001-02", contato: "(11) 94321-0002", endereco: "Rua das Figueiras, 500 - Santo André", vendedor_id: "vendedor-005", data_cadastro: "2024-02-28", ultima_compra: diasAtras(9), ticket_medio: 830, latitude: -23.6580, longitude: -46.5350 },
  { id: "cli-043", nome: "Restaurante Gosto Bom", tipo: "restaurante", cnpj: "56.789.012/0001-03", contato: "(11) 94321-0003", endereco: "Av. Goias, 800 - São Caetano do Sul", vendedor_id: "vendedor-005", data_cadastro: "2024-03-22", ultima_compra: diasAtras(16), ticket_medio: 3200, latitude: -23.6230, longitude: -46.5580 },
  { id: "cli-044", nome: "Mercado Sao Bernardo", tipo: "mercado", cnpj: "56.789.012/0001-04", contato: "(11) 94321-0004", endereco: "Av. Kennedy, 1500 - São Bernardo", vendedor_id: "vendedor-005", data_cadastro: "2024-05-08", ultima_compra: diasAtras(32), ticket_medio: 1650, latitude: -23.6940, longitude: -46.5650 },
  { id: "cli-045", nome: "Confeitaria Delicia Real", tipo: "confeitaria", cnpj: "56.789.012/0001-05", contato: "(11) 94321-0005", endereco: "Rua Marechal Deodoro, 400 - São Bernardo", vendedor_id: "vendedor-005", data_cadastro: "2024-06-25", ultima_compra: diasAtras(52), ticket_medio: 740, latitude: -23.6910, longitude: -46.5510 },
  { id: "cli-046", nome: "Lanchonete Diadema Grill", tipo: "lanchonete", cnpj: "56.789.012/0001-06", contato: "(11) 94321-0006", endereco: "Av. Sete de Setembro, 1000 - Diadema", vendedor_id: "vendedor-005", data_cadastro: "2024-07-15", ultima_compra: diasAtras(6), ticket_medio: 310, latitude: -23.6860, longitude: -46.6230 },
  { id: "cli-047", nome: "Supermercado Maua Plus", tipo: "supermercado", cnpj: "56.789.012/0001-07", contato: "(11) 94321-0007", endereco: "Av. Barão de Mauá, 2200 - Mauá", vendedor_id: "vendedor-005", data_cadastro: "2024-03-12", ultima_compra: diasAtras(71), ticket_medio: 2900, latitude: -23.6670, longitude: -46.4620 },
  { id: "cli-048", nome: "Padaria Pão de Mel", tipo: "padaria", cnpj: "56.789.012/0001-08", contato: "(11) 94321-0008", endereco: "Rua Tiradentes, 350 - Ribeirão Pires", vendedor_id: "vendedor-005", data_cadastro: "2024-08-20", ultima_compra: diasAtras(82), ticket_medio: 480, latitude: -23.7120, longitude: -46.4100 },
  { id: "cli-049", nome: "Restaurante Rancho Mineiro", tipo: "restaurante", cnpj: "56.789.012/0001-09", contato: "(11) 94321-0009", endereco: "Av. Pereira Barreto, 1400 - Santo André", vendedor_id: "vendedor-005", data_cadastro: "2024-04-15", ultima_compra: diasAtras(10), ticket_medio: 3800, latitude: -23.6560, longitude: -46.5400 },
  { id: "cli-050", nome: "Mercado Rio Grande ABC", tipo: "mercado", cnpj: "56.789.012/0001-10", contato: "(11) 94321-0010", endereco: "Av. Presidente Costa e Silva, 3000 - Mauá", vendedor_id: "vendedor-005", data_cadastro: "2024-09-05", ultima_compra: diasAtras(105), ticket_medio: 780, latitude: -23.6720, longitude: -46.4680 },
];

export const getClientesByVendedor = (vendedorId: string) =>
  mockClientes.filter((c) => c.vendedor_id === vendedorId);

export const getClienteById = (id: string) =>
  mockClientes.find((c) => c.id === id);

export const getStatusCliente = (cliente: MockCliente): StatusCliente => {
  if (!cliente.ultima_compra) return "critico";
  const dias = Math.floor((Date.now() - new Date(cliente.ultima_compra).getTime()) / (1000 * 60 * 60 * 24));
  if (dias <= 30) return "ativo";
  if (dias <= 60) return "risco";
  return "critico";
};

export const getDiasSemCompra = (cliente: MockCliente): number => {
  if (!cliente.ultima_compra) return 999;
  return Math.floor((Date.now() - new Date(cliente.ultima_compra).getTime()) / (1000 * 60 * 60 * 24));
};
