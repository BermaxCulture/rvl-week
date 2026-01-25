import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner, toast } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import ResetPassword from "./pages/ResetPassword";
import Jornada from "./pages/Jornada";
import DiaConteudo from "./pages/DiaConteudo";
import AdminEditDia from "./pages/AdminEditDia";
import Perfil from "./pages/Perfil";
import RankingPage from "./pages/RankingPage";
import UnlockPage from "./pages/UnlockPage";
import JornadaConclusao from "./pages/JornadaConclusao";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/utils/ScrollToTop";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";

const queryClient = new QueryClient();

const AppContent = () => {
  const { checkAuth, isAuthenticated } = useAuth();
  const { setPendingUnlock, unlockDay } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const { fetchDays } = useStore();
  useEffect(() => {
    if (isAuthenticated) {
      fetchDays();
    }
  }, [isAuthenticated, fetchDays]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('🔄 Recovery event detected, navigating to reset-password');
        navigate('/reset-password', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
            <AdminRoute>
              <AdminEditDia />
            </AdminRoute>
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

        <Route
          path="/jornada/conclusao"
          element={
            <ProtectedRoute>
              <JornadaConclusao />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
