import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Milk } from "lucide-react";

export default function Index() {
  const { user, isLoading, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Milk className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Gestão Comercial</h1>
              <p className="text-sm text-muted-foreground">
                {userRole === "admin" ? "Painel Administrativo" : "Dashboard do Vendedor"}
              </p>
            </div>
          </div>
          <Button onClick={signOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo!</CardTitle>
            <CardDescription>
              Sistema configurado e pronto para uso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Você está logado como: <strong>{user.email}</strong></p>
              <p>Perfil: <strong className="capitalize">{userRole}</strong></p>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-semibold mb-2">Próximos passos:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Dashboard com métricas será implementado</li>
                  <li>• Análise de IA com OpenAI gpt-4.1-mini</li>
                  <li>• Gestão de clientes e pedidos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
