/**
 * Página de Agendamento - Cliente
 * Fluxo: Serviço → Data → Horário → Dados → Confirmação
 */

import { useState, useEffect } from 'react';
import { bookingAPI, type Service, type TimeSlot } from '../services/bookingApi';

type Step = 'service' | 'date' | 'time' | 'customer' | 'confirmation';

interface CustomerData {
  customer_name: string;
  customer_phone: string;
  vehicle_type: string;
  notes: string;
}

export function AgendamentoPage() {
  const [currentStep, setCurrentStep] = useState<Step>('service');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dados do agendamento
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({
    customer_name: '',
    customer_phone: '',
    vehicle_type: '',
    notes: '',
  });
  const [bookingComplete, setBookingComplete] = useState(false);

  // Carregar serviços ao montar
  useEffect(() => {
    loadServices();
  }, []);

  // Carregar disponibilidade quando data mudar
  useEffect(() => {
    if (selectedDate && selectedService) {
      loadAvailability();
    }
  }, [selectedDate, selectedService]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await bookingAPI.getServices();
      setServices(data);
    } catch (err) {
      setError('Erro ao carregar serviços. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      setLoading(true);
      setError('');
      const slots = await bookingAPI.getAvailability(
        selectedDate,
        selectedService?.duration_minutes
      );
      setAvailableSlots(slots);
      setSelectedTime(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar horários');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedDate('');
    setSelectedTime(null);
    setCurrentStep('date');
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setCurrentStep('time');
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedTime(slot);
    setCurrentStep('customer');
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedTime || !selectedDate) return;

    try {
      setLoading(true);
      setError('');

      // Combinar data e hora para o start_time
      const startTime = `${selectedDate}T${selectedTime.time}`;

      await bookingAPI.createAppointment({
        customer_name: customerData.customer_name,
        customer_phone: customerData.customer_phone,
        vehicle_type: customerData.vehicle_type,
        service_id: selectedService.id,
        start_time: startTime,
        notes: customerData.notes || undefined,
      });

      setBookingComplete(true);
      setCurrentStep('confirmation');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    switch (currentStep) {
      case 'date':
        setCurrentStep('service');
        break;
      case 'time':
        setCurrentStep('date');
        break;
      case 'customer':
        setCurrentStep('time');
        break;
    }
  };

  const resetBooking = () => {
    setCurrentStep('service');
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime(null);
    setCustomerData({
      customer_name: '',
      customer_phone: '',
      vehicle_type: '',
      notes: '',
    });
    setBookingComplete(false);
    setError('');
  };

  // Gerar próximos 30 dias para o calendário
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        day: date.getDate(),
        weekDay: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      });
    }
    
    return dates;
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-8">
      {(['service', 'date', 'time', 'customer'] as const).map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              currentStep === step
                ? 'bg-gold text-dark-900'
                : bookingComplete || 
                  (['service', 'date', 'time', 'customer'].indexOf(currentStep) >
                    ['service', 'date', 'time', 'customer'].indexOf(step))
                ? 'bg-green-500 text-white'
                : 'bg-dark-700 text-gray-400'
            }`}
          >
            {index + 1}
          </div>
          {index < 3 && (
            <div
              className={`w-8 h-0.5 ${
                ['service', 'date', 'time', 'customer'].indexOf(currentStep) > index
                  ? 'bg-green-500'
                  : 'bg-dark-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-600 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                <span className="text-gold">Auto</span>
                <span className="text-white">Brilho</span>
              </span>
            </a>
            {currentStep !== 'service' && currentStep !== 'confirmation' && (
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Agendar Serviço</h1>
          <p className="text-gray-400">
            {currentStep === 'service' && 'Escolha o serviço desejado'}
            {currentStep === 'date' && 'Selecione a data'}
            {currentStep === 'time' && 'Escolha o horário'}
            {currentStep === 'customer' && 'Preencha seus dados'}
            {currentStep === 'confirmation' && 'Agendamento realizado!'}
          </p>
        </div>

        {/* Indicador de steps */}
        {!bookingComplete && stepIndicator}

        {/* Erro global */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && currentStep === 'service' && (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        )}

        {/* Step 1: Seleção de Serviço */}
        {currentStep === 'service' && !loading && (
          <div className="space-y-4">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className="w-full p-6 bg-dark-800 rounded-xl border border-dark-600 hover:border-gold transition-all text-left group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors">
                    {service.name}
                  </h3>
                  <span className="text-gold font-bold text-lg">
                    R$ {service.price.toFixed(2)}
                  </span>
                </div>
                {service.description && (
                  <p className="text-gray-400 text-sm mb-3">{service.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {service.duration_minutes} minutos
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Seleção de Data */}
        {currentStep === 'date' && (
          <div>
            {/* Serviço selecionado */}
            <div className="mb-6 p-4 bg-dark-800 rounded-xl border border-gold/30">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Serviço selecionado</p>
                  <p className="text-white font-semibold">{selectedService?.name}</p>
                </div>
                <span className="text-gold font-bold">
                  R$ {selectedService?.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Calendário horizontal */}
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-3" style={{ width: 'max-content' }}>
                {generateDates().map((date) => (
                  <button
                    key={date.value}
                    onClick={() => handleDateSelect(date.value)}
                    className={`flex flex-col items-center p-4 rounded-xl border transition-all min-w-[80px] ${
                      selectedDate === date.value
                        ? 'bg-gold text-dark-900 border-gold'
                        : 'bg-dark-800 border-dark-600 hover:border-gold text-white'
                    }`}
                  >
                    <span className="text-xs uppercase opacity-70">{date.weekDay}</span>
                    <span className="text-2xl font-bold">{date.day}</span>
                    <span className="text-xs uppercase opacity-70">{date.month}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Seleção de Horário */}
        {currentStep === 'time' && (
          <div>
            {/* Resumo */}
            <div className="mb-6 p-4 bg-dark-800 rounded-xl border border-gold/30">
              <div className="flex justify-between items-center mb-2">
                <p className="text-white font-semibold">{selectedService?.name}</p>
                <span className="text-gold font-bold">R$ {selectedService?.price.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-400">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>

            {/* Horários */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => handleTimeSelect(slot)}
                    className={`py-4 px-2 rounded-xl border text-center font-semibold transition-all ${
                      selectedTime?.time === slot.time
                        ? 'bg-gold text-dark-900 border-gold'
                        : 'bg-dark-800 border-dark-600 hover:border-gold text-white'
                    }`}
                  >
                    {slot.display}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400">Nenhum horário disponível nesta data</p>
                <button
                  onClick={() => setCurrentStep('date')}
                  className="mt-4 text-gold hover:underline"
                >
                  Escolher outra data
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Dados do Cliente */}
        {currentStep === 'customer' && (
          <div>
            {/* Resumo */}
            <div className="mb-6 p-4 bg-dark-800 rounded-xl border border-gold/30">
              <div className="flex justify-between items-center mb-2">
                <p className="text-white font-semibold">{selectedService?.name}</p>
                <span className="text-gold font-bold">R$ {selectedService?.price.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-400">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}{' '}
                às {selectedTime?.display}
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Seu nome *
                </label>
                <input
                  type="text"
                  value={customerData.customer_name}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, customer_name: e.target.value })
                  }
                  className="w-full px-4 py-4 rounded-xl bg-dark-800 border border-dark-600 text-white placeholder-gray-500 focus:border-gold outline-none text-lg"
                  placeholder="Como podemos te chamar?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  value={customerData.customer_phone}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, customer_phone: e.target.value })
                  }
                  className="w-full px-4 py-4 rounded-xl bg-dark-800 border border-dark-600 text-white placeholder-gray-500 focus:border-gold outline-none text-lg"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de veículo *
                </label>
                <select
                  value={customerData.vehicle_type}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, vehicle_type: e.target.value })
                  }
                  className="w-full px-4 py-4 rounded-xl bg-dark-800 border border-dark-600 text-white focus:border-gold outline-none text-lg appearance-none"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Hatch">Hatch</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Moto">Moto</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={customerData.notes}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, notes: e.target.value })
                  }
                  className="w-full px-4 py-4 rounded-xl bg-dark-800 border border-dark-600 text-white placeholder-gray-500 focus:border-gold outline-none resize-none"
                  placeholder="Alguma informação adicional?"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl bg-gold text-dark-900 font-bold text-lg hover:bg-gold-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Confirmar Agendamento'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 5: Confirmação */}
        {currentStep === 'confirmation' && bookingComplete && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">
              Solicitação Enviada!
            </h2>

            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Sua solicitação de agendamento foi recebida. Entraremos em contato pelo
              WhatsApp para confirmar seu horário.
            </p>

            {/* Resumo do agendamento */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-600 text-left mb-8">
              <h3 className="text-gold font-semibold mb-4">Resumo do Agendamento</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Serviço:</span>
                  <span className="text-white">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Data:</span>
                  <span className="text-white">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Horário:</span>
                  <span className="text-white">{selectedTime?.display}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Valor:</span>
                  <span className="text-gold font-bold">R$ {selectedService?.price.toFixed(2)}</span>
                </div>
                <hr className="border-dark-600" />
                <div className="flex justify-between">
                  <span className="text-gray-400">Cliente:</span>
                  <span className="text-white">{customerData.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">WhatsApp:</span>
                  <span className="text-white">{customerData.customer_phone}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href="/"
                className="py-4 px-6 rounded-xl bg-gold text-dark-900 font-bold text-lg hover:bg-gold-dark transition-colors"
              >
                Voltar ao Início
              </a>
              <button
                onClick={resetBooking}
                className="py-4 px-6 rounded-xl bg-dark-700 text-white font-semibold hover:bg-dark-600 transition-colors"
              >
                Fazer Novo Agendamento
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
