/**
 * Controller de Agendamentos
 */

import * as appointmentsService from '../services/appointmentsService.js';

/**
 * GET /api/appointments
 * Listar agendamentos com filtros
 */
export async function list(req, res) {
  try {
    const { date, status, startDate, endDate } = req.query;
    
    const appointments = await appointmentsService.listAppointments({
      date,
      status,
      startDate,
      endDate
    });
    
    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar agendamentos' 
    });
  }
}

/**
 * GET /api/appointments/today
 * Agendamentos de hoje
 */
export async function getToday(req, res) {
  try {
    const appointments = await appointmentsService.getTodayAppointments();
    
    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos de hoje:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar agendamentos' 
    });
  }
}

/**
 * GET /api/appointments/upcoming
 * Próximos agendamentos
 */
export async function getUpcoming(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const appointments = await appointmentsService.getUpcomingAppointments(limit);
    
    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Erro ao buscar próximos agendamentos:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar agendamentos' 
    });
  }
}

/**
 * GET /api/appointments/:id
 * Buscar agendamento por ID
 */
export async function getById(req, res) {
  try {
    const { id } = req.params;
    const appointment = await appointmentsService.getAppointmentById(id);
    
    if (!appointment) {
      return res.status(404).json({ 
        error: 'Agendamento não encontrado' 
      });
    }
    
    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar agendamento' 
    });
  }
}

/**
 * POST /api/appointments
 * Criar novo agendamento (público)
 */
export async function create(req, res) {
  try {
    const appointment = await appointmentsService.createAppointment(req.body);
    
    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Agendamento criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(400).json({ 
      error: error.message || 'Erro ao criar agendamento' 
    });
  }
}

/**
 * PUT /api/appointments/:id
 * Atualizar agendamento
 */
export async function update(req, res) {
  try {
    const { id } = req.params;
    const appointment = await appointmentsService.updateAppointment(id, req.body);
    
    res.json({
      success: true,
      data: appointment,
      message: 'Agendamento atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(400).json({ 
      error: error.message || 'Erro ao atualizar agendamento' 
    });
  }
}

/**
 * PATCH /api/appointments/:id/status
 * Alterar status do agendamento
 */
export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        error: 'Status é obrigatório' 
      });
    }
    
    const appointment = await appointmentsService.updateAppointmentStatus(id, status);
    
    res.json({
      success: true,
      data: appointment,
      message: 'Status atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(400).json({ 
      error: error.message || 'Erro ao atualizar status' 
    });
  }
}

/**
 * DELETE /api/appointments/:id
 * Cancelar agendamento
 */
export async function cancel(req, res) {
  try {
    const { id } = req.params;
    const appointment = await appointmentsService.cancelAppointment(id);
    
    res.json({
      success: true,
      data: appointment,
      message: 'Agendamento cancelado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(400).json({ 
      error: error.message || 'Erro ao cancelar agendamento' 
    });
  }
}

/**
 * GET /api/dashboard
 * Dados do dashboard
 */
export async function getDashboard(req, res) {
  try {
    const stats = await appointmentsService.getDashboardStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar dados do dashboard' 
    });
  }
}

/**
 * GET /api/appointments/availability
 * Buscar horários disponíveis (público)
 */
export async function getAvailability(req, res) {
  try {
    const { date, service_duration } = req.query;
    
    if (!date) {
      return res.status(400).json({ 
        error: 'Data é obrigatória (formato: YYYY-MM-DD)' 
      });
    }
    
    // Validar formato da data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ 
        error: 'Formato de data inválido. Use YYYY-MM-DD' 
      });
    }
    
    // Validar se a data não é passada
    const selectedDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({ 
        error: 'Não é possível agendar em datas passadas' 
      });
    }
    
    const duration = parseInt(service_duration) || 90;
    const slots = await appointmentsService.getAvailableSlots(date, duration);
    
    res.json({
      success: true,
      data: {
        date,
        slots,
        total: slots.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar horários disponíveis' 
    });
  }
}
