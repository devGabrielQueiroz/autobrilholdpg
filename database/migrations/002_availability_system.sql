-- ============================================
-- AUTOBRILHO - MIGRAÇÃO: Sistema de Disponibilidade
-- Permite ao admin controlar dias e horários de funcionamento
-- ============================================

-- ============================================
-- TABELA: business_hours
-- Horários de funcionamento por dia da semana
-- ============================================
CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
    is_open BOOLEAN NOT NULL DEFAULT true,
    open_time TIME NOT NULL DEFAULT '08:00',
    close_time TIME NOT NULL DEFAULT '18:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Apenas um registro por dia da semana
    CONSTRAINT unique_day_of_week UNIQUE (day_of_week),
    -- Validação: close_time > open_time
    CONSTRAINT check_time_order CHECK (close_time > open_time)
);

-- Trigger para updated_at
CREATE TRIGGER trigger_business_hours_updated_at
    BEFORE UPDATE ON business_hours
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE business_hours IS 'Horários de funcionamento por dia da semana';
COMMENT ON COLUMN business_hours.day_of_week IS '0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado';
COMMENT ON COLUMN business_hours.is_open IS 'Se a loja abre neste dia';

-- ============================================
-- TABELA: blocked_dates
-- Datas bloqueadas ou com horário especial
-- ============================================
CREATE TABLE blocked_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    is_full_day_blocked BOOLEAN NOT NULL DEFAULT true,
    open_time TIME, -- Horário especial se não bloqueado totalmente
    close_time TIME,
    reason TEXT, -- Ex: "Feriado", "Manutenção", "Férias"
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Apenas um registro por data
    CONSTRAINT unique_blocked_date UNIQUE (date),
    -- Validação: se não está bloqueado, precisa ter horários
    CONSTRAINT check_special_hours CHECK (
        is_full_day_blocked = true 
        OR (open_time IS NOT NULL AND close_time IS NOT NULL AND close_time > open_time)
    )
);

-- Índice para buscar por data
CREATE INDEX idx_blocked_dates_date ON blocked_dates(date);

-- Trigger para updated_at
CREATE TRIGGER trigger_blocked_dates_updated_at
    BEFORE UPDATE ON blocked_dates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE blocked_dates IS 'Datas bloqueadas (feriados, folgas) ou com horário especial';
COMMENT ON COLUMN blocked_dates.is_full_day_blocked IS 'true = dia inteiro bloqueado, false = horário especial';

-- ============================================
-- RLS POLICIES
-- ============================================

-- Habilitar RLS
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- business_hours: Leitura pública, escrita admin
CREATE POLICY "business_hours_select_public"
    ON business_hours FOR SELECT
    USING (true);

CREATE POLICY "business_hours_insert_admin"
    ON business_hours FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

CREATE POLICY "business_hours_update_admin"
    ON business_hours FOR UPDATE
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

CREATE POLICY "business_hours_delete_admin"
    ON business_hours FOR DELETE
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

-- blocked_dates: Leitura pública, escrita admin
CREATE POLICY "blocked_dates_select_public"
    ON blocked_dates FOR SELECT
    USING (true);

CREATE POLICY "blocked_dates_insert_admin"
    ON blocked_dates FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

CREATE POLICY "blocked_dates_update_admin"
    ON blocked_dates FOR UPDATE
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

CREATE POLICY "blocked_dates_delete_admin"
    ON blocked_dates FOR DELETE
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

-- ============================================
-- DADOS INICIAIS: Horário padrão de funcionamento
-- Segunda a Sexta: 08:00 - 18:00
-- Sábado: 08:00 - 14:00
-- Domingo: Fechado
-- ============================================
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time) VALUES
    (0, false, '08:00', '18:00'),  -- Domingo - Fechado
    (1, true, '08:00', '18:00'),   -- Segunda
    (2, true, '08:00', '18:00'),   -- Terça
    (3, true, '08:00', '18:00'),   -- Quarta
    (4, true, '08:00', '18:00'),   -- Quinta
    (5, true, '08:00', '18:00'),   -- Sexta
    (6, true, '08:00', '14:00');   -- Sábado - Meio período

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================
