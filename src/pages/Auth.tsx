import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { SparklesCore } from "@/components/ui/sparkles";
import { Shield, User, Users } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, user, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) {
    navigate(userRole === "admin" ? "/admin" : "/");
    return null;
  }

  const handleQuickLogin = async (loginEmail: string, loginPassword: string, role: string) => {
    setIsLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast.success("Login realizado com sucesso!");
      navigate(role === "admin" ? "/admin" : "/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast.success("Login realizado com sucesso!");
      const stored = localStorage.getItem("mutumilk-auth");
      const role = stored ? JSON.parse(stored).role : "vendedor";
      navigate(role === "admin" ? "/admin" : "/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={60}
          className="w-full h-full"
          particleColor="#60a5fa"
          speed={0.8}
        />
      </div>

      <Card className="w-full max-w-md glass-strong gradient-border relative z-10">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-3xl font-bold text-gradient">MutuMilk</CardTitle>
          <CardDescription>Gestao Comercial Inteligente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Login Buttons */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center font-semibold uppercase tracking-wider">Acesso Rapido</p>
            <div className="grid gap-2">
              <Button
                onClick={() => handleQuickLogin("admin@laticinio.com", "Admin123", "admin")}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20"
                size="lg"
              >
                <Shield className="h-4 w-4 mr-2" />
                Entrar como Admin
              </Button>
              <Button
                onClick={() => handleQuickLogin("vendedor1@laticinio.com", "Vend123", "vendedor")}
                disabled={isLoading}
                variant="outline"
                className="w-full border-sky-500/30 text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/50"
                size="lg"
              >
                <User className="h-4 w-4 mr-2" />
                Entrar como Vendedor 1 (Carlos)
              </Button>
              <Button
                onClick={() => handleQuickLogin("vendedor2@laticinio.com", "Vend123", "vendedor")}
                disabled={isLoading}
                variant="outline"
                className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                size="lg"
              >
                <Users className="h-4 w-4 mr-2" />
                Entrar como Vendedor 2 (Ana Paula)
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/80 px-2 text-muted-foreground">ou entre manualmente</span>
            </div>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Senha</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">
              Demo Mode - Dados simulados para demonstracao
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
