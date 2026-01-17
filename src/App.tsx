import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner, toast } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Jornada from "./pages/Jornada";
import DiaConteudo from "./pages/DiaConteudo";
import AdminEditDia from "./pages/AdminEditDia";
import Perfil from "./pages/Perfil";
import RankingPage from "./pages/RankingPage";
import VerifyEmail from "./pages/VerifyEmail";
import UnlockPage from "./pages/UnlockPage";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/utils/ScrollToTop";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const { checkAuth, isAuthenticated } = useAuth();
  const { setPendingUnlock, unlockDay } = useStore();

  useEffect(() => {
    checkAuth();

    // Check for Auth Errors in URL (hash)
    const hash = window.location.hash;
    if (hash.includes("error=access_denied") && hash.includes("otp_expired")) {
      toast.error("O link de confirmação expirou ou já foi usado.", {
        description: "Lembre-se: o Supabase pode exigir que você confirme a alteração tanto no e-mail antigo quanto no novo. Verifique ambas as caixas de entrada!",
        duration: 8000
      });
      // Clean up hash
      window.history.replaceState({}, "", window.location.pathname);
    }

    // Check for QR Code scan in URL (Legacy fallback if needed)
    const params = new URLSearchParams(window.location.search);
    const dayToUnlock = params.get("unlock");
    if (dayToUnlock) {
      const dayNum = parseInt(dayToUnlock);
      if (isAuthenticated) {
        unlockDay(dayNum, "qrcode");
      } else {
        setPendingUnlock(dayNum);
      }
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [checkAuth, isAuthenticated, setPendingUnlock, unlockDay]);

  useEffect(() => {
    // Unified visible unlock flow via /unlock page
  }, [isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/verificar-email" element={<VerifyEmail />} />
            <Route path="/unlock" element={<UnlockPage />} />

            {/* Protected Routes */}
            <Route
              path="/jornada"
              element={
                <ProtectedRoute>
                  <Jornada />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jornada/dia/:dayNumber"
              element={
                <ProtectedRoute>
                  <DiaConteudo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jornada/dia/:dayNumber/editar"
              element={
                <ProtectedRoute>
                  <AdminEditDia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ranking"
              element={
                <ProtectedRoute>
                  <RankingPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
