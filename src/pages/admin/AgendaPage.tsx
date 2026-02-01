/**
 * Página de Agenda do admin
 */

import { useState, useEffect, useCallback } from 'react';
import { appointmentsAPI, servicesAPI } from '../../services/api';
import type { Appointment, Service, AppointmentStatus } from '../../services/api';

type ViewMode = 'day' | 'week';

export function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    vehicle_type: '',
    service_id: '',
    start_time: '',
    notes: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      let startDate: string;
      let endDate: string;

      if (viewMode === 'day') {
        startDate = selectedDate.toISOString().split('T')[0];
        endDate = startDate;
      } else {
        const start = new Date(selectedDate);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        startDate = start.toISOString().split('T')[0];
        endDate = end.toISOString().split('T')[0];
      }

      const [appointmentsRes, servicesRes] = await Promise.all([
        appointmentsAPI.list({ startDate, endDate }),
        servicesAPI.list(),
      ]);

      setAppointments(appointmentsRes.data);
      setServices(servicesRes.data.filter((s: Service) => s.active));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, viewMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - (viewMode === 'day' ? 1 : 7));
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (viewMode === 'day' ? 1 : 7));
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const openNewAppointmentModal = () => {
    setEditingAppointment(null);
    setFormData({
      customer_name: '',
      customer_phone: '',
      vehicle_type: '',
      service_id: services[0]?.id || '',
      start_time: '',
      notes: '',
    });
    setShowModal(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      customer_name: appointment.customer_name,
      customer_phone: appointment.customer_phone,
      vehicle_type: appointment.vehicle_type || '',
      service_id: appointment.service_id,
      start_time: new Date(appointment.start_time).toISOString().slice(0, 16),
      notes: appointment.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Por enquanto, apenas fecha o modal (funcionalidade completa requer endpoint)
    setShowModal(false);
    loadData();
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await appointmentsAPI.updateStatus(id, status);
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendente';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
          <p className="text-gray-400">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Agenda</h1>
          <p className="text-gray-400 capitalize">{formatDate(selectedDate)}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden border border-dark-600">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'day' 
                  ? 'bg-gold text-dark-900' 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'week' 
                  ? 'bg-gold text-dark-900' 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              Semana
            </button>
          </div>

          {/* Date navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-lg bg-dark-700 text-gray-300 hover:bg-dark-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 rounded-lg bg-dark-700 text-gray-300 hover:bg-dark-600 transition-colors text-sm font-medium"
            >
              Hoje
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg bg-dark-700 text-gray-300 hover:bg-dark-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* New appointment button */}
          <button
            onClick={openNewAppointmentModal}
            className="px-4 py-2 rounded-lg bg-gold text-dark-900 font-medium hover:bg-gold-dark transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Appointments list */}
      <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
        {appointments.length > 0 ? (
          <div className="divide-y divide-dark-600">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 hover:bg-dark-700/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">{appointment.customer_name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                    <p className="text-gold text-sm mb-1">{appointment.service?.name || 'Serviço'}</p>
                    <p className="text-gray-400 text-sm">{appointment.customer_phone}</p>
                    {appointment.notes && (
                      <p className="text-gray-500 text-sm mt-2 italic">"{appointment.notes}"</p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {new Date(appointment.start_time).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {appointment.service?.duration_minutes || 60} min
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(appointment)}
                      className="p-2 rounded-lg bg-dark-700 text-gray-300 hover:bg-dark-600 transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Status dropdown */}
                    <select
                      value={appointment.status}
                      onChange={(e) => handleStatusChange(appointment.id, e.target.value as AppointmentStatus)}
                      className="px-2 py-1 rounded-lg bg-dark-700 text-gray-300 border border-dark-500 text-sm focus:border-gold outline-none"
                    >
                      <option value="pending">Pendente</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="in_progress">Em Andamento</option>
                      <option value="completed">Concluído</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg">Nenhum agendamento para este período</p>
            <p className="text-sm mt-2">Clique em "Novo Agendamento" para criar um</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-lg">
            <div className="p-6 border-b border-dark-600">
              <h2 className="text-xl font-semibold text-white">
                {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-500 text-white focus:border-gold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-500 text-white focus:border-gold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Veículo
                </label>
                <input
                  type="text"
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-500 text-white focus:border-gold outline-none"
                  placeholder="Ex: Sedan, SUV, Pickup..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Serviço *
                </label>
                <select
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-500 text-white focus:border-gold outline-none"
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)} ({service.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data e Hora *
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-500 text-white focus:border-gold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-500 text-white focus:border-gold outline-none resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-dark-700 text-gray-300 hover:bg-dark-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg bg-gold text-dark-900 font-medium hover:bg-gold-dark transition-colors"
                >
                  {editingAppointment ? 'Salvar' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
