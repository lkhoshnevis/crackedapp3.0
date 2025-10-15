'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AlumniProfile } from '@/lib/types';
import { LeaderboardService } from '@/lib/leaderboard';
import { AuthService } from '@/lib/auth';
import { Analytics } from '@/lib/analytics';
import ProfilePicture from '@/components/ProfilePicture';
import RealtimeIndicator from '@/components/RealtimeIndicator';

export default function LeaderboardPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRealtimeUpdate, setShowRealtimeUpdate] = useState(false);
  const [eloChanges, setEloChanges] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      try {
        const leaderboard = await LeaderboardService.getTopProfiles(100);
        setProfiles(leaderboard);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const checkAuth = async () => {
      const user = await AuthService.getCurrentUser();
      setIsAuthenticated(!!user);
    };

    loadLeaderboard();
    checkAuth();

    // Track leaderboard view
    Analytics.trackLeaderboardClick();

    // Subscribe to real-time ELO updates
    const subscription = LeaderboardService.subscribeToEloUpdates((payload) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
        const profileId = payload.new.id;
        const oldElo = payload.old?.elo || 0;
        const newElo = payload.new.elo;
        const change = newElo - oldElo;
        
        setEloChanges(prev => new Map(prev.set(profileId, change)));
        setShowRealtimeUpdate(true);
        
        // Update the profiles list
        setProfiles(prev => prev.map(profile => 
          profile.id === profileId 
            ? { ...profile, elo: newElo }
            : profile
        ).sort((a, b) => b.elo - a.elo));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getEloChange = (profileId: string): number => {
    return eloChanges.get(profileId) || 0;
  };

  const getEloColor = (elo: number) => {
    if (elo >= 1500) return 'text-green-600';
    if (elo >= 1200) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-linkedin-blue" />
              <h1 className="text-xl font-bold text-gray-900">Leaderboard</h1>
            </div>
            
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-linkedin-blue">
                {profiles.length}
              </div>
              <div className="text-sm text-gray-600">Total Alumni</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {profiles.filter(p => p.elo >= 1500).length}
              </div>
              <div className="text-sm text-gray-600">Elite (1500+)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {profiles.filter(p => p.elo >= 1200 && p.elo < 1500).length}
              </div>
              <div className="text-sm text-gray-600">Strong (1200-1499)</div>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {profiles.length >= 3 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Top 3
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[2, 1, 3].map((rank) => {
                const profile = profiles[rank - 1];
                const change = getEloChange(profile.id);
                return (
                  <div key={profile.id} className={`text-center ${rank === 1 ? 'order-2' : rank === 2 ? 'order-1' : 'order-3'}`}>
                    <div className="relative">
                      <ProfilePicture profile={profile} size="xl" />
                      {change !== 0 && (
                        <div className={`absolute -top-2 -right-2 flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                          change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          <span>{change > 0 ? '+' : ''}{change}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mt-2">
                      {profile.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      DVHS Class of {profile.dvhs_class_of}
                    </p>
                    <div className={`text-2xl font-bold mt-2 ${getEloColor(profile.elo)}`}>
                      {profile.elo}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Full Leaderboard
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {profiles.map((profile, index) => {
              const rank = index + 1;
              const change = getEloChange(profile.id);
              
              return (
                <div key={profile.id} className="leaderboard-row">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="w-8 text-center">
                      <span className="text-lg font-bold text-gray-900">
                        {getRankIcon(rank)}
                      </span>
                    </div>
                    
                    {/* Profile Picture */}
                    <ProfilePicture profile={profile} size="md" />
                    
                    {/* Profile Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {profile.name}
                        </h3>
                        {profile.linkedin_url && (
                          <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-linkedin-blue hover:text-linkedin-dark transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        DVHS Class of {profile.dvhs_class_of}
                      </p>
                      {profile.location && (
                        <p className="text-xs text-gray-500">
                          {profile.location}
                        </p>
                      )}
                    </div>
                    
                    {/* ELO Score */}
                    <div className="flex items-center space-x-2">
                      {change !== 0 && (
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                          change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          <span>{change > 0 ? '+' : ''}{change}</span>
                        </div>
                      )}
                      <div className={`text-xl font-bold ${getEloColor(profile.elo)}`}>
                        {profile.elo}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Info Notice */}
        {!isAuthenticated && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Want to connect with alumni?</strong> Sign up to access contact information and reach out directly to your fellow DVHS graduates.
            </p>
          </div>
        )}
      </div>

      {/* Real-time indicator */}
      <RealtimeIndicator isActive={showRealtimeUpdate} />
    </div>
  );
}
