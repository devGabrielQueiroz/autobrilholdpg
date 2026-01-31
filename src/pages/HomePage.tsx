/**
 * HomePage - Página principal da landing page
 * Combina todas as seções em uma única página
 */

import { Header, Footer, FloatingCTA } from '../components/layout';
import { 
  HeroSection, 
  ServicesSection, 
  DiferenciaisSection, 
  CTASection 
} from '../components/sections';

export function HomePage() {
  return (
    <div className="min-h-screen bg-dark-800">
      {/* Header fixo */}
      <Header />

      {/* Conteúdo principal */}
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Seção de Serviços */}
        <ServicesSection />

        {/* Seção de Diferenciais */}
        <DiferenciaisSection />

        {/* Seção CTA */}
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Botão flutuante de WhatsApp */}
      <FloatingCTA />
    </div>
  );
}

export default HomePage;
