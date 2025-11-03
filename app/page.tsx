'use client';

import { useState, useEffect } from 'react';
import { FileText, Heart, CheckCircle, Zap } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import StatCard from '@/components/StatCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

interface DashboardStats {
  total_documents: number;
  total_sentiment_analyses: number;
  total_ats_checks: number;
  total_queries: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_documents: 0,
    total_sentiment_analyses: 0,
    total_ats_checks: 0,
    total_queries: 0,
  });
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats({
        total_documents: 125,
        total_sentiment_analyses: 89,
        total_ats_checks: 45,
        total_queries: 267,
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className={cn(
          "text-4xl font-bold mb-3 tracking-tight",
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Welcome to <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">ORVAHR.AI</span>
        </h1>
        <p className={cn(
          "text-lg max-w-3xl mx-auto",
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}>
          AI-Powered HR Analytics Platform for Performance Analysis, Sentiment Tracking & ATS Optimization
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="PA+HR Documents"
          value={stats.total_documents}
          icon={FileText}
          color={theme === 'dark' ? 'bg-blue-600/90' : 'bg-blue-500'}
        />
        <StatCard
          title="Sentiment Analyses"
          value={stats.total_sentiment_analyses}
          icon={Heart}
          color={theme === 'dark' ? 'bg-pink-600/90' : 'bg-pink-500'}
        />
        <StatCard
          title="ATS Checks"
          value={stats.total_ats_checks}
          icon={CheckCircle}
          color={theme === 'dark' ? 'bg-green-600/90' : 'bg-green-500'}
        />
        <StatCard
          title="Total Queries"
          value={stats.total_queries}
          icon={Zap}
          color={theme === 'dark' ? 'bg-purple-600/90' : 'bg-purple-500'}
        />
      </div>

      <div>
        <h2 className={cn(
          "text-xl font-semibold mb-4",
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Get Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="PA+HR Journal Analysis"
            description="Upload performance and HR documents for AI-powered analysis and insights"
            icon={FileText}
            href="/journal"
            color={theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'}
          />
          <DashboardCard
            title="Sentiment Analysis"
            description="Track employee sentiment and engagement through intelligent analysis"
            icon={Heart}
            href="/sentiment"
            color={theme === 'dark' ? 'bg-pink-600' : 'bg-pink-500'}
          />
          <DashboardCard
            title="ATS Checker"
            description="Optimize your resumes and job descriptions with AI guidance"
            icon={CheckCircle}
            href="/ats"
            color={theme === 'dark' ? 'bg-green-600' : 'bg-green-500'}
          />
        </div>
      </div>
    </div>
  );
}