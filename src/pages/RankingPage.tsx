import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy,
    ArrowLeft,
    Search,
    Zap,
    Medal,
    Award,
    Calendar,
    CheckCircle2,
    X,
    Target,
    User
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/ButtonCustom";
import { mockAchievements } from "@/mocks/days.mock";

interface RankingUser {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    total_points: number;
    completed_days: number;
    achievements: string[];
    position: number;
}

interface UserDetail {
    day_number: number;
    title: string;
    completed: boolean;
    points_earned: number;
}

interface UserRank {
    position: number;
    total_users: number;
    user_total_points: number;
    user_completed_days: number;
}

export default function RankingPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<RankingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<RankingUser | null>(null);
    const [userDetails, setUserDetails] = useState<UserDetail[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // User Rank State
    const [userRank, setUserRank] = useState<UserRank | null>(null);

    useEffect(() => {
        fetchFullRanking();
        fetchUserRank();
    }, []);

    const fetchFullRanking = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc("get_ranking", { limit_count: 100 });
            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error("Erro ao buscar ranking:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRank = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase.rpc("get_user_rank", { target_user_id: user.id });
            if (error) throw error;
            if (data && data.length > 0) {
                setUserRank(data[0]);
            }
        } catch (err) {
            console.error("Erro ao buscar posição do usuário:", err);
        }
    };

    const fetchUserDetails = async (user: RankingUser) => {
        setSelectedUser(user);
        setLoadingDetails(true);
        try {
            const { data, error } = await supabase.rpc("get_user_journey_details", {
                target_user_id: user.id,
            });
            if (error) throw error;
            setUserDetails(data || []);
        } catch (err) {
            console.error("Erro ao buscar detalhes:", err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const filteredUsers = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    const getPosColor = (pos: number) => {
        if (pos === 1) return "text-yellow-500 border-yellow-500 bg-yellow-500/10";
        if (pos === 2) return "text-gray-300 border-gray-300 bg-gray-300/10";
        if (pos === 3) return "text-orange-500 border-orange-500 bg-orange-500/10";
        return "text-purple-400 border-purple-900/50 bg-purple-900/20";
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Header />

            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <Link
                                to="/jornada"
                                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Voltar para Jornada</span>
                            </Link>
                            <h1 className="text-4xl md:text-5xl font-black font-display uppercase tracking-tight flex items-center gap-4">
                                <Trophy className="text-yellow-500 w-10 h-10 md:w-12 md:h-12" />
                                Ranking <span className="text-primary">Geral</span>
                            </h1>
                        </div>

                        <div className="relative group max-w-sm w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar participante..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-card/50 border-2 border-border focus:border-primary rounded-2xl py-3 pl-12 pr-4 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* User Rank Stick at Top (Optional UX) */}
                    {userRank && (
                        <div className="mb-8 p-6 bg-primary/10 border-2 border-primary/30 rounded-3xl flex items-center justify-between shadow-lg shadow-primary/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-cartoon-sm">
                                    <span className="font-black">#{userRank.position}</span>
                                </div>
                                <p className="font-black uppercase italic tracking-tight text-foreground">Sua posição atual</p>
                            </div>
                            <div className="flex gap-6">
                                <div className="text-right">
                                    <p className="text-xl font-black text-yellow-500 flex items-center gap-1">
                                        <Zap className="w-4 h-4 fill-yellow-500" /> {userRank.user_total_points}
                                    </p>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">PONTOS</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ranking List */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                            <p className="text-muted-foreground font-display font-bold animate-pulse">CARREGANDO PLACAR...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredUsers.map((user, idx) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => fetchUserDetails(user)}
                                    className={`
                                        group relative flex items-center gap-4 p-4 md:p-6 rounded-3xl cursor-pointer
                                        border-2 transition-all duration-300
                                        ${getPosColor(user.position)}
                                        hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/10
                                    `}
                                >
                                    {/* Position Badge */}
                                    <div className="w-12 md:w-16 text-center">
                                        {user.position <= 3 ? (
                                            user.position === 1 ? <span className="text-3xl">🥇</span> :
                                                user.position === 2 ? <span className="text-3xl">🥈</span> :
                                                    <span className="text-3xl">🥉</span>
                                        ) : (
                                            <span className="font-display font-black text-2xl opacity-50">#{user.position}</span>
                                        )}
                                    </div>

                                    {/* Avatar */}
                                    <div className="relative">
                                        {user.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                alt={user.name}
                                                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-current shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/20 flex items-center justify-center font-bold text-lg border-2 border-current shadow-lg">
                                                {user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                                            </div>
                                        )}
                                        {user.completed_days === 7 && (
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1 shadow-md">
                                                <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-display font-bold text-lg md:text-xl truncate text-foreground group-hover:text-primary transition-colors uppercase italic">
                                            {user.name}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1 font-medium italic">
                                                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                                {user.completed_days}/7 dias completos
                                            </span>
                                        </div>
                                    </div>

                                    {/* Points Tag */}
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <Zap className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 fill-yellow-500" />
                                            <span className="text-2xl md:text-3xl font-black font-display text-yellow-500">
                                                {user.total_points}
                                            </span>
                                        </div>
                                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">PONTOS</span>
                                    </div>
                                </motion.div>
                            ))}

                            {filteredUsers.length === 0 && (
                                <div className="text-center py-20 bg-card/30 rounded-3xl border-2 border-dashed border-border">
                                    <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-lg font-bold text-muted-foreground">Nenhum participante encontrado</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* User Detail Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-card border-2 border-primary/20 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="relative p-8 md:p-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent border-b border-border/50">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="absolute right-6 top-6 p-2 bg-background/50 hover:bg-background rounded-full transition-all hover:rotate-90"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="relative">
                                        {selectedUser.avatar_url ? (
                                            <img
                                                src={selectedUser.avatar_url}
                                                alt={selectedUser.name}
                                                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary shadow-xl"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/20 flex items-center justify-center font-bold text-4xl border-4 border-primary shadow-xl">
                                                {selectedUser.name[0]}
                                            </div>
                                        )}
                                        <div className="absolute -top-4 -right-2 bg-yellow-500 text-black font-black px-4 py-1 rounded-full text-lg shadow-cartoon-sm">
                                            #{selectedUser.position}
                                        </div>
                                    </div>

                                    <div className="text-center md:text-left">
                                        <h2 className="text-3xl md:text-4xl font-black font-display mb-2 uppercase tracking-tight">
                                            {selectedUser.name}
                                        </h2>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                            <div className="bg-yellow-500/10 text-yellow-500 px-4 py-1 rounded-full flex items-center gap-2 font-black italic">
                                                <Zap className="w-4 h-4 fill-yellow-500" />
                                                {selectedUser.total_points} PTS
                                            </div>
                                            <div className="bg-primary/10 text-primary px-4 py-1 rounded-full flex items-center gap-2 font-black italic">
                                                <Calendar className="w-4 h-4" />
                                                {selectedUser.completed_days}/7 DIAS
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10">
                                {/* Achievements / Badges */}
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2 text-left">
                                        <Award className="w-5 h-5 text-secondary" /> Conquistas Desbloqueadas
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {mockAchievements.map((m) => {
                                            const isUnlocked = selectedUser.achievements?.includes(m.id);
                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`
                                                        relative flex flex-col items-center p-4 rounded-3xl border-2 transition-all
                                                        ${isUnlocked ? "bg-secondary/5 border-secondary/30 grayscale-0" : "bg-card border-border grayscale opacity-40"}
                                                    `}
                                                >
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br ${isUnlocked ? 'from-secondary to-purple-600' : 'from-muted to-muted'} shadow-lg`}>
                                                        <Award className="text-white w-7 h-7" />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-center leading-tight uppercase font-heading">{m.name}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Journey Progress */}
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2 text-left">
                                        <Target className="w-5 h-5 text-primary" /> Rastro da Jornada
                                    </h3>

                                    {loadingDetails ? (
                                        <div className="flex items-center justify-center py-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                                        </div>
                                    ) : (
                                        <div className="grid gap-3 text-left">
                                            {userDetails.map((day) => (
                                                <div
                                                    key={day.day_number}
                                                    className={`
                                                        flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                                                        ${day.completed ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/10 opacity-60"}
                                                    `}
                                                >
                                                    <div className={`
                                                        w-10 h-10 rounded-xl flex items-center justify-center font-display font-black
                                                        ${day.completed ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}
                                                    `}>
                                                        {day.day_number}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-sm leading-tight">{day.title}</h4>
                                                        <p className="text-[10px] uppercase font-black tracking-widest mt-0.5 opacity-60">
                                                            {day.completed ? `+${day.points_earned} PTS` : "Não concluído"}
                                                        </p>
                                                    </div>
                                                    {day.completed && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 border-t border-border/50 bg-black/20">
                                <Button variant="outline" fullWidth onClick={() => setSelectedUser(null)}>
                                    Fechar Perfil
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
