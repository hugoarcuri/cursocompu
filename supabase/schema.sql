-- ============================================================
-- SCHEMA GENERADO AUTOMÁTICAMENTE DESDE PLANTILLA EXCEL
-- Plantilla Registro Adultos.xlsx
-- ============================================================

-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: students (Hoja1 - Datos Personales del Alumno)
-- ============================================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number INTEGER NOT NULL,
  full_name TEXT NOT NULL,
  inscription_number TEXT,
  birth_day INTEGER,
  birth_month INTEGER,
  birth_year INTEGER,
  nationality TEXT,
  sex TEXT CHECK (sex IN ('M', 'F')),
  admission_date DATE,
  exit_date DATE,
  exit_reason TEXT,
  age_range TEXT CHECK (age_range IN (
    '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24',
    '25-29', '30-34', '35-39', '40-49', '50+'
  )),
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: attendance (Hoja 2- - Asistencia Diaria)
-- ============================================================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  day_1 TEXT,
  day_2 TEXT,
  day_3 TEXT,
  day_4 TEXT,
  day_5 TEXT,
  day_6 TEXT,
  day_7 TEXT,
  day_8 TEXT,
  day_9 TEXT,
  day_10 TEXT,
  day_11 TEXT,
  day_12 TEXT,
  day_13 TEXT,
  day_14 TEXT,
  day_15 TEXT,
  day_16 TEXT,
  day_17 TEXT,
  day_18 TEXT,
  day_19 TEXT,
  day_20 TEXT,
  day_21 TEXT,
  day_22 TEXT,
  day_23 TEXT,
  day_24 TEXT,
  day_25 TEXT,
  day_26 TEXT,
  day_27 TEXT,
  day_28 TEXT,
  day_29 TEXT,
  day_30 TEXT,
  day_31 TEXT,
  total_attendances INTEGER DEFAULT 0,
  total_absences INTEGER DEFAULT 0,
  late_arrivals INTEGER DEFAULT 0,
  monthly_accumulated TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: inscription_links (Enlaces de inscripción pública)
-- ============================================================
CREATE TABLE inscription_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGER: actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER inscription_links_updated_at
  BEFORE UPDATE ON inscription_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscription_links ENABLE ROW LEVEL SECURITY;

-- Políticas para students
CREATE POLICY "Students insertable via API" ON students
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Students readable by authenticated" ON students
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students updatable by authenticated" ON students
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Students deletable by authenticated" ON students
  FOR DELETE TO authenticated USING (true);

-- Políticas para attendance
CREATE POLICY "Attendance insertable via API" ON attendance
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Attendance readable by authenticated" ON attendance
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Attendance updatable by authenticated" ON attendance
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Attendance deletable by authenticated" ON attendance
  FOR DELETE TO authenticated USING (true);

-- Políticas para inscription_links
CREATE POLICY "Inscription links readable by anon" ON inscription_links
  FOR SELECT TO anon USING (true);
CREATE POLICY "Inscription links manageable by authenticated" ON inscription_links
  FOR ALL TO authenticated USING (true);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_students_full_name ON students(full_name);
CREATE INDEX idx_students_order_number ON students(order_number);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_month_year ON attendance(month, year);
CREATE INDEX idx_inscription_links_token ON inscription_links(token);
CREATE INDEX idx_inscription_links_active ON inscription_links(is_active);
