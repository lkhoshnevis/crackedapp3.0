'use client';

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

interface RealtimeIndicatorProps {
  isActive?: boolean;
  className?: string;
}

export default function RealtimeIndicator({ 
  isActive = false, 
  className = '' 
}: RealtimeIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg animate-slide-up">
        <Activity className="h-4 w-4 animate-pulse" />
        <span className="text-sm font-medium">Live Update</span>
      </div>
    </div>
  );
}
