/**
 * HeroSection - Seção principal da landing page
 * Primeira impressão visual com headline e CTA
 */

import { Container, Button } from '../ui';

// Ícone de brilho/estrela
const SparkleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0L14.645 8.355L23 11L14.645 13.645L12 22L9.355 13.645L1 11L9.355 8.355L12 0Z"/>
  </svg>
);

// Ícone de play
const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

export function HeroSection() {
  // Função para abrir WhatsApp
  const handleAgendar = () => {
    const whatsappNumber = '5511999999999'; // Substituir pelo número real
    const message = encodeURIComponent('Olá! Gostaria de agendar um serviço na AutoBrilho.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  // Função para rolar até serviços
  const scrollToServices = () => {
    const servicesSection = document.getElementById('servicos');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background com gradiente e padrão */}
      <div className="absolute inset-0 bg-dark-900">
        {/* Gradiente radial dourado sutil */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-3xl" />
        
        {/* Linhas decorativas */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          <div className="absolute top-40 right-20 w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          <div className="absolute bottom-32 left-1/4 w-20 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
      </div>

      <Container className="relative z-10">
        <div className="flex flex-col items-center text-center pt-20 pb-12 md:pt-24 md:pb-16">
          {/* Badge superior */}
          <div className="animate-fade-in mb-6 md:mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full text-gold text-sm font-medium">
              <SparkleIcon />
              Estética Automotiva Premium
            </span>
          </div>

          {/* Headline principal */}
          <h1 className="animate-slide-up text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-cream leading-tight mb-6">
            Seu carro com{' '}
            <span className="relative inline-block">
              <span 
                className="text-gradient-gold inline-block cursor-default transition-all duration-500 hover:scale-105 hover:[text-shadow:0_0_30px_rgba(212,175,55,0.8),0_0_60px_rgba(212,175,55,0.4)]"
              >
                brilho
              </span>
              {' '}de novo
              {/* Underline decorativo */}
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light rounded-full" />
            </span>
          </h1>

          {/* Subheadline */}
          <p 
            className="animate-slide-up text-lg md:text-xl text-cream-dark max-w-2xl mb-8 mt-8 md:mb-10 leading-relaxed"
            style={{ animationDelay: '0.1s' }}
          >
            Transformamos seu veículo com cuidado profissional e atenção aos detalhes. 
            Qualidade premium que você pode ver e sentir.
          </p>

          {/* CTAs */}
          <div 
            className="animate-slide-up flex flex-col sm:flex-row items-center gap-4"
            style={{ animationDelay: '0.2s' }}
          >
            <Button onClick={handleAgendar} size="lg">
              <SparkleIcon />
              Agendar agora
            </Button>
            <Button onClick={scrollToServices} variant="secondary" size="lg">
              <PlayIcon />
              Ver serviços
            </Button>
          </div>

          {/* Stats/Social proof */}
          <div 
            className="animate-fade-in mt-12 md:mt-16 grid grid-cols-3 gap-6 md:gap-12"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-heading font-bold text-gold">500+</p>
              <p className="text-xs md:text-sm text-cream-dark">Clientes satisfeitos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-heading font-bold text-gold">5.0</p>
              <p className="text-xs md:text-sm text-cream-dark">Avaliação média</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-heading font-bold text-gold">3+</p>
              <p className="text-xs md:text-sm text-cream-dark">Anos de experiência</p>
            </div>
          </div>
        </div>
      </Container>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <button 
          onClick={scrollToServices}
          className="flex flex-col items-center gap-2 text-cream-dark hover:text-gold transition-colors duration-300"
          aria-label="Rolar para baixo"
        >
          <span className="text-xs">Scroll</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
    </section>
  );
}

export default HeroSection;
