import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { DashboardStats } from '@/types/dashboard';

export function useDashboardStats(days: number = 7, refreshInterval = 30000) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const userEmail = 'tester@example.com'; // Using test email consistently
        console.log(`Fetching stats for ${userEmail} for last ${days} days`);
        const response = await api.dashboard.getStats(userEmail, days);
        
        if (!response || !response.stats) {
          setError('Invalid data received from API');
          return;
        }
        
        // Validate the response matches our expected type
        const validatedStats: DashboardStats = response;
        setStats(validatedStats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, days]); // Added days to dependencies

  return { stats, loading, error };
}
