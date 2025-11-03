// Create: lib/api-client.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const sentimentAPI = {
  submit: async (file: File, domain: string, userEmail: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('domain', domain);
    formData.append('user_email', userEmail);
    formData.append('organization_id', 'org_default');
    
    const response = await fetch(`${API_BASE_URL}/agents/sentiment/submit`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Failed to submit job');
    return response.json();
  },
  
  getStatus: async (jobId: string) => {
    const response = await fetch(`${API_BASE_URL}/agents/sentiment/status/${jobId}`);
    if (!response.ok) throw new Error('Failed to get status');
    return response.json();
  },
  
  query: async (jobId: string, query: string, userEmail: string) => {
    const response = await fetch(`${API_BASE_URL}/agents/sentiment/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, query, user_email: userEmail }),
    });
    if (!response.ok) throw new Error('Query failed');
    return response.json();
  },
  
  listJobs: async (userEmail: string, limit = 10) => {
    const params = new URLSearchParams({ user_email: userEmail, limit: String(limit) });
    const response = await fetch(`${API_BASE_URL}/agents/sentiment/jobs?${params}`);
    if (!response.ok) throw new Error('Failed to list jobs');
    return response.json();
  }
};