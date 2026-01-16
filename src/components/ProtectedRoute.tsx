import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    // Enquanto verifica autenticação, mostra loading
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
            </div>
        )
    }

    // Se não está autenticado, redireciona pro login
    // Guarda a rota que o user tentou acessar no state
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />
    }

    // Se está autenticado, renderiza a página normalmente
    return <>{children}</>
}
