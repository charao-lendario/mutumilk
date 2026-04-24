import React from "react";
import {
  LayoutDashboard, LogOut, Users, ShoppingCart,
  Package, Sparkles, BarChart3, Map, History,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/mutumilk_logo.png";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const vendedorMainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, end: true },
  { title: "Minha Rota", url: "/rota", icon: Map, end: false },
  { title: "Clientes", url: "/clientes", icon: Users, end: true },
  { title: "Pedidos", url: "/pedidos", icon: ShoppingCart, end: true },
];

const vendedorToolItems = [
  { title: "Historico", url: "/historico", icon: History, end: true },
  { title: "Analises IA", url: "/analises", icon: Sparkles, end: true },
];

const adminMainItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Mapa ao Vivo", url: "/admin/mapa", icon: Map, end: true },
  { title: "Vendedores", url: "/admin/vendedores", icon: Users, end: false },
];

const adminToolItems = [
  { title: "Produtos", url: "/admin/produtos", icon: Package, end: true },
  { title: "Relatorios", url: "/admin/relatorios", icon: BarChart3, end: true },
];

type NavItem = { title: string; url: string; icon: React.ElementType; end: boolean };

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, userRole, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

  const mainItems = isAdmin ? adminMainItems : vendedorMainItems;
  const toolItems = isAdmin ? adminToolItems : vendedorToolItems;

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "MM";

  const displayName = user?.full_name || (isAdmin ? "Administrador" : "Vendedor");

  const handleSignOut = () => {
    signOut();
    navigate("/auth");
  };

  const renderItem = (item: NavItem) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          end={item.end}
          className="group flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-slate-200/70 transition-all duration-200"
          activeClassName="bg-sidebar-primary/10 text-sidebar-primary border border-sidebar-primary/20"
        >
          <item.icon className="h-4 w-4 shrink-0 group-hover:text-sidebar-primary transition-colors" />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-center">
          <img
            src={logo}
            alt="MutuMilk"
            className={`object-contain transition-all duration-300 ${collapsed ? 'h-8 w-auto' : 'h-12 w-auto'}`}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3 mb-1">
              Principal
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && <Separator className="my-3 bg-slate-200" />}

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3 mb-1">
              Ferramentas
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-3">
        <div className="space-y-2">
          {!collapsed && user && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-700 to-blue-900 flex items-center justify-center shrink-0 shadow-lg shadow-red-700/20">
                <span className="text-xs font-bold text-white">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            size={collapsed ? "sm" : "default"}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2 text-sm">Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
