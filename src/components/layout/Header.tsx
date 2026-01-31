/**
 * Componente Header - Cabeçalho fixo com logo e CTA
 * Mobile-first com menu responsivo
 */

import { useState, useEffect, useRef } from 'react';
import { Container, Button } from '../ui';
import { Logo } from './Logo';

// Seções para navegação
const navSections = [
  { id: 'servicos', label: 'Serviços' },
  { id: 'diferenciais', label: 'Diferenciais' },
  { id: 'contato', label: 'Contato' },
];

export function Header() {
  // Estado para detectar scroll e aplicar blur no header
  const [isScrolled, setIsScrolled] = useState(false);
  // Estado para a seção ativa
  const [activeSection, setActiveSection] = useState<string | null>(null);
  // Ref para os links de navegação
  const navRefs = useRef<{ [key: string]: HTMLButtonElement | HTMLAnchorElement | null }>({});
  // Estado para posição do indicador
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  // Estado para progresso do scroll
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Calcular progresso do scroll
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));

      // Detectar seção ativa baseado no scroll
      const scrollPosition = window.scrollY + 150; // Offset para detecção

      // Se estiver no topo, não há seção ativa
      if (window.scrollY < 100) {
        setActiveSection(null);
        return;
      }

      // Verificar se está perto do final da página (seção contato)
      const isNearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100;
      if (isNearBottom) {
        setActiveSection('contato');
        return;
      }

      // Verificar cada seção (de baixo para cima para priorizar a seção visível)
      let foundSection: string | null = null;
      for (const section of navSections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            foundSection = section.id;
            break;
          }
        }
      }
      
      if (foundSection) {
        setActiveSection(foundSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Verificar posição inicial
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Atualizar posição do indicador quando a seção ativa muda
  useEffect(() => {
    if (activeSection && navRefs.current[activeSection]) {
      const element = navRefs.current[activeSection];
      if (element) {
        const rect = element.getBoundingClientRect();
        const parentRect = element.parentElement?.getBoundingClientRect();
        if (parentRect) {
          setIndicatorStyle({
            left: rect.left - parentRect.left,
            width: rect.width,
            opacity: 1,
          });
        }
      }
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [activeSection]);

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
          <nav className="hidden md:flex items-center gap-8 relative">
            {/* Indicador animado */}
            <div
              className="absolute -bottom-1 h-0.5 bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-300 ease-out"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                opacity: indicatorStyle.opacity,
              }}
            />
            
            <button
              ref={(el) => { navRefs.current['servicos'] = el; }}
              onClick={scrollToServices}
              className={`text-sm font-medium transition-colors duration-300 py-2 ${
                activeSection === 'servicos' 
                  ? 'text-gold' 
                  : 'text-cream-muted hover:text-gold'
              }`}
            >
              Serviços
            </button>
            <a
              ref={(el) => { navRefs.current['diferenciais'] = el; }}
              href="#diferenciais"
              className={`text-sm font-medium transition-colors duration-300 py-2 ${
                activeSection === 'diferenciais' 
                  ? 'text-gold' 
                  : 'text-cream-muted hover:text-gold'
              }`}
            >
              Diferenciais
            </a>
            <a
              ref={(el) => { navRefs.current['contato'] = el; }}
              href="#contato"
              className={`text-sm font-medium transition-colors duration-300 py-2 ${
                activeSection === 'contato' 
                  ? 'text-gold' 
                  : 'text-cream-muted hover:text-gold'
              }`}
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

      {/* Barra de progresso do scroll */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-dark-700/30 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold/80 via-gold to-gold-light transition-all duration-150 ease-out relative"
          style={{ width: `${scrollProgress}%` }}
        >
          {/* Shimmer/ponto de luz na ponta */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-[6px] bg-gradient-to-r from-transparent via-white to-white/0 animate-pulse" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 -mr-1">
            <div className="absolute inset-0 bg-white rounded-full blur-sm animate-ping opacity-75" />
            <div className="absolute inset-0 bg-white rounded-full blur-[2px] opacity-90" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
