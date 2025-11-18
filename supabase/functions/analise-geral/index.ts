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

    const contexto = {
      totalClientes: clientes?.length || 0,
      clientesAtivos: clientesAtivos.length,
      clientesInativos: clientesInativos.length,
      promocoes: promocoes?.length || 0,
      clientes: clientes?.map(c => ({
        nome: c.nome,
        tipo: c.tipo,
        ultimaCompra: c.ultima_compra,
        ticketMedio: c.ticket_medio,
        totalPedidos: Array.isArray(c.pedidos) ? c.pedidos.length : 0
      }))
    };

    const prompt = `Você é um assistente de vendas especializado em laticínios. Analise os dados abaixo e gere um relatório estratégico para hoje.

DADOS DA CARTEIRA:
- Total de clientes: ${contexto.totalClientes}
- Clientes ativos (últimos 30 dias): ${contexto.clientesAtivos}
- Clientes inativos: ${contexto.clientesInativos}
- Produtos em promoção: ${contexto.promocoes}

CLIENTES DETALHADOS:
${JSON.stringify(contexto.clientes, null, 2)}

GERE UM RELATÓRIO COM:

1. **PRIORIDADES DO DIA** (3-5 clientes para contatar hoje e o motivo)
2. **ALERTAS** (clientes em risco de perda ou oportunidades urgentes)
3. **OPORTUNIDADES** (cross-sell, upsell, reativação)
4. **RESUMO EXECUTIVO** (1 parágrafo com a situação geral)

Seja objetivo, prático e focado em ações concretas que o vendedor pode tomar hoje.`;

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
