-- Create enum types
CREATE TYPE public.app_role AS ENUM ('vendedor', 'admin');
CREATE TYPE public.tipo_cliente AS ENUM ('supermercado', 'mercado', 'padaria', 'confeitaria', 'lanchonete', 'restaurante');
CREATE TYPE public.status_pedido AS ENUM ('concluido', 'pendente', 'cancelado');
CREATE TYPE public.tipo_analise AS ENUM ('geral', 'individual');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create produtos table
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  preco_atual DECIMAL(10,2) NOT NULL,
  preco_anterior DECIMAL(10,2) NOT NULL,
  unidade TEXT NOT NULL,
  em_promocao BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create clientes table
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo tipo_cliente NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  contato TEXT,
  vendedor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_cadastro TIMESTAMPTZ DEFAULT now() NOT NULL,
  ultima_compra TIMESTAMPTZ,
  ticket_medio DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create pedidos table
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  vendedor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_pedido TIMESTAMPTZ DEFAULT now() NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  status status_pedido DEFAULT 'concluido',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create itens_pedido table
CREATE TABLE public.itens_pedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create analises_ia table
CREATE TABLE public.analises_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  tipo_analise tipo_analise NOT NULL,
  prompt_enviado TEXT NOT NULL,
  resposta_ia TEXT NOT NULL,
  sugestoes_geradas JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analises_ia ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for produtos
CREATE POLICY "Everyone can view produtos"
  ON public.produtos FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage produtos"
  ON public.produtos FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for clientes
CREATE POLICY "Vendedores can view their own clientes"
  ON public.clientes FOR SELECT
  USING (auth.uid() = vendedor_id);

CREATE POLICY "Admins can view all clientes"
  ON public.clientes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Vendedores can update their own clientes"
  ON public.clientes FOR UPDATE
  USING (auth.uid() = vendedor_id);

-- RLS Policies for pedidos
CREATE POLICY "Vendedores can view their own pedidos"
  ON public.pedidos FOR SELECT
  USING (auth.uid() = vendedor_id);

CREATE POLICY "Admins can view all pedidos"
  ON public.pedidos FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for itens_pedido
CREATE POLICY "Users can view itens from their pedidos"
  ON public.itens_pedido FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pedidos
      WHERE pedidos.id = itens_pedido.pedido_id
        AND (pedidos.vendedor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

-- RLS Policies for analises_ia
CREATE POLICY "Vendedores can view their own analises"
  ON public.analises_ia FOR SELECT
  USING (auth.uid() = vendedor_id);

CREATE POLICY "Vendedores can insert their own analises"
  ON public.analises_ia FOR INSERT
  WITH CHECK (auth.uid() = vendedor_id);

CREATE POLICY "Admins can view all analises"
  ON public.analises_ia FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_clientes_vendedor ON public.clientes(vendedor_id);
CREATE INDEX idx_pedidos_cliente ON public.pedidos(cliente_id);
CREATE INDEX idx_pedidos_vendedor ON public.pedidos(vendedor_id);
CREATE INDEX idx_pedidos_data ON public.pedidos(data_pedido);
CREATE INDEX idx_itens_pedido ON public.itens_pedido(pedido_id);
CREATE INDEX idx_analises_vendedor ON public.analises_ia(vendedor_id);
CREATE INDEX idx_analises_data ON public.analises_ia(created_at);