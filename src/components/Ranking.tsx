import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Trophy, Medal, Award, Zap, ArrowRight, X, Calendar, Target, CheckCircle2, User, Church } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/ButtonCustom'
import { mockAchievements } from '@/mocks/days.mock'

interface RankingUser {
    id: string
    name: string
    email: string
    avatar_url: string | null
    total_points: number
    completed_days: number
    achievements: string[]
    is_member: boolean
    position: number
}

interface UserDetail {
    day_number: number
    title: string
    completed: boolean
    points_earned: number
    data_real: string
}

interface UserRank {
    position: number
    total_users: number
    user_total_points: number
    user_completed_days: number
}

export default function Ranking() {
    const navigate = useNavigate()
    const [topUsers, setTopUsers] = useState<RankingUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // User Rank State
    const [userRank, setUserRank] = useState<UserRank | null>(null)

    // Modal State
    const [selectedUser, setSelectedUser] = useState<RankingUser | null>(null)
    const [userDetails, setUserDetails] = useState<UserDetail[]>([])
    const [loadingDetails, setLoadingDetails] = useState(false)

    useEffect(() => {
        loadRanking()
        loadUserRank()
    }, [])
    const loadRanking = async () => {
        try {
            setLoading(true)

            // Busca direta na tabela profiles excluindo admin e pastor para o Top 3
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, image_url, total_points, completed_days, achievements, role, is_member')
                .not('role', 'eq', 'admin')
                .not('role', 'eq', 'pastor')
                .order('total_points', { ascending: false })
                .order('full_name', { ascending: true })
                .limit(3);

            if (error) throw error

            // Mapear para o formato esperado pelo componente
            const mappedUsers = (data || []).map((u: any, index: number) => ({
                id: u.id,
                name: u.full_name,
                email: u.email,
                avatar_url: u.image_url,
                total_points: u.total_points || 0,
                completed_days: u.completed_days || 0,
                achievements: u.achievements || [],
                is_member: u.is_member || false,
                position: index + 1
            }));

            setTopUsers(mappedUsers)
        } catch (err) {
            console.error('Erro ao carregar ranking:', err)
            setError('Não foi possível carregar o ranking')
        } finally {
            setLoading(false)
        }
    }

    const loadUserRank = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) return

            // Buscar perfil para checar role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authUser.id)
                .single()

            if (profile?.role === 'pastor' || profile?.role === 'admin') {
                setUserRank(null)
                return
            }

            const { data, error } = await supabase
                .rpc('get_user_rank', { target_user_id: authUser.id })

            if (error) throw error
            if (data && data.length > 0) {
                setUserRank(data[0])
            }
        } catch (err) {
            console.error('Erro ao carregar posição do usuário:', err)
        }
    }

    const fetchUserDetails = async (user: RankingUser) => {
        setSelectedUser(user)
        setLoadingDetails(true)
        try {
            const { data, error } = await supabase.rpc("get_user_journey_details", {
                target_user_id: user.id,
            })
            if (error) throw error
            setUserDetails(data || [])
        } catch (err) {
            console.error("Erro ao buscar detalhes:", err)
        } finally {
            setLoadingDetails(false)
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    }

    const formatName = (name: string) => {
        const parts = name.trim().split(/\s+/)
        if (parts.length <= 2) return name
        return `${parts[0]} ${parts[parts.length - 1]}`
    }

    const getRankStyle = (pos: number) => {
        if (pos === 1) return {
            border: "border-yellow-500",
            icon: <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />,
            bg: "bg-yellow-500/5"
        }
        if (pos === 2) return {
            border: "border-slate-400",
            icon: <Medal className="w-6 h-6 md:w-8 md:h-8 text-slate-400" />,
            bg: "bg-slate-400/5"
        }
        if (pos === 3) return {
            border: "border-orange-500",
            icon: <Award className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />,
            bg: "bg-orange-500/5"
        }
        return {
            border: "border-border/50",
            icon: <span className="font-display font-black text-xl opacity-50">#{pos}</span>,
            bg: "bg-card/30"
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="flex flex-col items-start gap-1 mb-6">
                <h2 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
                    <Trophy className="w-7 h-7 text-secondary" />
                    TOP 3 DA SEMANA
                </h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/ranking')}
                    className="text-[12px] font-bold text-secondary hover:bg-secondary/10 flex items-center gap-2"
                >
                    VER RANKING COMPLETO <ArrowRight className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid gap-4">
                {topUsers.map((user, index) => {
                    const style = getRankStyle(user.position)

                    return (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => fetchUserDetails(user)}
                            className={`
                                group relative flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-[2rem] cursor-pointer
                                border-[1.5px] transition-all duration-300
                                ${style.border} ${style.bg}
                                hover:scale-[1.01] hover:brightness-110
                            `}
                        >
                            {/* Position Icon */}
                            <div className="w-8 md:w-12 flex justify-center items-center shrink-0">
                                {style.icon}
                            </div>

                            {/* Avatar/Initials */}
                            <div className="relative shrink-0">
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name}
                                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-white/10"
                                    />
                                ) : (
                                    <div className={`
                                        w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center 
                                        font-bold text-sm border border-white/10
                                        bg-background/50
                                    `}>
                                        {getInitials(user.name)}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h3 className="font-display font-black text-sm md:text-base truncate text-foreground leading-tight uppercase tracking-tight">
                                    {formatName(user.name)}
                                </h3>
                                <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wide truncate">
                                    {user.completed_days}/7 dias concluídos
                                </span>
                            </div>

                            {/* Points */}
                            <div className="text-right shrink-0 pl-2">
                                <div className="flex items-center gap-1 justify-end">
                                    <Zap className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-lg md:text-xl font-black font-display text-yellow-500">
                                        {user.total_points.toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mr-0.5">
                                    PONTOS
                                </p>
                            </div>
                        </motion.div>
                    )
                })}

                {topUsers.length === 0 && !error && (
                    <div className="p-8 text-center bg-card/50 rounded-2xl border-2 border-dashed border-border text-muted-foreground font-display text-sm">
                        A JORNADA ESTÁ COMEÇANDO. SEJA O PRIMEIRO!
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500 rounded-xl text-red-500 text-xs text-center">
                        {error}
                    </div>
                )}
            </div>

            {/* User Position Summary */}
            {userRank && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-card/40 border-2 border-border/50 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                            <User className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Sua Posição</p>
                            <h4 className="text-2xl font-black font-display text-foreground">
                                #{userRank.position} <span className="text-sm font-bold text-muted-foreground">de {userRank.total_users}</span>
                            </h4>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <p className="text-2xl font-black text-yellow-500 flex items-center gap-2">
                                <Zap className="w-5 h-5 fill-yellow-500" /> {userRank.user_total_points.toFixed(2)}
                            </p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">PONTOS</p>
                        </div>
                        <div className="h-10 w-px bg-border/50" />
                        <div className="text-center">
                            <p className="text-2xl font-black text-primary flex items-center gap-2">
                                <Calendar className="w-5 h-5" /> {userRank.user_completed_days}/7
                            </p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">DIAS</p>
                        </div>
                    </div>
                </motion.div>
            )}

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
                                                {selectedUser.total_points.toFixed(2)} PTS
                                            </div>
                                            <div className="bg-primary/10 text-primary px-4 py-1 rounded-full flex items-center gap-2 font-black italic">
                                                <Calendar className="w-4 h-4" />
                                                {selectedUser.completed_days}/7 DIAS
                                            </div>
                                            <div className="bg-muted text-muted-foreground px-4 py-1 rounded-full flex items-center gap-2 font-black italic uppercase text-[10px] tracking-widest border border-border/50">
                                                <Church className="w-3.5 h-3.5" />
                                                {selectedUser.is_member ? "Membro" : "Visitante"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2 text-left">
                                        <Award className="w-5 h-5 text-secondary" /> Conquistas Desbloqueadas
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {mockAchievements.map((m) => {
                                            const isUnlocked = selectedUser.achievements?.includes(m.id)
                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`
                                                        relative flex flex-col items-center p-4 rounded-3xl border-2 transition-all
                                                        ${isUnlocked ? "bg-secondary/5 border-secondary/30 grayscale-0" : "bg-card border-border grayscale opacity-40"}
                                                    `}
                                                >
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br ${isUnlocked ? 'from-secondary to-purple-600' : 'from-muted to-muted'} shadow-lg`}>
                                                        <Award className="text-white w-6 h-6" />
                                                    </div>
                                                    <p className="text-[9px] font-bold text-center leading-tight uppercase font-heading">{m.name}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

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
                                                    const now = new Date();
                                                    const isCompleted = day.completed;
                                                    const datePart = day.data_real.toString().includes('T')
                                                        ? day.data_real.toString().split('T')[0]
                                                        : day.data_real.toString();
                                                    const dayStart = new Date(`${datePart}T00:00:00-03:00`);

                                                    // Se já completou, sempre mostra. Se o dia já começou, mostra.
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

                            <div className="p-8 border-t border-border/50 bg-black/20">
                                <Button variant="outline" fullWidth onClick={() => setSelectedUser(null)}>
                                    Fechar Perfil
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
