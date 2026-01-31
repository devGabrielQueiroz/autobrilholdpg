/**
 * ServicesSection - Seção de serviços oferecidos
 * Cards responsivos com preços e CTAs
 */

import { Container, Card, Button, Badge } from '../ui';

// Interface para os serviços
interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string;
  popular?: boolean;
  features?: string[];
}

// Dados mockados dos serviços
const services: Service[] = [
  {
    id: 1,
    name: 'Lavagem Simples',
    description: 'Lavagem externa completa com produtos de alta qualidade. Ideal para manutenção semanal.',
    price: 50,
    duration: '30 min',
    features: ['Lavagem externa', 'Secagem com pano', 'Limpeza de vidros'],
  },
  {
    id: 2,
    name: 'Lavagem Completa',
    description: 'Lavagem interna e externa com aspiração e hidratação do painel.',
    price: 85,
    duration: '1h',
    popular: true,
    features: ['Lavagem externa', 'Limpeza interna', 'Aspiração', 'Hidratação do painel'],
  },
  {
    id: 3,
    name: 'Lavagem Premium',
    description: 'Tratamento completo com cera de proteção e finalização impecável.',
    price: 105,
    duration: '1h30',
    features: ['Tudo da Completa', 'Cera de proteção', 'Pretinho nos pneus', 'Revitalização de plásticos'],
  },
  {
    id: 4,
    name: 'Higienização de Bancos',
    description: 'Limpeza profunda dos estofados com extratora profissional.',
    price: 110,
    duration: '2h',
    features: ['Extração de sujeira', 'Eliminação de odores', 'Higienização antibacteriana'],
  },
  {
    id: 5,
    name: 'Limpeza de Motor',
    description: 'Limpeza e desengraxamento do compartimento do motor com proteção.',
    price: 120,
    duration: '1h',
    features: ['Desengraxamento', 'Proteção de componentes', 'Acabamento profissional'],
  },
];

// Componente de ícone de check
const CheckIcon = () => (
  <svg className="w-4 h-4 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

// Componente de ícone de relógio
const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Componente do card de serviço
function ServiceCard({ service }: { service: Service }) {
  // Função para abrir WhatsApp com serviço pré-selecionado
  const handleAgendar = () => {
    const whatsappNumber = '5511999999999';
    const message = encodeURIComponent(
      `Olá! Gostaria de agendar o serviço: ${service.name} (R$${service.price})`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <Card
      variant="glow"
      className={`
        relative flex flex-col h-full
        ${service.popular ? 'border-gold/50 ring-1 ring-gold/20' : ''}
      `}
    >
      {/* Badge de popular */}
      {service.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="gold" size="sm">
            ⭐ Mais pedido
          </Badge>
        </div>
      )}

      {/* Header do card */}
      <div className="mb-4">
        <h3 className="font-heading font-bold text-lg md:text-xl text-cream mb-2">
          {service.name}
        </h3>
        <p className="text-cream-dark text-sm leading-relaxed">
          {service.description}
        </p>
      </div>

      {/* Features */}
      {service.features && (
        <ul className="space-y-2 mb-6 flex-grow">
          {service.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-cream-muted">
              <CheckIcon />
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* Footer do card */}
      <div className="mt-auto pt-4 border-t border-dark-600">
        {/* Preço e duração */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl md:text-3xl font-heading font-bold text-gold">
              R${service.price}
            </span>
          </div>
          <div className="flex items-center gap-1 text-cream-dark text-sm">
            <ClockIcon />
            <span>{service.duration}</span>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handleAgendar}
          variant={service.popular ? 'primary' : 'secondary'}
          fullWidth
          size="sm"
        >
          Agendar serviço
        </Button>
      </div>
    </Card>
  );
}

export function ServicesSection() {
  return (
    <section id="servicos" className="section bg-dark-800 relative">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <Container className="relative z-10">
        {/* Header da seção */}
        <div className="text-center mb-12 md:mb-16">
          <Badge className="mb-4">Nossos Serviços</Badge>
          <h2 className="font-heading font-bold text-cream mb-4">
            Cuidados completos para seu veículo
          </h2>
          <p className="text-cream-dark max-w-2xl mx-auto">
            Oferecemos uma variedade de serviços pensados para atender todas as necessidades 
            do seu carro, com qualidade profissional e atenção aos detalhes.
          </p>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* CTA adicional */}
        <div className="text-center mt-12 md:mt-16">
          <p className="text-cream-dark mb-4">
            Não encontrou o que procura? Entre em contato para um orçamento personalizado.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              const whatsappNumber = '5511999999999';
              const message = encodeURIComponent('Olá! Gostaria de um orçamento personalizado.');
              window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
            }}
          >
            Solicitar orçamento
          </Button>
        </div>
      </Container>
    </section>
  );
}

export default ServicesSection;
