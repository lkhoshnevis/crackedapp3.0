'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Users, TrendingUp, Search, Eye } from 'lucide-react';
import { AlumniProfile } from '@/lib/types';
import { supabaseAdmin } from '@/lib/supabase';
import AlumniProfileCard from '@/components/AlumniProfileCard';

export default function AdminPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalProfiles: 0,
    averageElo: 0,
    topElo: 0,
    recentUploads: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfiles();
    loadStats();
  }, []);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('alumni_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get total profiles
      const { count: totalProfiles } = await supabaseAdmin
        .from('alumni_profiles')
        .select('*', { count: 'exact', head: true });

      // Get average ELO
      const { data: eloData } = await supabaseAdmin
        .from('alumni_profiles')
        .select('elo');

      // Get top ELO
      const { data: topProfile } = await supabaseAdmin
        .from('alumni_profiles')
        .select('elo')
        .order('elo', { ascending: false })
        .limit(1)
        .single();

      // Get recent uploads (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: recentUploads } = await supabaseAdmin
        .from('alumni_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      const averageElo = eloData && eloData.length > 0 ? Math.round(eloData.reduce((sum: number, p: { elo: number }) => sum + p.elo, 0) / eloData.length) : 0;

      setStats({
        totalProfiles: totalProfiles || 0,
        averageElo,
        topElo: topProfile ? (topProfile as { elo: number }).elo : 0,
        recentUploads: recentUploads || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload via API route
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setUploadResult(result);

      if (result.success) {
        // Reload profiles and stats
        await loadProfiles();
        await loadStats();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        stats: { total: 0, updated: 0, inserted: 0, errors: 1 }
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.dvhs_class_of.includes(searchQuery) ||
    profile.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Profiles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProfiles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average ELO</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageElo}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Highest ELO</p>
                <p className="text-2xl font-bold text-gray-900">{stats.topElo}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Upload className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Uploads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentUploads}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CSV Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload CSV Data
          </h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Upload a CSV file with alumni profile data
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Choose CSV File'}
            </button>
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start">
                {uploadResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                )}
                <div>
                  <p className={`font-medium ${
                    uploadResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {uploadResult.message}
                  </p>
                  {uploadResult.stats && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Total: {uploadResult.stats.total}</p>
                      <p>Inserted: {uploadResult.stats.inserted}</p>
                      <p>Updated: {uploadResult.stats.updated}</p>
                      <p>Errors: {uploadResult.stats.errors}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profiles Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Profile Management
              </h2>
              
              {/* Search */}
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search profiles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                />
              </div>
            </div>
          </div>

          {/* Profiles List */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4" />
                <p className="text-gray-600">Loading profiles...</p>
              </div>
            ) : filteredProfiles.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredProfiles.map((profile) => (
                  <AlumniProfileCard
                    key={profile.id}
                    profile={profile}
                    showElo={true}
                    showContact={true}
                    isBlurred={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {searchQuery ? 'No profiles found matching your search.' : 'No profiles available.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
