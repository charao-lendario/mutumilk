import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { SparklesCore } from "@/components/ui/sparkles";

export default function Auth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Verifica se já existem dados
        const { data: existingUsers } = await supabase.from("profiles").select("id").limit(1);
        
        if (!existingUsers || existingUsers.length === 0) {
          console.log("Inicializando dados de teste...");
          
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-data`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            console.error("Erro ao inicializar dados:", data.error);
          } else {
            toast.success("Sistema inicializado! Use as credenciais de exemplo para fazer login.");
          }
        }
      } catch (error) {
        console.error("Erro na inicialização:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeData();
  }, []);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Login realizado com sucesso!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Cadastro realizado! Você já pode fazer login.");
        setEmail("");
        setPassword("");
        setFullName("");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-full bg-background flex flex-col items-center justify-center overflow-hidden">
        <div className="w-full absolute inset-0 h-screen">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#60a5fa"
            speed={1}
          />
        </div>
        <div className="relative z-20 flex flex-col items-center gap-4">
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold text-center text-foreground">
            MutuMilk
          </h1>
          <div className="w-[40rem] h-40 relative">
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-primary to-transparent h-[2px] w-3/4 blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-primary to-transparent h-px w-3/4" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-[5px] w-1/4 blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px w-1/4" />
          </div>
          <p className="text-muted-foreground text-lg animate-pulse">Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-2xl">Sistema de Gestão Comercial</CardTitle>
          <CardDescription>Gestão Inteligente para Laticínios</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground text-center">Credenciais de Teste:</p>
              <div className="bg-muted/50 rounded-md p-3 space-y-1">
                <p><strong>Admin:</strong> admin@laticinio.com / Admin123</p>
                <p><strong>Vendedor:</strong> vendedor1@laticinio.com / Vend123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}