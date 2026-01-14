import { motion } from "framer-motion";

export const Footer = () => {
    return (
        <footer className="py-8 border-t border-border/40 bg-background/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 text-center">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-1.5"
                >
                    Desenvolvido por <span className="text-foreground font-bold hover:text-primary transition-colors cursor-default">Bermax Culture</span>
                </motion.p>
                <p className="text-[10px] text-muted-foreground/50 mt-2 uppercase tracking-widest font-bold">
                    Revival Week 2025 • Link Church
                </p>
            </div>
        </footer>
    );
};
