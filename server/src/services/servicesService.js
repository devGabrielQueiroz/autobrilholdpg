/**
 * Service para operações com Serviços
 * Lógica de negócio separada dos controllers
 */

import { supabaseAdmin, supabase } from '../config/supabase.js';

// Usar cliente admin se disponível, senão cliente público
const db = supabaseAdmin || supabase;

/**
 * Listar todos os serviços
 * @param {boolean} onlyActive - Se true, retorna apenas serviços ativos
 */
export async function listServices(onlyActive = false) {
  let query = db.from('services').select('*').order('name');

  if (onlyActive) {
    query = query.eq('active', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Buscar serviço por ID
 * @param {string} id - UUID do serviço
 */
export async function getServiceById(id) {
  const { data, error } = await db
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Criar novo serviço
 * @param {Object} serviceData - Dados do serviço
 */
export async function createService(serviceData) {
  const { name, description, price, duration_minutes = 90, active = true } = serviceData;

  // Validações
  if (!name || name.trim().length === 0) {
    throw new Error('Nome do serviço é obrigatório');
  }

  if (price === undefined || price < 0) {
    throw new Error('Preço inválido');
  }

  const { data, error } = await db
    .from('services')
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      price: parseFloat(price),
      duration_minutes: parseInt(duration_minutes),
      active
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Atualizar serviço existente
 * @param {string} id - UUID do serviço
 * @param {Object} serviceData - Dados para atualizar
 */
export async function updateService(id, serviceData) {
  const { name, description, price, duration_minutes, active } = serviceData;

  const updateData = {};

  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description?.trim() || null;
  if (price !== undefined) updateData.price = parseFloat(price);
  if (duration_minutes !== undefined) updateData.duration_minutes = parseInt(duration_minutes);
  if (active !== undefined) updateData.active = active;

  const { data, error } = await db
    .from('services')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Ativar/Desativar serviço
 * @param {string} id - UUID do serviço
 * @param {boolean} active - Status desejado
 */
export async function toggleServiceStatus(id, active) {
  return updateService(id, { active });
}

/**
 * Deletar serviço (soft delete - apenas desativa)
 * @param {string} id - UUID do serviço
 */
export async function deleteService(id) {
  // Por segurança, apenas desativamos
  return toggleServiceStatus(id, false);
}
