import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowRight, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/ButtonCustom";
import { useAuth } from "@/hooks/useAuth";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";

export default function VerifyEmail() {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    const { verifyEmail, resendOTP } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate("/cadastro");
            return;
        }

        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [email, navigate]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
        const newCode = [...code];
        pastedData.forEach((char, i) => {
            if (/^\d$/.test(char)) {
                newCode[i] = char;
            }
        });
        setCode(newCode);
        if (pastedData.length > 0) {
            inputs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const verificationCode = code.join("");

        if (verificationCode.length !== 6) {
            toast.error("Por favor, insira o código completo");
            return;
        }

        setIsLoading(true);
        try {
            const success = await verifyEmail(email, verificationCode);
            if (success) {
                toast.success("Email verificado com sucesso! Bem-vindo!");
                navigate("/jornada");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        const success = await resendOTP(email);
        if (success) {
            setTimer(60);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            <AnimatedGradientBackground
                animateEntrance={false}
                Breathing={true}
                gradientColors={["#020617", "#2e1065", "#581c87", "#7e22ce", "#fcd95b", "#fbbf24", "#7e22ce"]}
                gradientStops={[35, 50, 60, 70, 85, 95, 100]}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-sm"
            >
                <div className="bg-card/95 backdrop-blur-sm rounded-3xl p-5 md:p-8 shadow-cartoon-lg border-3 border-foreground/10">
                    <div className="text-center mb-6">
                        <Link to="/">
                            <Logo size="md" className="mx-auto mb-4" />
                        </Link>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="font-display font-bold text-2xl text-foreground mb-2">
                            Verifique seu email
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Enviamos um código de 6 dígitos para <br />
                            <span className="font-bold text-foreground">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-between gap-1 sm:gap-2">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-muted/30 border-2 border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                />
                            ))}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            isLoading={isLoading}
                            disabled={code.some(d => !d)}
                            icon={ArrowRight}
                            iconPosition="right"
                        >
                            VERIFICAR CÓDIGO
                        </Button>
                    </form>

                    <div className="mt-8 text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Não recebeu o código?{" "}
                            {timer > 0 ? (
                                <span className="text-primary font-bold">Aguarde {timer}s</span>
                            ) : (
                                <button
                                    onClick={handleResend}
                                    className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                                >
                                    <RefreshCw className="w-3 h-3" /> Reenviar
                                </button>
                            )}
                        </p>

                        <Link
                            to="/cadastro"
                            className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Usar outro email
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
