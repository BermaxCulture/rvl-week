export const getBaseUrl = (): string => {
    // Se for produção, usa a URL da Vercel
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_PRODUCTION_URL || window.location.origin;
    }

    // Se for desenvolvimento, tenta a ENV de dev, se não, usa o que o navegador diz (que é o 8080)
    // Isso evita que o valor fique "preso" se a ENV demorar a recarregar
    return import.meta.env.VITE_DEVELOPMENT_URL || window.location.origin;
}
