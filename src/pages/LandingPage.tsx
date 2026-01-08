import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Flame,
  Heart,
  BookOpen,
  QrCode,
  Play,
  Trophy,
  Clock,
  MapPin,
  Baby,
  Cross,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/ButtonCustom";
import { Logo } from "@/components/ui/Logo";
import { useStore } from "@/store/useStore";
import { mockDays } from "@/mocks/days.mock";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const { isAuthenticated } = useStore();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Triangle Background Pattern */}
        <div className="absolute inset-0 gradient-hero">
          <svg
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <polygon
              points="0,100 50,20 100,100"
              fill="rgba(252, 217, 91, 0.4)"
            />
            <polygon
              points="0,100 25,50 50,100"
              fill="rgba(252, 217, 91, 0.3)"
            />
            <polygon
              points="50,100 75,40 100,100"
              fill="rgba(252, 217, 91, 0.35)"
            />
            <polygon
              points="80,100 90,60 100,100"
              fill="rgba(252, 217, 91, 0.45)"
            />
            <polygon
              points="0,100 10,70 20,100"
              fill="rgba(252, 217, 91, 0.5)"
            />
          </svg>
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-8"
            >
              <Logo size="xl" className="mx-auto" />
            </motion.div>

            <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-primary text-shadow-cartoon mb-4">
              VIMOS E PROVAMOS
            </h1>

            <p className="text-lg md:text-xl text-foreground/80 mb-6 max-w-2xl mx-auto">
              Uma semana de adoração, intercessão e direção
            </p>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-block bg-card px-6 py-4 rounded-2xl border-3 border-foreground/20 shadow-cartoon mb-6"
            >
              <p className="font-display font-bold text-xl md:text-2xl text-primary">
                A BONDADE DE DEUS
              </p>
            </motion.div>

            <p className="text-lg font-semibold text-foreground mb-8">
              <Calendar className="inline-block w-5 h-5 mr-2" />
              20 a 26 de Janeiro | 19h30
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link to="/jornada">
                  <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                    ACESSAR MINHA JORNADA
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/cadastro">
                    <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                      COMEÇAR MINHA JORNADA
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg">
                      Já tem conta? Entrar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* O Que É Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2
              variants={itemVariants}
              className="font-display font-bold text-3xl md:text-4xl text-primary mb-4"
            >
              O que é a RVL Week?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-muted-foreground max-w-3xl mx-auto"
            >
              Uma semana especial de busca e comunhão com Deus, onde vamos adorar, 
              interceder e receber direção através da Palavra. Cada dia é uma 
              oportunidade de experimentar a bondade de Deus de forma prática.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-secondary/20 to-accent/20 p-8 rounded-2xl border-3 border-secondary/30 shadow-cartoon hover:-translate-y-1 hover:shadow-cartoon-hover transition-all"
            >
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4 shadow-cartoon-sm">
                <Flame className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">Adoração Intensa</h3>
              <p className="text-muted-foreground">
                Ambiente preparado, tempo prolongado e intencional de louvor
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-accent/20 to-secondary/10 p-8 rounded-2xl border-3 border-accent/30 shadow-cartoon hover:-translate-y-1 hover:shadow-cartoon-hover transition-all"
            >
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 shadow-cartoon-sm">
                <Heart className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">Intercessão Dirigida</h3>
              <p className="text-muted-foreground">
                Pautas específicas para igreja, famílias e cidade
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-2xl border-3 border-primary/30 shadow-cartoon hover:-translate-y-1 hover:shadow-cartoon-hover transition-all"
            >
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-cartoon-sm">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">Palavra de Direção</h3>
              <p className="text-muted-foreground">
                Baseada em Provérbios para sabedoria e discernimento
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mb-4">
              Como funciona a jornada?
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: Calendar,
                title: "Participe dos cultos",
                description: "Venha aos cultos noturnos às 19h30",
              },
              {
                icon: QrCode,
                title: "Escaneie o QR Code",
                description: "Ganhe +100 pts de presença",
              },
              {
                icon: Play,
                title: "Assista os conteúdos",
                description: "Vídeos e reflexões diárias",
              },
              {
                icon: Trophy,
                title: "Acumule conquistas",
                description: "Complete a jornada e seja premiado",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center p-6 bg-card rounded-2xl border border-border shadow-cartoon-sm"
              >
                <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Programação Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mb-4">
              Programação Completa
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {mockDays.map((day, index) => {
              const hasGuest = day.church !== undefined;
              const date = new Date(day.date + "T00:00:00");
              const formattedDate = date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
              });

              return (
                <motion.div
                  key={day.dayNumber}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className={`p-5 rounded-2xl bg-background transition-all ${
                    hasGuest
                      ? "border-3 border-secondary shadow-cartoon"
                      : "border border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display font-bold text-lg">
                      DIA {day.dayNumber}
                    </span>
                    <span className="text-sm text-muted-foreground">{formattedDate}</span>
                  </div>
                  <p className="font-semibold text-foreground mb-1">{day.pastor}</p>
                  {day.church && (
                    <p className="text-sm text-secondary font-medium">{day.church}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">19h30</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Clock, label: "Horário", value: "19h30" },
              { icon: MapPin, label: "Local", value: "Link Church, Belém/PA" },
              { icon: Baby, label: "Link Kids", value: "Disponível" },
              { icon: Cross, label: "Tema", value: "A Bondade de Deus" },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center p-6 bg-card rounded-2xl border border-border"
              >
                <item.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                <p className="font-display font-bold text-lg">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24 gradient-purple">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary-foreground mb-4">
              Não perca essa jornada espiritual!
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              7 dias para experimentar a bondade de Deus e crescer na fé
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link to="/jornada">
                  <Button variant="primary" size="lg">
                    ACESSAR MINHA JORNADA
                  </Button>
                </Link>
              ) : (
                <Link to="/cadastro">
                  <Button variant="primary" size="lg">
                    COMEÇAR AGORA
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center">
          <Logo size="sm" className="mx-auto mb-4 brightness-200" />
          <p className="text-sm opacity-60">
            © 2025 Link Church. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
