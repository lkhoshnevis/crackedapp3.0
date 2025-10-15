'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Equal, Trophy, ChevronRight } from 'lucide-react';
import { AlumniProfile, VotePair } from '@/lib/types';
import { VotingSystem } from '@/lib/voting';
import { Analytics } from '@/lib/analytics';
import AlumniProfileCard from '@/components/AlumniProfileCard';
import RealtimeIndicator from '@/components/RealtimeIndicator';

export default function VotePage() {
  const router = useRouter();
  const [currentPair, setCurrentPair] = useState<VotePair | null>(null);
  const [preloadedPair, setPreloadedPair] = useState<VotePair | null>(null);
  const [isVoted, setIsVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEloChanges, setShowEloChanges] = useState(false);
  const [eloChanges, setEloChanges] = useState<any>(null);
  const [voteCount, setVoteCount] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);

  // Load initial pair
  const loadPair = useCallback(async () => {
    setIsLoading(true);
    try {
      const pair = await VotingSystem.getRandomPair();
      setCurrentPair(pair);
      setIsVoted(false);
      setShowEloChanges(false);
      setIsRevealing(false);
      setEloChanges(null);
      
      // Preload next pair
      if (pair) {
        const nextPair = await VotingSystem.preloadNextPair();
        setPreloadedPair(nextPair);
      }
    } catch (error) {
      console.error('Error loading pair:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Preload next pair
  const preloadNext = useCallback(async () => {
    try {
      const nextPair = await VotingSystem.preloadNextPair();
      setPreloadedPair(nextPair);
    } catch (error) {
      console.error('Error preloading pair:', error);
    }
  }, []);

  useEffect(() => {
    loadPair();
  }, [loadPair]);

  const handleVote = async (winnerId?: string, votedEqual: boolean = false) => {
    if (!currentPair || isSubmitting) return;

    setIsSubmitting(true);
    setIsRevealing(true);

    try {
      // Submit vote
      const result = await VotingSystem.submitVote(
        currentPair.profile1.id,
        currentPair.profile2.id,
        winnerId,
        votedEqual
      );

      if (result.success) {
        setIsVoted(true);
        setVoteCount(prev => prev + 1);
        
        if (result.eloChanges) {
          setEloChanges(result.eloChanges);
          setShowEloChanges(true);
        }
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    // Use preloaded pair if available
    if (preloadedPair) {
      setCurrentPair(preloadedPair);
      setPreloadedPair(null);
      setIsVoted(false);
      setShowEloChanges(false);
      setIsRevealing(false);
      setEloChanges(null);
      
      // Preload next pair
      preloadNext();
    } else {
      // Fallback to loading new pair
      loadPair();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (!currentPair) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No profiles available for voting</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Return Home
          </button>
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
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-linkedin-blue" />
                <span className="text-sm font-medium text-gray-700">
                  {voteCount} votes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Who's More Cracked?
          </h1>
          <p className="text-gray-600">
            Click on a profile to vote, or click "Equal" if they're tied
          </p>
        </div>

        {/* Vote Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Profile 1 */}
          <div className="lg:order-1">
            <div
              className={`vote-card cursor-pointer transition-all duration-200 ${
                isVoted ? 'pointer-events-none' : 'hover:shadow-xl hover:scale-105'
              } ${isVoted && eloChanges?.winner?.id === currentPair.profile1.id ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => !isVoted && handleVote(currentPair.profile1.id)}
            >
              <AlumniProfileCard
                profile={currentPair.profile1}
                showElo={true}
                showContact={false}
                isBlurred={!isVoted}
                className="!shadow-none !border-none !p-0"
              />
              
              {showEloChanges && eloChanges?.winner?.id === currentPair.profile1.id && (
                <div className="mt-4 p-2 bg-green-100 rounded-lg">
                  <p className="text-green-800 font-semibold">+15 ELO</p>
                </div>
              )}
              
              {showEloChanges && eloChanges?.loser?.id === currentPair.profile1.id && (
                <div className="mt-4 p-2 bg-red-100 rounded-lg">
                  <p className="text-red-800 font-semibold">-15 ELO</p>
                </div>
              )}
            </div>
          </div>

          {/* Center Equal Button / Next Button */}
          <div className="lg:order-2 flex justify-center">
            {!isVoted ? (
              <button
                onClick={() => handleVote(undefined, true)}
                disabled={isSubmitting}
                className="w-20 h-20 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
              >
                <Equal className="h-8 w-8 text-gray-600" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-20 h-20 bg-linkedin-blue hover:bg-linkedin-dark text-white rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}
            
            {!isVoted && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <p className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                  Equal
                </p>
              </div>
            )}
          </div>

          {/* Profile 2 */}
          <div className="lg:order-3">
            <div
              className={`vote-card cursor-pointer transition-all duration-200 ${
                isVoted ? 'pointer-events-none' : 'hover:shadow-xl hover:scale-105'
              } ${isVoted && eloChanges?.winner?.id === currentPair.profile2.id ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => !isVoted && handleVote(currentPair.profile2.id)}
            >
              <AlumniProfileCard
                profile={currentPair.profile2}
                showElo={true}
                showContact={false}
                isBlurred={!isVoted}
                className="!shadow-none !border-none !p-0"
              />
              
              {showEloChanges && eloChanges?.winner?.id === currentPair.profile2.id && (
                <div className="mt-4 p-2 bg-green-100 rounded-lg">
                  <p className="text-green-800 font-semibold">+15 ELO</p>
                </div>
              )}
              
              {showEloChanges && eloChanges?.loser?.id === currentPair.profile2.id && (
                <div className="mt-4 p-2 bg-red-100 rounded-lg">
                  <p className="text-red-800 font-semibold">-15 ELO</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        {!isVoted && (
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Click on the profile you think is "more cracked" or click "Equal" if they're tied
            </p>
          </div>
        )}

        {/* Post-vote message */}
        {isVoted && (
          <div className="mt-12 text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Vote submitted!
            </p>
            <p className="text-gray-600">
              Click the arrow to continue voting
            </p>
          </div>
        )}
      </div>

      {/* Real-time indicator */}
      <RealtimeIndicator isActive={isRevealing} />
    </div>
  );
}
