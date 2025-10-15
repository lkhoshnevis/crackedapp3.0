-- DVHS Alumni Ranking Website Database Schema
-- Run this SQL in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create alumni_profiles table
CREATE TABLE IF NOT EXISTS alumni_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    profile_picture_url TEXT,
    high_school TEXT DEFAULT 'DVHS',
    dvhs_class_of TEXT,
    college_1_name TEXT,
    college_1_degree TEXT,
    college_1_logo TEXT,
    college_2_name TEXT,
    college_2_degree TEXT,
    college_2_logo TEXT,
    college_3_name TEXT,
    college_3_degree TEXT,
    college_3_logo TEXT,
    experience_1_company TEXT,
    experience_1_role TEXT,
    experience_1_logo TEXT,
    experience_2_company TEXT,
    experience_2_role TEXT,
    experience_2_logo TEXT,
    experience_3_company TEXT,
    experience_3_role TEXT,
    experience_3_logo TEXT,
    experience_4_company TEXT,
    experience_4_role TEXT,
    experience_4_logo TEXT,
    linkedin_url TEXT,
    elo INTEGER DEFAULT 1000,
    email TEXT,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vote_sessions table
CREATE TABLE IF NOT EXISTS vote_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT NOT NULL,
    profile1_id UUID REFERENCES alumni_profiles(id) ON DELETE CASCADE,
    profile2_id UUID REFERENCES alumni_profiles(id) ON DELETE CASCADE,
    winner_id UUID REFERENCES alumni_profiles(id) ON DELETE SET NULL,
    voted_equal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create elo_history table
CREATE TABLE IF NOT EXISTS elo_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES alumni_profiles(id) ON DELETE CASCADE,
    old_elo INTEGER NOT NULL,
    new_elo INTEGER NOT NULL,
    change_amount INTEGER NOT NULL,
    vote_session_id UUID REFERENCES vote_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search_analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    query TEXT NOT NULL,
    results_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session_analytics table
CREATE TABLE IF NOT EXISTS session_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    votes_made INTEGER DEFAULT 0,
    leaderboard_clicks INTEGER DEFAULT 0,
    searches_made INTEGER DEFAULT 0,
    contact_info_clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vote_analytics table
CREATE TABLE IF NOT EXISTS vote_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    profile1_id UUID REFERENCES alumni_profiles(id) ON DELETE CASCADE,
    profile2_id UUID REFERENCES alumni_profiles(id) ON DELETE CASCADE,
    winner_id UUID REFERENCES alumni_profiles(id) ON DELETE SET NULL,
    voted_equal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_click_analytics table
CREATE TABLE IF NOT EXISTS contact_click_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES alumni_profiles(id) ON DELETE CASCADE,
    contact_type TEXT CHECK (contact_type IN ('email', 'phone')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_elo ON alumni_profiles(elo DESC);
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_name ON alumni_profiles(name);
CREATE INDEX IF NOT EXISTS idx_vote_sessions_session_id ON vote_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_vote_sessions_created_at ON vote_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_elo_history_profile_id ON elo_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_elo_history_created_at ON elo_history(created_at);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON search_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_session_analytics_session_id ON session_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_vote_analytics_session_id ON vote_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_vote_analytics_created_at ON vote_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_click_analytics_user_id ON contact_click_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_click_analytics_profile_id ON contact_click_analytics(profile_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_alumni_profiles_updated_at 
    BEFORE UPDATE ON alumni_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_analytics_updated_at 
    BEFORE UPDATE ON session_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE elo_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_click_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (read/insert/update)
-- Alumni profiles - public read, authenticated insert/update
CREATE POLICY "Public read access for alumni profiles" ON alumni_profiles
    FOR SELECT USING (true);

CREATE POLICY "Authenticated insert access for alumni profiles" ON alumni_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update access for alumni profiles" ON alumni_profiles
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Vote sessions - public insert, authenticated read
CREATE POLICY "Public insert access for vote sessions" ON vote_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated read access for vote sessions" ON vote_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

-- ELO history - public insert, authenticated read
CREATE POLICY "Public insert access for elo history" ON elo_history
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated read access for elo history" ON elo_history
    FOR SELECT USING (auth.role() = 'authenticated');

-- Search analytics - public insert, authenticated read
CREATE POLICY "Public insert access for search analytics" ON search_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated read access for search analytics" ON search_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

-- User profiles - authenticated users only
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Session analytics - public insert, authenticated read
CREATE POLICY "Public insert access for session analytics" ON session_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated read access for session analytics" ON session_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update access for session analytics" ON session_analytics
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Vote analytics - public insert, authenticated read
CREATE POLICY "Public insert access for vote analytics" ON vote_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated read access for vote analytics" ON vote_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Contact click analytics - authenticated users only
CREATE POLICY "Users can insert own contact clicks" ON contact_click_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own contact clicks" ON contact_click_analytics
    FOR SELECT USING (auth.uid() = user_id);

-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE alumni_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE vote_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE elo_history;
ALTER PUBLICATION supabase_realtime ADD TABLE search_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE session_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE vote_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_click_analytics;

-- Create a function to get profile rank
CREATE OR REPLACE FUNCTION get_profile_rank(profile_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) + 1
        FROM alumni_profiles
        WHERE elo > (SELECT elo FROM alumni_profiles WHERE id = profile_uuid)
    );
END;
$$ LANGUAGE plpgsql;

-- Create a function to get recent ELO changes
CREATE OR REPLACE FUNCTION get_recent_elo_change(profile_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT change_amount
        FROM elo_history
        WHERE profile_id = profile_uuid
        ORDER BY created_at DESC
        LIMIT 1
    );
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Create RPC functions for analytics
CREATE OR REPLACE FUNCTION insert_search_analytics(p_query TEXT, p_results_count INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO search_analytics (query, results_count, created_at)
    VALUES (p_query, p_results_count, NOW());
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_vote_analytics(
    p_session_id TEXT,
    p_user_id UUID,
    p_profile1_id UUID,
    p_profile2_id UUID,
    p_winner_id UUID,
    p_voted_equal BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO vote_analytics (
        session_id, user_id, profile1_id, profile2_id, 
        winner_id, voted_equal, created_at
    )
    VALUES (
        p_session_id, p_user_id, p_profile1_id, p_profile2_id,
        p_winner_id, p_voted_equal, NOW()
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_contact_click_analytics(
    p_user_id UUID,
    p_profile_id UUID,
    p_contact_type TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO contact_click_analytics (user_id, profile_id, contact_type, created_at)
    VALUES (p_user_id, p_profile_id, p_contact_type, NOW());
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_name TEXT,
    p_avatar_url TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_profiles (id, email, name, avatar_url, created_at, updated_at)
    VALUES (p_user_id, p_email, p_name, p_avatar_url, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION upsert_session_analytics(
    p_session_id TEXT,
    p_user_id UUID,
    p_votes_made INTEGER,
    p_leaderboard_clicks INTEGER,
    p_searches_made INTEGER,
    p_contact_info_clicks INTEGER
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO session_analytics (
        session_id, user_id, votes_made, leaderboard_clicks,
        searches_made, contact_info_clicks, created_at, updated_at
    )
    VALUES (
        p_session_id, p_user_id, p_votes_made, p_leaderboard_clicks,
        p_searches_made, p_contact_info_clicks, NOW(), NOW()
    )
    ON CONFLICT (session_id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        votes_made = session_analytics.votes_made + EXCLUDED.votes_made,
        leaderboard_clicks = session_analytics.leaderboard_clicks + EXCLUDED.leaderboard_clicks,
        searches_made = session_analytics.searches_made + EXCLUDED.searches_made,
        contact_info_clicks = session_analytics.contact_info_clicks + EXCLUDED.contact_info_clicks,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data (optional)
-- INSERT INTO alumni_profiles (name, dvhs_class_of, elo, linkedin_url) VALUES
-- ('Sample Alumni 1', '2020', 1200, 'https://linkedin.com/in/sample1'),
-- ('Sample Alumni 2', '2021', 1150, 'https://linkedin.com/in/sample2'),
-- ('Sample Alumni 3', '2019', 1300, 'https://linkedin.com/in/sample3');

COMMENT ON TABLE alumni_profiles IS 'Main table storing alumni profile information and ELO ratings';
COMMENT ON TABLE vote_sessions IS 'Tracks all voting sessions between alumni profiles';
COMMENT ON TABLE elo_history IS 'Historical record of all ELO rating changes';
COMMENT ON TABLE search_analytics IS 'Analytics for search queries and results';
COMMENT ON TABLE user_profiles IS 'User profiles for authenticated users';
COMMENT ON TABLE session_analytics IS 'Session-based analytics tracking user behavior';
COMMENT ON TABLE vote_analytics IS 'Detailed analytics for individual votes';
COMMENT ON TABLE contact_click_analytics IS 'Analytics for contact information clicks by authenticated users';
