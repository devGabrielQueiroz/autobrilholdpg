/**
 * Service para operações com Agendamentos
 * Lógica de negócio separada dos controllers
 */

import { supabaseAdmin, supabase } from '../config/supabase.js';

// Usar cliente admin se disponível
const db = supabaseAdmin || supabase;

/**
 * Listar agendamentos com filtros
 * @param {Object} filters - Filtros opcionais
 */
export async function listAppointments(filters = {}) {
  const { date, status, startDate, endDate } = filters;

  let query = db
    .from('appointments')
    .select(`
      *,
      service:services(id, name, price, duration_minutes)
    `)
    .order('start_time', { ascending: true });

  // Filtrar por data específica
  if (date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    query = query
      .gte('start_time', dayStart.toISOString())
      .lte('start_time', dayEnd.toISOString());
  }

  // Filtrar por intervalo de datas
  if (startDate) {
    query = query.gte('start_time', new Date(startDate).toISOString());
  }
  if (endDate) {
    query = query.lte('start_time', new Date(endDate).toISOString());
  }

  // Filtrar por status
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Buscar agendamentos do dia
 */
export async function getTodayAppointments() {
  const today = new Date();
  return listAppointments({ date: today.toISOString().split('T')[0] });
}

/**
 * Buscar próximos agendamentos (pendentes e confirmados)
 * @param {number} limit - Quantidade máxima de resultados
 */
export async function getUpcomingAppointments(limit = 10) {
  const now = new Date().toISOString();

  const { data, error } = await db
    .from('appointments')
    .select(`
      *,
      service:services(id, name, price, duration_minutes)
    `)
    .gte('start_time', now)
    .in('status', ['pending', 'confirmed'])
    .order('start_time', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Buscar agendamento por ID
 * @param {string} id - UUID do agendamento
 */
export async function getAppointmentById(id) {
  const { data, error } = await db
    .from('appointments')
    .select(`
      *,
      service:services(id, name, price, duration_minutes)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Criar novo agendamento (público)
 * @param {Object} appointmentData - Dados do agendamento
 */
export async function createAppointment(appointmentData) {
  const {
    customer_name,
    customer_phone,
    vehicle_type,
    service_id,
    start_time,
    notes
  } = appointmentData;

  // Validações básicas
  if (!customer_name?.trim()) throw new Error('Nome do cliente é obrigatório');
  if (!customer_phone?.trim()) throw new Error('Telefone é obrigatório');
  if (!vehicle_type?.trim()) throw new Error('Tipo de veículo é obrigatório');
  if (!service_id) throw new Error('Serviço é obrigatório');
  if (!start_time) throw new Error('Horário é obrigatório');

  // Buscar duração do serviço para calcular end_time
  const { data: service, error: serviceError } = await db
    .from('services')
    .select('duration_minutes')
    .eq('id', service_id)
    .eq('active', true)
    .single();

  if (serviceError || !service) {
    throw new Error('Serviço não encontrado ou inativo');
  }

  // Calcular end_time
  const startDate = new Date(start_time);
  const endDate = new Date(startDate.getTime() + service.duration_minutes * 60000);

  const { data, error } = await db
    .from('appointments')
    .insert({
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      vehicle_type: vehicle_type.trim(),
      service_id,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      notes: notes?.trim() || null,
      status: 'pending'
    })
    .select(`
      *,
      service:services(id, name, price, duration_minutes)
    `)
    .single();

  if (error) {
    // Verificar se é erro de conflito de horário
    if (error.message.includes('agendamento')) {
      throw new Error(error.message);
    }
    throw error;
  }

  return data;
}

/**
 * Atualizar status do agendamento
 * @param {string} id - UUID do agendamento
 * @param {string} status - Novo status
 */
export async function updateAppointmentStatus(id, status) {
  const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    throw new Error(`Status inválido. Use: ${validStatuses.join(', ')}`);
  }

  const { data, error } = await db
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select(`
      *,
      service:services(id, name, price, duration_minutes)
    `)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Atualizar agendamento
 * @param {string} id - UUID do agendamento
 * @param {Object} updateData - Dados para atualizar
 */
export async function updateAppointment(id, updateData) {
  const allowedFields = ['customer_name', 'customer_phone', 'vehicle_type', 'notes', 'status'];
  const filteredData = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }

  const { data, error } = await db
    .from('appointments')
    .update(filteredData)
    .eq('id', id)
    .select(`
      *,
      service:services(id, name, price, duration_minutes)
    `)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Cancelar agendamento
 * @param {string} id - UUID do agendamento
 */
export async function cancelAppointment(id) {
  return updateAppointmentStatus(id, 'cancelled');
}

/**
 * Buscar estatísticas do dashboard
 */
export async function getDashboardStats() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Agendamentos de hoje
  const todayAppointments = await listAppointments({ date: todayStr });

  // Próximos agendamentos
  const upcoming = await getUpcomingAppointments(5);

  // Contadores por status (hoje)
  const statusCounts = {
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  };

  todayAppointments.forEach(apt => {
    if (statusCounts[apt.status] !== undefined) {
      statusCounts[apt.status]++;
    }
  });

  return {
    today: {
      total: todayAppointments.length,
      ...statusCounts,
      appointments: todayAppointments
    },
    upcoming
  };
}

/**
 * Buscar horários disponíveis para uma data específica
 * @param {string} dateStr - Data no formato YYYY-MM-DD
 * @param {number} serviceDuration - Duração do serviço em minutos (default: 90)
 * @returns {Array} Lista de horários disponíveis
 */
export async function getAvailableSlots(dateStr, serviceDuration = 90) {
  // Configuração de horário de funcionamento
  const OPENING_HOUR = 8;  // 08:00
  const CLOSING_HOUR = 18; // 18:00
  const SLOT_INTERVAL = 30; // Intervalos de 30 minutos
  
  const targetDate = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const isToday = targetDate.toDateString() === now.toDateString();
  
  // Buscar agendamentos do dia (exceto cancelados)
  const { data: appointments, error } = await db
    .from('appointments')
    .select('start_time, end_time, status')
    .gte('start_time', `${dateStr}T00:00:00`)
    .lt('start_time', `${dateStr}T23:59:59`)
    .neq('status', 'cancelled');

  if (error) throw error;

  // Gerar todos os slots possíveis do dia
  const slots = [];
  
  for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_INTERVAL) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(hour, minute, 0, 0);
      
      const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
      
      // Verificar se o slot termina antes do fechamento
      if (slotEnd.getHours() > CLOSING_HOUR || 
          (slotEnd.getHours() === CLOSING_HOUR && slotEnd.getMinutes() > 0)) {
        continue;
      }
      
      // Se for hoje, ignorar horários passados (com margem de 1 hora)
      if (isToday) {
        const minTime = new Date(now.getTime() + 60 * 60000); // 1 hora de antecedência
        if (slotStart < minTime) {
          continue;
        }
      }
      
      // Verificar conflito com agendamentos existentes
      const hasConflict = appointments.some(apt => {
        const aptStart = new Date(apt.start_time);
        const aptEnd = new Date(apt.end_time);
        
        // Slot conflita se:
        // - Começa durante outro agendamento
        // - Termina durante outro agendamento
        // - Engloba outro agendamento
        return (
          (slotStart >= aptStart && slotStart < aptEnd) ||
          (slotEnd > aptStart && slotEnd <= aptEnd) ||
          (slotStart <= aptStart && slotEnd >= aptEnd)
        );
      });
      
      if (!hasConflict) {
        slots.push({
          time: slotStart.toISOString(),
          display: slotStart.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
          })
        });
      }
    }
  }
  
  return slots;
}
