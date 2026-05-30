CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    purpose TEXT NOT NULL,
    language VARCHAR(20) NOT NULL CHECK (language IN ('Hindi', 'Tamil', 'Telugu', 'Marathi', 'English')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_name_mobile ON applications(name, mobile);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
