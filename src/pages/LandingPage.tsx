import { useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
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
  const { isAuthenticated } = useAuth();
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24">
        {/* Background Base */}
        <div className="absolute inset-0 bg-[#020617]" />

        {/* Visible Background Image */}
        <div
          className="absolute inset-0 opacity-50 pointer-events-none overflow-hidden"
          style={{
            backgroundImage: 'url("/images/revival-week-bg.jpeg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Internal darkening overlay to help text contrast within the image div */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Gradient Overlays for Brand Colors and Depth */}
        <div className="absolute inset-0 gradient-hero opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-transparent to-[#020617]/90" />

        <div className="container relative z-10 mx-auto px-4 pt-20 pb-20 md:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center scale-[0.85] md:scale-100 origin-top"
          >
            {/* Main Title - CreateHack Style: Giant Bold Sans-Serif */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-display text-white mb-6"
              style={{
                fontSize: 'clamp(2.8rem, 9.6vw, 7.2rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 0.85,
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
              Sete dias de avivamento, entrega, adoração e direção!
            </motion.p>


            {/* Date and Location */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 text-white/90 font-heading font-semibold mb-10"
            >
              <div className="flex items-center gap-3 text-base md:text-lg">
                <Calendar className="w-5 h-5 text-accent shrink-0" />
                <span>19 a 25 de janeiro</span>
              </div>

              <div className="hidden lg:block w-px h-6 bg-white/20" />

              <div className="flex items-start lg:items-center gap-3 text-base md:text-lg text-left lg:text-left">
                <Clock className="w-5 h-5 text-accent shrink-0 mt-1 lg:mt-0" />
                <span className="leading-tight">
                  Segunda a sexta 19h30<br className="sm:hidden" />
                  <span className="hidden sm:inline"> | </span>
                  Domingo 10h, 17h e 19h
                </span>
              </div>

              <div className="hidden lg:block w-px h-6 bg-white/20" />

              <div className="flex items-center gap-3 text-base md:text-lg">
                <MapPin className="w-5 h-5 text-accent shrink-0" />
                <span>Link Church, Belém/PA</span>
              </div>
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
                  <Button variant="secondary" size="xl" icon={ArrowRight} iconPosition="right">
                    ACESSAR MINHA JORNADA
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/cadastro">
                    <Button variant="secondary" size="xl" icon={ArrowRight} iconPosition="right">
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
                  {["VIMOS", "WE SAW", "PROVAMOS", "WE WITNESSED", "ADORAMOS", "WE WORSHIP", "INTERCEDEMOS", "WE INTERCEDE", "BUSCAMOS", "WE SEEK", "RECEBEMOS", "WE RECEIVE"].map((word, idx) => (
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
      </section >

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
              Será uma semana em que viveremos juntos como igreja, com cultos todos os dias, buscando avivamento pessoal, metanoia e alinhamento como Igreja de Cristo.
              <br /><br />
              No ano da bondade de Deus, escolhemos confiar e entregar todos os nossos planos a Ele, caminhando em obediência e rendição àquilo que Deus já determinou para nós, tanto individualmente quanto como igreja.
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
                icon: Heart,
                title: "Entrega diária",
                description: "Decidir todos os dias confiar e entregar o controle a Deus.",
                gradient: "from-[#5b00a3] to-[#fcd95b]",
              },
              {
                icon: Flame,
                title: "Busca pela Presença",
                description: "Priorizar estar com Deus acima de qualquer outra coisa.",
                gradient: "from-[#fcd95b] to-[#5b00a3]",
              },
              {
                icon: Sparkles,
                title: "Liberação de destino",
                description: "Permitir que o que Deus já determinou se manifeste.",
                gradient: "from-purple-600 to-purple-400",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-white/5 backdrop-blur-md border-2 border-white/40 p-8 rounded-[32px] group cursor-pointer hover:bg-white/10 hover:border-white/60 transition-all duration-300"
              >
                <div className="mb-6">
                  <item.icon className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-heading font-bold text-xl text-white mb-3 tracking-tight">{item.title}</h3>
                <p className="text-white/70 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

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
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          >
            {[
              {
                icon: Calendar,
                step: "1",
                title: "Participe dos cultos",
                description: "Venha aos cultos nos horários indicados",
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

          {/* Video Explanation Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div
              className="relative group cursor-pointer aspect-video rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/10"
              onClick={() => setShowVideo(true)}
            >
              {showVideo ? (
                <video
                  src="https://rzvtpgvrhzr0gbqt.public.blob.vercel-storage.com/Vi%CC%81deo%20Site.mp4"
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                />
              ) : (
                <>
                  {/* Video Frame as Thumbnail */}
                  <video
                    src="https://rzvtpgvrhzr0gbqt.public.blob.vercel-storage.com/Vi%CC%81deo%20Site.mp4#t=0.1"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    muted
                    playsInline
                    preload="metadata"
                  />

                  {/* Overlay for depth */}
                  <div className="absolute inset-0 bg-black/20" />

                  {/* Play Button Overlay - Centered */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-24 h-24 rounded-full bg-accent text-black flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-10 h-10 fill-black ml-1" />
                    </div>
                  </div>

                  {/* Glassy Tag */}
                  <div className="absolute bottom-6 left-6 z-20 glass-card-premium px-4 py-2 rounded-full border border-white/20">
                    <p className="font-heading font-black text-xs text-white uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-accent" /> Assista o vídeo explicativo
                    </p>
                  </div>

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 shimmer-effect opacity-30 pointer-events-none" />
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section >

      {/* Programação Section */}
      < ScheduleCarousel />

      {/* Info Section */}
      <section className="section-padding bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: Clock, label: "Horário", value: "Seg-Sex 19h30 | Dom 10h, 17h, 19h" },
              { icon: MapPin, label: "Local", value: "Link Church, Belém/PA" },
              { icon: Baby, label: "Link Kids", value: "Disponível" },
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
              7 dias para viver uma experiência marcante e crescer na fé
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link to="/jornada">
                  <Button variant="primary" size="xl">
                    ACESSAR MINHA JORNADA
                  </Button>
                </Link>
              ) : (
                <Link to="/cadastro">
                  <Button variant="primary" size="xl">
                    COMEÇAR AGORA
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div >
  );
}