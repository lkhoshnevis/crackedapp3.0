'use client';

import { useState, useEffect } from 'react';
import { AlumniProfile } from '@/lib/types';
import { AuthService } from '@/lib/auth';
import { Analytics } from '@/lib/analytics';
import ProfilePicture from './ProfilePicture';
import { ExternalLink, Mail, Phone, Lock } from 'lucide-react';

interface AlumniProfileCardProps {
  profile: AlumniProfile;
  showElo?: boolean;
  showContact?: boolean;
  className?: string;
  isBlurred?: boolean;
  similarityScore?: number;
  relevantSnippet?: string;
}

export default function AlumniProfileCard({
  profile,
  showElo = true,
  showContact = false,
  className = '',
  isBlurred = false,
  similarityScore,
  relevantSnippet
}: AlumniProfileCardProps) {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
    };
    checkAuth();
  }, []);

  const handleContactClick = async (type: 'email' | 'phone') => {
    if (!isAuthenticated) return;
    
    await Analytics.trackContactClick(profile.id, type);
    
    if (type === 'email' && profile.email) {
      window.open(`mailto:${profile.email}`, '_blank');
    } else if (type === 'phone' && profile.phone_number) {
      window.open(`tel:${profile.phone_number}`, '_blank');
    }
  };

  const getEloColor = (elo: number) => {
    if (elo >= 1500) return 'elo-high';
    if (elo >= 1200) return 'elo-medium';
    return 'elo-low';
  };

  const getExperience = () => {
    const experiences = [];
    
    if (profile.experience_1_company) {
      experiences.push({
        company: profile.experience_1_company,
        role: profile.experience_1_role,
        logo: profile.experience_1_logo
      });
    }
    
    if (profile.experience_2_company) {
      experiences.push({
        company: profile.experience_2_company,
        role: profile.experience_2_role,
        logo: profile.experience_2_logo
      });
    }
    
    if (profile.experience_3_company) {
      experiences.push({
        company: profile.experience_3_company,
        role: profile.experience_3_role,
        logo: profile.experience_3_logo
      });
    }
    
    if (profile.experience_4_company) {
      experiences.push({
        company: profile.experience_4_company,
        role: profile.experience_4_role,
        logo: profile.experience_4_logo
      });
    }
    
    return experiences;
  };

  const getEducation = () => {
    const education = [];
    
    if (profile.college_1_name) {
      education.push({
        school: profile.college_1_name,
        degree: profile.college_1_degree,
        logo: profile.college_1_logo
      });
    }
    
    if (profile.college_2_name) {
      education.push({
        school: profile.college_2_name,
        degree: profile.college_2_degree,
        logo: profile.college_2_logo
      });
    }
    
    if (profile.college_3_name) {
      education.push({
        school: profile.college_3_name,
        degree: profile.college_3_degree,
        logo: profile.college_3_logo
      });
    }
    
    return education;
  };

  const experiences = getExperience();
  const education = getEducation();

  return (
    <div className={`profile-card ${className} ${isBlurred ? 'vote-blur' : 'vote-reveal'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <ProfilePicture profile={profile} size="lg" />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">
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
              <p className="text-sm text-gray-500">
                {profile.location}
              </p>
            )}
          </div>
        </div>
        
        {showElo && (
          <div className={`elo-badge ${getEloColor(profile.elo)}`}>
            {profile.elo}
          </div>
        )}
      </div>

      {/* Similarity Score for Search Results */}
      {similarityScore && (
        <div className="mb-3 p-2 bg-blue-50 rounded-md">
          <p className="text-xs text-blue-600 font-medium">
            Relevance: {Math.round(similarityScore * 100)}%
          </p>
          {relevantSnippet && (
            <p className="text-xs text-blue-700 mt-1">
              "{relevantSnippet}"
            </p>
          )}
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Experience</h4>
          <div className="space-y-2">
            {experiences.slice(0, 2).map((exp, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                  {exp.logo ? (
                    <img src={exp.logo} alt="" className="w-4 h-4" />
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  )}
                </div>
                <span className="text-gray-600">
                  {exp.role && `${exp.role} at `}
                  <span className="font-medium">{exp.company}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Education</h4>
          <div className="space-y-2">
            {education.slice(0, 2).map((edu, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                  {edu.logo ? (
                    <img src={edu.logo} alt="" className="w-4 h-4" />
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  )}
                </div>
                <span className="text-gray-600">
                  {edu.degree && `${edu.degree} at `}
                  <span className="font-medium">{edu.school}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Information */}
      {showContact && (
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Contact</h4>
          <div className="space-y-2">
            {profile.email && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{profile.email}</span>
                </div>
                {isAuthenticated ? (
                  <button
                    onClick={() => handleContactClick('email')}
                    className="text-xs text-linkedin-blue hover:text-linkedin-dark transition-colors"
                  >
                    Email →
                  </button>
                ) : (
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Lock className="h-3 w-3" />
                    <span>Sign in to contact</span>
                  </div>
                )}
              </div>
            )}
            
            {profile.phone_number && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{profile.phone_number}</span>
                </div>
                {isAuthenticated ? (
                  <button
                    onClick={() => handleContactClick('phone')}
                    className="text-xs text-linkedin-blue hover:text-linkedin-dark transition-colors"
                  >
                    Text them! →
                  </button>
                ) : (
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Lock className="h-3 w-3" />
                    <span>Sign in to contact</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
