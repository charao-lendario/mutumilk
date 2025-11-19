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

    // Criar ou buscar Admin
    console.log("📝 Verificando usuário admin...");
    let adminUserId: string;
    
    const { data: existingAdminList } = await supabaseAdmin.auth.admin.listUsers();
    const existingAdmin = existingAdminList?.users.find(u => u.email === "admin@laticinio.com");
    
    if (existingAdmin) {
      console.log("✅ Admin já existe, usando usuário existente");
      adminUserId = existingAdmin.id;
    } else {
      const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
        email: "admin@laticinio.com",
        password: "Admin123",
        email_confirm: true,
        user_metadata: { full_name: "Maria Santos" },
      });

      if (adminError) throw new Error(`Erro ao criar admin: ${adminError.message}`);
      adminUserId = adminUser.user.id;
      console.log("✅ Admin criado");

      // Inserir profile e role do admin
      await supabaseAdmin.from("profiles").upsert({
        id: adminUserId,
        full_name: "Maria Santos",
      });
      await supabaseAdmin.from("user_roles").upsert({
        user_id: adminUserId,
        role: "admin",
      });
    }

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
      console.log(`📝 Verificando vendedor: ${vendedor.nome}...`);
      
      const existingVendedor = existingAdminList?.users.find(u => u.email === vendedor.email);
      
      if (existingVendedor) {
        console.log(`✅ Vendedor ${vendedor.nome} já existe`);
        vendedorIds.push(existingVendedor.id);
      } else {
        const { data: vendedorUser, error: vendedorError } = await supabaseAdmin.auth.admin.createUser({
          email: vendedor.email,
          password: "Vend123",
          email_confirm: true,
          user_metadata: { full_name: vendedor.nome },
        });

        if (vendedorError) throw new Error(`Erro ao criar vendedor: ${vendedorError.message}`);

        await supabaseAdmin.from("profiles").upsert({
          id: vendedorUser.user.id,
          full_name: vendedor.nome,
        });
        await supabaseAdmin.from("user_roles").upsert({
          user_id: vendedorUser.user.id,
          role: "vendedor",
        });

        vendedorIds.push(vendedorUser.user.id);
        console.log(`✅ Vendedor ${vendedor.nome} criado`);
      }
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

        // PERFIS MAIS REALISTAS COM FOCO EM PROBLEMAS (60% clientes com problemas)
        // Distribuição: 20% ótimo, 20% bom, 25% em risco, 20% crítico, 15% perdido
        let perfilCliente: number;
        const rand = j % 10;
        if (rand < 2) {
          perfilCliente = 0; // Ótimo (20%)
        } else if (rand < 4) {
          perfilCliente = 1; // Bom (20%)
        } else if (rand < 6) {
          perfilCliente = 2; // Regular/Em Risco (20%)
        } else if (rand < 8) {
          perfilCliente = 3; // Crítico (20%)
        } else if (rand < 9) {
          perfilCliente = 4; // Inativo (10%)
        } else {
          perfilCliente = 5; // Perdido (10%)
        }
        
        let numPedidos: number;
        let diasUltimaCompra: number;
        
        if (perfilCliente === 0) {
          // ÓTIMO: Crescimento constante, compra frequente, ticket alto
          numPedidos = 8 + Math.floor(Math.random() * 4); // 8-11 pedidos
          diasUltimaCompra = Math.floor(Math.random() * 7); // 0-7 dias
        } else if (perfilCliente === 1) {
          // BOM: Cliente estável, compra regular
          numPedidos = 5 + Math.floor(Math.random() * 3); // 5-7 pedidos
          diasUltimaCompra = 8 + Math.floor(Math.random() * 15); // 8-22 dias
        } else if (perfilCliente === 2) {
          // EM RISCO: Frequência caindo, ticket diminuindo, precisa atenção
          numPedidos = 4 + Math.floor(Math.random() * 2); // 4-5 pedidos
          diasUltimaCompra = 35 + Math.floor(Math.random() * 25); // 35-59 dias (ALERTA!)
        } else if (perfilCliente === 3) {
          // CRÍTICO: Parou de comprar, última compra há muito tempo
          numPedidos = 2 + Math.floor(Math.random() * 2); // 2-3 pedidos
          diasUltimaCompra = 60 + Math.floor(Math.random() * 40); // 60-99 dias (URGENTE!)
        } else if (perfilCliente === 4) {
          // INATIVO: Cliente praticamente perdido
          numPedidos = 1 + Math.floor(Math.random() * 2); // 1-2 pedidos
          diasUltimaCompra = 100 + Math.floor(Math.random() * 50); // 100-149 dias (CRÍTICO!)
        } else {
          // PERDIDO: Cliente completamente inativo, pode ter mudado de fornecedor
          numPedidos = 1;
          diasUltimaCompra = 150 + Math.floor(Math.random() * 60); // 150-209 dias (PERDIDO!)
        }

        let ultimaCompra = new Date();
        let totalVendas = 0;

        for (let k = 0; k < numPedidos; k++) {
          // Distribuir pedidos de forma realista baseado no perfil
          let diasAtras: number;
          
          if (k === 0) {
            // Primeira iteração é a última compra
            diasAtras = diasUltimaCompra;
          } else if (perfilCliente === 0) {
            // ÓTIMO: Compras frequentes e regulares (a cada 7-15 dias)
            diasAtras = diasUltimaCompra + (k * (7 + Math.floor(Math.random() * 8)));
          } else if (perfilCliente === 1) {
            // BOM: Compras regulares (a cada 15-25 dias)
            diasAtras = diasUltimaCompra + (k * (15 + Math.floor(Math.random() * 10)));
          } else if (perfilCliente === 2) {
            // EM RISCO: Espaçamento CRESCENTE entre compras (problemas visíveis)
            diasAtras = diasUltimaCompra + (k * (25 + k * 10 + Math.floor(Math.random() * 15)));
          } else if (perfilCliente === 3) {
            // CRÍTICO: Compras muito espaçadas e irregulares
            diasAtras = diasUltimaCompra + (k * (40 + Math.floor(Math.random() * 30)));
          } else if (perfilCliente === 4) {
            // INATIVO: Compras raríssimas
            diasAtras = diasUltimaCompra + (k * (60 + Math.floor(Math.random() * 40)));
          } else {
            // PERDIDO: Compras antigas e esporádicas
            diasAtras = diasUltimaCompra + (k * (80 + Math.floor(Math.random() * 50)));
          }
          
          const dataPedido = new Date();
          dataPedido.setDate(dataPedido.getDate() - diasAtras);

          if (k === 0) {
            ultimaCompra = dataPedido;
          }

          // Selecionar produtos baseado no perfil e SIMULAR QUEDA
          let numItens: number;
          let quantidadeMultiplicador: number;
          
          if (perfilCliente === 0) {
            // ÓTIMO: Muitos itens, quantidades crescentes
            numItens = 5 + Math.floor(Math.random() * 6);
            quantidadeMultiplicador = 1.2 + (k * 0.15); // CRESCE a cada pedido
          } else if (perfilCliente === 1) {
            // BOM: Itens e quantidades estáveis
            numItens = 4 + Math.floor(Math.random() * 4);
            quantidadeMultiplicador = 1.0;
          } else if (perfilCliente === 2) {
            // EM RISCO: Quantidade CAI drasticamente, menos itens
            numItens = 2 + Math.floor(Math.random() * 3);
            quantidadeMultiplicador = Math.max(0.3, 1.0 - (k * 0.15)); // CAI a cada pedido
          } else if (perfilCliente === 3) {
            // CRÍTICO: Pedidos muito pequenos e esporádicos
            numItens = 1 + Math.floor(Math.random() * 2);
            quantidadeMultiplicador = Math.max(0.2, 0.6 - (k * 0.1));
          } else if (perfilCliente === 4) {
            // INATIVO: Pedido mínimo
            numItens = 1 + Math.floor(Math.random() * 2);
            quantidadeMultiplicador = 0.3;
          } else {
            // PERDIDO: Pedido ínfimo
            numItens = 1;
            quantidadeMultiplicador = 0.2;
          }
          
          const produtosSelecionados = [];
          for (let p = 0; p < numItens; p++) {
            const produto = produtos[Math.floor(Math.random() * produtos.length)];
            produtosSelecionados.push(produto);
          }

          // Calcular valor total do pedido
          let valorTotal = 0;
          const itens = produtosSelecionados.map((produto) => {
            const quantidadeBase = 2 + Math.floor(Math.random() * 8);
            const quantidade = Math.max(1, Math.floor(quantidadeBase * quantidadeMultiplicador));
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