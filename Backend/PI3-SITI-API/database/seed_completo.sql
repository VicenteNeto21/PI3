-- ==============================================================================
-- SITI-APP — SEED COMPLETO PARA DESENVOLVIMENTO
-- Banco: siti_db
-- ==============================================================================

USE siti_db;

-- Limpa dados anteriores respeitando FK order
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM poll_schedules;
DELETE FROM poll_alighting_stops;
DELETE FROM poll_boarding_stops;
DELETE FROM passenger_votes;
DELETE FROM passenger_trips;
DELETE FROM transport_requests;
DELETE FROM trips;
DELETE FROM route_stops;
DELETE FROM stop_schedules;
DELETE FROM stops;
DELETE FROM schedules;
DELETE FROM routes;
DELETE FROM buses;
DELETE FROM notices;
DELETE FROM support_messages;
DELETE FROM failures;
DELETE FROM polls;
DELETE FROM settings;
DELETE FROM passengers;
DELETE FROM drivers;
DELETE FROM administrators;
DELETE FROM addresses;
DELETE FROM users;
SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- 1. ENDEREÇOS
-- ==============================================================================
INSERT INTO addresses (id, neighborhood, street, building_number, complement) VALUES
(1, 'Centro',         'Rua São José',              '100', 'Prefeitura'),
(2, 'Universitário',  'Av. Universitária',          '1000', NULL),
(3, 'Cosmos',         'Rua das Flores',             '45',  NULL),
(4, 'Centro',         'Praça da Matriz',            's/n', NULL),
(5, 'Gentil',         'Praça Gentil Cardoso',       's/n', NULL),
(6, 'UFC',            'Campus UFC - Benfica',       's/n', NULL),
(7, 'Zona Norte',     'Terminal Norte',             's/n', NULL);

-- ==============================================================================
-- 2. USUÁRIOS (senha BCrypt de "123456" para todos)
-- ==============================================================================
INSERT INTO users (id, email, password, status, identifier_document, name) VALUES
(1, 'admin@siti.com',       '$2a$10$o7ZFkRPu9xYXP.jMsy/bYeWlTtHu0xJ8Y6VqjOQexNktyPH4Gq.n2', 'Ativo', '00000000001', 'Admin SITI'),
(2, 'motorista@siti.com',   '$2a$10$o7ZFkRPu9xYXP.jMsy/bYeWlTtHu0xJ8Y6VqjOQexNktyPH4Gq.n2', 'Ativo', '00000000002', 'Carlos Motorista'),
(3, 'aluno@siti.com',       '$2a$10$o7ZFkRPu9xYXP.jMsy/bYeWlTtHu0xJ8Y6VqjOQexNktyPH4Gq.n2', 'Ativo', '00000000003', 'João Aluno'),
(4, 'aluno2@siti.com',      '$2a$10$o7ZFkRPu9xYXP.jMsy/bYeWlTtHu0xJ8Y6VqjOQexNktyPH4Gq.n2', 'Ativo', '00000000004', 'Maria Aluno 2'),
(5, 'motorista2@siti.com',  '$2a$10$o7ZFkRPu9xYXP.jMsy/bYeWlTtHu0xJ8Y6VqjOQexNktyPH4Gq.n2', 'Ativo', '00000000005', 'Roberto Motorista 2'),
(6, 'coordenador@siti.com', '$2a$10$o7ZFkRPu9xYXP.jMsy/bYeWlTtHu0xJ8Y6VqjOQexNktyPH4Gq.n2', 'Ativo', '00000000006', 'Coordenador ADM 2'),
(10, 'gabriel.pendente@ufc.br', '$2a$10$o7ZFkRPu9xYXP.jMsy/bYeWlTtHu0xJ8Y6VqjOQexNktyPH4Gq.n2', 'Pendente', '10101010101', 'Gabriel Barbosa de Assis'),
(11, 'larissa.pendente@ufc.br', '$2a$10$o7ZFkRPu9xYXP.jMsy/bYeWlTtHu0xJ8Y6VqjOQexNktyPH4Gq.n2', 'Pendente', '11011011011', 'Larissa Monteiro Albuquerque');

-- ==============================================================================
-- 3. ADMINISTRADORES
-- ==============================================================================
INSERT INTO administrators (id, name, city, state, id_address) VALUES
(1, 'Admin SITI', 'Fortaleza', 'CE', 1),
(6, 'Coordenador ADM 2', 'Cosmos', 'CE', 1);

-- ==============================================================================
-- 4. MOTORISTAS
-- ==============================================================================
INSERT INTO drivers (id, name, phone, birth_date, cnh_number, cnh_category, cnh_validity_date, id_address) VALUES
(2, 'Carlos Motorista', '(88) 98888-7777', '1985-06-23', '12345678901', 'D', '2031-12-31', 2),
(5, 'Roberto Motorista 2', '(85) 99999-0005', '1982-11-20', '88888888888', 'D', '2030-12-31', 2);

-- ==============================================================================
-- 5. PASSAGEIROS (ALUNOS)
-- ==============================================================================
INSERT INTO passengers (id, birth_date, phone, type, registration_number, bond_proof, id_address) VALUES
(3, '2000-05-15', '(88) 99999-9999', 'Campus Universitário', '20260042', 'comprovante_matricula_2026.pdf', 3),
(4, '2004-05-15', '(85) 99999-0004', 'Estudante', '20260004', 'comprovante.pdf', 3),
(10, '2005-04-12', '(85) 99887-7665', 'Estudante', '20260101', 'Comprovante_Matricula_UFC_2026.pdf', 3),
(11, '2004-11-08', '(85) 98765-4321', 'Estudante', '20260102', 'Declaracao_UFC_2026.pdf', 3);

-- ==============================================================================
-- 6. ÔNIBUS (BUS)
-- ==============================================================================
INSERT INTO buses (id, nickname, license_plate, bus_model, manufacturing_year, capacity, accessibility, operation_status, id_administrator) VALUES
(1, 'Ônibus 01', 'ABC-1234', 'Volare W9',            '2020', 48, TRUE,  'Excelente', 1),
(2, 'Ônibus 02', 'DEF-5678', 'Mercedes OF-1519',     '2019', 44, FALSE, 'Bom',       1),
(3, 'Ônibus 03', 'GHI-9012', 'Marcopolo Attivi',     '2021', 50, TRUE,  'Excelente', 1);

-- ==============================================================================
-- 7. ROTAS
-- ==============================================================================
INSERT INTO routes (id, code, name, description, status) VALUES
(1, 'RT-001', 'Rota Centro - UFC Benfica',  'Centro da cidade até o campus UFC Benfica',  'Ativa'),
(2, 'RT-002', 'Rota Zona Norte - IFCE',     'Terminal Norte até IFCE Campus Central',      'Ativa');

-- ==============================================================================
-- 8. HORÁRIOS
-- ==============================================================================
INSERT INTO schedules (id, time) VALUES
(1, '06:30'),
(2, '07:00'),
(3, '07:30'),
(4, '08:00'),
(5, '17:00'),
(6, '18:00'),
(7, '18:30');

-- ==============================================================================
-- 9. PARADAS (STOPS)
-- ==============================================================================
INSERT INTO stops (id, status, id_address) VALUES
(1, 'Ativa', 3),  -- Cosmos
(2, 'Ativa', 4),  -- Praça da Matriz
(3, 'Ativa', 5),  -- Praça Gentil Cardoso
(4, 'Ativa', 6),  -- UFC Benfica
(5, 'Ativa', 7);  -- Terminal Norte

-- ==============================================================================
-- 10. PARADA × HORÁRIO
-- ==============================================================================
INSERT INTO stop_schedules (id_stop, id_schedule) VALUES
(1, 1), (1, 2), (1, 3),   -- Cosmos: 06:30, 07:00, 07:30
(2, 2), (2, 3), (2, 4),   -- Praça da Matriz: 07:00, 07:30, 08:00
(3, 2), (3, 3), (3, 4),   -- Praça Gentil: 07:00, 07:30, 08:00
(4, 3), (4, 4),            -- UFC: 07:30, 08:00
(5, 1), (5, 2);            -- Terminal Norte: 06:30, 07:00

-- ==============================================================================
-- 11. ROTA × PARADA (ordem)
-- ==============================================================================
INSERT INTO route_stops (id_route, id_stop, stop_order) VALUES
(1, 1, 1),  -- RT-001: Cosmos 1°
(1, 2, 2),  -- RT-001: Praça da Matriz 2°
(1, 3, 3),  -- RT-001: Praça Gentil 3°
(1, 4, 4),  -- RT-001: UFC 4°
(2, 5, 1),  -- RT-002: Terminal Norte 1°
(2, 3, 2),  -- RT-002: Praça Gentil 2°
(2, 4, 3);  -- RT-002: UFC 3°

-- ==============================================================================
-- 12. VIAGENS (TRIPS) — de hoje
-- ==============================================================================
INSERT INTO trips (id, date, status, id_route, id_bus, id_driver) VALUES
(1, CURRENT_DATE(), 'Agendada', 1, 1, 2),
(2, CURRENT_DATE(), 'Agendada', 2, 2, 2);

-- ==============================================================================
-- 13. PASSAGEIRO × VIAGEM
-- ==============================================================================
INSERT INTO passenger_trips (id_passenger, id_trip, id_schedule) VALUES
(3, 1, 2);  -- João Aluno na viagem 1, horário 07:00

-- ==============================================================================
-- 14. POLL (ENQUETE ATIVA)
-- ==============================================================================
INSERT INTO polls (id, title, description, start_time, end_time, status) VALUES
(1,
 'Votação de Embarque e Desembarque — Julho 2026',
 'Informe seu ponto de embarque e desembarque para organizar as rotas de transporte universitário',
 DATE_FORMAT(NOW() - INTERVAL 1 HOUR, '%Y-%m-%d %H:%i:%s'),
 DATE_FORMAT(NOW() + INTERVAL 23 HOUR, '%Y-%m-%d %H:%i:%s'),
 'Ativa');

-- Paradas de embarque disponíveis na enquete
INSERT INTO poll_boarding_stops (poll_id, stop_id) VALUES
(1, 1),  -- Cosmos
(1, 2),  -- Praça da Matriz
(1, 3);  -- Praça Gentil Cardoso

-- Paradas de desembarque disponíveis na enquete
INSERT INTO poll_alighting_stops (poll_id, stop_id) VALUES
(1, 3),  -- Praça Gentil Cardoso
(1, 4);  -- UFC Benfica

-- Horários disponíveis na enquete
INSERT INTO poll_schedules (poll_id, schedule_id) VALUES
(1, 1),  -- 06:30
(1, 2),  -- 07:00
(1, 3);  -- 07:30

-- ==============================================================================
-- 15. AVISOS
-- ==============================================================================
INSERT INTO notices (title, message) VALUES
('Início do Semestre 2026.2', 'As rotas de transporte universitário iniciam na próxima segunda-feira, dia 14/07. Todos os alunos cadastrados estão confirmados.'),
('Manutenção Programada — Ônibus 02', 'O veículo ABC-5678 passará por revisão na sexta-feira. Utilize a rota alternativa RT-002.');

-- ==============================================================================
-- 16. CONFIGURAÇÕES DO SISTEMA
-- ==============================================================================
INSERT INTO settings (open_time, close_time, blocked_next_day) VALUES
('06:00', '22:00', FALSE);

-- ==============================================================================
-- VERIFICAÇÃO FINAL
-- ==============================================================================
SELECT 'users'         AS tabela, COUNT(*) AS registros FROM users
UNION ALL
SELECT 'administrators', COUNT(*) FROM administrators
UNION ALL
SELECT 'drivers',        COUNT(*) FROM drivers
UNION ALL
SELECT 'passengers',     COUNT(*) FROM passengers
UNION ALL
SELECT 'buses',          COUNT(*) FROM buses
UNION ALL
SELECT 'routes',         COUNT(*) FROM routes
UNION ALL
SELECT 'stops',          COUNT(*) FROM stops
UNION ALL
SELECT 'schedules',      COUNT(*) FROM schedules
UNION ALL
SELECT 'trips',          COUNT(*) FROM trips
UNION ALL
SELECT 'polls',          COUNT(*) FROM polls
UNION ALL
SELECT 'notices',        COUNT(*) FROM notices;
