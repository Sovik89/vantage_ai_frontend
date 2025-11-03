'use client';

import { useState, useRef, useEffect } from 'react';
import { Heart, Upload, Send, Plus, X, Loader2 } from 'lucide-react';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import Toast from '@/components/Toast';
import { getSentimentLoadingMessage } from '@/lib/loadingMessages';
import PageLayout from '@/components/PageLayout';
import { formatFileSize, cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import api from '@/lib/api';

type ResultsSummary = {
  summary_text: string;
  total_texts: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  sentiment_index: number;
  average_confidence: number;
};

type AnalysisResults = {
  summary: ResultsSummary;
  sentiment_breakdown: Record<string, any>;
  key_themes: string[];
  report_url: string;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  jobId?: string;
  reportUrl?: string;
};

type AnalysisMode = 'upload' | 'query';

export default function SentimentPage() {
  // State Management
  const [mode, setMode] = useState<AnalysisMode>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout>();

  // Debug: Log conversation changes
  useEffect(() => {
    console.log('Conversation state changed. Length:', conversation.length, 'CurrentJobId:', currentJobId, 'Mode:', mode, 'IsComplete:', isAnalysisComplete);
  }, [conversation, currentJobId, mode, isAnalysisComplete]);

  // Cleanup polling on unmount or when starting new analysis
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearTimeout(pollIntervalRef.current);
      }
    };
  }, []);

  // Feedback type options
  const feedbackTypes = [
    { value: 'exit_feedback', label: 'Exit Feedback' },
    { value: 'appraisal_feedback', label: 'Appraisal Feedback' },
    { value: 'interview_feedback', label: 'Interview Feedback' },
    { value: 'pulse_feedback', label: 'Pulse Feedback' },
    { value: 'training_feedback', label: 'Training Feedback' },
    { value: 'onboarding_feedback', label: 'Onboarding Feedback' },
    { value: 'manager_feedback', label: 'Manager Feedback' },
    { value: 'employee_feedback', label: 'Employee Feedback' },
    { value: 'general', label: 'General' },
  ];

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  // Remove selected file
  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle new analysis submission
  const handleAnalysisSubmit = async () => {
    if (!file) {
      setError('Please select an Excel file first');
      return;
    }

    if (!feedbackType) {
      setError('Please select a feedback type');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setIsAnalysisComplete(false);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('feedback_type', feedbackType);

      // Submit the job
      console.log('Submitting job...');
      const response = await api.sentiment.submitJob(formData);
      console.log('Submit response:', response);

      if (response && response.job_id) {
        const newJobId = response.job_id;
        console.log('Received job ID:', newJobId, 'Status:', response.status);
        setCurrentJobId(newJobId);

        // Add initial user message
        const userMessage: Message = {
          role: 'user',
          content: `Started sentiment analysis on ${file.name} (${feedbackType})`,
          timestamp: new Date(),
          jobId: newJobId,
        };

        setConversation(prev => [...prev, userMessage]);

        // Backend processes synchronously, so status should be COMPLETED
        if (response.status === 'COMPLETED' || response.status === 'completed') {
          console.log('Job completed! Fetching results...');
          
          // Fetch results immediately
          const resultsResponse = await api.sentiment.getResults(newJobId);
          console.log('Results response:', resultsResponse);
          
          setAnalysisResults(resultsResponse);

          const resultMessage: Message = {
            role: 'assistant',
            content: resultsResponse.summary?.summary_text || 'Analysis completed successfully!',
            timestamp: new Date(),
            jobId: newJobId,
            reportUrl: resultsResponse.report_url
          };

          setConversation(prev => [...prev, resultMessage]);
          setIsAnalysisComplete(true);
          setLoading(false);
        } else {
          // Unexpected: backend should complete synchronously
          console.warn('Job not completed immediately. Status:', response.status);
          setError(`Unexpected status: ${response.status}. Please try again.`);
          setLoading(false);
        }
      } else {
        console.error('No job_id in response:', response);
        setError('Failed to start analysis - no job ID returned');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start analysis. Please try again.');
      console.error('Analysis error:', err);
      setLoading(false);
    }
  };

  // Handle follow-up query submission
  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    if (!currentJobId) {
      setError('No active analysis. Please start a new analysis first.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Add user query to conversation
      const userMessage: Message = {
        role: 'user',
        content: query,
        timestamp: new Date(),
        jobId: currentJobId,
      };
      
      setConversation(prev => [...prev, userMessage]);

      // Call query API with job_id, query, and user_email
      const queryResponse = await api.sentiment.query({
        job_id: currentJobId,
        query: query,
        user_email: 'guest@vantage.ai',
      });

      if (queryResponse) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: queryResponse.answer || 'Query completed.',
          timestamp: new Date(),
          jobId: currentJobId,
          reportUrl: analysisResults?.report_url
        };

        setConversation(prev => [...prev, assistantMessage]);
      }

      // Clear query input
      setQuery('');
    } catch (err: any) {
      setError(err.message || 'Failed to process query. Please try again.');
      console.error('Query error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle message copy
  const handleCopy = async (message: Message) => {
    const copyText = message.role === 'assistant' && analysisResults 
      ? `${message.content}\n\nAnalysis Summary:\n${analysisResults.summary.summary_text}${message.reportUrl ? `\n\n📥 Download Report: ${message.reportUrl}` : ''}`
      : message.content;

    try {
      await navigator.clipboard.writeText(copyText);
      setToast({ message: 'Content copied to clipboard!', type: 'success' });
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      setToast({ message: 'Unable to copy content', type: 'error' });
    }
  };

  // Handle message sharing
  const handleShare = async (message: Message) => {
    // If it's an assistant message and has analysis results
    const shareText = message.role === 'assistant' && analysisResults 
      ? `${message.content}\n\nAnalysis Summary:\n${analysisResults.summary.summary_text}${message.reportUrl ? `\n\nDetailed Report: ${message.reportUrl}` : ''}`
      : message.content;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Sentiment Analysis Results',
          text: shareText
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setToast({ message: 'Content copied to clipboard!', type: 'success' });
      }
    } catch (err) {
      console.error('Error sharing:', err);
      try {
        await navigator.clipboard.writeText(shareText);
        setToast({ message: 'Content copied to clipboard!', type: 'success' });
      } catch (clipboardErr) {
        console.error('Error copying to clipboard:', clipboardErr);
        setToast({ message: 'Unable to share content', type: 'error' });
      }
    }
  };

  // Handle download as text file
  const handleDownload = (message: Message) => {
    const downloadText = message.role === 'assistant' && analysisResults 
      ? `SENTIMENT ANALYSIS RESULTS\n${'='.repeat(50)}\n\n${message.content}\n\nAnalysis Summary:\n${analysisResults.summary.summary_text}\n\n${message.reportUrl ? `Download Full Report: ${message.reportUrl}\n` : ''}Generated: ${new Date(message.timestamp).toLocaleString()}\nJob ID: ${message.jobId || 'N/A'}`
      : `${message.content}\n\nTimestamp: ${new Date(message.timestamp).toLocaleString()}`;

    const blob = new Blob([downloadText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sentiment_Analysis_${message.jobId?.slice(0, 8) || 'result'}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Handle switching back to upload mode (new analysis)
  const handleNewAnalysis = () => {
    // Confirm if there's an active conversation
    if (conversation.length > 0) {
      setShowConfirmModal(true);
      return;
    }

    // Reset everything if no conversation
    resetAnalysis();
  };

  const resetAnalysis = () => {
    setMode('upload');
    setConversation([]);
    setCurrentJobId('');
    setAnalysisResults(null);
    setIsAnalysisComplete(false);
    setQuery('');
    setError('');
    setFile(null);
    setFeedbackType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmNewAnalysis = () => {
    setShowConfirmModal(false);
    resetAnalysis();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Sentiment Analysis</h1>
        </div>
        <p className="text-muted-foreground">
          Analyze employee feedback with AI-powered sentiment analysis and follow-up queries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload/Query Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* New Analysis Button (Always Visible) */}
          <button
            onClick={handleNewAnalysis}
            disabled={loading}
            className={`w-full bg-pink-500 hover:bg-pink-700/90 disabled:bg-primary/70 disabled:cursor-not-allowed text-primary-foreground rounded-lg p-4 flex items-center justify-center space-x-2 transition-colors ${
              mode === 'upload' ? 'ring-2 ring-ring' : ''
            }`}
          >
            <Plus className="w-5 h-5 text-white" />
            <span className="font-semibold text-white">New Analysis</span>
          </button>

          {/* Upload Section (Visible when mode === 'upload') */}
          {mode === 'upload' && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Upload Feedback File</h2>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Excel File (.xlsx, .xls)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-ring transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {file ? file.name : 'Click to browse file'}
                    </p>
                    {file && (
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatFileSize(file.size)}
                      </p>
                    )}
                  </div>
                </label>
              </div>

              {/* File Preview and Remove */}
              {file && (
                <div className="flex items-center space-x-2 bg-muted rounded-lg p-3">
                  <Upload className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground flex-1 truncate">{file.name}</span>
                  <button
                    onClick={removeFile}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Feedback Type Dropdown */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Feedback Type
                </label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={loading}
                >
                  <option value="">Select feedback type...</option>
                  {feedbackTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleAnalysisSubmit}
                disabled={!file || !feedbackType || loading}
                fullWidth
                loading={loading}
              >
                {loading ? 'Starting Analysis...' : 'Start Analysis'}
              </Button>

              {error && mode === 'upload' && (
                <ErrorMessage message={error} onDismiss={() => setError('')} />
              )}
            </div>
          )}

          {/* Query Section Info (Visible when analysis is running or complete) */}
          {currentJobId && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {isAnalysisComplete ? 'Analysis Complete' : 'Analysis In Progress'}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job ID:</span>
                  <span className="text-primary font-mono">{currentJobId.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  {isAnalysisComplete ? (
                    <span className="text-green-500 font-semibold">✓ Complete</span>
                  ) : (
                    <span className="text-yellow-500 font-semibold">⏳ Processing</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {isAnalysisComplete 
                  ? 'You can now ask follow-up questions about this analysis.'
                  : 'Analysis is running. You can ask questions once it completes.'}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Conversation Area */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg h-[600px] flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Empty State */}
              {conversation.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Welcome to Sentiment Analysis
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Upload an Excel file with employee feedback, select the feedback type, and start analyzing. 
                    You can then ask follow-up questions about the results.
                  </p>
                </div>
              )}

              {/* Conversation Messages */}
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === 'assistant' && msg.reportUrl && (
                      <div className="mt-2">
                        <a href={msg.reportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                          View Detailed Report
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopy(msg)}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                          title="Copy to clipboard"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy</span>
                        </button>

                        {/* Share Button */}
                        <button
                          onClick={() => handleShare(msg)}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                          title="Share"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                          </svg>
                          <span>Share</span>
                        </button>

                        {/* Download Button */}
                        <button
                          onClick={() => handleDownload(msg)}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                          title="Download as text file"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>Download</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        {msg.jobId && (
                          <span className="font-mono">Job: {msg.jobId.slice(0, 8)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4 flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="text-foreground">Processing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Query Input Area (Only enabled when analysis is complete) */}
            <div className="border-t border-border p-4">
              {error && isAnalysisComplete && (
                <div className="mb-3">
                  <ErrorMessage message={error} onDismiss={() => setError('')} />
                </div>
              )}

              <div className="flex items-end space-x-2">
                {/* Job ID Display */}
                {currentJobId && isAnalysisComplete && (
                  <div className="flex items-center bg-muted rounded-lg px-3 py-2 text-xs">
                    <span className="text-muted-foreground mr-2">Job ID:</span>
                    <span className="text-primary font-mono">{currentJobId.slice(0, 12)}</span>
                  </div>
                )}

                {/* Query Input */}
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !loading && isAnalysisComplete) {
                      handleQuerySubmit();
                    }
                  }}
                  placeholder={
                    isAnalysisComplete && currentJobId
                      ? 'Ask a follow-up question...'
                      : loading 
                        ? 'Analysis in progress...'
                        : 'Complete an analysis to ask questions'
                  }
                  className="flex-1 bg-background border border-input rounded-lg px-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !isAnalysisComplete || !currentJobId}
                />

                {/* Send Button */}
                <Button
                  onClick={handleQuerySubmit}
                  disabled={loading || !query.trim() || !isAnalysisComplete || !currentJobId}
                  className="!p-2.5"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              {/* Helper Text */}
              <div className="mt-2 text-xs text-muted-foreground">
                {!isAnalysisComplete ? (
                  <p>Complete an analysis first to enable follow-up queries</p>
                ) : (
                  <p>Ask questions about sentiment patterns, key themes, or specific feedback</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Start New Analysis?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              <p className="text-gray-700 dark:text-gray-300">
                Starting a new analysis will clear the current conversation and all results. Make sure you've downloaded any reports you need.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmNewAnalysis}
                className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}