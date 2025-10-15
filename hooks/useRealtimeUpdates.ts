'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AlumniProfile } from '@/lib/types';

export function useRealtimeUpdates() {
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Subscribe to alumni profiles updates
    const subscription = supabase
      .channel('alumni_profiles_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alumni_profiles'
        },
        (payload) => {
          console.log('Profile updated:', payload);
          // Handle real-time updates here
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alumni_profiles'
        },
        (payload) => {
          console.log('Profile inserted:', payload);
          // Handle new profile insertions here
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { profiles, isConnected };
}

export function useEloUpdates(callback: (payload: any) => void) {
  useEffect(() => {
    const subscription = supabase
      .channel('elo_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alumni_profiles'
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [callback]);
}

export function useVoteUpdates(callback: (payload: any) => void) {
  useEffect(() => {
    const subscription = supabase
      .channel('vote_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vote_sessions'
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [callback]);
}
