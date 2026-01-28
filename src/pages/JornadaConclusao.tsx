import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    CheckCircle,
    BookOpen,
    MessageCircle,
    PartyPopper,
    Zap,
    Sparkles,
    Trophy,
    Loader2,
    Medal,
    ArrowRight
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/ButtonCustom";
import { Footer } from "@/components/layout/Footer";
import rvlTiketoLogo from "@/assets/RVL26_Tiketo.png";

export default function JornadaConclusao() {
    const navigate = useNavigate();
    const [winners, setWinners] = useState<{ full_name: string, total_points: number }[]>([]);
    const [loadingWinners, setLoadingWinners] = useState(true);

    useEffect(() => {
        const fetchWinners = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name, total_points')
                    .not('role', 'eq', 'admin')
                    .not('role', 'eq', 'pastor')
                    .order('total_points', { ascending: false })
                    .order('full_name', { ascending: true })
                    .limit(3);

                if (error) throw error;
                setWinners(data || []);
            } catch (err) {
                console.error("Erro ao buscar ganhadores:", err);
            } finally {
                setLoadingWinners(false);
            }
        };

        fetchWinners();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Header />
            <main className="pt-24 pb-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Hero Encerramento */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative rounded-[2.5rem] overflow-hidden p-8 md:p-12 mb-10 text-center border-2 border-white/5 bg-gradient-to-b from-purple-900/40 to-black/60"
                    >
                        <div className="absolute inset-0 bg-[url('/grid-bg.png')] opacity-20 pointer-events-none" />
                        <div className="relative z-10">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-900/50"
                            >
                                <PartyPopper className="w-10 h-10 text-white" />
                            </motion.div>
                            <h1 className="font-display font-black text-3xl md:text-5xl mb-4 tracking-tight">
                                VOCÊ FINALIZOU A <span className="text-purple-500">JORNADA!</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/70 font-medium mb-8 max-w-2xl mx-auto leading-relaxed">
                                Parabéns por ter chegado até aqui. Concluir essa jornada é um princípio bíblico:
                                <span className="block mt-4 italic text-purple-400 font-serif text-2xl">
                                    "Melhor é o fim das coisas do que o seu início."
                                </span>
                                <span className="text-white/40 text-sm block mt-2 uppercase font-bold tracking-widest">(Eclesiastes 7:8)</span>
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <div className="px-6 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-bold opacity-80 uppercase tracking-tighter">7 DIAS CONCLUÍDOS</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Texto de Continuidade */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center mb-16 space-y-6"
                    >
                        <h2 className="text-xl md:text-2xl font-bold max-w-xl mx-auto leading-tight">
                            Mas este não é apenas um final. <br />
                            É o <span className="text-purple-500 underline underline-offset-4">começo de um posicionamento</span>.
                        </h2>
                        <p className="text-white text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
                            Tudo o que recebemos durante a RVL WEEK não foi para ficar restrito a uma semana, mas para
                            gerar continuidade, maturidade espiritual e decisões práticas. Agora é o momento de viver o que
                            foi liberado, aprofundar a revelação e sustentar o que Deus começou.
                        </p>
                    </motion.div>

                    {/* RVL Conference Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-12"
                    >
                        <div className="bg-[#111] rounded-[2.5rem] border-2 border-white/5 overflow-hidden shadow-2xl flex flex-col">
                            {/* Imagem no topo */}
                            <div className="w-full relative h-[300px] md:h-[450px]">
                                <img src={rvlTiketoLogo} alt="RVL Conference" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                            </div>

                            {/* Conteúdo embaixo */}
                            <div className="p-8 md:p-14 relative z-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                                    <div className="flex-1">
                                        <div className="inline-flex items-center gap-2 text-purple-500 font-black uppercase text-xs tracking-[0.2em] mb-4">
                                            <Sparkles className="w-4 h-4" /> Próximo Passo
                                        </div>
                                        <h3 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter leading-none text-white">
                                            RVL Conference 2026
                                        </h3>
                                        <p className="text-white/80 text-lg leading-relaxed max-w-2xl">
                                            O que Deus começou na RVL WEEK continua. A RVL Conference é o próximo nível para quem deseja crescer em revelação, alinhamento e visão de Reino.
                                        </p>
                                    </div>

                                    <div className="shrink-0 flex items-center">
                                        <div className="flex items-center gap-4 bg-white/5 p-5 rounded-[1.5rem] border border-white/10 shadow-xl backdrop-blur-sm">
                                            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 flex items-center justify-center shrink-0">
                                                <Zap className="w-7 h-7 text-purple-500 fill-purple-500/20" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <p className="font-black text-xl leading-none text-white tracking-tight">Vagas Limitadas</p>
                                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.15em] mt-2">Disponíveis até 23h59</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vídeo em destaque maior */}
                                <div className="mb-10 rounded-[2rem] overflow-hidden aspect-video bg-black/40 border-2 border-white/5 shadow-2xl relative group">
                                    <iframe
                                        className="w-full h-full"
                                        src="https://www.youtube.com/embed/s8iw2i01evU"
                                        title="RVL Conference Video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    ></iframe>
                                </div>

                                <a
                                    href="http://tiketo.com.br/evento/4610"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="primary" size="lg" className="w-full h-16 bg-purple-600 hover:bg-purple-700 shadow-2xl shadow-purple-900/40 border-none transition-all hover:scale-[1.02] active:scale-95 text-lg font-black tracking-widest">
                                        GARANTA SUA VAGA NO TIKETO <ArrowRight className="w-6 h-6 ml-2" />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </motion.section>

                    {/* Link School Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mb-12"
                    >
                        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-[2rem] border-2 border-white/5 p-8 md:p-16 flex flex-col items-center">
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-3xl md:text-5xl font-black mb-6 uppercase tracking-tighter leading-none">
                                    Link <span className="text-blue-500">School</span>
                                </h3>
                                <p className="text-white/60 mb-10 leading-relaxed max-w-2xl mx-auto">
                                    Crescimento espiritual também passa por formação. A Link School existe para te ajudar a transformar revelação em prática, fé em fundamento e chamado em responsabilidade.
                                </p>

                                {/* Vídeo da Link School */}
                                <div className="aspect-video w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border-2 border-blue-500/20 shadow-2xl mb-10 relative group">
                                    <iframe
                                        className="w-full h-full"
                                        src="https://www.youtube.com/embed/coMdxKbqyjg"
                                        title="Link School Video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    ></iframe>
                                </div>

                                <a
                                    href="https://www.linkschoolbr.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full max-w-xl mx-auto"
                                >
                                    <Button variant="primary" size="xl" className="w-full h-20 px-16 shadow-2xl transition-all font-black uppercase tracking-widest text-xl group">
                                        ACESSAR LINK SCHOOL <ArrowRight className="w-8 h-8 ml-3 group-hover:translate-x-2 transition-transform" />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </motion.section>

                    {/* Comunidade e WhatsApp */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="grid md:grid-cols-2 gap-6 mb-16"
                    >
                        <div className="bg-green-600/5 border-2 border-green-600/20 rounded-[2rem] p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-green-900/20">
                                <MessageCircle className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="text-xl font-black mb-2 uppercase tracking-tighter">Grupo do WhatsApp</h4>
                            <p className="text-white/40 text-sm mb-6 leading-relaxed">Fique por dentro dos avisos, próximos passos e conteúdos pós-RVL.</p>
                            <a
                                href="https://chat.whatsapp.com/FyvFSOWtzJYJ1CZgN3Z4RH?mode=gi_t"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                            >
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white border-none py-6 rounded-2xl font-black uppercase tracking-widest text-xs">
                                    ENTRE NO GRUPO
                                </Button>
                            </a>
                        </div>

                        <div className="bg-amber-600/5 border-2 border-amber-600/20 rounded-[2rem] p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-amber-900/20">
                                <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="text-xl font-black mb-2 uppercase tracking-tighter">Premiação da Jornada</h4>
                            <p className="text-white/40 text-sm mb-6 leading-relaxed">
                                Confira o que os campeões da RVL Week ganharão em descontos para o novo curso <span className="text-amber-500 font-bold">BIBLE PROJECT</span>:
                            </p>

                            <div className="w-full space-y-3 mb-8">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex flex-col items-start">
                                        <span className="flex items-center gap-2 font-bold text-xs uppercase opacity-60"><Medal className="w-3 h-3 text-yellow-500" /> 1º LUGAR</span>
                                        <span className="font-black text-sm text-white uppercase tracking-tight">
                                            {loadingWinners ? "..." : (winners[0]?.full_name?.trim() || "---")}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-yellow-500 block leading-none">100% OFF</span>
                                        {!loadingWinners && winners[0] && (
                                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                                                {winners[0].total_points} PTS
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex flex-col items-start">
                                        <span className="flex items-center gap-2 font-bold text-xs uppercase opacity-60"><Medal className="w-3 h-3 text-slate-400" /> 2º LUGAR</span>
                                        <span className="font-black text-sm text-white uppercase tracking-tight">
                                            {loadingWinners ? "..." : (winners[1]?.full_name?.trim() || "---")}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-slate-400 block leading-none">50% OFF</span>
                                        {!loadingWinners && winners[1] && (
                                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                                                {winners[1].total_points} PTS
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex flex-col items-start">
                                        <span className="flex items-center gap-2 font-bold text-xs uppercase opacity-60"><Medal className="w-3 h-3 text-amber-700" /> 3º LUGAR</span>
                                        <span className="font-black text-sm text-white uppercase tracking-tight">
                                            {loadingWinners ? "..." : (winners[2]?.full_name?.trim() || "---")}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-amber-700 block leading-none">25% OFF</span>
                                        {!loadingWinners && winners[2] && (
                                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                                                {winners[2].total_points} PTS
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.section>

                    {/* Footer de Encerramento */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-center pt-20 border-t border-white/5 space-y-4"
                    >
                        <p className="font-display font-black text-white/20 text-4xl leading-none pb-10">RVL WEEK 2026</p>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/jornada')}
                            className="text-white/40 hover:text-white"
                        >
                            VOLTAR PARA O MENU
                        </Button>
                    </motion.div>

                </div>
            </main>
            <Footer />
        </div>
    );
}
