-- Golf Charity Platform Database Schema
-- Optimized for scalability and future expansion

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Charities table
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  long_description TEXT,
  image_url TEXT,
  website_url TEXT,
  country VARCHAR(2) DEFAULT 'US',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  total_supporters INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE, -- 'monthly' or 'yearly'
  price DECIMAL(10,2) NOT NULL,
  interval VARCHAR(20) NOT NULL, -- 'month' or 'year'
  stripe_price_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  is_admin BOOLEAN DEFAULT false,
  subscription_status VARCHAR(50) DEFAULT 'inactive', -- 'active', 'inactive', 'cancelled', 'past_due'
  subscription_plan_id UUID REFERENCES subscription_plans(id),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User charity selections
CREATE TABLE user_charity_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  contribution_percentage DECIMAL(5,2) DEFAULT 10.00 CHECK (contribution_percentage >= 10 AND contribution_percentage <= 100),
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- One charity per user
);

-- Scores table (CRITICAL: 5-score rolling window)
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value >= 1 AND value <= 45),
  score_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient score queries
CREATE INDEX idx_scores_user_date ON scores(user_id, score_date DESC);

-- Draws table
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_date DATE NOT NULL,
  numbers INTEGER[] NOT NULL CHECK (array_length(numbers, 1) = 5),
  draw_type VARCHAR(50) DEFAULT 'random', -- 'random' or 'algorithmic'
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'simulated', 'published'
  total_pool_amount DECIMAL(10,2) DEFAULT 0,
  jackpot_amount DECIMAL(10,2) DEFAULT 0,
  five_match_pool DECIMAL(10,2) DEFAULT 0,
  four_match_pool DECIMAL(10,2) DEFAULT 0,
  three_match_pool DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id)
);

-- Draw results (stores match results for each user)
CREATE TABLE draw_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_numbers INTEGER[] NOT NULL,
  matched_count INTEGER NOT NULL CHECK (matched_count >= 0 AND matched_count <= 5),
  matched_numbers INTEGER[],
  prize_tier VARCHAR(50), -- '3-match', '4-match', '5-match', null
  prize_amount DECIMAL(10,2) DEFAULT 0,
  verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'paid'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);

-- Winner verifications
CREATE TABLE winner_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_result_id UUID NOT NULL REFERENCES draw_results(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  proof_image_url TEXT,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  admin_notes TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid'
  paid_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(draw_result_id)
);

-- Prize pool history (for jackpot rollover tracking)
CREATE TABLE prize_pool_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL, -- 'YYYY-MM'
  total_subscribers INTEGER DEFAULT 0,
  total_pool_amount DECIMAL(10,2) DEFAULT 0,
  jackpot_rollover DECIMAL(10,2) DEFAULT 0,
  five_match_allocated DECIMAL(10,2) DEFAULT 0,
  four_match_allocated DECIMAL(10,2) DEFAULT 0,
  three_match_allocated DECIMAL(10,2) DEFAULT 0,
  five_match_winners INTEGER DEFAULT 0,
  four_match_winners INTEGER DEFAULT 0,
  three_match_winners INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient result queries
CREATE INDEX idx_draw_results_user ON draw_results(user_id, created_at DESC);
CREATE INDEX idx_draw_results_draw ON draw_results(draw_id);
CREATE INDEX idx_draw_results_prize_tier ON draw_results(prize_tier) WHERE prize_tier IS NOT NULL;
CREATE INDEX idx_winner_verifications_status ON winner_verifications(status);
CREATE INDEX idx_winner_verifications_user ON winner_verifications(user_id);

-- Function to enforce 5-score limit per user
CREATE OR REPLACE FUNCTION enforce_score_limit()
RETURNS TRIGGER AS $$
DECLARE
  score_count INTEGER;
BEGIN
  -- Count existing scores for user
  SELECT COUNT(*) INTO score_count
  FROM scores
  WHERE user_id = NEW.user_id;
  
  -- If at limit, delete oldest score
  IF score_count >= 5 THEN
    DELETE FROM scores
    WHERE id = (
      SELECT id FROM scores
      WHERE user_id = NEW.user_id
      ORDER BY score_date ASC, created_at ASC
      LIMIT 1
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce 5-score limit
CREATE TRIGGER trigger_enforce_score_limit
BEFORE INSERT ON scores
FOR EACH ROW
EXECUTE FUNCTION enforce_score_limit();

-- Function to update profile timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profile updates
CREATE TRIGGER trigger_update_profile_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Seed subscription plans
INSERT INTO subscription_plans (name, price, interval) VALUES
  ('monthly', 10.00, 'month'),
  ('yearly', 100.00, 'year'); -- ~17% discount

-- Seed charities
INSERT INTO charities (name, description, country) VALUES
  ('Global Health Initiative', 'Providing healthcare access to underserved communities worldwide', 'US'),
  ('Education for All', 'Supporting quality education for children in developing nations', 'US'),
  ('Clean Water Project', 'Building sustainable water infrastructure in rural areas', 'US'),
  ('Wildlife Conservation Fund', 'Protecting endangered species and their habitats', 'US'),
  ('Youth Sports Foundation', 'Promoting youth development through sports programs', 'US');

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_charity_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_results ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Scores: Users can manage their own scores
CREATE POLICY "Users can view own scores" ON scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores" ON scores
  FOR DELETE USING (auth.uid() = user_id);

-- Charity selections: Users can manage their own selection
CREATE POLICY "Users can view own charity selection" ON user_charity_selections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own charity selection" ON user_charity_selections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own charity selection" ON user_charity_selections
  FOR UPDATE USING (auth.uid() = user_id);

-- Draw results: Users can view their own results
CREATE POLICY "Users can view own draw results" ON draw_results
  FOR SELECT USING (auth.uid() = user_id);

-- Winner verifications: Users can manage their own verifications
CREATE POLICY "Users can view own verifications" ON winner_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verifications" ON winner_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Charities and draws are publicly readable
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Charities are viewable by everyone" ON charities
  FOR SELECT USING (true);

CREATE POLICY "Published draws are viewable by everyone" ON draws
  FOR SELECT USING (status = 'published' OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Subscription plans are viewable by everyone" ON subscription_plans
  FOR SELECT USING (true);
