
/* Auto-updated api client to match backend endpoints (minimal) */
import axios from 'axios';
import type { DashboardStats } from '@/types/dashboard';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  // Removed timeout to allow for longer processing times
  timeout: 0,
});

export default {
  journal: {
    uploadFiles: async (files: File[], query?: string) => {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      if (query) formData.append('query', query);
      const res = await apiClient.post('/files/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    askQuestion: async (query: string, sessionId?: string) => {
      const res = await apiClient.post('/insights/ask/nostream', { query, session_id: sessionId });
      return res.data;
    }
  },

  sentiment: {
    submitJob: async (formData: FormData) => {
      // ensure default user_email
      if (!formData.get('user_email')) formData.append('user_email', 'guest@vantage.ai');
      const res = await apiClient.post('/agents/sentiment/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    getStatus: async (jobId: string) => {
      const res = await apiClient.get(`/agents/sentiment/status/${jobId}`);
      return res.data;
    },
    getResults: async (jobId: string) => {
      const res = await apiClient.get(`/agents/sentiment/results/${jobId}`);
      return res.data;
    },
    query: async (payload: { job_id: string; query: string; user_email: string }) => {
      const res = await apiClient.post('/agents/sentiment/query', payload);
      return res.data;
    },
    listJobs: async (userEmail: string, params = {}) => {
      const res = await apiClient.get('/agents/sentiment/jobs', { params: { user_email: userEmail, ...params }});
      return res.data;
    }
  },

  // Merged with the other dashboard section below

  ats: {
    submitJob: async (formData: FormData) => {
      if (!formData.get('user_email')) formData.append('user_email', 'guest@vantage.ai');
      const res = await apiClient.post('/agents/ats/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    getStatus: async (jobId: string) => {
      const res = await apiClient.get(`/agents/ats/status/${jobId}`);
      return res.data;
    },
    getResults: async (jobId: string) => {
      const res = await apiClient.get(`/agents/ats/results/${jobId}`);
      return res.data;
    },
    query: async (payload: { job_id: string; query: string; user_email: string }) => {
      const res = await apiClient.post('/agents/ats/query', payload);
      return res.data;
    },
    listJobs: async (userEmail: string, params = {}) => {
      const res = await apiClient.get('/agents/ats/jobs', { params: { user_email: userEmail, ...params }});
      return res.data;
    }
  },

  dashboard: {
    getStats: async (userEmail: string, days = 40): Promise<DashboardStats> => {
      const res = await apiClient.get<DashboardStats>('/agents/dashboard/stats', { 
        params: { user_email: userEmail, days }
      });
      if (!res.data || !res.data.stats) {
        throw new Error('Invalid response format from API');
      }
      return res.data;
    },
    getSessions: async (userEmail: string) => {
      const res = await apiClient.get(`/sessions/user/${userEmail}`);
      if (!res.data) {
        throw new Error('No session data received');
      }
      return res.data;
    }
  },

  download: {
    generateDocx: async (request: any) => {
      const res = await apiClient.post('/download/docx', request, { responseType: 'blob' });
      return res.data;
    },
    generatePdf: async (request: any) => {
      const res = await apiClient.post('/download/pdf', request, { responseType: 'blob' });
      return res.data;
    }
  }
};
