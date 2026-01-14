import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/utils/ScrollToTop";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

const queryClient = new QueryClient();

const App = () => {
  const { checkAuth, isAuthenticated, setPendingUnlock } = useStore();

  useEffect(() => {
    checkAuth();

    // Check for QR Code scan in URL
    const params = new URLSearchParams(window.location.search);
    const dayToUnlock = params.get("unlock");
    if (dayToUnlock) {
      const dayNum = parseInt(dayToUnlock);
      if (isAuthenticated) {
        // Unlocks immediately if already logged in
        useStore.getState().unlockDay(dayNum, "qrcode");
      } else {
        // Saves for later and user will be prompted to login/register
        setPendingUnlock(dayNum);
      }
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [checkAuth, setPendingUnlock]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/jornada" element={<Jornada />} />
            <Route path="/jornada/dia/:dayNumber" element={<DiaConteudo />} />
            <Route path="/jornada/dia/:dayNumber/editar" element={<AdminEditDia />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/verificar-email" element={<VerifyEmail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
