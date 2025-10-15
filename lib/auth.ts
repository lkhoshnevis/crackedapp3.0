import { supabase } from './supabase';
import { Analytics } from './analytics';
import { User } from '@supabase/supabase-js';

export class AuthService {
  static async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      // Use direct URL redirect instead of OAuth method
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const oauthUrl = `https://idpflboxrlsnhfwnppdu.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
      
      window.location.href = oauthUrl;
      
      return { success: true };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async handleAuthCallback(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (data.session?.user) {
        // Track user signup/login
        await Analytics.trackUserSignup(
          data.session.user.id,
          data.session.user.email || '',
          data.session.user.user_metadata?.full_name || data.session.user.email || '',
          data.session.user.user_metadata?.avatar_url
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error handling auth callback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }

  static async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  static async requireAuth(): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }
    return user;
  }
}
