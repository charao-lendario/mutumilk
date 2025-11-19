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

    // Buscar produtos em promoção
    const { data: promocoes } = await supabase
      .from('produtos')
      .select('*')
      .eq('em_promocao', true);

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
      promocoes: promocoes?.length || 0,
      clientes: clientesDetalhados
    };

    const prompt = `IDENTIDADE E MISSÃO CENTRAL
Você é o ComercialMaster Analytics, um agente de inteligência comercial especializado em indústrias de laticínios de Minas Gerais, combinando análise comportamental de clientes, performance de vendedores e inteligência de mercado para gerar relatórios acionáveis que transformam dados em vendas.

⚠️ FOCO CRÍTICO: Esta carteira tem PROBLEMAS SÉRIOS! Sua missão é identificar com precisão cirúrgica os clientes em risco e criar planos de ação imediatos.

DADOS DA CARTEIRA (SITUAÇÃO ATUAL):
- Total de clientes: ${contexto.totalClientes}
- ✅ Clientes ativos (últimos 30 dias): ${contexto.clientesAtivos} (${Math.round((contexto.clientesAtivos / contexto.totalClientes) * 100)}%)
- ⚠️ Clientes EM RISCO (30-60 dias): ${contexto.clientesEmRisco} (${Math.round((contexto.clientesEmRisco / contexto.totalClientes) * 100)}%)
- 🚨 Clientes CRÍTICOS (+60 dias): ${contexto.clientesCriticos} (${Math.round((contexto.clientesCriticos / contexto.totalClientes) * 100)}%)
- 📦 Produtos em promoção: ${contexto.promocoes}

🔴 ALERTA: ${contexto.clientesEmRisco + contexto.clientesCriticos} clientes (${Math.round(((contexto.clientesEmRisco + contexto.clientesCriticos) / contexto.totalClientes) * 100)}%) PRECISAM ATENÇÃO URGENTE!

CLIENTES DETALHADOS (ordenados por prioridade de ação):
${JSON.stringify(contexto.clientes.sort((a, b) => b.diasSemComprar - a.diasSemComprar), null, 2)}

Com base nos dados acima, gere um relatório comercial FOCADO EM RESOLVER PROBLEMAS seguindo esta estrutura:

## 🚨 SITUAÇÃO CRÍTICA DA CARTEIRA
- Análise BRUTAL da situação: Quantos % da carteira estão em risco real?
- ALERTAS CRÍTICOS prioritizados por urgência e potencial de perda:
  - 🔴 URGENTE (Perda iminente - Ligar HOJE)
  - 🟡 ATENÇÃO (Em declínio - Agendar esta semana)
  - 🟢 OPORTUNIDADE (Crescimento possível)

## 🔥 TOP 5 CLIENTES MAIS CRÍTICOS (LIGAR HOJE!)
Para CADA cliente em situação crítica, forneça:
- **Nome e Situação**: Quantos dias sem comprar? Quanto está perdendo?
- **Por que está sumindo**: Análise comportamental (padrão de queda, sinais de alerta)
- **SCRIPT DE RECUPERAÇÃO**: O que falar na ligação para reconquistar
  - Abordagem: Como iniciar a conversa (sem ser insistente)
  - Oferta irrecusável: Promoção personalizada que ele não pode recusar
  - Objeções previstas: O que ele pode falar e como responder
- **Meta desta ação**: Quanto R$ recuperar com este cliente
- **Prazo**: Quando DEVE ligar (HOJE, Amanhã, Esta semana)

## 💰 OPORTUNIDADES DE ALTO VALOR
- Clientes com maior potencial não explorado
- Estratégias específicas de abordagem
- Produtos-chave e argumentos de venda

## ⚠️ CLIENTES EM ZONA DE RISCO
- Sinais de alerta identificados
- Ações recomendadas para retenção

## 📊 ANÁLISE DE PERFORMANCE
- Padrões de venda identificados
- Categorias com melhor/pior performance
- Recomendações estratégicas

## 🆕 PRODUTOS PARA FOCAR
- Lançamentos e promoções
- Produtos de alta margem subutilizados
- Clientes ideais para cada produto

## 📞 ROTEIRO SUGERIDO
- Sequência otimizada de contatos do dia
- Timing ideal para cada cliente
- Dicas de otimização de rota

## 💡 INSIGHTS E APRENDIZADOS
- Padrões comportamentais identificados
- Sugestões estratégicas baseadas em evidências

## ✅ RESUMO: O QUE FAZER AGORA
Lista priorizada de ações imediatas com potencial de faturamento.

Seja objetivo, prático e focado em ações concretas. Use linguagem motivacional e personalizada para o contexto de laticínios em Minas Gerais.`;

    console.log('📤 Enviando prompt para OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um assistente de vendas especializado em análise de dados comerciais para laticínios.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erro OpenAI:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analise = data.choices[0].message.content;

    console.log('✅ Análise gerada com sucesso');

    // Salvar análise no banco
    const { error: insertError } = await supabase
      .from('analises_ia')
      .insert({
        vendedor_id: user.id,
        tipo_analise: 'geral',
        prompt_enviado: prompt,
        resposta_ia: analise,
        sugestoes_geradas: contexto
      });

    if (insertError) {
      console.error('Erro ao salvar análise:', insertError);
    }

    return new Response(
      JSON.stringify({ analise, contexto }),
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
