// ============================================================================
// VANTAGE.AI - TypeScript Type Definitions
// ============================================================================

// ----------------------------------------------------------------------------
// Journal Analysis Types (PA+HR Module)
// ----------------------------------------------------------------------------
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface JournalAnalysisRequest {
  document_id: string;
  file_path?: string;
}

export interface JournalAnalysisResponse {
  document_id: string;
  analysis: {
    summary: string;
    key_topics: string[];
    sentiment_overview: string;
    actionable_insights: string[];
    compliance_notes?: string[];
  };
  metadata: {
    processed_at: string;
    page_count: number;
    word_count: number;
  };
  status: 'success' | 'error';
}

// ----------------------------------------------------------------------------
// Sentiment Analysis Types
// ----------------------------------------------------------------------------
export interface SentimentAnalysisRequest {
  text: string;
  context?: string;
}

export interface SentimentScore {
  positive: number;
  negative: number;
  neutral: number;
  overall: 'positive' | 'negative' | 'neutral';
}

export interface SentimentAnalysisResponse {
  sentiment: SentimentScore;
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
  key_phrases: string[];
  recommendations: string[];
  status: 'success' | 'error';
}

// ----------------------------------------------------------------------------
// ATS Resume Checker Types
// ----------------------------------------------------------------------------
export interface ATSCheckRequest {
  resume_text: string;
  job_description?: string;
}

export interface ATSScore {
  overall_score: number;
  formatting_score: number;
  keyword_score: number;
  content_score: number;
}

export interface ATSCheckResponse {
  ats_score: ATSScore;
  detected_sections: string[];
  missing_sections: string[];
  keyword_analysis: {
    matched_keywords: string[];
    missing_keywords: string[];
    keyword_density: number;
  };
  recommendations: string[];
  parsed_data: {
    name?: string;
    email?: string;
    phone?: string;
    skills: string[];
    experience_years?: number;
  };
  status: 'success' | 'error';
}

// ----------------------------------------------------------------------------
// Session Analysis Types
// ----------------------------------------------------------------------------
export interface SessionData {
  session_id: string;
  timestamp: string;
  duration: number;
  user_id?: string;
  module: 'journal' | 'sentiment' | 'ats';
  action: string;
  metadata?: Record<string, any>;
}

export interface SessionAnalytics {
  total_sessions: number;
  active_users: number;
  popular_modules: {
    module: string;
    usage_count: number;
  }[];
  average_session_duration: number;
  peak_usage_times: string[];
}

// ----------------------------------------------------------------------------
// API Response Types
// ----------------------------------------------------------------------------
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// ----------------------------------------------------------------------------
// Dashboard Types
// ----------------------------------------------------------------------------
export interface DashboardStats {
  total_documents: number;
  total_sentiment_analyses: number;
  total_ats_checks: number;
  total_queries: number;
}

export interface RecentActivity {
  id: string;
  type: 'journal' | 'sentiment' | 'ats';
  title: string;
  timestamp: string;
  status: 'completed' | 'processing' | 'failed';
}

// ----------------------------------------------------------------------------
// UI Component Types
// ----------------------------------------------------------------------------
export interface ModuleCard {
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

// ----------------------------------------------------------------------------
// File Upload Types
// ----------------------------------------------------------------------------
export interface FileUploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  message?: string;
}

// Sentiment Analysis Types (Extended)
export interface SentimentUploadRequest {
  file: File;
  feedback_type: string;
}

export interface SentimentUploadResponse {
  job_id: string;
  message: string;
  status: string;
}

export interface SentimentQueryRequest {
  job_id: string;
  query: string;
}

export interface SentimentQueryResponse {
  job_id: string;
  query: string;
  answer: string;
  timestamp: string;
}

export interface SentimentStatusResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  report_url?: string;
  error_message?: string;
}

// ============================================================================
// ADD THESE TYPE DEFINITIONS TO YOUR /types/index.ts FILE
// Add at the end of the file or in the ATS section
// ============================================================================

// ====================================================================
// ATS Analysis Types (Extended)
// ====================================================================

/**
 * Request type for uploading ATS analysis files
 */
export interface ATSUploadRequest {
  job_description: File;
  resumes: File[];
  results_filter: 'top' | 'all';
  top_count?: number;
}

/**
 * Response from ATS analysis upload
 */
export interface ATSUploadResponse {
  job_id: string;
  message: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at?: string;
  total_resumes?: number;
}

/**
 * Request type for querying ATS analysis results
 */
export interface ATSQueryRequest {
  job_id: string;
  query: string;
}

/**
 * Response from ATS analysis query
 */
export interface ATSQueryResponse {
  job_id: string;
  query: string;
  answer: string;
  timestamp: string;
  metadata?: {
    confidence?: number;
    sources?: string[];
    top_candidates?: string[];
    [key: string]: any;
  };
}

/**
 * Response from ATS analysis status check
 */
export interface ATSStatusResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  progress?: number;
  report_url?: string;
  error_message?: string;
  metadata?: {
    job_description_file?: string;
    total_resumes?: number;
    processed_resumes?: number;
    top_candidates?: number;
    results_filter?: 'top' | 'all';
    [key: string]: any;
  };
}

/**
 * Results filter type for ATS analysis
 */
export type ATSResultsFilter = 'top' | 'all';

/**
 * Message type for ATS conversation
 */
export interface ATSMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  jobId?: string;
  metadata?: {
    job_description?: string;
    resume_count?: number;
    [key: string]: any;
  };
}

/**
 * ATS analysis mode
 */
export type ATSAnalysisMode = 'upload' | 'query';

/**
 * Candidate ranking result
 */
export interface CandidateRanking {
  candidate_id: string;
  candidate_name: string;
  resume_file: string;
  ats_score: number;
  match_percentage: number;
  strengths: string[];
  gaps: string[];
  recommendation: 'strong_fit' | 'good_fit' | 'potential_fit' | 'not_recommended';
  rank?: number;
}

/**
 * ATS analysis summary
 */
export interface ATSAnalysisSummary {
  job_id: string;
  total_candidates: number;
  analyzed_candidates: number;
  top_candidates: CandidateRanking[];
  average_score: number;
  key_requirements: string[];
  common_gaps: string[];
  recommendations: string[];
}

export const dashboardAPI = {
  getStats: async (userEmail: string, days: number = 7) => {
    const params = new URLSearchParams({ 
      user_email: userEmail, 
      days: String(days) 
    });
    const response = await fetch(`${API_BASE_URL}/agents/dashboard/stats?${params}`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  }
}

// ====================================================================
// End of Type Definitions
// ====================================================================


