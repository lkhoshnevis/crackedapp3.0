export interface AlumniProfile {
  id: string;
  name: string;
  location?: string;
  profile_picture_url?: string;
  high_school: string;
  dvhs_class_of: string;
  college_1_name?: string;
  college_1_degree?: string;
  college_1_logo?: string;
  college_2_name?: string;
  college_2_degree?: string;
  college_2_logo?: string;
  college_3_name?: string;
  college_3_degree?: string;
  college_3_logo?: string;
  experience_1_company?: string;
  experience_1_role?: string;
  experience_1_logo?: string;
  experience_2_company?: string;
  experience_2_role?: string;
  experience_2_logo?: string;
  experience_3_company?: string;
  experience_3_role?: string;
  experience_3_logo?: string;
  experience_4_company?: string;
  experience_4_role?: string;
  experience_4_logo?: string;
  linkedin_url?: string;
  elo: number;
  created_at: string;
  updated_at: string;
  email?: string;
  phone_number?: string;
}

export interface VoteSession {
  id: string;
  session_id: string;
  profile1_id: string;
  profile2_id: string;
  winner_id?: string;
  voted_equal: boolean;
  created_at: string;
}

export interface EloHistory {
  id: string;
  profile_id: string;
  old_elo: number;
  new_elo: number;
  change_amount: number;
  vote_session_id: string;
  created_at: string;
}

export interface SearchAnalytics {
  id: string;
  query: string;
  results_count: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionAnalytics {
  id: string;
  session_id: string;
  user_id?: string;
  votes_made: number;
  leaderboard_clicks: number;
  searches_made: number;
  contact_info_clicks: number;
  created_at: string;
  updated_at: string;
}

export interface VoteAnalytics {
  id: string;
  session_id: string;
  user_id?: string;
  profile1_id: string;
  profile2_id: string;
  winner_id?: string;
  voted_equal: boolean;
  created_at: string;
}

export interface ContactClickAnalytics {
  id: string;
  user_id: string;
  profile_id: string;
  contact_type: 'email' | 'phone';
  created_at: string;
}

export interface SearchResult {
  profile: AlumniProfile;
  similarity_score: number;
  relevant_snippet: string;
}

export interface VotePair {
  profile1: AlumniProfile;
  profile2: AlumniProfile;
}

export interface EloChange {
  profile_id: string;
  old_elo: number;
  new_elo: number;
  change: number;
}

export interface CSVRow {
  'Profile_Name': string;
  'addressWithoutCountry': string;
  'Profile_Picture_URL': string;
  'high_school': string;
  'high_school_logo': string;
  'DVHS class of': string;
  'College_1_Name': string;
  'College_1_Degree': string;
  'College_1_Logo': string;
  'College_2_Name': string;
  'College_2_Degree': string;
  'College_2_Logo': string;
  'College_3_Name': string;
  'College_3_Degree': string;
  'College_3_Logo': string;
  'Experience_1_Company': string;
  'Experience_1_Role': string;
  'Experience_1_Logo': string;
  'Experience_2_Company': string;
  'Experience_2_Role': string;
  'Experience_2_Logo': string;
  'Experience_3_Company': string;
  'Experience_3_Role': string;
  'Experience_3_Logo': string;
  'Experience_4_Company': string;
  'Experience_4_Role': string;
  'Experience_4_Logo': string;
  'linkedinUrl': string;
  'Email': string;
  'Phone number': string;
}

export interface Database {
  public: {
    Tables: {
      alumni_profiles: {
        Row: AlumniProfile;
        Insert: Omit<AlumniProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AlumniProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      vote_sessions: {
        Row: VoteSession;
        Insert: Omit<VoteSession, 'id' | 'created_at'>;
        Update: Partial<Omit<VoteSession, 'id' | 'created_at'>>;
      };
      elo_history: {
        Row: EloHistory;
        Insert: Omit<EloHistory, 'id' | 'created_at'>;
        Update: Partial<Omit<EloHistory, 'id' | 'created_at'>>;
      };
      search_analytics: {
        Row: SearchAnalytics;
        Insert: Omit<SearchAnalytics, 'id' | 'created_at'>;
        Update: Partial<Omit<SearchAnalytics, 'id' | 'created_at'>>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      session_analytics: {
        Row: SessionAnalytics;
        Insert: Omit<SessionAnalytics, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SessionAnalytics, 'id' | 'created_at' | 'updated_at'>>;
      };
      vote_analytics: {
        Row: VoteAnalytics;
        Insert: Omit<VoteAnalytics, 'id' | 'created_at'>;
        Update: Partial<Omit<VoteAnalytics, 'id' | 'created_at'>>;
      };
      contact_click_analytics: {
        Row: ContactClickAnalytics;
        Insert: Omit<ContactClickAnalytics, 'id' | 'created_at'>;
        Update: Partial<Omit<ContactClickAnalytics, 'id' | 'created_at'>>;
      };
    };
  };
}
