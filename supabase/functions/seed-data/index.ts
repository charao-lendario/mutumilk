import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("🌱 Iniciando seed de dados...");

    // Criar Admin
    console.log("📝 Criando usuário admin...");
    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@laticinio.com",
      password: "Admin123",
      email_confirm: true,
      user_metadata: { full_name: "Maria Santos" },
    });

    if (adminError) throw new Error(`Erro ao criar admin: ${adminError.message}`);
    console.log("✅ Admin criado");

    // Inserir profile e role do admin
    await supabaseAdmin.from("profiles").insert({
      id: adminUser.user.id,
      full_name: "Maria Santos",
    });
    await supabaseAdmin.from("user_roles").insert({
      user_id: adminUser.user.id,
      role: "admin",
    });

    // Criar Vendedores
    const vendedores = [
      { email: "vendedor1@laticinio.com", nome: "Carlos Silva" },
      { email: "vendedor2@laticinio.com", nome: "Ana Paula Costa" },
      { email: "vendedor3@laticinio.com", nome: "Roberto Almeida" },
      { email: "vendedor4@laticinio.com", nome: "Juliana Ferreira" },
      { email: "vendedor5@laticinio.com", nome: "Pedro Henrique Souza" },
    ];

    const vendedorIds: string[] = [];

    for (const vendedor of vendedores) {
      console.log(`📝 Criando vendedor: ${vendedor.nome}...`);
      const { data: vendedorUser, error: vendedorError } = await supabaseAdmin.auth.admin.createUser({
        email: vendedor.email,
        password: "Vend123",
        email_confirm: true,
        user_metadata: { full_name: vendedor.nome },
      });

      if (vendedorError) throw new Error(`Erro ao criar vendedor: ${vendedorError.message}`);

      await supabaseAdmin.from("profiles").insert({
        id: vendedorUser.user.id,
        full_name: vendedor.nome,
      });
      await supabaseAdmin.from("user_roles").insert({
        user_id: vendedorUser.user.id,
        role: "vendedor",
      });

      vendedorIds.push(vendedorUser.user.id);
      console.log(`✅ Vendedor ${vendedor.nome} criado`);
    }

    // Buscar produtos para usar nos pedidos
    const { data: produtos } = await supabaseAdmin.from("produtos").select("*");
    if (!produtos || produtos.length === 0) {
      throw new Error("Nenhum produto encontrado na base");
    }

    // Criar clientes e pedidos para cada vendedor
    const tiposCliente = ["supermercado", "mercado", "padaria", "confeitaria", "lanchonete", "restaurante"];
    const nomeClientes = [
      ["Supermercado Preço Bom", "Atacadão Central", "Padaria Pão Quente", "Confeitaria Doce Prazer", 
       "Mercadinho da Esquina", "Lanchonete Sabor & Cia", "Extra Mercado", "Padaria do João", 
       "Restaurante Bom Gosto", "Mercado Bairro Novo"],
      ["Supermercado Economia", "Padaria Sabor Caseiro", "Confeitaria Maria Clara", "Mercado São José",
       "Lanchonete Lanches & Cia", "Restaurante Família", "Supermercado Bem Barato", "Padaria Nosso Pão",
       "Café Colonial", "Mini Mercado Vitória"],
      ["Supermercado Super Compras", "Padaria Massa Mãe", "Confeitaria Sweet Dreams", "Mercado Popular",
       "Lanchonete Hot Dog Premium", "Pizzaria Bella Napoli", "Atacado Gigante", "Padaria Artesanal",
       "Café & Companhia", "Mercadinho Central"],
      ["Supermercado da Família", "Padaria Trigo Dourado", "Confeitaria Arte em Doce", "Mercado 24 Horas",
       "Lanchonete Burger House", "Restaurante Cantina Italiana", "Hiper Mercado", "Padaria Vó Maria",
       "Café Gourmet", "Mercado do Povo"],
      ["Supermercado União", "Padaria Real", "Confeitaria Delícias da Vovó", "Mercado Vila Nova",
       "Lanchonete Sabores", "Restaurante Sabor do Brasil", "Super Atacado", "Padaria Sol Nascente",
       "Café Expresso", "Mercado Estrela"]
    ];

    for (let i = 0; i < vendedorIds.length; i++) {
      const vendedorId = vendedorIds[i];
      console.log(`👥 Criando 10 clientes para vendedor ${i + 1}...`);

      for (let j = 0; j < 10; j++) {
        const tipo = tiposCliente[j % tiposCliente.length];
        const nome = nomeClientes[i][j];
        const cnpj = `${10 + i}${11 + j}.${222 + j}${333 + j}.${444 + j}${555 + j}/0001-${10 + j}${20 + i}`;

        // Inserir cliente
        const { data: cliente } = await supabaseAdmin
          .from("clientes")
          .insert({
            nome,
            tipo,
            cnpj,
            contato: `(11) 9${1000 + i * 100 + j}-${2000 + j}`,
            vendedor_id: vendedorId,
          })
          .select()
          .single();

        if (!cliente) continue;

        // Criar entre 2 e 5 pedidos históricos para cada cliente
        const numPedidos = 2 + Math.floor(Math.random() * 4);
        let ultimaCompra = new Date();
        let totalVendas = 0;

        for (let k = 0; k < numPedidos; k++) {
          // Distribuir pedidos nos últimos 6 meses
          const diasAtras = Math.floor(Math.random() * 180);
          const dataPedido = new Date();
          dataPedido.setDate(dataPedido.getDate() - diasAtras);

          if (dataPedido > ultimaCompra) {
            ultimaCompra = dataPedido;
          }

          // Selecionar 2-6 produtos aleatórios
          const numItens = 2 + Math.floor(Math.random() * 5);
          const produtosSelecionados = [];
          for (let p = 0; p < numItens; p++) {
            const produto = produtos[Math.floor(Math.random() * produtos.length)];
            produtosSelecionados.push(produto);
          }

          // Calcular valor total do pedido
          let valorTotal = 0;
          const itens = produtosSelecionados.map((produto) => {
            const quantidade = 1 + Math.floor(Math.random() * 10);
            const subtotal = Number(produto.preco_atual) * quantidade;
            valorTotal += subtotal;
            return {
              produto_id: produto.id,
              quantidade,
              preco_unitario: produto.preco_atual,
              subtotal,
            };
          });

          totalVendas += valorTotal;

          // Criar pedido
          const { data: pedido } = await supabaseAdmin
            .from("pedidos")
            .insert({
              cliente_id: cliente.id,
              vendedor_id: vendedorId,
              data_pedido: dataPedido.toISOString(),
              valor_total: valorTotal,
              status: "concluido",
            })
            .select()
            .single();

          if (pedido) {
            // Inserir itens do pedido
            const itensComPedidoId = itens.map((item) => ({
              ...item,
              pedido_id: pedido.id,
            }));
            await supabaseAdmin.from("itens_pedido").insert(itensComPedidoId);
          }
        }

        // Atualizar cliente com última compra e ticket médio
        await supabaseAdmin
          .from("clientes")
          .update({
            ultima_compra: ultimaCompra.toISOString(),
            ticket_medio: totalVendas / numPedidos,
          })
          .eq("id", cliente.id);
      }

      console.log(`✅ Clientes e pedidos criados para vendedor ${i + 1}`);
    }

    console.log("🎉 Seed completo!");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Dados de seed criados com sucesso!",
        admin: "admin@laticinio.com / Admin123",
        vendedores: vendedores.map(v => `${v.email} / Vend123`),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Erro no seed:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});