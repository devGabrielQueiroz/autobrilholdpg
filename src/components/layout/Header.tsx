/**
 * Componente Header - Cabeçalho fixo com logo e CTA
 * Mobile-first com menu responsivo
 */

import { useState, useEffect } from 'react';
import { Container, Button } from '../ui';
import { Logo } from './Logo';

export function Header() {
  // Estado para detectar scroll e aplicar blur no header
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Função para rolar suavemente até a seção de serviços
  const scrollToServices = () => {
    const servicesSection = document.getElementById('servicos');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Função para abrir WhatsApp
  const handleAgendar = () => {
    const whatsappNumber = '5511999999999'; // Substituir pelo número real
    const message = encodeURIComponent('Olá! Gostaria de agendar um serviço na AutoBrilho.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${isScrolled 
          ? 'bg-dark-900/95 backdrop-blur-md shadow-lg border-b border-dark-600' 
          : 'bg-transparent'
        }
      `}
    >
      <Container>
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Logo />

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={scrollToServices}
              className="text-cream-muted hover:text-gold transition-colors duration-300 font-medium"
            >
              Serviços
            </button>
            <a
              href="#diferenciais"
              className="text-cream-muted hover:text-gold transition-colors duration-300 font-medium"
            >
              Diferenciais
            </a>
            <a
              href="#contato"
              className="text-cream-muted hover:text-gold transition-colors duration-300 font-medium"
            >
              Contato
            </a>
          </nav>

          {/* Botão CTA */}
          <Button 
            onClick={handleAgendar}
            size="sm"
            className="hidden sm:inline-flex"
          >
            Agendar agora
          </Button>

          {/* Botão Mobile */}
          <Button 
            onClick={handleAgendar}
            size="sm"
            className="sm:hidden text-sm px-4 py-2"
          >
            Agendar
          </Button>
        </div>
      </Container>
    </header>
  );
}

export default Header;
