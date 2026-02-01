# AutoBrilho - Fase 3

Sistema de agendamento para estética automotiva.

## 📁 Estrutura do Projeto

```
autobrilholdpg/
├── server/                    # Backend Node.js
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js   # Configuração Supabase
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── servicesController.js
│   │   │   └── appointmentsController.js
│   │   ├── middlewares/
│   │   │   └── auth.js       # Autenticação e autorização
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── auth.js
│   │   │   ├── services.js
│   │   │   └── appointments.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── servicesService.js
│   │   │   └── appointmentsService.js
│   │   └── server.js         # Entry point
│   ├── .env.example
│   └── package.json
│
├── admin/                     # Painel Admin React
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminLayout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── AgendaPage.tsx
│   │   │   └── ServicosPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── database/
    └── schema.sql            # Schema do banco de dados
```

## 🚀 Como Executar

### 1. Configurar o Backend

```bash
# Entrar na pasta do servidor
cd server

# Instalar dependências
npm install

# Copiar e configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais do Supabase

# Iniciar servidor
npm run dev
```

### 2. Configurar o Admin

```bash
# Entrar na pasta do admin
cd admin

# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev
```

### 3. Configurar o Supabase

1. Execute o SQL do arquivo `database/schema.sql` no Supabase
2. Crie um usuário admin no Supabase Auth
3. Adicione `role: 'admin'` no user_metadata do usuário

```sql
-- No Supabase SQL Editor, após criar o usuário:
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'seu-email@exemplo.com';
```

## 📡 API Endpoints

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/login` | Login admin | ❌ |
| POST | `/api/auth/logout` | Logout | ✅ |
| GET | `/api/auth/me` | Dados do usuário | ✅ |
| POST | `/api/auth/refresh` | Renovar token | ❌ |

### Serviços

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/services/public` | Listar serviços ativos | ❌ |
| GET | `/api/services` | Listar todos os serviços | ✅ Admin |
| GET | `/api/services/:id` | Buscar por ID | ✅ Admin |
| POST | `/api/services` | Criar serviço | ✅ Admin |
| PUT | `/api/services/:id` | Atualizar serviço | ✅ Admin |
| PATCH | `/api/services/:id/toggle` | Ativar/desativar | ✅ Admin |
| DELETE | `/api/services/:id` | Remover (soft delete) | ✅ Admin |

### Agendamentos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/appointments/public` | Criar agendamento | ❌ |
| GET | `/api/appointments` | Listar com filtros | ✅ Admin |
| GET | `/api/appointments/today` | Agendamentos do dia | ✅ Admin |
| GET | `/api/appointments/upcoming` | Próximos agendamentos | ✅ Admin |
| GET | `/api/appointments/:id` | Buscar por ID | ✅ Admin |
| PATCH | `/api/appointments/:id/status` | Alterar status | ✅ Admin |
| DELETE | `/api/appointments/:id` | Cancelar | ✅ Admin |

### Dashboard

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/dashboard` | Estatísticas | ✅ Admin |

## 📋 Exemplos de Uso

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@autobrilho.com",
    "password": "sua-senha"
  }'
```

Resposta:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@autobrilho.com",
      "role": "admin",
      "name": "Administrador"
    },
    "session": {
      "access_token": "eyJ...",
      "refresh_token": "...",
      "expires_at": 1234567890
    }
  }
}
```

### Criar Serviço

```bash
curl -X POST http://localhost:3001/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "name": "Lavagem Premium",
    "description": "Lavagem completa com cera",
    "price": 150.00,
    "duration_minutes": 90
  }'
```

### Criar Agendamento (Público)

```bash
curl -X POST http://localhost:3001/api/appointments/public \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "João Silva",
    "customer_phone": "11999999999",
    "vehicle_type": "SUV",
    "service_id": "uuid-do-servico",
    "start_time": "2026-02-01T10:00:00Z"
  }'
```

### Listar Agendamentos por Data

```bash
curl http://localhost:3001/api/appointments?date=2026-02-01 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Alterar Status do Agendamento

```bash
curl -X PATCH http://localhost:3001/api/appointments/UUID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"status": "confirmed"}'
```

Status disponíveis:
- `pending` - Pendente
- `confirmed` - Confirmado
- `in_progress` - Em andamento
- `completed` - Concluído
- `cancelled` - Cancelado

## 🔐 Segurança

- Todas as rotas admin requerem autenticação via Bearer Token
- Apenas usuários com `role: 'admin'` podem acessar o painel
- RLS (Row Level Security) ativo no Supabase
- Tokens expiram e podem ser renovados

## 🎨 Painel Admin

Funcionalidades:

1. **Dashboard**
   - Estatísticas do dia
   - Próximos agendamentos

2. **Agenda**
   - Filtro por data
   - Filtro por status
   - Alterar status do agendamento
   - Cancelar agendamento

3. **Serviços**
   - CRUD completo
   - Ativar/Desativar

## 📦 Dependências

### Backend
- express
- @supabase/supabase-js
- cors
- dotenv

### Admin
- react
- react-router-dom
- tailwindcss
- vite

## 🔗 URLs

- **Backend**: http://localhost:3001
- **Admin**: http://localhost:5174
- **Landing Page**: http://localhost:5173
