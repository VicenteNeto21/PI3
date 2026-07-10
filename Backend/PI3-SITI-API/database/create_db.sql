-- ===================================================================
-- SITI-API — full database creation
-- ===================================================================
CREATE DATABASE IF NOT EXISTS sitidb;

USE sitidb;

-- ==============================================================================
-- TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS users
(
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password            VARCHAR(255) NOT NULL,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active',
    identifier_document VARCHAR(50),
    name                VARCHAR(255),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS addresses
(
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    neighborhood  VARCHAR(255),
    street        VARCHAR(255),
    building_number VARCHAR(20),
    complement    VARCHAR(255)
    );

CREATE TABLE IF NOT EXISTS passengers
(
    id               BIGINT PRIMARY KEY,
    birth_date       DATE,
    phone            VARCHAR(20),
    type             VARCHAR(50),
    registration_number VARCHAR(50),
    bond_proof       VARCHAR(255),
    photo_url        VARCHAR(500),
    id_address       BIGINT,
    CONSTRAINT fk_passenger_user    FOREIGN KEY (id)         REFERENCES users(id)     ON DELETE CASCADE,
    CONSTRAINT fk_passenger_address FOREIGN KEY (id_address) REFERENCES addresses(id)
    );

CREATE TABLE IF NOT EXISTS administrators
(
    id         BIGINT PRIMARY KEY,
    name       VARCHAR(255),
    city       VARCHAR(255),
    state      VARCHAR(100),
    id_address BIGINT,
    CONSTRAINT fk_admin_user    FOREIGN KEY (id)         REFERENCES users(id)     ON DELETE CASCADE,
    CONSTRAINT fk_admin_address FOREIGN KEY (id_address) REFERENCES addresses(id)
    );

CREATE TABLE IF NOT EXISTS drivers
(
    id               BIGINT PRIMARY KEY,
    name             VARCHAR(255),
    phone            VARCHAR(20),
    birth_date       DATE,
    cnh_number       VARCHAR(50),
    cnh_category     VARCHAR(10),
    cnh_validity_date DATE,
    id_address       BIGINT,
    CONSTRAINT fk_driver_user    FOREIGN KEY (id)         REFERENCES users(id)     ON DELETE CASCADE,
    CONSTRAINT fk_driver_address FOREIGN KEY (id_address) REFERENCES addresses(id)
    );

CREATE TABLE IF NOT EXISTS buses
(
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    nickname           VARCHAR(255),
    license_plate      VARCHAR(20)  NOT NULL UNIQUE,
    bus_model          VARCHAR(255),
    manufacturing_year VARCHAR(10),
    capacity           INT,
    accessibility      BOOLEAN     DEFAULT FALSE,
    operation_status   VARCHAR(50),
    id_administrator   BIGINT,
    CONSTRAINT fk_bus_admin FOREIGN KEY (id_administrator) REFERENCES administrators(id)
    );

CREATE TABLE IF NOT EXISTS routes
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    code        VARCHAR(50) NOT NULL UNIQUE,
    name        VARCHAR(255),
    description TEXT,
    status      VARCHAR(50)
    );

CREATE TABLE IF NOT EXISTS schedules
(
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    time VARCHAR(10)
    );

CREATE TABLE IF NOT EXISTS stops
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    status      VARCHAR(50),
    id_address  BIGINT,
    CONSTRAINT fk_stop_address  FOREIGN KEY (id_address)  REFERENCES addresses(id)
    );

CREATE TABLE IF NOT EXISTS stop_schedules
(
    id_stop     BIGINT,
    id_schedule BIGINT,
    PRIMARY KEY (id_stop, id_schedule),
    CONSTRAINT fk_ss_stop     FOREIGN KEY (id_stop)     REFERENCES stops(id),
    CONSTRAINT fk_ss_schedule FOREIGN KEY (id_schedule) REFERENCES schedules(id)
    );

CREATE TABLE IF NOT EXISTS route_stops
(
    id_route   BIGINT,
    id_stop    BIGINT,
    stop_order INT,
    PRIMARY KEY (id_route, id_stop),
    CONSTRAINT fk_rs_route FOREIGN KEY (id_route) REFERENCES routes(id),
    CONSTRAINT fk_rs_stop  FOREIGN KEY (id_stop)  REFERENCES stops(id)
    );

CREATE TABLE IF NOT EXISTS trips
(
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    date      DATE,
    status    VARCHAR(50),
    id_route  BIGINT,
    id_bus    BIGINT,
    id_driver BIGINT,
    CONSTRAINT fk_trip_route  FOREIGN KEY (id_route)  REFERENCES routes(id),
    CONSTRAINT fk_trip_bus    FOREIGN KEY (id_bus)    REFERENCES buses(id),
    CONSTRAINT fk_trip_driver FOREIGN KEY (id_driver) REFERENCES drivers(id)
    );

CREATE TABLE IF NOT EXISTS passenger_trips
(
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_passenger BIGINT,
    id_trip      BIGINT,
    id_schedule  BIGINT,
    CONSTRAINT fk_pt_passenger FOREIGN KEY (id_passenger) REFERENCES passengers(id),
    CONSTRAINT fk_pt_trip      FOREIGN KEY (id_trip)      REFERENCES trips(id),
    CONSTRAINT fk_pt_schedule  FOREIGN KEY (id_schedule)  REFERENCES schedules(id)
    );

CREATE TABLE IF NOT EXISTS transport_requests
(
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    day                 DATE,
    schedule            VARCHAR(10),
    needs_accessibility BOOLEAN DEFAULT FALSE,
    destination         VARCHAR(255),
    id_passenger        BIGINT,
    id_bus              BIGINT,
    CONSTRAINT fk_tr_passenger FOREIGN KEY (id_passenger) REFERENCES passengers(id),
    CONSTRAINT fk_tr_bus       FOREIGN KEY (id_bus)       REFERENCES buses(id)
    );

CREATE TABLE IF NOT EXISTS settings
(
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    open_time        VARCHAR(10),
    close_time       VARCHAR(10),
    blocked_next_day BOOLEAN
);

CREATE TABLE IF NOT EXISTS notices
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(255),
    message    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notice_reads
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    notice_id  BIGINT NOT NULL,
    read_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nr_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_nr_notice FOREIGN KEY (notice_id) REFERENCES notices(id),
    UNIQUE KEY uk_user_notice (user_id, notice_id)
);

CREATE TABLE IF NOT EXISTS support_messages
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT,
    subject    VARCHAR(255),
    message    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sm_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS failures
(
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_plate VARCHAR(20),
    issue_type    VARCHAR(100),
    severity      VARCHAR(50),
    description   TEXT,
    status        VARCHAR(50) DEFAULT 'Registrado',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS polls
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    start_time  DATETIME NOT NULL,
    end_time    DATETIME NOT NULL,
    status      VARCHAR(50) DEFAULT 'Ativa',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS passenger_votes
(
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_passenger          BIGINT,
    poll_id               BIGINT,
    boarding_stop_id      BIGINT,
    boarding_schedule_id  BIGINT,
    alighting_stop_id     BIGINT,
    alighting_schedule_id BIGINT,
    voted_date            DATE,
    status                VARCHAR(50) DEFAULT 'Pendente',
    CONSTRAINT fk_vote_passenger       FOREIGN KEY (id_passenger)          REFERENCES passengers(id),
    CONSTRAINT fk_vote_poll            FOREIGN KEY (poll_id)               REFERENCES polls(id),
    CONSTRAINT fk_vote_boarding_stop   FOREIGN KEY (boarding_stop_id)      REFERENCES stops(id),
    CONSTRAINT fk_vote_boarding_sch    FOREIGN KEY (boarding_schedule_id)  REFERENCES schedules(id),
    CONSTRAINT fk_vote_alighting_stop  FOREIGN KEY (alighting_stop_id)     REFERENCES stops(id),
    CONSTRAINT fk_vote_alighting_sch   FOREIGN KEY (alighting_schedule_id) REFERENCES schedules(id)
);


CREATE TABLE IF NOT EXISTS poll_boarding_stops (
    poll_id BIGINT,
    stop_id BIGINT,
    PRIMARY KEY (poll_id, stop_id),
    CONSTRAINT fk_pbs_poll FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    CONSTRAINT fk_pbs_stop FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS poll_alighting_stops (
    poll_id BIGINT,
    stop_id BIGINT,
    PRIMARY KEY (poll_id, stop_id),
    CONSTRAINT fk_pas_poll FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    CONSTRAINT fk_pas_stop FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS poll_schedules (
    poll_id BIGINT,
    schedule_id BIGINT,
    PRIMARY KEY (poll_id, schedule_id),
    CONSTRAINT fk_ps_poll FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    CONSTRAINT fk_ps_sch FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
);
