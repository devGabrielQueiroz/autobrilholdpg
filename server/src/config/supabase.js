/**
 * Configuração do cliente Supabase
 * Exporta dois clientes: público e admin (service role)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validar variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias');
}

/**
 * Cliente público - respeita RLS
 * Usado para operações que respeitam as políticas de segurança
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Cliente admin - ignora RLS
 * Usado apenas no backend para operações administrativas
 * NUNCA expor no frontend!
 */
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

export default supabase;
