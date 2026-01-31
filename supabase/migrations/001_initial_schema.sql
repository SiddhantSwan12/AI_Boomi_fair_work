-- FairWork Database Schema for Supabase
-- This stores off-chain metadata while sensitive data lives on IPFS

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_job_id BIGINT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  description_ipfs TEXT NOT NULL,
  amount BIGINT NOT NULL,
  deadline BIGINT NOT NULL,
  client TEXT NOT NULL,
  freelancer TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  deliverable_ipfs TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_dispute_id BIGINT UNIQUE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  contract_job_id BIGINT NOT NULL,
  raised_by TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'RAISED',
  outcome TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Evidence table
CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
  ipfs_hash TEXT NOT NULL,
  description TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Analysis table
CREATE TABLE IF NOT EXISTS ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID UNIQUE REFERENCES disputes(id) ON DELETE CASCADE,
  recommendation TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  summary TEXT NOT NULL,
  reasoning JSONB NOT NULL,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
  juror TEXT NOT NULL,
  decision TEXT NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dispute_id, juror)
);

-- Jurors table (tracks who's in the jury pool)
CREATE TABLE IF NOT EXISTS jurors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
  juror_address TEXT NOT NULL,
  selected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_client ON jobs(client);
CREATE INDEX IF NOT EXISTS idx_jobs_freelancer ON jobs(freelancer);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_disputes_job_id ON disputes(job_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_evidence_dispute_id ON evidence(dispute_id);
CREATE INDEX IF NOT EXISTS idx_votes_dispute_id ON votes(dispute_id);

-- Enable Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurors ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow read for all, write for authenticated users)
CREATE POLICY "Allow public read access on jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Allow public read access on disputes" ON disputes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on evidence" ON evidence FOR SELECT USING (true);
CREATE POLICY "Allow public read access on ai_analysis" ON ai_analysis FOR SELECT USING (true);
CREATE POLICY "Allow public read access on votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on jurors" ON jurors FOR SELECT USING (true);

-- For MVP, allow all inserts/updates (in production, you'd restrict this)
CREATE POLICY "Allow all inserts on jobs" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates on jobs" ON jobs FOR UPDATE USING (true);
CREATE POLICY "Allow all inserts on disputes" ON disputes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates on disputes" ON disputes FOR UPDATE USING (true);
CREATE POLICY "Allow all inserts on evidence" ON evidence FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all inserts on ai_analysis" ON ai_analysis FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all inserts on votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all inserts on jurors" ON jurors FOR INSERT WITH CHECK (true);
