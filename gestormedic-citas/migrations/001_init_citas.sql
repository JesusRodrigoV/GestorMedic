-- Microservicio gestormedic-citas - esquema inicial

CREATE TABLE IF NOT EXISTS appointment_weekly_blocks (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctor_profiles(id),
    weekday INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    consultation_minutes INTEGER NOT NULL,
    specialty_id INTEGER NOT NULL REFERENCES specialties(id),
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    consultation_price INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS ix_weekly_block_doctor_weekday
    ON appointment_weekly_blocks (doctor_id, weekday);

CREATE TABLE IF NOT EXISTS appointment_slot_overrides (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctor_profiles(id),
    slot_start TIMESTAMP NOT NULL,
    slot_end TIMESTAMP NOT NULL,
    specialty_id INTEGER NOT NULL REFERENCES specialties(id),
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    consultation_price INTEGER,
    extra_description VARCHAR(500),
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_slot_override_doctor_slot_start UNIQUE (doctor_id, slot_start)
);

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctor_profiles(id),
    patient_user_id INTEGER NOT NULL REFERENCES users(id),
    specialty_id INTEGER NOT NULL REFERENCES specialties(id),
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    extra_notes VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS ix_appointment_doctor_starts_at
    ON appointments (doctor_id, starts_at);

CREATE INDEX IF NOT EXISTS ix_appointment_patient_starts_at
    ON appointments (patient_user_id, starts_at);

CREATE TABLE IF NOT EXISTS room_doctor_permissions (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    doctor_id INTEGER NOT NULL REFERENCES doctor_profiles(id),
    weekday INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_room_doctor_permission_unique_slot UNIQUE (room_id, doctor_id, weekday, start_time, end_time)
);

CREATE TABLE IF NOT EXISTS room_specialty_permissions (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    specialty_id INTEGER NOT NULL REFERENCES specialties(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_room_specialty_permission UNIQUE (room_id, specialty_id)
);
