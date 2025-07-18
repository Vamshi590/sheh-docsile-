-- Disable Row Level Security to allow direct access from your application
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'patients' AND column_name = 'status') THEN
        ALTER TABLE patients ADD COLUMN status TEXT;
    END IF;
    
    -- Add doctorName column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'patients' AND column_name = 'doctorName') THEN
        ALTER TABLE patients ADD COLUMN doctorName TEXT;
    END IF;
END $$;
