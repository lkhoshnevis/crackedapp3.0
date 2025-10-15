import { AlumniProfile } from './types';
import { supabaseAdmin } from './supabase';

export class SemanticSearch {
  static async searchProfiles(query: string, limit: number = 20): Promise<{
    profile: AlumniProfile;
    similarity_score: number;
    relevant_snippet: string;
  }[]> {
    try {
      console.log('Searching profiles with query:', query);
      
      // For now, return mock search results
      const mockProfile: AlumniProfile = {
        id: '1',
        name: 'Search Result Alumni',
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
        linkedin_url: 'https://linkedin.com/in/search-result',
        elo: 1200,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return [{
        profile: mockProfile,
        similarity_score: 0.85,
        relevant_snippet: `Software Engineer at Google, studied Computer Science at Stanford University`
      }];
    } catch (error) {
      console.error('Error in semantic search:', error);
      return [];
    }
  }

  static async searchWithContext(query: string, limit: number = 20): Promise<{
    profile: AlumniProfile;
    similarity_score: number;
    relevant_snippet: string;
  }[]> {
    // Handle specific query patterns
    const enhancedQuery = this.enhanceQuery(query);
    return this.searchProfiles(enhancedQuery, limit);
  }

  private static enhanceQuery(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    // Handle common abbreviations and patterns
    const enhancements: { [key: string]: string } = {
      'yc': 'y combinator',
      'ai': 'artificial intelligence machine learning',
      'ml': 'machine learning artificial intelligence',
      'space tech': 'space aerospace rocket nasa spacex',
      'fintech': 'finance financial technology',
      'startup': 'startup entrepreneur founder',
      'faang': 'facebook amazon apple netflix google meta',
      'big tech': 'google apple microsoft amazon meta',
      'mercor': 'mercor consulting',
      'consulting': 'consultant consulting mckinsey bcg bain',
      'investment banking': 'investment bank goldman sachs morgan stanley',
      'venture capital': 'vc venture capital investor',
      'software engineer': 'software engineer developer programmer',
      'data scientist': 'data scientist analytics machine learning',
      'product manager': 'product manager pm product',
      'quant': 'quantitative finance trading algorithm'
    };

    let enhancedQuery = query;
    
    for (const [key, value] of Object.entries(enhancements)) {
      if (lowerQuery.includes(key)) {
        enhancedQuery += ` ${value}`;
      }
    }
    
    return enhancedQuery;
  }
}