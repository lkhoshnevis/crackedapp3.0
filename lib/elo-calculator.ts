import { supabaseAdmin } from './supabase';

const ELO_CHANGE = 15;
const BASE_ELO = 1000;

export class EloCalculator {
  static async calculateEloChange(
    winnerId: string,
    loserId: string,
    sessionId: string
  ): Promise<void> {
    try {
      console.log('Calculating ELO change:', { winnerId, loserId, sessionId });
      // TODO: Implement actual ELO calculation with database
      // For now, just log the action
    } catch (error) {
      console.error('Error calculating ELO change:', error);
      throw error;
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
}