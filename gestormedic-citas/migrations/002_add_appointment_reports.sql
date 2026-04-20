-- Migration: add appointment_reports and appointment_ratings tables

CREATE TABLE IF NOT EXISTS appointment_reports (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctor_profiles(id),
    patient_user_id INTEGER NOT NULL REFERENCES users(id),
    report_text TEXT NOT NULL,
    diagnosis VARCHAR(500),
    prescription TEXT,
    follow_up VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NULL,
    UNIQUE (appointment_id)
);

CREATE INDEX IF NOT EXISTS ix_appointment_report_doctor ON appointment_reports(doctor_id);

CREATE TABLE IF NOT EXISTS appointment_ratings (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    patient_user_id INTEGER NOT NULL REFERENCES users(id),
    doctor_id INTEGER NOT NULL REFERENCES doctor_profiles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 3),
    comment VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (appointment_id, patient_user_id)
);

CREATE INDEX IF NOT EXISTS ix_appointment_rating_doctor ON appointment_ratings(doctor_id);
