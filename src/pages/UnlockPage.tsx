import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { qrcodeService } from '@/services/qrcode.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedGradientBackground from '@/components/ui/animated-gradient-background';
import { useStore } from '@/store/useStore';

export default function UnlockPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

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

            console.log('📍 UNLOCK PAGE - isAuthenticated:', isAuthenticated, 'day:', day, 'token:', token);

            if (!day || !token) {
                toast.error('Link inválido ou incompleto');
                navigate('/jornada');
                return;
            }

            // Se NÃO está autenticado, redirecionar para cadastro/login
            if (!isAuthenticated || !user) {
                console.log('❌ Usuário NÃO autenticado - salvando pending_unlock');
                setStatus('needs_auth');
                setDayNumber(day);

                // Salvar params no localStorage para usar após login/cadastro
                localStorage.setItem('pending_unlock', JSON.stringify({
                    day,
                    token,
                    timestamp: Date.now()
                }));

                // Redirecionar após 2 segundos
                setTimeout(() => {
                    navigate('/cadastro', {
                        state: {
                            message: `Complete seu cadastro para desbloquear o Dia ${day}!`
                        }
                    });
                }, 2000);
                return;
            }

            // Usuário está autenticado - desbloquear
            console.log('✅ Usuário autenticado - chamando RPC unlock_via_qr...');

            // DEBUG: Validar formato esperado antes de enviar
            const expectedFormat = `RVL2026D${day}`;
            console.log('📍 Token recebido:', token);
            console.log('📍 Formato esperado:', expectedFormat);

            const result = await qrcodeService.unlockDayViaQR(day, token);

            if (result.success) {
                console.log('✅ RPC retornou sucesso:', result);
                setStatus('success');
                setDayNumber(result.dayNumber);
                setPoints(result.pointsEarned);

                // Confete
                confetti({
                    particleCount: 200,
                    spread: 160,
                    origin: { y: 0.6 },
                    colors: ['#7C3AED', '#FB923C', '#FDE047']
                });

                // Limpar pending unlock
                localStorage.removeItem('pending_unlock');

                // ATUALIZAR STORE PARA REFLETIR NOVO STATUS
                console.log('🔄 Atualizando store local...');
                await useStore.getState().fetchDays();

                // Mostrar toast tbm para feedback extra
                if (result.pointsEarned > 0) {
                    toast.success(`🎉 Dia ${result.dayNumber} desbloqueado! +${result.pointsEarned} pts`);
                }

                // Redirecionar após 3 segundos
                setTimeout(() => {
                    navigate(`/jornada/dia/${result.dayNumber}`);
                }, 3000);
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
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-background z-50 overflow-hidden">
            <AnimatedGradientBackground
                Breathing={true}
                gradientColors={
                    status === 'success'
                        ? ["#064e3b", "#065f46", "#047857", "#059669", "#10b981", "#34d399", "#6ee7b7"]
                        : status === 'error'
                            ? ["#450a0a", "#7f1d1d", "#991b1b", "#b91c1c", "#dc2626", "#ef4444", "#f87171"]
                            : ["#020617", "#2e1065", "#581c87", "#7e22ce", "#fcd95b", "#fbbf24", "#7e22ce"]
                }
                gradientStops={[35, 50, 60, 70, 85, 95, 100]}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-sm sm:max-w-md bg-card/95 backdrop-blur-md border-3 border-border rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 text-center shadow-cartoon-lg relative z-10 mx-auto"
            >
                {/* Background Sparkles for Success */}
                {status === 'success' && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_70%)]" />
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
                            className="flex flex-col items-center justify-center py-4 sm:py-6"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
                                className="mb-6"
                            >
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-success/20 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-success" />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-center"
                            >
                                <h2 className="text-3xl sm:text-4xl font-display font-black text-foreground mb-2">
                                    DESBLOQUEADO!
                                </h2>
                                <p className="text-muted-foreground text-base sm:text-lg mb-8">
                                    O Dia {dayNumber} já está disponível para você.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0, rotate: -5 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.7, type: 'spring' }}
                                className="w-full bg-success/10 border-2 border-success/20 rounded-[1.5rem] sm:rounded-3xl p-6 mb-8 shadow-sm flex flex-col items-center gap-2"
                            >
                                <p className="text-success font-display font-black text-lg sm:text-xl flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    PARABÉNS! +{points} PONTOS!
                                </p>
                            </motion.div>

                            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Acessando conteúdo...</span>
                            </div>
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
