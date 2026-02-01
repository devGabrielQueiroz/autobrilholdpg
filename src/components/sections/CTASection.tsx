/**
 * CTASection - Seção de chamada para ação final
 * Incentiva o agendamento antes do footer
 */

import { useState } from 'react';
import { Container, Button, AgendamentoModal } from '../ui';

// Ícone de Calendário
const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export function CTASection() {
  // Estado para o modal de agendamento
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função para abrir modal de agendamento
  const handleAgendar = () => {
    setIsModalOpen(true);
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800" />
      
      {/* Decoração */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-3xl" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-cream mb-6">
            Pronto para deixar seu carro{' '}
            <span className="text-gradient-gold">brilhando?</span>
          </h2>

          {/* Descrição */}
          <p className="text-cream-dark text-lg md:text-xl mb-8 max-w-xl mx-auto">
            Agende agora online e dê ao seu veículo o cuidado que ele merece.
          </p>

          {/* CTA */}
          <Button onClick={handleAgendar} size="lg" className="animate-glow-pulse">
            <CalendarIcon />
            Agendar agora
          </Button>

          {/* Informação adicional */}
          <p className="mt-6 text-cream-dark text-sm">
            Agendamento rápido • Confirmação em até 1 hora
          </p>
        </div>
      </Container>

      {/* Modal de escolha de agendamento */}
      <AgendamentoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}

export default CTASection;
