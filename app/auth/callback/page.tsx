'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const result = await AuthService.handleAuthCallback();
        
        if (result.success) {
          setStatus('success');
          setMessage('Successfully signed in! Redirecting...');
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Authentication failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred');
        console.error('Auth callback error:', error);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="loading-spinner mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Completing sign in...
              </h2>
              <p className="text-gray-600">
                Please wait while we finish setting up your account.
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome!
              </h2>
              <p className="text-gray-600">
                {message}
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Sign in failed
              </h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <button
                onClick={() => router.push('/')}
                className="btn-primary"
              >
                Return to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
