import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/InputCustom";
import { Button } from "@/components/ui/ButtonCustom";
import { useAuth } from "@/hooks/useAuth";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { updatePassword, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.error("Preencha todos os campos");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }

        if (password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        const success = await updatePassword(password);
        if (success) {
            navigate("/login", { replace: true });
        }
    };

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
                            Nova Senha
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Digite sua nova senha abaixo
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <Input
                            label="Nova Senha"
                            type="password"
                            icon={Lock}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="py-2.5"
                        />

                        <Input
                            label="Confirmar Senha"
                            type="password"
                            icon={Lock}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="py-2.5"
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            fullWidth
                            isLoading={isLoading}
                            className="mt-4"
                        >
                            ATUALIZAR SENHA
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
