'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Users, Clock } from 'lucide-react';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import api from '@/lib/api';

interface Session {
  module: string;
  session_id: string;
  created_at: string;
  files_count: number;
  status: string;
}

interface Stats {
  totalSessions: number;
  uniqueUsers: number;
  averageDuration: number;
  successRate: number;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    uniqueUsers: 0,
    averageDuration: 0,
    successRate: 0,
  });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        // Use the test user that works in Postman
        const userEmail = 'tester@example.com';
        // const userEmail = 'guest@vantage.ai';
        const response = await api.dashboard.getSessions(userEmail);
        // Ensure we're getting the sessions array
        const sessionData = Array.isArray(response) ? response : response.sessions || [];
        setSessions(sessionData);

        if (sessionData.length > 0) {
          const moduleCount = new Set(sessionData.map((s: Session) => s.module)).size;
          const totalFiles = sessionData.reduce((acc: number, s: Session) => acc + s.files_count, 0);
          const completedSessions = sessionData.filter((s: Session) => s.status === 'completed').length;
          
          setStats({
            totalSessions: sessionData.length,
            uniqueUsers: moduleCount, // Now represents unique modules used
            averageDuration: totalFiles, // Now represents total files processed
            successRate: (completedSessions / sessionData.length) * 100,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        {error}
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="rounded-lg border shadow-sm">
        <EmptyState
          icon={Activity}
          title="No sessions yet"
          description="Sessions will appear here once users start interacting with the system."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={Activity}
          trend={{ value: 10, isPositive: true }}
        />
        <StatCard
          title="Unique Modules"
          value={stats.uniqueUsers}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Total Files"
          value={stats.averageDuration}
          icon={Clock}
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard
          title="Completion Rate"
          value={`${Math.round(stats.successRate)}%`}
          icon={TrendingUp}
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      <div className="rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm ">
            <thead className="bg-blue-700">
              <tr>
                <th className="px-4 py-3 font-medium">Session ID</th>
                <th className="px-4 py-3 font-medium">Module</th>
                <th className="px-4 py-3 font-medium">Files</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sessions.map((session) => (
                <tr key={session.session_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{session.session_id}</td>
                  <td className="px-4 py-3">{session.module}</td>
                  <td className="px-4 py-3">{session.files_count}</td>
                  <td className="px-4 py-3">{session.status}</td>
                  <td className="px-4 py-3">
                    {new Date(session.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );}
