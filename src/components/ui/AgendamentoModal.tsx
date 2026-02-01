/**
 * AgendamentoModal - Modal de escolha entre WhatsApp e Agendamento Online
 * Permite ao usuário escolher como deseja agendar seu serviço
 * Usa React Portal para garantir posicionamento correto independente do scroll
 */

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

interface AgendamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Ícone do WhatsApp
const WhatsAppIcon = () => (
  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

// Ícone de Calendário/Agendamento
const CalendarIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
  </svg>
);

// Ícone de fechar
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export function AgendamentoModal({ isOpen, onClose }: AgendamentoModalProps) {
  const navigate = useNavigate();

  // Fechar com ESC
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Abrir WhatsApp
  const handleWhatsApp = () => {
    const phone = '5511999999999'; // Substituir pelo número real
    const message = encodeURIComponent('Olá! Gostaria de agendar um serviço de estética automotiva.');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    onClose();
  };

  // Ir para agendamento online
  const handleAgendamentoOnline = () => {
    navigate('/agendar');
    onClose();
  };

  if (!isOpen) return null;

  // Usar Portal para renderizar diretamente no body
  // Isso garante que o modal funcione corretamente independente do scroll
  // e não seja afetado por transforms ou contextos de stacking dos parents
  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Decoração de brilho */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gold/10 blur-3xl rounded-full" />
        
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-cream-dark hover:text-cream hover:bg-dark-700 rounded-lg transition-all duration-200 z-10"
          aria-label="Fechar"
        >
          <CloseIcon />
        </button>

        {/* Conteúdo */}
        <div className="relative p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-cream mb-2">
              Como deseja agendar?
            </h2>
            <p className="text-cream-dark">
              Escolha a forma mais conveniente para você
            </p>
          </div>

          {/* Opções */}
          <div className="grid gap-4">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="group relative flex items-center gap-4 p-5 bg-dark-700/50 hover:bg-dark-700 border border-dark-600 hover:border-green-500/50 rounded-xl transition-all duration-300 overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Ícone */}
              <div className="relative flex-shrink-0 w-14 h-14 flex items-center justify-center bg-green-500/10 group-hover:bg-green-500/20 border border-green-500/20 rounded-xl text-green-500 transition-all duration-300 group-hover:scale-105">
                <WhatsAppIcon />
              </div>

              {/* Texto */}
              <div className="relative flex-1 text-left">
                <h3 className="text-lg font-semibold text-cream group-hover:text-green-400 transition-colors">
                  WhatsApp
                </h3>
                <p className="text-sm text-cream-dark">
                  Fale diretamente com nossa equipe
                </p>
              </div>

              {/* Seta */}
              <svg 
                className="relative w-5 h-5 text-cream-dark group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            {/* Agendamento Online */}
            <button
              onClick={handleAgendamentoOnline}
              className="group relative flex items-center gap-4 p-5 bg-dark-700/50 hover:bg-dark-700 border border-dark-600 hover:border-gold/50 rounded-xl transition-all duration-300 overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/5 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Ícone */}
              <div className="relative flex-shrink-0 w-14 h-14 flex items-center justify-center bg-gold/10 group-hover:bg-gold/20 border border-gold/20 rounded-xl text-gold transition-all duration-300 group-hover:scale-105">
                <CalendarIcon />
              </div>

              {/* Texto */}
              <div className="relative flex-1 text-left">
                <h3 className="text-lg font-semibold text-cream group-hover:text-gold transition-colors">
                  Agendar Online
                </h3>
                <p className="text-sm text-cream-dark">
                  Escolha data e horário disponíveis
                </p>
              </div>

              {/* Seta */}
              <svg 
                className="relative w-5 h-5 text-cream-dark group-hover:text-gold group-hover:translate-x-1 transition-all duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* Footer hint */}
          <p className="text-center text-xs text-cream-dark/60 mt-6">
            Pressione <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-cream-dark">ESC</kbd> para fechar
          </p>
        </div>
      </div>
    </div>
  );

  // Renderizar no body usando Portal
  return createPortal(modalContent, document.body);
}
