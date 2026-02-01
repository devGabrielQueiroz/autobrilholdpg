/**
 * Página de login/cadastro do admin
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAdminAuth();
  
  // Estado para alternar entre login e cadastro
  const [isRegister, setIsRegister] = useState(false);
  
  // Campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/admin/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!name.trim()) {
      setError('Por favor, informe seu nome');
      return;
    }

    setIsSubmitting(true);

    try {
      // Registrar no Supabase Auth com role admin nos metadados
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
            role: 'admin',
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        // Verificar se precisa confirmar email
        if (data.user.identities?.length === 0) {
          setError('Este email já está cadastrado. Tente fazer login.');
        } else if (!data.session) {
          setSuccess('Cadastro realizado! Verifique seu email para confirmar a conta.');
          // Limpar formulário
          setName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        } else {
          // Login automático se não precisar confirmar email
          setSuccess('Cadastro realizado com sucesso!');
          setTimeout(() => {
            setIsRegister(false);
          }, 1500);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao cadastrar';
      if (message.includes('already registered')) {
        setError('Este email já está cadastrado');
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setSuccess('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gold">Auto</span>
              <span className="text-white">Brilho</span>
            </h1>
          </a>
          <p className="text-gray-400">Painel Administrativo</p>
        </div>

        {/* Card de login/cadastro */}
        <div className="bg-dark-800 rounded-2xl p-8 border border-dark-600 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            {isRegister ? 'Criar conta de administrador' : 'Acesse sua conta'}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-5">
            {/* Campo de nome (só no cadastro) */}
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nome completo
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-500 text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
                  placeholder="Seu nome"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-500 text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-500 text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {/* Confirmar senha (só no cadastro) */}
            {isRegister && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar senha
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-500 text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-lg bg-gold text-dark-900 font-semibold hover:bg-gold-dark transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-dark-900/20 border-t-dark-900 rounded-full animate-spin"></div>
                  {isRegister ? 'Cadastrando...' : 'Entrando...'}
                </>
              ) : (
                isRegister ? 'Criar conta' : 'Entrar'
              )}
            </button>
          </form>

          {/* Toggle entre login e cadastro */}
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-gray-400 hover:text-gold transition-colors text-sm"
            >
              {isRegister ? (
                <>Já tem uma conta? <span className="text-gold font-medium">Faça login</span></>
              ) : (
                <>Não tem conta? <span className="text-gold font-medium">Cadastre-se</span></>
              )}
            </button>
          </div>
        </div>

        {/* Link para voltar */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-gray-400 hover:text-gold transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao site
          </a>
        </div>
      </div>
    </div>
  );
}
