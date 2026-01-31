/**
 * DiferenciaisSection - Seção de diferenciais da empresa
 * Cards com ícones e descrições dos benefícios
 */

import { Container, Badge } from '../ui';

// Interface para os diferenciais
interface Diferencial {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Ícones dos diferenciais
const icons = {
  quality: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  home: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  car: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h8m-8 5h8m-4 4v.01M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
  ),
  tools: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

// Dados mockados dos diferenciais
const diferenciais: Diferencial[] = [
  {
    id: 1,
    title: 'Atendimento de Qualidade',
    description: 'Tratamos cada cliente de forma única, com atenção personalizada e compromisso com a sua satisfação total.',
    icon: icons.quality,
  },
  {
    id: 2,
    title: 'Serviço a Domicílio',
    description: 'Levamos nossa estrutura até você. Atendimento no conforto da sua casa ou trabalho, sem complicações.',
    icon: icons.home,
  },
  {
    id: 3,
    title: 'Busca e Entrega',
    description: 'Buscamos seu veículo, realizamos o serviço e entregamos onde você preferir. Praticidade total.',
    icon: icons.car,
  },
  {
    id: 4,
    title: 'Cuidado Profissional',
    description: 'Utilizamos produtos premium e técnicas profissionais para garantir o melhor resultado em cada serviço.',
    icon: icons.tools,
  },
];

// Componente do card de diferencial
function DiferencialCard({ diferencial }: { diferencial: Diferencial }) {
  return (
    <div className="group relative p-6 md:p-8 rounded-2xl bg-dark-700/50 border border-dark-600 hover:border-gold/30 transition-all duration-300">
      {/* Glow effect no hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {/* Ícone */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gold/10 text-gold mb-5 group-hover:scale-110 group-hover:bg-gold/20 transition-all duration-300">
          {diferencial.icon}
        </div>

        {/* Título */}
        <h3 className="font-heading font-bold text-lg md:text-xl text-cream mb-3 group-hover:text-gold transition-colors duration-300">
          {diferencial.title}
        </h3>

        {/* Descrição */}
        <p className="text-cream-dark text-sm md:text-base leading-relaxed">
          {diferencial.description}
        </p>
      </div>
    </div>
  );
}

export function DiferenciaisSection() {
  return (
    <section id="diferenciais" className="section bg-dark-900 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0">
        {/* Linha dourada decorativa */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>

      <Container className="relative z-10">
        {/* Header da seção */}
        <div className="text-center mb-12 md:mb-16">
          <Badge className="mb-4">Diferenciais</Badge>
          <h2 className="font-heading font-bold text-cream mb-4">
            Por que escolher a AutoBrilho?
          </h2>
          <p className="text-cream-dark max-w-2xl mx-auto">
            Nossa missão é oferecer mais do que uma simples lavagem. 
            Proporcionamos uma experiência completa de cuidado para o seu veículo.
          </p>
        </div>

        {/* Grid de diferenciais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {diferenciais.map((diferencial) => (
            <DiferencialCard key={diferencial.id} diferencial={diferencial} />
          ))}
        </div>

        {/* Frase de destaque */}
        <div className="mt-16 md:mt-20 text-center">
          <blockquote className="relative">
            {/* Aspas decorativas */}
            <span className="absolute -top-4 -left-2 text-6xl text-gold/20 font-serif">"</span>
            <p className="text-xl md:text-2xl lg:text-3xl font-heading font-medium text-cream-muted italic max-w-3xl mx-auto px-8">
              Cuidamos do seu carro como se fosse nosso
            </p>
            <span className="absolute -bottom-8 -right-2 text-6xl text-gold/20 font-serif rotate-180">"</span>
          </blockquote>
        </div>
      </Container>
    </section>
  );
}

export default DiferenciaisSection;
