import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { qrcodeService } from '@/services/qrcode.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UnlockPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [status, setStatus] = useState<'loading' | 'success' | 'needs_auth' | 'error'>('loading');
    const [dayNumber, setDayNumber] = useState<number | null>(null);
    const [points, setPoints] = useState<number>(0);
    const [message, setMessage] = useState('Processando seu acesso...');

    useEffect(() => {
        handleUnlock();
    }, [isAuthenticated]);

    const handleUnlock = async () => {
        try {
            const day = parseInt(searchParams.get('day') || '0');
            const token = searchParams.get('token') || '';

            if (!day || !token) {
                toast.error('Link inválido ou incompleto');
                navigate('/jornada');
                return;
            }

            // Se NÃO está autenticado, redirecionar para cadastro/login
            if (!isAuthenticated) {
                setStatus('needs_auth');
                setDayNumber(day);

                // Salvar params no localStorage para usar após login/cadastro
                localStorage.setItem('pending_unlock', JSON.stringify({ day, token }));

                // Redirecionar após 2 segundos
                setTimeout(() => {
                    navigate('/cadastro', {
                        state: {
                            from: `/unlock?day=${day}&token=${token}`,
                            message: 'Complete seu cadastro para desbloquear o dia!'
                        }
                    });
                }, 2000);
                return;
            }

            // Usuário está autenticado - desbloquear
            const result = await qrcodeService.unlockDayViaQR(day, token);

            if (result.success) {
                setStatus('success');
                setDayNumber(result.day);
                setPoints(result.points);

                // Confete (IMAGEM 2)
                confetti({
                    particleCount: 200,
                    spread: 160,
                    origin: { y: 0.6 },
                    colors: ['#7C3AED', '#FB923C', '#FDE047']
                });

                // Limpar pending unlock
                localStorage.removeItem('pending_unlock');

                // Mostrar toast tbm para feedback extra
                if (result.points > 0) {
                    toast.success(`Parabéns! +${result.points} pontos ganhos!`);
                }

                // Redirecionar após 3.5 segundos (mais tempo para ver a celebração)
                setTimeout(() => {
                    navigate(`/jornada/dia/${result.day}`);
                }, 3500);
            }
        } catch (err: any) {
            if (err.message === 'AUTH_REQUIRED') return; // Já tratado acima

            setStatus('error');
            setMessage(err.message || 'Erro ao desbloquear dia');
            toast.error(err.message || 'Houve um erro ao validar o QR Code.');

            setTimeout(() => navigate('/jornada'), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-card border-3 border-border rounded-3xl p-8 text-center shadow-cartoon relative overflow-hidden"
            >
                {/* Background Sparkles for Success */}
                {status === 'success' && (
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.2),transparent_70%)]" />
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {status === 'loading' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6 py-6"
                        >
                            <div className="relative w-20 h-20 mx-auto">
                                <Loader2 className="w-20 h-20 text-primary animate-spin" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold mb-2 text-foreground">Desbloqueando...</h2>
                                <p className="text-muted-foreground">{message}</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'needs_auth' && (
                        <motion.div
                            key="needs_auth"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6 py-6"
                        >
                            <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center mx-auto text-5xl">
                                🔓
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                                    Dia {dayNumber} pronto para você!
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    Complete seu cadastro para desbloquear o conteúdo e ganhar seus pontos da jornada.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-secondary font-bold animate-pulse">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Redirecionando para o cadastro...
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-6 relative z-10 py-4"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
                            >
                                <CheckCircle className="w-24 h-24 text-success mx-auto" />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h2 className="text-4xl font-display font-black text-foreground mb-2 whitespace-nowrap">
                                    DESBLOQUEADO!
                                </h2>
                                <p className="text-muted-foreground text-lg mb-8">
                                    Dia {dayNumber} desbloqueado com sucesso!
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.7, type: 'spring' }}
                                className="bg-success/20 border-3 border-success/30 rounded-3xl p-6 mb-8 shadow-cartoon-sm"
                            >
                                <p className="text-success font-display font-black text-xl">
                                    🎉 PARABÉNS! +{points} PONTOS!
                                </p>
                            </motion.div>

                            <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Carregando conteúdo...
                            </p>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 py-6"
                        >
                            <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto text-destructive text-5xl">
                                ×
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-destructive mb-2">Ops! Algo deu errado</h2>
                                <p className="text-muted-foreground">{message}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
