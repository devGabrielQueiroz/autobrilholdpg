/**
 * API Service para o Admin
 * Comunicação direta com Supabase (serverless)
 */

import { supabase } from '../lib/supabase';

// ============================================
// AUTH API (usando Supabase Auth diretamente)
// ============================================

export const authAPI = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Erro ao fazer login');
    }

    // Verificar se é admin
    const role = data.user.user_metadata?.role;
    if (role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('Acesso negado. Apenas administradores podem acessar.');
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      role: role || 'user',
      name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Admin',
    };

    // Salvar no localStorage para acesso rápido
    localStorage.setItem('admin_user', JSON.stringify(user));

    return {
      user,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0,
      },
    };
  },

  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('admin_user');
  },

  me: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      throw new Error('Não autenticado');
    }

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email || '',
        role: user.user_metadata?.role || 'user',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
      } as User,
    };
  },

  getStoredUser: (): User | null => {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('admin_user');
  },

  // Verificar sessão ativa
  checkSession: async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }
};

// ============================================
// SERVICES API (usando Supabase diretamente)
// ============================================

export const servicesAPI = {
  list: async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');

    if (error) throw new Error(error.message);
    return { success: true, data: data as Service[] };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data: data as Service };
  },

  create: async (input: ServiceInput) => {
    const { data, error } = await supabase
      .from('services')
      .insert([input])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data: data as Service };
  },

  update: async (id: string, input: Partial<ServiceInput>) => {
    const { data, error } = await supabase
      .from('services')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data: data as Service };
  },

  toggleStatus: async (id: string, active: boolean) => {
    const { data, error } = await supabase
      .from('services')
      .update({ active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data: data as Service };
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  }
};

// ============================================
// APPOINTMENTS API (usando Supabase diretamente)
// ============================================

export const appointmentsAPI = {
  list: async (filters?: AppointmentFilters) => {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        service:services(id, name, price, duration_minutes)
      `)
      .order('start_time', { ascending: true });

    if (filters?.date) {
      query = query
        .gte('start_time', `${filters.date}T00:00:00`)
        .lt('start_time', `${filters.date}T23:59:59`);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.startDate) {
      query = query.gte('start_time', `${filters.startDate}T00:00:00`);
    }
    if (filters?.endDate) {
      query = query.lte('start_time', `${filters.endDate}T23:59:59`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { success: true, data: data as Appointment[] };
  },

  getToday: async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(id, name, price, duration_minutes)
      `)
      .gte('start_time', `${today}T00:00:00`)
      .lt('start_time', `${today}T23:59:59`)
      .order('start_time', { ascending: true });

    if (error) throw new Error(error.message);
    return { success: true, data: data as Appointment[] };
  },

  getUpcoming: async (limit = 10) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(id, name, price, duration_minutes)
      `)
      .gte('start_time', now)
      .neq('status', 'cancelled')
      .order('start_time', { ascending: true })
      .limit(limit);

    if (error) throw new Error(error.message);
    return { success: true, data: data as Appointment[] };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(id, name, price, duration_minutes)
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data: data as Appointment };
  },

  updateStatus: async (id: string, status: AppointmentStatus) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        service:services(id, name, price, duration_minutes)
      `)
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data: data as Appointment };
  },

  cancel: async (id: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select(`
        *,
        service:services(id, name, price, duration_minutes)
      `)
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data: data as Appointment };
  }
};

// ============================================
// DASHBOARD API (usando Supabase diretamente)
// ============================================

export const dashboardAPI = {
  getStats: async () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Buscar agendamentos de hoje
    const { data: todayAppointments, error: todayError } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(id, name, price, duration_minutes)
      `)
      .gte('start_time', `${today}T00:00:00`)
      .lt('start_time', `${today}T23:59:59`)
      .order('start_time', { ascending: true });

    if (todayError) throw new Error(todayError.message);

    // Buscar próximos agendamentos
    const { data: upcomingAppointments, error: upcomingError } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(id, name, price, duration_minutes)
      `)
      .gte('start_time', now)
      .neq('status', 'cancelled')
      .order('start_time', { ascending: true })
      .limit(10);

    if (upcomingError) throw new Error(upcomingError.message);

    // Calcular estatísticas
    const appointments = todayAppointments as Appointment[];
    const stats: DashboardStats = {
      today: {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        in_progress: appointments.filter(a => a.status === 'in_progress').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
        appointments,
      },
      upcoming: upcomingAppointments as Appointment[],
    };

    return { success: true, data: stats };
  }
};

// ============================================
// TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceInput {
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  active?: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  vehicle_type: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  service: {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  };
}

export interface AppointmentFilters {
  date?: string;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
}

export interface DashboardStats {
  today: {
    total: number;
    pending: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    appointments: Appointment[];
  };
  upcoming: Appointment[];
}
