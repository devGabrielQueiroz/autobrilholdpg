/**
 * API de Administração de Disponibilidade
 * Gerencia horários de funcionamento e datas bloqueadas
 */

import { supabase } from '../lib/supabase';
import type { BusinessHours, BlockedDate } from './bookingApi';

// ============================================
// TYPES
// ============================================

export interface BlockedDateInput {
  date: string;
  is_full_day_blocked: boolean;
  open_time?: string;
  close_time?: string;
  reason?: string;
}

// ============================================
// ADMIN API
// ============================================

export const availabilityAPI = {
  /**
   * Buscar todos os horários de funcionamento
   */
  getBusinessHours: async (): Promise<BusinessHours[]> => {
    const { data, error } = await supabase
      .from('business_hours')
      .select('*')
      .order('day_of_week');

    if (error) {
      console.error('Erro ao buscar horários:', error);
      throw new Error('Não foi possível carregar horários de funcionamento');
    }

    return data || [];
  },

  /**
   * Atualizar horário de um dia da semana
   */
  updateBusinessHours: async (
    dayOfWeek: number,
    updates: Partial<BusinessHours>
  ): Promise<BusinessHours> => {
    const { data, error } = await supabase
      .from('business_hours')
      .update(updates)
      .eq('day_of_week', dayOfWeek)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar horário:', error);
      throw new Error('Não foi possível atualizar horário');
    }

    return data;
  },

  /**
   * Buscar todas as datas bloqueadas
   */
  getBlockedDates: async (startDate?: string, endDate?: string): Promise<BlockedDate[]> => {
    let query = supabase
      .from('blocked_dates')
      .select('*')
      .order('date');

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar datas bloqueadas:', error);
      throw new Error('Não foi possível carregar datas bloqueadas');
    }

    return data || [];
  },

  /**
   * Adicionar ou atualizar data bloqueada
   */
  upsertBlockedDate: async (input: BlockedDateInput): Promise<BlockedDate> => {
    const { data, error } = await supabase
      .from('blocked_dates')
      .upsert({
        date: input.date,
        is_full_day_blocked: input.is_full_day_blocked,
        open_time: input.is_full_day_blocked ? null : input.open_time,
        close_time: input.is_full_day_blocked ? null : input.close_time,
        reason: input.reason || null,
      }, {
        onConflict: 'date',
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar data bloqueada:', error);
      throw new Error('Não foi possível salvar');
    }

    return data;
  },

  /**
   * Remover data bloqueada
   */
  deleteBlockedDate: async (date: string): Promise<void> => {
    const { error } = await supabase
      .from('blocked_dates')
      .delete()
      .eq('date', date);

    if (error) {
      console.error('Erro ao remover data:', error);
      throw new Error('Não foi possível remover');
    }
  },
};
