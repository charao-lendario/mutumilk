import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verificar usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }

    console.log('🔍 Iniciando análise geral para vendedor:', user.id);

    // Buscar dados do vendedor
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select(`
        *,
        pedidos (
          valor_total,
          data_pedido,
          status
        )
      `)
      .eq('vendedor_id', user.id);

    if (clientesError) {
      console.error('Erro ao buscar clientes:', clientesError);
      throw clientesError;
    }

    // Buscar todos os produtos
    const { data: produtos } = await supabase
      .from('produtos')
      .select('*');

    // Preparar contexto para a IA
    const agora = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(agora.getDate() - 30);

    const clientesAtivos = clientes?.filter(c => 
      c.ultima_compra && new Date(c.ultima_compra) > trintaDiasAtras
    ) || [];

    const clientesInativos = clientes?.filter(c => 
      !c.ultima_compra || new Date(c.ultima_compra) <= trintaDiasAtras
    ) || [];

    const sessentaDiasAtras = new Date();
    sessentaDiasAtras.setDate(agora.getDate() - 60);

    const clientesEmRisco = clientes?.filter(c =>
      c.ultima_compra && 
      new Date(c.ultima_compra) <= trintaDiasAtras &&
      new Date(c.ultima_compra) > sessentaDiasAtras
    ) || [];

    const clientesCriticos = clientes?.filter(c =>
      !c.ultima_compra || new Date(c.ultima_compra) <= sessentaDiasAtras
    ) || [];

    // Calcular dias desde última compra para cada cliente
    const clientesDetalhados = clientes?.map(c => {
      const ultimaCompra = c.ultima_compra ? new Date(c.ultima_compra) : null;
      const diasSemComprar = ultimaCompra 
        ? Math.floor((agora.getTime() - ultimaCompra.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      const pedidosRecentes = Array.isArray(c.pedidos) ? c.pedidos.slice(0, 3) : [];
      const valorTotalRecente = pedidosRecentes.reduce((sum: number, p: any) => sum + Number(p.valor_total || 0), 0);
      
      return {
        nome: c.nome,
        tipo: c.tipo,
        ultimaCompra: c.ultima_compra,
        diasSemComprar,
        ticketMedio: Number(c.ticket_medio || 0),
        totalPedidos: Array.isArray(c.pedidos) ? c.pedidos.length : 0,
        valorRecenteTotal: valorTotalRecente,
        situacao: diasSemComprar <= 30 ? 'ATIVO' : 
                  diasSemComprar <= 60 ? 'EM RISCO' : 
                  'CRÍTICO'
      };
    }) || [];

    const contexto = {
      totalClientes: clientes?.length || 0,
      clientesAtivos: clientesAtivos.length,
      clientesInativos: clientesInativos.length,
      clientesEmRisco: clientesEmRisco.length,
      clientesCriticos: clientesCriticos.length,
      clientes: clientesDetalhados
    };

    const prompt = `Você é um Diretor Comercial Sênior da Mutumilk com 15 anos de experiência em vendas B2B de laticínios. Sua missão é criar estratégias agressivas de vendas que maximizem o faturamento e recuperem clientes.

CONTEXTO CRÍTICO:
- Mutumilk é uma INDÚSTRIA de laticínios, não um distribuidor pequeno
- Estabelecimentos comerciais compram VOLUMES GRANDES (caixas fechadas, bags de 28kg)
- Cada cliente perdido = R$ 50-200 mil/ano de faturamento
- Concorrentes estão ativos - se não vendermos, eles vendem

PORTFÓLIO COMPLETO MUTUMILK:
${JSON.stringify(produtos, null, 2)}

INTELIGÊNCIA DE MERCADO - ANÁLISE DETALHADA DOS CLIENTES:
${JSON.stringify(contexto.clientes.sort((a, b) => b.diasSemComprar - a.diasSemComprar), null, 2)}

MISSÃO: Crie uma estratégia de pedidos AGRESSIVA e INTELIGENTE para CADA cliente.

REGRAS DE OURO:
1. PEDIDOS GRANDES: Supermercados compram 50-100kg/semana, padarias 30-50kg, restaurantes 20-40kg
2. PENSE EM GIRO: Cliente ativo = pedido de reposição. Cliente crítico = pedido de reconquista (30-50% maior que o ticket médio)
3. MIX ESTRATÉGICO: Sempre inclua 3-5 produtos diferentes (queijos + cremes + especialidades)
4. MARGEM vs VOLUME: Balance produtos de alta margem (Provolone, Requeijão Premium) com carros-chefe (Mussarela)
5. JUSTIFICATIVA PROFUNDA: Não apenas LISTE produtos, mas EXPLIQUE a estratégia comercial completa

PARA CADA CLIENTE, ANALISE:
- Padrão de compra histórico (queda? crescimento? estável?)
- Potencial não explorado (está comprando pouco comparado ao porte?)
- Perfil do estabelecimento (fluxo alto = mais fatiados, padaria = mais requeijão)
- Urgência comercial (quanto tempo sem comprar = quanto risco de perder?)
- Oportunidade de mix (está comprando só mussarela? Venda Prato, Provolone, Cremes!)

ESTRUTURA DO JSON (OBRIGATÓRIA):
{
  "sugestoes": [
    {
      "nomeCliente": "Nome Exato do Cliente",
      "situacao": "ATIVO" | "EM RISCO" | "CRÍTICO",
      "diasSemComprar": numero,
      "analiseComportamental": "Análise profunda: padrões de compra, mudanças de comportamento, sinais de risco ou oportunidade (3-4 linhas)",
      "pedidoSugerido": [
        {
          "produto": "Nome exato do produto",
          "quantidade": numero_realista_para_industria,
          "precoUnitario": preco_unitario,
          "subtotal": quantidade * precoUnitario,
          "justificativaProduto": "Por que ESTE produto para ESTE cliente neste momento"
        }
      ],
      "valorTotal": soma_dos_subtotais,
      "estrategiaComercial": "Estratégia completa de abordagem: (1) Como abordar o cliente, (2) Argumentos de venda específicos, (3) Objeções previstas e respostas, (4) Urgência da ação (5-6 linhas)",
      "potencialRecuperacao": "Para clientes críticos/em risco: quanto de faturamento mensal/anual pode ser recuperado com sucesso",
      "proximasAcoes": "Lista de 3-4 ações concretas e imediatas que o vendedor deve executar"
    }
  ]
}

EXEMPLOS DE RACIOCÍNIO ESPERADO:

CLIENTE CRÍTICO (90+ dias):
- Pedido: 150-200% do ticket médio (pedido agressivo de reconquista)
- Estratégia: Ofertas irrecusáveis, condições especiais, visita pessoal URGENTE
- Mix: Produtos de entrada (mussarela) + alto valor (provolone) + commodity (creme granel)

CLIENTE EM RISCO (30-60 dias):
- Pedido: 120-150% do ticket médio (reativar antes de perder)
- Estratégia: Ligação proativa, check-in de satisfação, mostrar novidades
- Mix: Reforçar best-sellers + apresentar 1-2 produtos novos

CLIENTE ATIVO:
- Pedido: 100-120% do ticket médio (crescer a conta)
- Estratégia: Upsell e cross-sell, aumentar ticket e frequência
- Mix: Produtos habituais + oportunidades de margem

RETORNE APENAS O JSON, SEM TEXTO ADICIONAL.`;

    console.log('📤 Enviando prompt aprimorado para OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um Diretor Comercial estratégico que retorna APENAS JSON válido, sem markdown ou texto adicional. Suas análises são profundas, baseadas em dados e focadas em maximizar vendas.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erro OpenAI:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analise = data.choices[0].message.content;
    
    console.log('📥 Resposta bruta da IA recebida, tamanho:', analise?.length || 0);
    
    let sugestoesClientes = [];
    try {
      const parsed = JSON.parse(analise);
      console.log('📦 Estrutura do JSON:', Object.keys(parsed));
      
      // Tentar diferentes estruturas possíveis de retorno
      if (Array.isArray(parsed)) {
        sugestoesClientes = parsed;
      } else if (parsed.sugestoes && Array.isArray(parsed.sugestoes)) {
        sugestoesClientes = parsed.sugestoes;
      } else if (parsed.sugestoesPedidos && Array.isArray(parsed.sugestoesPedidos)) {
        sugestoesClientes = parsed.sugestoesPedidos;
      } else if (parsed.sugestoesClientes && Array.isArray(parsed.sugestoesClientes)) {
        sugestoesClientes = parsed.sugestoesClientes;
      } else {
        // Tentar encontrar qualquer array no objeto
        for (const key of Object.keys(parsed)) {
          if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
            console.log('🔍 Encontrado array em:', key);
            sugestoesClientes = parsed[key];
            break;
          }
        }
      }
      
      console.log('📋 Sugestões processadas:', sugestoesClientes.length, 'clientes');
    } catch (e) {
      console.error('❌ Erro ao parsear JSON:', e);
      console.error('📄 Conteúdo bruto:', analise?.substring(0, 500));
      sugestoesClientes = [];
    }

    console.log('✅ Análise gerada com sucesso');

    // Salvar análise no banco
    const { error: insertError } = await supabase
      .from('analises_ia')
      .insert({
        vendedor_id: user.id,
        tipo_analise: 'geral',
        prompt_enviado: prompt,
        resposta_ia: JSON.stringify(sugestoesClientes),
        sugestoes_geradas: { contexto, sugestoesClientes }
      });

    if (insertError) {
      console.error('Erro ao salvar análise:', insertError);
    }

    return new Response(
      JSON.stringify({ sugestoesClientes, contexto }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na função:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
