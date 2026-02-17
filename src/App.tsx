import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";

import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

// Vendedor pages
import VendedorDashboard from "@/pages/vendedor/Dashboard";
import Rota from "@/pages/vendedor/Rota";
import ExecutarRota from "@/pages/vendedor/ExecutarRota";
import HistoricoVisitas from "@/pages/vendedor/HistoricoVisitas";
import Clientes from "@/pages/Clientes";
import Pedidos from "@/pages/Pedidos";
import Analises from "@/pages/Analises";

// Admin pages
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminMapa from "@/pages/admin/Mapa";
import AdminVendedores from "@/pages/admin/Vendedores";
import AdminVendedorDetalhe from "@/pages/admin/VendedorDetalhe";
import AdminProdutos from "@/pages/admin/Produtos";
import AdminRelatorios from "@/pages/admin/Relatorios";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />

            {/* Vendedor routes */}
            <Route element={<ProtectedRoute requiredRole="vendedor" />}>
              <Route path="/" element={<VendedorDashboard />} />
              <Route path="/rota" element={<Rota />} />
              <Route path="/rota/:rotaId/executar" element={<ExecutarRota />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/pedidos" element={<Pedidos />} />
              <Route path="/historico" element={<HistoricoVisitas />} />
              <Route path="/analises" element={<Analises />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/mapa" element={<AdminMapa />} />
              <Route path="/admin/vendedores" element={<AdminVendedores />} />
              <Route path="/admin/vendedores/:id" element={<AdminVendedorDetalhe />} />
              <Route path="/admin/produtos" element={<AdminProdutos />} />
              <Route path="/admin/relatorios" element={<AdminRelatorios />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
