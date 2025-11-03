export interface DashboardStats {
  stats: {
    documents: {
      total: number;
      change_percentage: number | null;
    };
    sentiment: {
      total_jobs: number;
      completed: number;
      processing: number;
      failed: number;
    };
    ats: {
      total_jobs: number;
      completed: number;
      processing: number;
      total_candidates: number;
    };
  };
  recent_activity: Array<{
    type: string;
    description: string;
    timestamp: string;
    job_id: string;
  }>;
  insights: Array<{
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
  }>;
  period_days: number;
}