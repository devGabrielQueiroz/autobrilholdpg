-- ============================================
-- AUTOBRILHO - SISTEMA DE AGENDAMENTO
-- Modelagem de Banco de Dados para Supabase
-- ============================================

-- Habilitar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: services
-- Serviços oferecidos pela AutoBrilho
-- ============================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    duration_minutes INTEGER NOT NULL DEFAULT 90 CHECK (duration_minutes > 0),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para buscar serviços ativos
CREATE INDEX idx_services_active ON services(active) WHERE active = true;

-- Comentários da tabela
COMMENT ON TABLE services IS 'Serviços de estética automotiva oferecidos';
COMMENT ON COLUMN services.duration_minutes IS 'Duração padrão do serviço em minutos (default: 90)';
COMMENT ON COLUMN services.active IS 'Se o serviço está disponível para agendamento';

-- ============================================
-- TABELA: appointments
-- Agendamentos de serviços
-- ============================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Validação: end_time deve ser maior que start_time
    CONSTRAINT check_time_range CHECK (end_time > start_time)
);

-- Índices para performance
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_customer_phone ON appointments(customer_phone);

-- Índice composto para buscar agendamentos por horário e status
CREATE INDEX idx_appointments_time_status ON appointments(start_time, status);

-- Comentários da tabela
COMMENT ON TABLE appointments IS 'Agendamentos de serviços de estética automotiva';
COMMENT ON COLUMN appointments.status IS 'Status: pending, confirmed, in_progress, completed, cancelled';
COMMENT ON COLUMN appointments.vehicle_type IS 'Tipo do veículo (ex: Sedan, SUV, Hatch, Pickup)';

-- ============================================
-- CONSTRAINT: Evitar sobreposição de horários
-- Garante que apenas um agendamento exista por horário
-- ============================================

-- Função para verificar conflito de horário
CREATE OR REPLACE FUNCTION check_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se existe algum agendamento que conflita com o novo horário
    -- Ignora agendamentos cancelados
    IF EXISTS (
        SELECT 1 FROM appointments
        WHERE id != COALESCE(NEW.id, uuid_generate_v4())
        AND status != 'cancelled'
        AND (
            -- Novo agendamento começa durante outro
            (NEW.start_time >= start_time AND NEW.start_time < end_time)
            OR
            -- Novo agendamento termina durante outro
            (NEW.end_time > start_time AND NEW.end_time <= end_time)
            OR
            -- Novo agendamento engloba outro completamente
            (NEW.start_time <= start_time AND NEW.end_time >= end_time)
        )
    ) THEN
        RAISE EXCEPTION 'Já existe um agendamento neste horário. Por favor, escolha outro horário.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar antes de INSERT ou UPDATE
CREATE TRIGGER trigger_check_appointment_overlap
    BEFORE INSERT OR UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION check_appointment_overlap();

-- ============================================
-- FUNÇÃO: Calcular end_time automaticamente
-- Baseado na duração do serviço
-- ============================================
CREATE OR REPLACE FUNCTION calculate_appointment_end_time()
RETURNS TRIGGER AS $$
DECLARE
    service_duration INTEGER;
BEGIN
    -- Buscar duração do serviço
    SELECT duration_minutes INTO service_duration
    FROM services
    WHERE id = NEW.service_id;
    
    -- Se end_time não foi informado, calcular baseado na duração do serviço
    IF NEW.end_time IS NULL THEN
        NEW.end_time := NEW.start_time + (service_duration || ' minutes')::INTERVAL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular end_time antes do INSERT
CREATE TRIGGER trigger_calculate_end_time
    BEFORE INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION calculate_appointment_end_time();

-- ============================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER trigger_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: services
-- Leitura pública, escrita apenas admin
-- ============================================

-- Qualquer pessoa pode ler serviços ativos
CREATE POLICY "Serviços ativos são públicos"
    ON services
    FOR SELECT
    USING (active = true);

-- Admin pode ver todos os serviços (ativos e inativos)
CREATE POLICY "Admin pode ver todos os serviços"
    ON services
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR 
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

-- Apenas admin pode inserir serviços
CREATE POLICY "Apenas admin pode inserir serviços"
    ON services
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
        OR 
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

-- Apenas admin pode atualizar serviços
CREATE POLICY "Apenas admin pode atualizar serviços"
    ON services
    FOR UPDATE
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR 
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    )
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
        OR 
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

-- Apenas admin pode deletar serviços
CREATE POLICY "Apenas admin pode deletar serviços"
    ON services
    FOR DELETE
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR 
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

-- ============================================
-- POLICIES: appointments
-- INSERT público, SELECT/UPDATE apenas admin
-- ============================================

-- Qualquer pessoa pode criar agendamento (público)
CREATE POLICY "Qualquer pessoa pode criar agendamento"
    ON appointments
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Apenas admin pode ver agendamentos
CREATE POLICY "Apenas admin pode ver agendamentos"
    ON appointments
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR 
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

-- Apenas admin pode atualizar agendamentos
CREATE POLICY "Apenas admin pode atualizar agendamentos"
    ON appointments
    FOR UPDATE
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR 
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    )
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
        OR 
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

-- Apenas admin pode deletar agendamentos
CREATE POLICY "Apenas admin pode deletar agendamentos"
    ON appointments
    FOR DELETE
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR 
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );

-- ============================================
-- FUNÇÃO AUXILIAR: Buscar horários disponíveis
-- Retorna slots disponíveis para uma data
-- ============================================
CREATE OR REPLACE FUNCTION get_available_slots(
    p_date DATE,
    p_service_id UUID DEFAULT NULL,
    p_start_hour INTEGER DEFAULT 8,
    p_end_hour INTEGER DEFAULT 18,
    p_slot_duration INTEGER DEFAULT 90
)
RETURNS TABLE (
    slot_start TIMESTAMPTZ,
    slot_end TIMESTAMPTZ,
    available BOOLEAN
) AS $$
DECLARE
    v_current_slot TIMESTAMPTZ;
    v_slot_end TIMESTAMPTZ;
    v_duration INTEGER;
BEGIN
    -- Usar duração do serviço se informado, senão usar default
    IF p_service_id IS NOT NULL THEN
        SELECT duration_minutes INTO v_duration
        FROM services
        WHERE id = p_service_id AND active = true;
        
        IF v_duration IS NULL THEN
            v_duration := p_slot_duration;
        END IF;
    ELSE
        v_duration := p_slot_duration;
    END IF;
    
    -- Gerar slots do dia
    v_current_slot := p_date + (p_start_hour || ' hours')::INTERVAL;
    
    WHILE v_current_slot < p_date + (p_end_hour || ' hours')::INTERVAL LOOP
        v_slot_end := v_current_slot + (v_duration || ' minutes')::INTERVAL;
        
        -- Verificar se o slot está disponível
        slot_start := v_current_slot;
        slot_end := v_slot_end;
        available := NOT EXISTS (
            SELECT 1 FROM appointments
            WHERE status != 'cancelled'
            AND (
                (start_time >= v_current_slot AND start_time < v_slot_end)
                OR (end_time > v_current_slot AND end_time <= v_slot_end)
                OR (start_time <= v_current_slot AND end_time >= v_slot_end)
            )
        );
        
        RETURN NEXT;
        
        -- Próximo slot (incremento de 30 minutos para mais opções)
        v_current_slot := v_current_slot + '30 minutes'::INTERVAL;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DADOS INICIAIS: Serviços padrão
-- ============================================
INSERT INTO services (name, description, price, duration_minutes, active) VALUES
    ('Lavagem Completa', 'Lavagem externa e interna completa com produtos premium', 80.00, 60, true),
    ('Lavagem Premium', 'Lavagem completa + cera de proteção + hidratação de plásticos', 150.00, 90, true),
    ('Polimento Técnico', 'Polimento técnico para remoção de riscos leves e médios', 350.00, 180, true),
    ('Vitrificação', 'Proteção de pintura com vitrificação de alta durabilidade', 800.00, 240, true),
    ('Higienização Interna', 'Limpeza profunda de bancos, carpetes e forros', 200.00, 120, true),
    ('Cristalização de Vidros', 'Tratamento hidrofóbico para vidros', 150.00, 60, true);

-- ============================================
-- VIEWS ÚTEIS PARA O ADMIN
-- ============================================

-- View de agendamentos do dia
CREATE OR REPLACE VIEW v_appointments_today AS
SELECT 
    a.id,
    a.customer_name,
    a.customer_phone,
    a.vehicle_type,
    s.name AS service_name,
    a.start_time,
    a.end_time,
    a.status,
    a.notes
FROM appointments a
JOIN services s ON s.id = a.service_id
WHERE DATE(a.start_time) = CURRENT_DATE
ORDER BY a.start_time;

-- View de agendamentos da semana
CREATE OR REPLACE VIEW v_appointments_week AS
SELECT 
    a.id,
    a.customer_name,
    a.customer_phone,
    a.vehicle_type,
    s.name AS service_name,
    s.price,
    a.start_time,
    a.end_time,
    a.status,
    a.notes
FROM appointments a
JOIN services s ON s.id = a.service_id
WHERE a.start_time >= DATE_TRUNC('week', CURRENT_DATE)
  AND a.start_time < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
ORDER BY a.start_time;

-- ============================================
-- FIM DO SCHEMA
-- ============================================
