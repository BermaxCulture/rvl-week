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
    User,
    Church
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
    role?: string;
    is_member: boolean;
}

interface UserDetail {
    day_number: number;
    title: string;
    completed: boolean;
    points_earned: number;
    data_real: string;
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

            // Busca direta na tabela profiles excluindo admin e pastor
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, image_url, total_points, completed_days, achievements, role, is_member')
                .not('role', 'eq', 'admin')
                .not('role', 'eq', 'pastor')
                .order('total_points', { ascending: false })
                .order('full_name', { ascending: true });

            if (error) throw error;

            // Mapear para o formato esperado pelo componente e adicionar a posição
            const mappedUsers = (data || []).map((u: any, index: number) => ({
                id: u.id,
                name: u.full_name,
                email: u.email,
                avatar_url: u.image_url,
                total_points: u.total_points || 0,
                completed_days: u.completed_days || 0,
                achievements: u.achievements || [],
                is_member: u.is_member || false,
                position: index + 1,
                role: u.role
            }));

            setUsers(mappedUsers);
        } catch (err) {
            console.error("Erro ao buscar ranking:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRank = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            // Buscar perfil para checar role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authUser.id)
                .single();

            if (profile?.role === 'pastor' || profile?.role === 'admin') {
                setUserRank(null);
                return;
            }

            const { data, error } = await supabase.rpc("get_user_rank", { target_user_id: authUser.id });
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

    const getRankStyle = (pos: number) => {
        if (pos === 1) return {
            border: "border-yellow-500",
            icon: <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />,
            bg: "bg-yellow-500/5"
        };
        if (pos === 2) return {
            border: "border-slate-400",
            icon: <Medal className="w-6 h-6 md:w-8 md:h-8 text-slate-400" />,
            bg: "bg-slate-400/5"
        };
        if (pos === 3) return {
            border: "border-orange-500",
            icon: <Award className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />,
            bg: "bg-orange-500/5"
        };
        return {
            border: "border-border/50",
            icon: <span className="font-display font-black text-xl opacity-50">#{pos}</span>,
            bg: "bg-card/30"
        };
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
                                        <Zap className="w-4 h-4 fill-yellow-500" /> {userRank.user_total_points.toFixed(2)}
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
                            {filteredUsers.map((user, idx) => {
                                const rankStyle = getRankStyle(user.position);

                                return (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => fetchUserDetails(user)}
                                        className={`
                                            group relative flex items-center gap-3 md:gap-6 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] cursor-pointer
                                            border-[1.5px] transition-all duration-300
                                            ${rankStyle.border} ${rankStyle.bg}
                                            hover:scale-[1.01] hover:brightness-110
                                        `}
                                    >
                                        {/* Position Icon */}
                                        <div className="w-8 md:w-14 flex justify-center items-center shrink-0">
                                            {rankStyle.icon}
                                        </div>

                                        {/* Avatar/Initials */}
                                        <div className="relative shrink-0">
                                            {user.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt={user.name}
                                                    className="w-9 h-9 md:w-12 md:h-12 rounded-full object-cover border border-white/10"
                                                />
                                            ) : (
                                                <div className={`
                                                    w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center 
                                                    font-bold text-xs md:text-base border border-white/10
                                                    bg-background/50
                                                `}>
                                                    {user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h3 className="font-display font-black text-sm md:text-lg truncate text-foreground leading-tight uppercase tracking-tight">
                                                {user.name}
                                            </h3>
                                            <span className="text-[9px] md:text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                                {user.completed_days}/7 dias concluídos
                                            </span>
                                        </div>

                                        {/* Points */}
                                        <div className="text-right shrink-0">
                                            <div className="flex items-center gap-1 justify-end">
                                                <Zap className="w-3.5 h-3.5 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                                                <span className="text-lg md:text-2xl font-black font-display text-yellow-500">
                                                    {user.total_points.toFixed(2)}
                                                </span>
                                            </div>
                                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-1">
                                                PONTOS
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}

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
                                                className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary shadow-xl"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-primary/20 flex items-center justify-center font-bold text-2xl md:text-4xl border-4 border-primary shadow-xl">
                                                {selectedUser.name[0]}
                                            </div>
                                        )}
                                        <div className="absolute -top-2 -right-2 md:-top-4 md:-right-2 bg-yellow-500 text-black font-black px-3 py-0.5 md:px-4 md:py-1 rounded-full text-sm md:text-lg shadow-cartoon-sm">
                                            #{selectedUser.position}
                                        </div>
                                    </div>

                                    <div className="text-center md:text-left">
                                        <h2 className="text-xl md:text-3xl font-black font-display mb-2 uppercase tracking-tight leading-tight">
                                            {selectedUser.name}
                                        </h2>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4">
                                            <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full flex items-center gap-1.5 font-black italic text-xs md:text-base">
                                                <Zap className="w-3.5 h-3.5 fill-yellow-500" />
                                                {selectedUser.total_points.toFixed(2)} PTS
                                            </div>
                                            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1.5 font-black italic text-xs md:text-base">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {selectedUser.completed_days}/7 DIAS
                                            </div>
                                            <div className="bg-muted text-muted-foreground px-3 py-1 rounded-full flex items-center gap-1.5 font-black italic uppercase text-[9px] md:text-[10px] tracking-widest border border-border/50">
                                                <Church className="w-3 h-3" />
                                                {selectedUser.is_member ? "Membro" : "Visitante"}
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
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-4">
                                        {mockAchievements.map((m) => {
                                            const isUnlocked = selectedUser.achievements?.includes(m.id);
                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`
                                                        relative flex flex-col items-center p-2 md:p-4 rounded-2xl md:rounded-3xl border-2 transition-all
                                                        ${isUnlocked ? "bg-secondary/5 border-secondary/30 grayscale-0" : "bg-card border-border grayscale opacity-40"}
                                                    `}
                                                >
                                                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-2 md:mb-3 bg-gradient-to-br ${isUnlocked ? 'from-secondary to-purple-600' : 'from-muted to-muted'} shadow-lg`}>
                                                        <Award className="text-white w-4 h-4 md:w-7 md:h-7" />
                                                    </div>
                                                    <p className="text-[8px] md:text-[10px] font-bold text-center leading-tight uppercase font-heading">{m.name}</p>
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
                                            {userDetails
                                                .filter((day) => {
                                                    if (!day.data_real) return day.completed;
                                                    const now = new Date();
                                                    const isCompleted = day.completed;
                                                    const datePart = day.data_real.toString().includes('T')
                                                        ? day.data_real.toString().split('T')[0]
                                                        : day.data_real.toString();
                                                    const dayStart = new Date(`${datePart}T00:00:00-03:00`);
                                                    return isCompleted || now >= dayStart;
                                                })
                                                .map((day) => {
                                                    const now = new Date();
                                                    const maxDayPoints = day.day_number === 1 ? 200 : 250;
                                                    const isCompleted = day.completed || (Number(day.points_earned) >= maxDayPoints);
                                                    const datePart = day.data_real.toString().includes('T')
                                                        ? day.data_real.toString().split('T')[0]
                                                        : day.data_real.toString();
                                                    const unlockTime = day.day_number === 7 ? '10:00:00' : '19:30:00';
                                                    const unlockDate = new Date(`${datePart}T${unlockTime}-03:00`);

                                                    const isRevealed = now >= unlockDate || isCompleted;
                                                    const displayTitle = isRevealed ? day.title : "CONTEÚDO PRIVADO";

                                                    return (
                                                        <div
                                                            key={day.day_number}
                                                            className={`
                                                                flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                                                                ${isCompleted
                                                                    ? "bg-green-500/20 border-green-500/60 shadow-[0_0_20px_rgba(34,197,94,0.2)] scale-[1.02]"
                                                                    : isRevealed
                                                                        ? "bg-red-500/5 border-red-500/10 opacity-60"
                                                                        : "bg-muted/10 border-border/20 grayscale opacity-40"}
                                                            `}
                                                        >
                                                            <div className={`
                                                                w-10 h-10 rounded-xl flex items-center justify-center font-display font-black
                                                                ${isCompleted ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.6)]" : "bg-muted text-muted-foreground"}
                                                            `}>
                                                                {day.day_number}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className={`font-bold text-sm leading-tight ${isCompleted ? "text-green-400" : ""}`}>{displayTitle}</h4>
                                                                <p className="text-[10px] uppercase font-black tracking-widest mt-0.5 opacity-60">
                                                                    {isCompleted ? `+${Number(day.points_earned).toFixed(2)} PTS` : isRevealed ? "Não concluído" : "Liberação às " + (day.day_number === 7 ? "10h" : "19:30")}
                                                                </p>
                                                            </div>
                                                            {isCompleted ? (
                                                                <div className="bg-green-500 rounded-full p-1 shadow-[0_0_15px_rgba(34,197,94,0.6)]">
                                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                                </div>
                                                            ) : !isRevealed && (
                                                                <div className="w-6 h-6 border-2 border-border/30 rounded-full flex items-center justify-center opacity-30">
                                                                    <div className="w-1.5 h-1.5 bg-border/50 rounded-full" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
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
