import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, User, Trophy, Zap } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/ButtonCustom";
import { useStore } from "@/store/useStore";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useStore();
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
        <div className="bg-[#fcd95b] rounded-full shadow-2xl px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/jornada"
                  className="font-heading font-bold text-black hover:text-purple-900 transition-colors uppercase text-sm tracking-wide"
                >
                  Minha Jornada
                </Link>
                <div className="flex items-center gap-2 px-4 py-2 bg-black/10 rounded-full">
                  <span className="text-purple-900 font-bold text-sm flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-purple-900" /> {user?.totalPoints || 0} pts
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-black/70 hover:text-black transition-colors font-heading font-semibold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <nav className="py-4 flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-3 bg-secondary/10 rounded-xl">
                      <User className="w-5 h-5 text-primary" />
                      <span className="font-semibold">{user?.name}</span>
                      <span className="ml-auto text-secondary font-bold flex items-center gap-1">
                        <Zap className="w-4 h-4 fill-secondary" /> {user?.totalPoints || 0} pts
                      </span>
                    </div>
                    <Link
                      to="/jornada"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
                    >
                      <Trophy className="w-5 h-5 text-primary" />
                      <span className="font-display font-semibold">Minha Jornada</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5 text-destructive" />
                      <span className="font-display font-semibold text-destructive">Sair</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" fullWidth>
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/cadastro" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="primary" fullWidth>
                        Criar Conta
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
