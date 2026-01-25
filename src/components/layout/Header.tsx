import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, User, Trophy, Zap, ChevronRight, Flame } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/ButtonCustom";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const isLandingPage = location.pathname === "/";

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4">
      <div className="container mx-auto">
        <div className="bg-[#fcd95b] rounded-full shadow-2xl px-6 py-2 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/jornada"
                  className="flex items-center gap-2 px-4 py-2 bg-black/5 hover:bg-black/10 rounded-full transition-all group active:scale-95 border border-black/5"
                  title="Minha Jornada"
                >
                  <Flame className="w-4 h-4 text-purple-900" />
                  <span className="text-purple-900 font-bold text-sm tracking-tight hidden lg:inline">Jornada</span>
                </Link>

                <Link
                  to="/ranking"
                  className="flex items-center gap-2 px-4 py-2 bg-black/5 hover:bg-black/10 rounded-full transition-all group active:scale-95 border border-black/5"
                  title="Ranking Global"
                >
                  <Trophy className="w-4 h-4 text-purple-900" />
                  <span className="text-purple-900 font-bold text-sm tracking-tight hidden lg:inline">Ranking</span>
                </Link>

                <div className="flex items-center gap-2 px-4 py-2 bg-black/10 rounded-full">
                  <span className="text-purple-900 font-bold text-sm flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-purple-900" /> {Number(user?.totalPoints || 0).toFixed(2)}
                  </span>
                </div>

                <Link
                  to="/perfil"
                  className="relative group block"
                  title="Meu Perfil"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-black/10 overflow-hidden bg-white/20 hover:border-black/30 transition-all shadow-sm group-hover:scale-105 active:scale-95">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/5">
                        <User className="w-5 h-5 text-black" />
                      </div>
                    )}
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-black/10 rounded-full transition-colors text-black/70 hover:text-black"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-heading font-bold text-black hover:text-purple-900 transition-colors uppercase text-sm tracking-wide"
                >
                  Entrar
                </Link>
                <Link to="/cadastro">
                  <button className="bg-purple-900 text-white px-6 py-2 rounded-full font-heading font-bold text-sm uppercase tracking-wide hover:bg-purple-800 transition-colors">
                    Criar Conta
                  </button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-black/10 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="md:hidden mt-2"
            >
              <nav className="p-4 bg-[#fcd95b] rounded-3xl shadow-2xl flex flex-col gap-2 border-2 border-black/5">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/perfil"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-4 bg-black/5 rounded-2xl"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden flex items-center justify-center border-2 border-black/10">
                        {user?.imageUrl ? (
                          <img src={user.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-black" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-black truncate">{user?.name}</p>
                        <p className="text-xs text-black/60 font-bold uppercase tracking-wider">{Number(user?.totalPoints || 0).toFixed(2)} pontos</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-black/40" />
                    </Link>

                    <div className="mt-2 space-y-1">
                      <Link
                        to="/jornada"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-black/10 transition-colors"
                      >
                        <Zap className="w-5 h-5 text-black" />
                        <span className="font-heading font-bold text-black uppercase text-sm">Minha Jornada</span>
                      </Link>

                      <Link
                        to="/ranking"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-black/10 transition-colors"
                      >
                        <Trophy className="w-5 h-5 text-black" />
                        <span className="font-heading font-bold text-black uppercase text-sm">Ranking Global</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-black/10 transition-colors w-full text-left"
                      >
                        <LogOut className="w-5 h-5 text-black/60" />
                        <span className="font-heading font-bold text-black/60 uppercase text-sm">Sair da Conta</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full">
                      <Button variant="outline" fullWidth className="bg-white/20 border-black/10 text-black">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/cadastro" onClick={() => setIsMenuOpen(false)} className="w-full">
                      <Button variant="primary" fullWidth className="bg-purple-900 text-white border-none shadow-lg">
                        Começar Agora
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
