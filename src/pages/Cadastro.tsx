import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/InputCustom";
import { Button } from "@/components/ui/ButtonCustom";
import { useStore } from "@/store/useStore";

export default function Cadastro() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useStore();
  const navigate = useNavigate();

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (field: string, value: string) => {
    if (field === "phone") {
      value = formatPhone(value);
    }
    setFormData({ ...formData, [field]: value });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const success = await register(formData);

      if (success) {
        toast.success("Conta criada com sucesso! 🎉");
        navigate("/jornada");
      } else {
        toast.error("Erro ao criar conta");
      }
    } catch (error) {
      toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 py-8">
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
              Comece sua jornada
            </h1>
            <p className="text-muted-foreground">
              Crie sua conta em segundos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome completo"
              type="text"
              icon={User}
              placeholder="Seu nome"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
            />

            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
            />

            <Input
              label="Telefone/WhatsApp"
              type="tel"
              icon={Phone}
              placeholder="(91) 99999-9999"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              error={errors.phone}
            />

            <Input
              label="Senha"
              type="password"
              icon={Lock}
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={errors.password}
            />

            <Input
              label="Confirmar senha"
              type="password"
              icon={Lock}
              placeholder="Digite a senha novamente"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              CRIAR CONTA
            </Button>
          </form>

          <div className="mt-6 text-center">
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
    </div>
  );
}
