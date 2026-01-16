import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { qrcodeService } from '@/services/qrcode.service';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UnlockPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processando seu acesso...');

    useEffect(() => {
        const processUnlock = async () => {
            try {
                const url = window.location.href;
                const result = await qrcodeService.unlockDay(url);

                setStatus('success');
                setMessage(`Dia ${result.day} desbloqueado com sucesso!`);

                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });

                if (result.points > 0) {
                    toast.success(`Parabéns! +${result.points} pontos ganhos!`);
                } else {
                    toast.info(`Você já resgatou os pontos deste dia.`);
                }

                setTimeout(() => navigate(`/jornada/dia/${result.day}`), 2500);
            } catch (err: any) {
                if (err.message === 'AUTH_REQUIRED') {
                    toast.info("Faça login para salvar seu progresso e ganhar pontos!");
                    navigate('/login', { state: { from: window.location.pathname + window.location.search } });
                    return;
                }

                setStatus('error');
                setMessage(err.message || 'Houve um erro ao validar o QR Code.');
                toast.error(err.message);

                setTimeout(() => navigate('/jornada'), 3000);
            }
        };

        processUnlock();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-card border-3 border-border rounded-3xl p-8 text-center shadow-cartoon"
            >
                <AnimatePresence mode="wait">
                    {status === 'loading' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="relative w-20 h-20 mx-auto">
                                <Loader2 className="w-20 h-20 text-primary animate-spin" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold mb-2">Quase lá...</h2>
                                <p className="text-muted-foreground">{message}</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-12 h-12 text-success" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-success mb-2">Desbloqueado!</h2>
                                <p className="text-muted-foreground">{message}</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle className="w-12 h-12 text-destructive" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-destructive mb-2">Ops!</h2>
                                <p className="text-muted-foreground">{message}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
