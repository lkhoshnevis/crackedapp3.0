'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { AlumniProfile } from '@/lib/types';
import { SemanticSearch } from '@/lib/semantic-search';
import { Analytics } from '@/lib/analytics';
import AlumniProfileCard from './AlumniProfileCard';

interface SearchBarProps {
  onResults?: (results: any[]) => void;
  showResults?: boolean;
  className?: string;
  placeholder?: string;
}

const rotatingSearches = [
  "What DV students got into YC?",
  "What DV students work at Mercor?",
  "What DV students are into space tech?",
  "Who works at FAANG companies?",
  "What DV students are in AI/ML?",
  "Who's in fintech startups?",
  "What DV students are founders?",
  "Who works in consulting?"
];

export default function SearchBar({ 
  onResults, 
  showResults = true, 
  className = '',
  placeholder 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(rotatingSearches[0]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const placeholderIndexRef = useRef(0);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      placeholderIndexRef.current = (placeholderIndexRef.current + 1) % rotatingSearches.length;
      setCurrentPlaceholder(rotatingSearches[placeholderIndexRef.current]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length > 2) {
      setIsLoading(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const searchResults = await SemanticSearch.searchWithContext(query, 20);
          setResults(searchResults);
          setHasSearched(true);
          
          // Track search analytics
          await Analytics.trackSearch(query, searchResults.length);
          
          if (onResults) {
            onResults(searchResults);
          }
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, onResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder || currentPlaceholder}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-linkedin-blue focus:border-linkedin-blue text-sm"
        />
      </div>

      {/* Search Results */}
      {showResults && (query.length > 2) && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              <div className="mb-2 px-2 py-1 text-xs text-gray-500 border-b">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {results.slice(0, 10).map((result, index) => (
                  <div key={result.profile.id} className="p-2 hover:bg-gray-50 rounded">
                    <AlumniProfileCard
                      profile={result.profile}
                      similarityScore={result.similarity_score}
                      relevantSnippet={result.relevant_snippet}
                      showElo={true}
                      showContact={false}
                      isBlurred={false}
                      className="!p-0 !shadow-none !border-none"
                    />
                  </div>
                ))}
                {results.length > 10 && (
                  <div className="p-3 text-center text-sm text-gray-500 border-t">
                    <p>Showing first 10 results</p>
                    <p className="text-xs mt-1">Sign up to view all {results.length} profiles</p>
                  </div>
                )}
              </div>
            </div>
          ) : hasSearched ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No results found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try different keywords or check your spelling
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
