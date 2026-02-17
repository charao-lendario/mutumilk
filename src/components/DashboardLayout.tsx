import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function DashboardLayout({ title, subtitle, children, actions }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-white/[0.06] bg-card/30 backdrop-blur-xl sticky top-0 z-10 shrink-0">
            <div className="px-4 md:px-6 lg:px-8 py-4 flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-bold tracking-tight">{title}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
              </div>
              {actions}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
