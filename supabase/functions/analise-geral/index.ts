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

    const prompt = `Você é um assistente comercial especializado em laticínios da Mutumilk. Analise os clientes abaixo e gere sugestões de pedidos personalizadas baseadas no histórico de compras de cada um.

PORTFÓLIO DISPONÍVEL:
${JSON.stringify(produtos, null, 2)}

CLIENTES E HISTÓRICO:
${JSON.stringify(contexto.clientes.sort((a, b) => b.diasSemComprar - a.diasSemComprar), null, 2)}

Para cada cliente, sugira um pedido realista considerando:
1. Histórico de ticket médio
2. Dias sem comprar (clientes críticos precisam de ofertas agressivas)
3. Tipo de estabelecimento
4. Produtos mais adequados ao perfil

IMPORTANTE: Retorne APENAS um array JSON válido, sem texto adicional. Cada objeto deve ter:
- nomeCliente: string
- situacao: "ATIVO" | "EM RISCO" | "CRÍTICO"
- diasSemComprar: number
- pedidoSugerido: array de objetos com {produto, quantidade, precoUnitario, subtotal}
- valorTotal: number
- justificativa: string (máximo 2 linhas explicando a estratégia)`;

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
          { role: 'system', content: 'Você é um assistente de vendas que retorna APENAS JSON válido, sem markdown ou texto adicional.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
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
    
    let sugestoesClientes;
    try {
      const parsed = JSON.parse(analise);
      sugestoesClientes = parsed.sugestoes || parsed;
    } catch (e) {
      console.error('Erro ao parsear JSON:', e);
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
