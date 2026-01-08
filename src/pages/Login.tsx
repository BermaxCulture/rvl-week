import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/InputCustom";
import { Button } from "@/components/ui/ButtonCustom";
import { useStore } from "@/store/useStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast.success("Bem-vindo de volta! 🔥");
        navigate("/jornada");
      } else {
        toast.error("Erro ao fazer login");
      }
    } catch (error) {
      toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      {/* Triangle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <polygon
            points="0,100 50,20 100,100"
            fill="rgba(252, 217, 91, 0.3)"
          />
          <polygon
            points="0,100 25,50 50,100"
            fill="rgba(252, 217, 91, 0.2)"
          />
          <polygon
            points="50,100 75,40 100,100"
            fill="rgba(252, 217, 91, 0.25)"
          />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-card rounded-3xl p-8 shadow-cartoon-lg border-3 border-foreground/10">
          <div className="text-center mb-8">
            <Link to="/">
              <Logo size="lg" className="mx-auto mb-6" />
            </Link>
            <h1 className="font-display font-bold text-2xl text-primary mb-2">
              Entre na sua jornada
            </h1>
            <p className="text-muted-foreground">
              Continue de onde você parou
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Senha"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              ENTRAR
            </Button>
          </form>

          <div className="mt-6 text-center">
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
