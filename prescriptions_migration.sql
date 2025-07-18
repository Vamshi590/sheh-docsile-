-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY,
  Sno INTEGER,
  patientId TEXT,
  name TEXT,
  age INTEGER,
  gender TEXT,
  phone TEXT,
  date DATE,
  guardian TEXT,
  address TEXT,
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  status TEXT,
  doctorName TEXT,
  department TEXT,
  referredBy TEXT,
  dob DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_prescriptions_date ON prescriptions(date);

-- Create index on patientId for faster lookups
CREATE INDEX IF NOT EXISTS idx_prescriptions_patientid ON prescriptions(patientId);

-- Disable RLS (Row Level Security) for now to allow direct access
ALTER TABLE prescriptions DISABLE ROW LEVEL SECURITY;

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_prescriptions_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prescriptions_updated_at
BEFORE UPDATE ON prescriptions
FOR EACH ROW
EXECUTE FUNCTION update_prescriptions_updated_at_column();
