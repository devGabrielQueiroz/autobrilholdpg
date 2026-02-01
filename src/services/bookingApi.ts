/**
 * API Service para Agendamento Público
 * Usa Supabase diretamente (sem backend) - perfeito para Vercel
 */

import { supabase } from '../lib/supabase';

// ============================================
// TYPES
// ============================================

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  active: boolean;
}

export interface TimeSlot {
  time: string;
  display: string;
  available: boolean;
}

export interface AppointmentInput {
  customer_name: string;
  customer_phone: string;
  vehicle_type: string;
  service_id: string;
  start_time: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  vehicle_type: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
}

export interface BusinessHours {
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

export interface BlockedDate {
  date: string;
  is_full_day_blocked: boolean;
  open_time: string | null;
  close_time: string | null;
  reason: string | null;
}

// ============================================
// HELPERS
// ============================================

/**
 * Converte time string (HH:MM) para minutos desde meia-noite
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Gera slots de horário baseado nas configurações
 */
function generateTimeSlotsWithConfig(
  date: string,
  serviceDuration: number,
  openTime: string,
  closeTime: string
): { time: string; display: string }[] {
  const slots: { time: string; display: string }[] = [];
  
  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);

  const now = new Date();
  const isToday = date === now.toISOString().split('T')[0];

  for (let minutes = openMinutes; minutes < closeMinutes; minutes += 30) {
    // Verificar se o serviço cabe antes do fechamento
    if (minutes + serviceDuration > closeMinutes) continue;

    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    // Se for hoje, não mostrar horários passados
    if (isToday) {
      const slotTime = new Date(date);
      slotTime.setHours(hour, minute, 0, 0);
      if (slotTime <= now) continue;
    }

    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    slots.push({
      time: timeStr,
      display: timeStr,
    });
  }

  return slots;
}

/**
 * Formata datetime para ISO com timezone de Brasília
 */
function formatToISO(date: string, time: string): string {
  return `${date}T${time}:00-03:00`;
}

// ============================================
// BOOKING API
// ============================================

export const bookingAPI = {
  /**
   * Buscar serviços ativos (público)
   * RLS permite: SELECT onde active = true
   */
  getServices: async (): Promise<Service[]> => {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, description, price, duration_minutes, active')
      .eq('active', true)
      .order('price', { ascending: true });

    if (error) {
      console.error('Erro ao buscar serviços:', error);
      throw new Error('Não foi possível carregar os serviços');
    }

    return data || [];
  },

  /**
   * Buscar horários de funcionamento
   */
  getBusinessHours: async (): Promise<BusinessHours[]> => {
    const { data, error } = await supabase
      .from('business_hours')
      .select('day_of_week, is_open, open_time, close_time')
      .order('day_of_week');

    if (error) {
      console.error('Erro ao buscar horários:', error);
      // Retorna horário padrão se tabela não existir ainda
      return [
        { day_of_week: 0, is_open: false, open_time: '08:00', close_time: '18:00' },
        { day_of_week: 1, is_open: true, open_time: '08:00', close_time: '18:00' },
        { day_of_week: 2, is_open: true, open_time: '08:00', close_time: '18:00' },
        { day_of_week: 3, is_open: true, open_time: '08:00', close_time: '18:00' },
        { day_of_week: 4, is_open: true, open_time: '08:00', close_time: '18:00' },
        { day_of_week: 5, is_open: true, open_time: '08:00', close_time: '18:00' },
        { day_of_week: 6, is_open: true, open_time: '08:00', close_time: '14:00' },
      ];
    }

    return data || [];
  },

  /**
   * Verificar se uma data está bloqueada ou tem horário especial
   */
  getBlockedDate: async (date: string): Promise<BlockedDate | null> => {
    const { data, error } = await supabase
      .from('blocked_dates')
      .select('date, is_full_day_blocked, open_time, close_time, reason')
      .eq('date', date)
      .single();

    if (error) {
      // Não encontrou = não está bloqueada
      return null;
    }

    return data;
  },

  /**
   * Buscar horários disponíveis para uma data
   * Respeita configurações de business_hours e blocked_dates
   */
  getAvailability: async (date: string, serviceDuration: number = 90): Promise<TimeSlot[]> => {
    // 1. Verificar se data está bloqueada
    const blockedDate = await bookingAPI.getBlockedDate(date);
    
    if (blockedDate?.is_full_day_blocked) {
      return []; // Dia bloqueado - sem slots
    }

    // 2. Buscar horário do dia da semana
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    const businessHours = await bookingAPI.getBusinessHours();
    const dayConfig = businessHours.find(h => h.day_of_week === dayOfWeek);

    if (!dayConfig || !dayConfig.is_open) {
      return []; // Dia não funciona
    }

    // 3. Determinar horário de funcionamento (especial ou padrão)
    const openTime = blockedDate?.open_time || dayConfig.open_time;
    const closeTime = blockedDate?.close_time || dayConfig.close_time;

    // 4. Gerar slots baseado no horário
    const allSlots = generateTimeSlotsWithConfig(date, serviceDuration, openTime, closeTime);

    // 5. Buscar agendamentos do dia
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .neq('status', 'cancelled')
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay);

    if (error) {
      console.error('Erro ao buscar disponibilidade:', error);
      throw new Error('Não foi possível verificar disponibilidade');
    }

    // 6. Marcar slots ocupados
    const slotsWithAvailability = allSlots.map((slot) => {
      const slotStart = new Date(formatToISO(date, slot.time));
      const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);

      const hasConflict = (appointments || []).some((apt) => {
        const aptStart = new Date(apt.start_time);
        const aptEnd = new Date(apt.end_time);

        return (
          (slotStart >= aptStart && slotStart < aptEnd) ||
          (slotEnd > aptStart && slotEnd <= aptEnd) ||
          (slotStart <= aptStart && slotEnd >= aptEnd)
        );
      });

      return {
        ...slot,
        available: !hasConflict,
      };
    });

    return slotsWithAvailability.filter((slot) => slot.available);
  },

  /**
   * Verificar se um dia está disponível (para marcar no calendário)
   */
  isDayAvailable: async (date: string): Promise<boolean> => {
    // Verificar bloqueio
    const blockedDate = await bookingAPI.getBlockedDate(date);
    if (blockedDate?.is_full_day_blocked) {
      return false;
    }

    // Verificar dia da semana
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    const businessHours = await bookingAPI.getBusinessHours();
    const dayConfig = businessHours.find(h => h.day_of_week === dayOfWeek);

    return dayConfig?.is_open ?? false;
  },

  /**
   * Criar agendamento (público)
   */
  createAppointment: async (data: AppointmentInput): Promise<Appointment> => {
    const startTime = formatToISO(
      data.start_time.split('T')[0],
      data.start_time.split('T')[1]?.substring(0, 5) || data.start_time
    );

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        vehicle_type: data.vehicle_type,
        service_id: data.service_id,
        start_time: startTime,
        notes: data.notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar agendamento:', error);
      if (error.message.includes('Já existe um agendamento')) {
        throw new Error('Este horário já foi reservado. Por favor, escolha outro.');
      }
      throw new Error('Não foi possível confirmar o agendamento. Tente novamente.');
    }

    return appointment;
  },
};
