import { AlumniProfile } from './types';
import { supabase } from './supabase';

export class LeaderboardService {
  static async getTopProfiles(limit: number = 100): Promise<AlumniProfile[]> {
    try {
      // For now, return mock data
      const mockProfiles: AlumniProfile[] = [
        {
          id: '1',
          name: 'Top Alumni 1',
          location: 'San Francisco, CA',
          profile_picture_url: '',
          high_school: 'DVHS',
          dvhs_class_of: '2019',
          college_1_name: 'MIT',
          college_1_degree: 'Computer Science',
          college_1_logo: '',
          experience_1_company: 'Tesla',
          experience_1_role: 'Senior Software Engineer',
          experience_1_logo: '',
          linkedin_url: 'https://linkedin.com/in/top1',
          elo: 1500,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Top Alumni 2',
          location: 'New York, NY',
          profile_picture_url: '',
          high_school: 'DVHS',
          dvhs_class_of: '2020',
          college_1_name: 'Stanford University',
          college_1_degree: 'Business',
          college_1_logo: '',
          experience_1_company: 'Goldman Sachs',
          experience_1_role: 'Investment Banker',
          experience_1_logo: '',
          linkedin_url: 'https://linkedin.com/in/top2',
          elo: 1450,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return mockProfiles;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  static async getProfileRank(profileId: string): Promise<number> {
    try {
      console.log('Getting profile rank for:', profileId);
      // TODO: Implement actual rank calculation
      return 1;
    } catch (error) {
      console.error('Error getting profile rank:', error);
      return 0;
    }
  }

  static async getEloChange(profileId: string): Promise<number> {
    try {
      console.log('Getting ELO change for profile:', profileId);
      // TODO: Implement actual ELO change retrieval
      return 0;
    } catch (error) {
      console.error('Error getting ELO change:', error);
      return 0;
    }
  }

  static subscribeToEloUpdates(
    callback: (payload: any) => void
  ): { unsubscribe: () => void } {
    // Mock subscription
    console.log('Subscribing to ELO updates');
    return {
      unsubscribe: () => {
        console.log('Unsubscribed from ELO updates');
      }
    };
  }
}