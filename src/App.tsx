/**
 * App.tsx - Componente raiz da aplicação
 * AutoBrilho - Landing Page + Painel Administrativo
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage, AgendamentoPage, DisponibilidadePage } from './pages';
import {
  AdminAuthProvider,
  AdminLayout,
  ProtectedRoute,
  LoginPage,
  DashboardPage,
  AgendaPage,
  ServicosPage,
} from './pages/admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* Agendamento (público) */}
        <Route path="/agendar" element={<AgendamentoPage />} />

        {/* Admin Routes - todas dentro do provider */}
        <Route path="/admin/*" element={
          <AdminAuthProvider>
            <Routes>
              {/* Login (público) */}
              <Route path="login" element={<LoginPage />} />

              {/* Rotas protegidas com layout */}
              <Route element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="agenda" element={<AgendaPage />} />
                <Route path="servicos" element={<ServicosPage />} />
                <Route path="disponibilidade" element={<DisponibilidadePage />} />
              </Route>

              {/* Redirect /admin para /admin/dashboard */}
              <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </AdminAuthProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
