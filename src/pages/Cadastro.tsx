import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertTriangle, Check, X, Church } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/InputCustom";
import { Button } from "@/components/ui/ButtonCustom";
import { useAuth } from "@/hooks/useAuth";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";

export default function Cadastro() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    isMember: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Usuário autenticado após cadastro - verificando pending...');
      const pending = localStorage.getItem('pending_unlock');
      if (pending) {
        try {
          const { day, token } = JSON.parse(pending);
          console.log('🔓 Pending unlock encontrado:', pending);
          navigate(`/unlock?day=${day}&token=${token}`, { replace: true });
        } catch (e) {
          console.error('❌ Erro ao parsear pending_unlock:', e);
          navigate("/jornada", { replace: true });
        }
      } else {
        console.log('ℹ️ Nenhum pending unlock - indo para jornada');
        navigate("/jornada", { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  // Validação em tempo real (Debounce) para as senhas
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "As senhas não coincidem" }));
      } else if (formData.password === formData.confirmPassword) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.password, formData.confirmPassword]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (field: string, value: string) => {
    let finalValue = value;
    if (field === "phone") {
      finalValue = formatPhone(value);
    }
    setFormData({ ...formData, [field]: finalValue });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação geral
    if (!validate()) return;

    // Verificação extra de segurança para as senhas antes de abrir o modal
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas precisam ser iguais!");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalRegister = async () => {
    setIsLoading(true);
    try {
      const success = await register(formData);
      if (success) {
        toast.success("Conta criada com sucesso! 🚀");
      }
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8 relative">
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
              Comece sua jornada
            </h1>
            <p className="text-muted-foreground text-sm">
              Crie sua conta em segundos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              label="Nome completo"
              type="text"
              icon={User}
              placeholder="Seu nome"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
              className="py-2.5"
            />

            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              className="py-2.5"
            />

            <Input
              label="Telefone/WhatsApp"
              type="tel"
              icon={Phone}
              placeholder="(91) 99999-9999"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              error={errors.phone}
              className="py-2.5"
            />

            <Input
              label="Senha"
              type="password"
              icon={Lock}
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={errors.password}
              className="py-2.5"
            />

            <Input
              label="Confirmar senha"
              type="password"
              icon={Lock}
              placeholder="Digite a senha novamente"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
              className="py-2.5"
            />

            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-xl border-2 border-border/50 hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => setFormData({ ...formData, isMember: !formData.isMember })}>
              <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${formData.isMember ? 'bg-primary text-primary-foreground' : 'bg-muted border-2 border-border'}`}>
                {formData.isMember && <Check className="w-4 h-4" />}
              </div>
              <span className="text-sm font-semibold select-none">Sou membro na Link Church</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isLoading}
              className="mt-2"
            >
              CRIAR CONTA
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-muted-foreground">
              Já tem conta?{" "}
              <Link
                to="/login"
                className="text-primary font-bold hover:underline"
              >
                Entrar
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

      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-card border-3 border-primary/20 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent" />

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-bold text-2xl text-foreground">
                  Confirme seus dados
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Verifique se está tudo correto antes de prosseguir
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Nome</p>
                        <p className="font-bold text-foreground break-words">{formData.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Email</p>
                        <p className="font-bold text-foreground break-all">{formData.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Telefone</p>
                        <p className="font-bold text-foreground">{formData.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Senha</p>
                          <p className="font-mono font-bold text-foreground">
                            {showPassword ? formData.password : "••••••••"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                        <Church className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Status</p>
                        <p className="font-bold text-foreground">
                          {formData.isMember ? "Membro na Link Church" : "Visitante"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-500/80 font-medium leading-relaxed">
                    Certifique-se de que seu email está correto, pois ele será necessário para acessar sua conta futuramente.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowConfirmModal(false)}
                  className="rounded-2xl border-2"
                >
                  CORRIGIR
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleFinalRegister}
                  isLoading={isLoading}
                  className="rounded-2xl shadow-lg shadow-primary/20"
                >
                  CONFIRMAR
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
