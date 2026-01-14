import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
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
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/ButtonCustom";
import { Quiz } from "@/components/features/Quiz";
import { useStore } from "@/store/useStore";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/ui/Logo";
import { ScheduleCarousel } from "@/components/sections/ScheduleCarousel";
import { mockDays } from "@/mocks/days.mock";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  },
};

export default function LandingPage() {
  const { isAuthenticated } = useStore();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Gradient - Clean & Simple */}
        <div className="absolute inset-0 gradient-hero opacity-95" />

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 80% 20%, rgba(252, 217, 91, 0.15) 0%, transparent 50%)',
        }} />

        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

        <div className="container relative z-10 mx-auto px-4 pt-12 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-10"
            >
              <Logo size="lg" className="mx-auto" />
            </motion.div>

            {/* Main Title - CreateHack Style: Giant Bold Sans-Serif */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-display text-white mb-6"
              style={{
                fontSize: 'clamp(2.4rem, 9.6vw, 7.2rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 0.9,
                textTransform: 'uppercase'
              }}
            >
              VIMOS E PROVAMOS
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-white/90 font-heading font-medium mb-8 max-w-2xl mx-auto"
            >
              Uma semana de adoração, intercessão e direção
            </motion.p>

            {/* Theme Card - Glassmorphism */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="inline-block glass-card px-8 py-5 mb-8"
            >
              <p className="font-display text-2xl md:text-3xl text-white tracking-wider">
                A BONDADE DE DEUS
              </p>
            </motion.div>

            {/* Date */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-3 text-lg text-white/90 font-heading font-semibold mb-10"
            >
              <Calendar className="w-5 h-5" />
              <span>18 a 25 de Janeiro | 19h30</span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {isAuthenticated ? (
                <Link to="/jornada">
                  <Button variant="secondary" size="xl" icon={ArrowRight} iconPosition="right" glow>
                    ACESSAR MINHA JORNADA
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/cadastro">
                    <Button variant="secondary" size="xl" icon={ArrowRight} iconPosition="right" glow>
                      COMEÇAR MINHA JORNADA
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-purple-600">
                      Já tem conta? Entrar
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Ticker Bar - Golden Yellow with English/Portuguese Mix */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#fcd95b] border-t border-black/10 py-4 overflow-hidden">
          <div className="ticker-wrapper">
            <div className="ticker-content">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-8 px-4">
                  {["VIMOS", "WE SAW", "PROVAMOS", "WE TASTED", "ADORAMOS", "WE WORSHIP", "INTERCEDEMOS", "WE INTERCEDE", "BUSCAMOS", "WE SEEK", "RECEBEMOS", "WE RECEIVE"].map((word, idx) => (
                    <span key={idx} className="flex items-center gap-4">
                      <Sparkles className="w-5 h-5 text-black/60" />
                      <span className="font-heading text-xl text-black tracking-widest font-black">{word}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* O Que É Section */}
      <section className="section-padding relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 gradient-purple" />

        {/* Geometric shapes from CTA Final */}
        <div
          className="absolute top-0 right-0 w-80 h-80 opacity-30"
          style={{
            background: '#fcd95b',
            clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-60 h-60 opacity-20"
          style={{
            background: '#5b00a3',
            clipPath: 'polygon(0 0, 0% 100%, 100% 100%)',
          }}
        />

        <div className="container relative mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="font-display text-white mb-6"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                textTransform: 'uppercase'
              }}
            >
              O QUE É A <span className="text-gradient-gold">RVL WEEK</span>?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed"
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
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-6 lg:gap-8"
          >
            {[
              {
                icon: Flame,
                title: "Adoração Intensa",
                description: "Ambiente preparado, tempo prolongado e intencional de louvor",
                gradient: "from-[#5b00a3] to-[#fcd95b]",
              },
              {
                icon: Heart,
                title: "Intercessão Dirigida",
                description: "Pautas específicas para igreja, famílias e cidade",
                gradient: "from-[#fcd95b] to-[#5b00a3]",
              },
              {
                icon: BookOpen,
                title: "Palavra de Direção",
                description: "Baseada em Provérbios para sabedoria e discernimento",
                gradient: "from-purple-600 to-purple-400",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-black/30 backdrop-blur-md border border-white/10 p-8 rounded-[24px] group cursor-pointer shadow-xl"
              >
                <div className={`w - 16 h - 16 rounded - 2xl bg - gradient - to - br ${item.gradient} flex items - center justify - center mb - 6 shadow - glow - sm group - hover: shadow - glow transition - shadow duration - 300`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading font-bold text-xl text-white mb-3">{item.title}</h3>
                <p className="text-white/70 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="section-padding bg-card relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#5b00a3]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#fcd95b]/5 rounded-full blur-3xl" />

        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="font-display text-foreground mb-4"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                textTransform: 'uppercase'
              }}
            >
              COMO FUNCIONA A <span className="text-gradient-gold">JORNADA</span>?
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: Calendar,
                step: "1",
                title: "Participe dos cultos",
                description: "Venha aos cultos noturnos às 19h30",
              },
              {
                icon: QrCode,
                step: "2",
                title: "Escaneie o QR Code",
                description: "Ganhe +100 pts de presença",
              },
              {
                icon: Play,
                step: "3",
                title: "Assista os conteúdos",
                description: "Vídeos e reflexões diárias",
              },
              {
                icon: Trophy,
                step: "4",
                title: "Acumule conquistas",
                description: "Complete a jornada e seja premiado",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative text-center p-6 group"
              >
                {/* Step number */}
                <div className="step-circle mx-auto mb-6">
                  {item.step}
                </div>

                {/* Connector line */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#5b00a3]/50 to-transparent" />
                )}

                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#5b00a3]/10 group-hover:border-[#5b00a3]/30 transition-all duration-300">
                  <item.icon className="w-7 h-7 text-[#fcd95b]" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Programação Section */}
      <ScheduleCarousel />

      {/* Info Section */}
      <section className="section-padding bg-card">
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
                className="text-center p-8 rounded-2xl bg-background border border-border hover:border-[#5b00a3]/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#5b00a3] to-[#4C1D95] flex items-center justify-center mx-auto mb-4 shadow-glow-sm">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm text-muted-foreground mb-1 font-heading uppercase tracking-wider">{item.label}</p>
                <p className="font-heading font-bold text-lg text-foreground">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section-padding relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 gradient-purple" />

        {/* Geometric shapes */}
        <div
          className="absolute top-0 right-0 w-80 h-80 opacity-30"
          style={{
            background: '#fcd95b',
            clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-60 h-60 opacity-20"
          style={{
            background: '#5b00a3',
            clipPath: 'polygon(0 0, 0% 100%, 100% 100%)',
          }}
        />

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="font-display text-white mb-6"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                textTransform: 'uppercase'
              }}
            >
              NÃO PERCA ESSA JORNADA
            </h2>
            <p className="text-white/80 text-lg md:text-xl mb-10 max-w-xl mx-auto font-heading">
              7 dias para experimentar a bondade de Deus e crescer na fé
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link to="/jornada">
                  <Button variant="primary" size="xl" glow>
                    ACESSAR MINHA JORNADA
                  </Button>
                </Link>
              ) : (
                <Link to="/cadastro">
                  <Button variant="primary" size="xl" glow>
                    COMEÇAR AGORA
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}