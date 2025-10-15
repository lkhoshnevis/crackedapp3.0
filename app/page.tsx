'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Trophy, Search } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import { Analytics } from '@/lib/analytics';
import SearchBar from '@/components/SearchBar';
import AlumniProfileCard from '@/components/AlumniProfileCard';
import { AlumniProfile } from '@/lib/types';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
    };
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setUser(user);
      setIsAuthenticated(!!user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const result = await AuthService.signInWithGoogle();
    if (!result.success) {
      console.error('Sign in failed:', result.error);
    }
  };

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  };

  const handleLeaderboardClick = () => {
    Analytics.trackLeaderboardClick();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linkedin-blue rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DVHS Alumni Network</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <img
                      src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'User')}`}
                      alt="Profile"
                      className="h-8 w-8 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {user?.user_metadata?.full_name || user?.email}
                    </span>
                  </div>
                  <button
                    onClick={() => AuthService.signOut()}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Sign in with Google</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            DVHS Alumni Network
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            *currently limited to CS students*
          </p>
          <p className="text-2xl md:text-3xl font-semibold text-linkedin-blue mb-8">
            Find people the fun way!
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <SearchBar
            onResults={handleSearchResults}
            showResults={false}
            className="w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
          <Link
            href="/vote"
            className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
          >
            <Trophy className="h-6 w-6" />
            <span>Start Voting</span>
          </Link>
          
          <Link
            href="/leaderboard"
            onClick={handleLeaderboardClick}
            className="btn-outline flex items-center space-x-2 text-lg px-8 py-4"
          >
            <Users className="h-6 w-6" />
            <span>View Leaderboard</span>
          </Link>
        </div>

        {/* Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Search Results
              </h2>
              <p className="text-gray-600">
                Found {searchResults.length} profile{searchResults.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.slice(0, 6).map((result) => (
                <AlumniProfileCard
                  key={result.profile.id}
                  profile={result.profile}
                  similarityScore={result.similarity_score}
                  relevantSnippet={result.relevant_snippet}
                  showElo={true}
                  showContact={isAuthenticated}
                  isBlurred={false}
                />
              ))}
            </div>
            
            {searchResults.length > 6 && (
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">
                  Showing first 6 results. {isAuthenticated ? 'View all results by searching again.' : 'Sign up to view all profiles.'}
                </p>
                {!isAuthenticated && (
                  <button
                    onClick={handleSignIn}
                    className="btn-primary"
                  >
                    Sign up to see all profiles
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-linkedin-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Gamified Rankings
            </h3>
            <p className="text-gray-600">
              Vote between alumni profiles to determine who's "more cracked" using our ELO ranking system.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-linkedin-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Smart Search
            </h3>
            <p className="text-gray-600">
              Find alumni by asking natural questions like "Who works at YC?" or "What DV students are in AI?"
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-linkedin-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Network & Connect
            </h3>
            <p className="text-gray-600">
              Sign up to access contact information and connect directly with fellow DVHS alumni.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 DVHS Alumni Network. Built for the Dougherty Valley High School community.
          </p>
        </div>
      </footer>
    </div>
  );
}
