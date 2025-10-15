'use client';

import { useState } from 'react';
import { AlumniProfile } from '@/lib/types';

interface ProfilePictureProps {
  profile: AlumniProfile;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl'
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getBackgroundColor = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-teal-500'
  ];
  
  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

export default function ProfilePicture({ 
  profile, 
  size = 'md', 
  className = '',
  showFallback = true 
}: ProfilePictureProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (!profile.profile_picture_url || imageError || !showFallback) {
    return (
      <div 
        className={`
          ${sizeClasses[size]} 
          ${getBackgroundColor(profile.name)} 
          rounded-full flex items-center justify-center text-white font-semibold
          ${className}
        `}
      >
        {getInitials(profile.name)}
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <img
        src={profile.profile_picture_url}
        alt={profile.name}
        className={`
          ${sizeClasses[size]} 
          rounded-full object-cover
          ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          transition-opacity duration-200
        `}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      {!imageLoaded && (
        <div 
          className={`
            absolute inset-0 
            ${sizeClasses[size]} 
            ${getBackgroundColor(profile.name)} 
            rounded-full flex items-center justify-center text-white font-semibold
          `}
        >
          {getInitials(profile.name)}
        </div>
      )}
    </div>
  );
}
