import { AlumniProfile, VotePair } from './types';
import { supabaseAdmin } from './supabase';
import { EloCalculator } from './elo-calculator';
import { Analytics } from './analytics';

export class VotingSystem {
  private static recentlyVoted = new Set<string>();
  private static readonly RECENT_VOTE_THRESHOLD = 20;

  static async getRandomPair(): Promise<VotePair | null> {
    try {
      // For now, return mock data
      const mockProfile1: AlumniProfile = {
        id: '1',
        name: 'Sample Alumni 1',
        location: 'San Francisco, CA',
        profile_picture_url: '',
        high_school: 'DVHS',
        dvhs_class_of: '2020',
        college_1_name: 'Stanford University',
        college_1_degree: 'Computer Science',
        college_1_logo: '',
        experience_1_company: 'Google',
        experience_1_role: 'Software Engineer',
        experience_1_logo: '',
        linkedin_url: 'https://linkedin.com/in/sample1',
        elo: 1200,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const mockProfile2: AlumniProfile = {
        id: '2',
        name: 'Sample Alumni 2',
        location: 'Seattle, WA',
        profile_picture_url: '',
        high_school: 'DVHS',
        dvhs_class_of: '2021',
        college_1_name: 'UC Berkeley',
        college_1_degree: 'Data Science',
        college_1_logo: '',
        experience_1_company: 'Microsoft',
        experience_1_role: 'Data Scientist',
        experience_1_logo: '',
        linkedin_url: 'https://linkedin.com/in/sample2',
        elo: 1150,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return {
        profile1: mockProfile1,
        profile2: mockProfile2
      };
    } catch (error) {
      console.error('Error getting random pair:', error);
      return null;
    }
  }

  static async submitVote(
    profile1Id: string,
    profile2Id: string,
    winnerId?: string,
    votedEqual: boolean = false
  ): Promise<{ success: boolean; eloChanges?: any }> {
    try {
      console.log('Vote submitted:', { profile1Id, profile2Id, winnerId, votedEqual });

      // Track analytics
      await Analytics.trackVote(profile1Id, profile2Id, winnerId, votedEqual);

      // Calculate ELO changes if there's a winner
      let eloChanges = null;
      if (winnerId && !votedEqual) {
        const loserId = winnerId === profile1Id ? profile2Id : profile1Id;
        await EloCalculator.calculateEloChange(winnerId, loserId, 'mock-session-id');
        
        // Get the ELO changes for display
        eloChanges = {
          winner: {
            id: winnerId,
            change: 15
          },
          loser: {
            id: loserId,
            change: -15
          }
        };
      }

      // Mark profiles as recently voted
      this.recentlyVoted.add(profile1Id);
      this.recentlyVoted.add(profile2Id);

      return { success: true, eloChanges };

    } catch (error) {
      console.error('Error submitting vote:', error);
      return { success: false };
    }
  }

  static async preloadNextPair(): Promise<VotePair | null> {
    return this.getRandomPair();
  }

  static getRecentlyVotedCount(): number {
    return this.recentlyVoted.size;
  }

  static clearRecentlyVoted(): void {
    this.recentlyVoted.clear();
  }
}