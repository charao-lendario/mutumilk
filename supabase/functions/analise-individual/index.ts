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

    const { clienteId } = await req.json();

    if (!clienteId) {
      throw new Error('ID do cliente não fornecido');
    }

    // Verificar usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }

    console.log('🔍 Iniciando análise individual para cliente:', clienteId);

    // Buscar dados do cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select(`
        *,
        pedidos (
          valor_total,
          data_pedido,
          status,
          itens_pedido (
            quantidade,
            preco_unitario,
            subtotal,
            produto_id,
            produtos (nome, categoria)
          )
        )
      `)
      .eq('id', clienteId)
      .eq('vendedor_id', user.id)
      .single();

    if (clienteError || !cliente) {
      console.error('Erro ao buscar cliente:', clienteError);
      throw new Error('Cliente não encontrado ou sem permissão');
    }

    // Buscar produtos em promoção
    const { data: promocoes } = await supabase
      .from('produtos')
      .select('*')
      .eq('em_promocao', true);

    // Análise de comportamento de compra
    const pedidos = Array.isArray(cliente.pedidos) ? cliente.pedidos : [];
    const produtosMaisComprados = new Map<string, number>();
    
    pedidos.forEach((pedido: any) => {
      if (Array.isArray(pedido.itens_pedido)) {
        pedido.itens_pedido.forEach((item: any) => {
          if (item.produtos) {
            const nome = item.produtos.nome;
            const qtd = produtosMaisComprados.get(nome) || 0;
            produtosMaisComprados.set(nome, qtd + Number(item.quantidade));
          }
        });
      }
    });

    const topProdutos = Array.from(produtosMaisComprados.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nome, qtd]) => ({ nome, quantidade: qtd }));

    const contexto = {
      cliente: {
        nome: cliente.nome,
        tipo: cliente.tipo,
        cnpj: cliente.cnpj,
        contato: cliente.contato,
        dataCadastro: cliente.data_cadastro,
        ultimaCompra: cliente.ultima_compra,
        ticketMedio: cliente.ticket_medio
      },
      historico: {
        totalPedidos: pedidos.length,
        valorTotal: pedidos.reduce((sum: number, p: any) => sum + Number(p.valor_total), 0),
        produtosMaisComprados: topProdutos
      },
      promocoes: promocoes?.map(p => ({ nome: p.nome, precoAtual: p.preco_atual, precoAnterior: p.preco_anterior }))
    };

    const prompt = `Você é um assistente de vendas especializado em laticínios. Faça uma análise profunda do cliente abaixo.

DADOS DO CLIENTE:
${JSON.stringify(contexto.cliente, null, 2)}

HISTÓRICO DE COMPRAS:
${JSON.stringify(contexto.historico, null, 2)}

PRODUTOS EM PROMOÇÃO:
${JSON.stringify(contexto.promocoes, null, 2)}

GERE UMA ANÁLISE COMPLETA COM:

1. **PERFIL COMPORTAMENTAL** (padrão de compras, frequência, preferências)
2. **PRODUTOS RECOMENDADOS** (baseado no histórico e promoções)
3. **ESTRATÉGIA DE ABORDAGEM** (melhor forma de apresentar as ofertas)
4. **SCRIPT DE CONTATO** (exemplo prático de como iniciar a conversa)
5. **ALERTAS** (riscos de perda do cliente ou oportunidades urgentes)

Seja específico, prático e focado em aumentar as vendas com este cliente.`;

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
          { role: 'system', content: 'Você é um assistente de vendas especializado em análise comportamental de clientes B2B de laticínios.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
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
        cliente_id: clienteId,
        tipo_analise: 'individual',
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
