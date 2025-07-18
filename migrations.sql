-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY,
  patientId TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  phone TEXT,
  date DATE NOT NULL,
  time TIME,
  address TEXT,
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  status TEXT,
  doctorName TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_patients_date ON patients(date);

-- Create index on patientId for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_patientid ON patients(patientId);

-- Disable RLS (Row Level Security) for now to allow direct access
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS but allow anon access, use this instead:
-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow anonymous access" 
-- ON patients 
-- FOR ALL 
-- USING (true) 
-- WITH CHECK (true);

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comment on table and columns
COMMENT ON TABLE patients IS 'Stores patient information for the Docsile application';
COMMENT ON COLUMN patients.id IS 'Unique identifier for the patient record';
COMMENT ON COLUMN patients.patientId IS 'Patient ID used for identification in the system';
COMMENT ON COLUMN patients.date IS 'Appointment date';
COMMENT ON COLUMN patients.time IS 'Appointment time';
