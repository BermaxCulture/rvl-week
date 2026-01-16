import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/InputCustom";
import { Button } from "@/components/ui/ButtonCustom";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/jornada";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    await login(email, password);
    // Note: useAuth.login handles its own success toast and isLoading
    // We navigate based on isAuthenticated in a useEffect or here if we know it succeeded
  };

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AnimatedGradientBackground
        Breathing={true}
        gradientColors={["#020617", "#2e1065", "#581c87", "#7e22ce", "#fcd95b", "#fbbf24", "#7e22ce"]}
        gradientStops={[35, 50, 60, 70, 85, 95, 100]}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        <div className="bg-card/95 backdrop-blur-sm rounded-3xl p-5 shadow-cartoon-lg border-3 border-foreground/10">
          <div className="text-center mb-4">
            <Link to="/">
              <Logo size="md" className="mx-auto mb-3" />
            </Link>
            <h1 className="font-display font-bold text-xl text-primary mb-1">
              Entre na sua jornada
            </h1>
            <p className="text-muted-foreground text-sm">
              Continue de onde você parou
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="py-2.5"
            />

            <Input
              label="Senha"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="py-2.5"
            />

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isLoading}
              className="mt-2"
            >
              ENTRAR
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-muted-foreground">
              Não tem conta?{" "}
              <Link
                to="/cadastro"
                className="text-secondary font-bold hover:underline"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-foreground/70 hover:text-foreground">
            ← Voltar para o início
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
