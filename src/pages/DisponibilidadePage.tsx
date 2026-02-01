/**
 * Página Admin - Gerenciamento de Disponibilidade
 * Controla horários de funcionamento e datas bloqueadas
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { availabilityAPI } from '../services/availabilityApi';
import type { BusinessHours, BlockedDate } from '../services/bookingApi';

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function DisponibilidadePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);

  // Form de nova data bloqueada
  const [newBlockedDate, setNewBlockedDate] = useState({
    date: '',
    is_full_day_blocked: true,
    open_time: '08:00',
    close_time: '18:00',
    reason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hours, blocked] = await Promise.all([
        availabilityAPI.getBusinessHours(),
        availabilityAPI.getBlockedDates(),
      ]);
      setBusinessHours(hours);
      setBlockedDates(blocked);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHoursChange = async (dayOfWeek: number, field: string, value: string | boolean) => {
    try {
      setSaving(true);
      setError('');

      // Atualizar estado local primeiro
      setBusinessHours((prev) =>
        prev.map((h) =>
          h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h
        )
      );

      // Salvar no banco
      await availabilityAPI.updateBusinessHours(dayOfWeek, { [field]: value });
      setSuccess('Horário atualizado!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Erro ao salvar');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate.date) return;

    try {
      setSaving(true);
      setError('');

      const result = await availabilityAPI.upsertBlockedDate(newBlockedDate);
      setBlockedDates((prev) => [...prev.filter(d => d.date !== result.date), result].sort((a, b) => a.date.localeCompare(b.date)));
      
      // Limpar form
      setNewBlockedDate({
        date: '',
        is_full_day_blocked: true,
        open_time: '08:00',
        close_time: '18:00',
        reason: '',
      });

      setSuccess('Data bloqueada adicionada!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Erro ao adicionar data');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBlockedDate = async (date: string) => {
    try {
      setSaving(true);
      await availabilityAPI.deleteBlockedDate(date);
      setBlockedDates((prev) => prev.filter((d) => d.date !== date));
      setSuccess('Data removida!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Erro ao remover');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-cream">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-600 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="text-cream-dark hover:text-gold transition-colors"
            >
              ← Voltar
            </Link>
            <h1 className="text-xl font-bold text-gold">Gerenciar Disponibilidade</h1>
          </div>

          {saving && (
            <span className="text-cream-dark text-sm animate-pulse">Salvando...</span>
          )}
        </div>
      </header>

      {/* Mensagens */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
            {success}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Seção: Horários de Funcionamento */}
        <section className="bg-dark-800 rounded-xl p-6 border border-dark-600">
          <h2 className="text-lg font-semibold text-cream mb-4 flex items-center gap-2">
            <span className="text-gold">🕐</span>
            Horários de Funcionamento
          </h2>
          <p className="text-cream-dark text-sm mb-6">
            Configure os horários padrão de funcionamento para cada dia da semana.
          </p>

          <div className="space-y-3">
            {businessHours.map((hours) => (
              <div
                key={hours.day_of_week}
                className={`flex flex-wrap items-center gap-4 p-4 rounded-lg border transition-colors ${
                  hours.is_open
                    ? 'bg-dark-700 border-dark-600'
                    : 'bg-dark-800 border-dark-700 opacity-60'
                }`}
              >
                {/* Dia da semana */}
                <div className="w-24 font-medium">
                  {DAY_NAMES[hours.day_of_week]}
                </div>

                {/* Toggle aberto/fechado */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hours.is_open}
                    onChange={(e) =>
                      handleHoursChange(hours.day_of_week, 'is_open', e.target.checked)
                    }
                    className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-gold focus:ring-gold"
                  />
                  <span className={hours.is_open ? 'text-green-400' : 'text-red-400'}>
                    {hours.is_open ? 'Aberto' : 'Fechado'}
                  </span>
                </label>

                {/* Horários (só mostrar se aberto) */}
                {hours.is_open && (
                  <div className="flex items-center gap-2 ml-auto">
                    <input
                      type="time"
                      value={hours.open_time}
                      onChange={(e) =>
                        handleHoursChange(hours.day_of_week, 'open_time', e.target.value)
                      }
                      className="bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-cream focus:ring-gold focus:border-gold"
                    />
                    <span className="text-cream-dark">até</span>
                    <input
                      type="time"
                      value={hours.close_time}
                      onChange={(e) =>
                        handleHoursChange(hours.day_of_week, 'close_time', e.target.value)
                      }
                      className="bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-cream focus:ring-gold focus:border-gold"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Seção: Datas Bloqueadas */}
        <section className="bg-dark-800 rounded-xl p-6 border border-dark-600">
          <h2 className="text-lg font-semibold text-cream mb-4 flex items-center gap-2">
            <span className="text-gold">📅</span>
            Datas Bloqueadas / Horário Especial
          </h2>
          <p className="text-cream-dark text-sm mb-6">
            Bloqueie datas específicas (feriados, férias) ou defina horários especiais.
          </p>

          {/* Formulário para adicionar */}
          <form onSubmit={handleAddBlockedDate} className="mb-6 p-4 bg-dark-700 rounded-lg border border-dark-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Data */}
              <div>
                <label className="block text-sm text-cream-dark mb-1">Data</label>
                <input
                  type="date"
                  value={newBlockedDate.date}
                  onChange={(e) =>
                    setNewBlockedDate((prev) => ({ ...prev, date: e.target.value }))
                  }
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-cream focus:ring-gold focus:border-gold"
                  required
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm text-cream-dark mb-1">Tipo</label>
                <select
                  value={newBlockedDate.is_full_day_blocked ? 'blocked' : 'special'}
                  onChange={(e) =>
                    setNewBlockedDate((prev) => ({
                      ...prev,
                      is_full_day_blocked: e.target.value === 'blocked',
                    }))
                  }
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-cream focus:ring-gold focus:border-gold"
                >
                  <option value="blocked">Dia bloqueado</option>
                  <option value="special">Horário especial</option>
                </select>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm text-cream-dark mb-1">Motivo</label>
                <input
                  type="text"
                  value={newBlockedDate.reason}
                  onChange={(e) =>
                    setNewBlockedDate((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="Ex: Feriado, Férias..."
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-cream placeholder:text-cream-dark/50 focus:ring-gold focus:border-gold"
                />
              </div>

              {/* Botão */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving || !newBlockedDate.date}
                  className="w-full bg-gold text-dark-900 font-semibold py-2 px-4 rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Horários especiais (só mostrar se não bloqueado) */}
            {!newBlockedDate.is_full_day_blocked && (
              <div className="mt-4 flex items-center gap-4">
                <div>
                  <label className="block text-sm text-cream-dark mb-1">Abertura</label>
                  <input
                    type="time"
                    value={newBlockedDate.open_time}
                    onChange={(e) =>
                      setNewBlockedDate((prev) => ({ ...prev, open_time: e.target.value }))
                    }
                    className="bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-cream focus:ring-gold focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm text-cream-dark mb-1">Fechamento</label>
                  <input
                    type="time"
                    value={newBlockedDate.close_time}
                    onChange={(e) =>
                      setNewBlockedDate((prev) => ({ ...prev, close_time: e.target.value }))
                    }
                    className="bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-cream focus:ring-gold focus:border-gold"
                  />
                </div>
              </div>
            )}
          </form>

          {/* Lista de datas bloqueadas */}
          {blockedDates.length === 0 ? (
            <p className="text-cream-dark text-center py-8">
              Nenhuma data bloqueada no momento.
            </p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((blocked) => (
                <div
                  key={blocked.date}
                  className="flex items-center justify-between p-3 bg-dark-700 rounded-lg border border-dark-600"
                >
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      blocked.is_full_day_blocked
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {blocked.is_full_day_blocked ? 'Bloqueado' : 'Especial'}
                    </span>
                    <span className="font-medium">{formatDate(blocked.date)}</span>
                    {blocked.reason && (
                      <span className="text-cream-dark">— {blocked.reason}</span>
                    )}
                    {!blocked.is_full_day_blocked && blocked.open_time && (
                      <span className="text-cream-dark">
                        ({blocked.open_time} - {blocked.close_time})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveBlockedDate(blocked.date)}
                    className="text-red-400 hover:text-red-300 transition-colors p-2"
                    title="Remover"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default DisponibilidadePage;
