'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle, Upload, Send, Plus, X, Loader2, FileText, Info } from 'lucide-react';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import Toast from '@/components/Toast';
import { getATSLoadingMessage } from '@/lib/loadingMessages';
import { formatFileSize } from '@/lib/utils';
import api from '@/lib/api';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  jobId?: string;
  reportUrl?: string;
};

type AnalysisMode = 'upload' | 'query';

type ResultsFilter = 'top' | 'all';

type AnalysisResults = {
  summary: string;
  report_url?: string;
  matches?: any[];
  rankings?: any[];
};

export default function ATSPage() {
  // State Management
  const [mode, setMode] = useState<AnalysisMode>('upload');
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [resultsFilter, setResultsFilter] = useState<ResultsFilter>('all');
  const [topCount, setTopCount] = useState<number>(5);
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string>('');
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const jdInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug: Log state changes
  useEffect(() => {
    console.log('ATS State changed. JobId:', currentJobId, 'IsComplete:', isAnalysisComplete, 'ConvLength:', conversation.length);
  }, [currentJobId, isAnalysisComplete, conversation.length]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Handle Job Description file selection
  const handleJDFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setError('Job Description must be PDF, DOCX, DOC, or TXT file');
        return;
      }
      
      setJobDescriptionFile(selectedFile);
      setError('');
    }
  };

  // Handle Resume files selection (multiple)
  const handleResumeFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length === 0) return;
    
    // Validate file types
    const validExtensions = ['.pdf', '.docx', '.doc'];
    const invalidFiles = selectedFiles.filter(file => {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      return !validExtensions.includes(fileExtension);
    });
    
    if (invalidFiles.length > 0) {
      setError(`Invalid file types. Only PDF, DOCX, and DOC files are supported. Found: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setResumeFiles(selectedFiles);
    setError('');
  };

  // Remove Job Description file
  const removeJDFile = () => {
    setJobDescriptionFile(null);
    if (jdInputRef.current) {
      jdInputRef.current.value = '';
    }
  };

  // Remove specific resume file
  const removeResumeFile = (index: number) => {
    const newFiles = resumeFiles.filter((_, i) => i !== index);
    setResumeFiles(newFiles);
    if (newFiles.length === 0 && resumeInputRef.current) {
      resumeInputRef.current.value = '';
    }
  };

  // Remove all resume files
  const removeAllResumeFiles = () => {
    setResumeFiles([]);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = '';
    }
  };

  // Handle analysis submission
  const handleAnalysisSubmit = async () => {
    if (!jobDescriptionFile) {
      setError('Please upload a Job Description file');
      return;
    }

    if (resumeFiles.length === 0) {
      setError('Please upload at least one resume/CV file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setIsAnalysisComplete(false);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('job_description', jobDescriptionFile);
      
      // Add all resume files
      resumeFiles.forEach((file) => {
        formData.append('resumes', file);
      });
      
      // Add results filter settings
      formData.append('results_filter', resultsFilter);
      if (resultsFilter === 'top') {
        formData.append('top_count', topCount.toString());
      }

      // Call ATS analysis API - waits for completion (no timeout)
      console.log('Submitting ATS job...');
      const response = await api.ats.submitJob(formData);
      console.log('Submit response:', response);

      // API returns res.data directly, so response has job_id at top level
      if (response && response.job_id) {
        const newJobId = response.job_id;
        console.log('Received job ID:', newJobId, 'Status:', response.status);
        setCurrentJobId(newJobId);

        // Add initial user message
        const userMessage: Message = {
          role: 'user',
          content: `Started ATS analysis with ${jobDescriptionFile.name} and ${resumeFiles.length} resume(s)`,
          timestamp: new Date(),
          jobId: newJobId,
        };

        setConversation(prev => [...prev, userMessage]);

        // Backend processes synchronously, so status should be COMPLETED
        if (response.status === 'COMPLETED' || response.status === 'completed') {
          console.log('Job completed! Fetching results...');
          
          // Fetch results immediately
          const resultsResponse = await api.ats.getResults(newJobId);
          console.log('Results response:', resultsResponse);
          
          setAnalysisResults(resultsResponse);

          const resultMessage: Message = {
            role: 'assistant',
            content: resultsResponse.summary || 'Analysis complete! You can now ask questions about the matches.',
            timestamp: new Date(),
            jobId: newJobId,
            reportUrl: resultsResponse.report_url
          };

          setConversation(prev => [...prev, resultMessage]);
          setIsAnalysisComplete(true);
          setMode('query');  // ✅ Switch to query mode to enable follow-up questions
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
      setError(err.message || 'Failed to start ATS analysis. Please try again.');
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
      const queryResponse = await api.ats.query({
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
    setJobDescriptionFile(null);
    setResumeFiles([]);
    if (jdInputRef.current) jdInputRef.current.value = '';
    if (resumeInputRef.current) resumeInputRef.current.value = '';
  };

  const confirmNewAnalysis = () => {
    setShowConfirmModal(false);
    resetAnalysis();
  };

  // Handle message copy
  const handleCopy = async (message: Message) => {
    const copyText = message.role === 'assistant' && analysisResults 
      ? `${message.content}${message.reportUrl ? `\n\n📥 Download Report: ${message.reportUrl}` : ''}`
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
    const shareText = message.role === 'assistant' && analysisResults 
      ? `${message.content}${message.reportUrl ? `\n\n📥 Download Report: ${message.reportUrl}` : ''}`
      : message.content;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'ATS Analysis Results',
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
      ? `ATS ANALYSIS RESULTS\n${'='.repeat(50)}\n\n${message.content}\n\n${message.reportUrl ? `Download Full Report: ${message.reportUrl}\n` : ''}Generated: ${new Date(message.timestamp).toLocaleString()}\nJob ID: ${message.jobId || 'N/A'}`
      : `${message.content}\n\nTimestamp: ${new Date(message.timestamp).toLocaleString()}`;

    const blob = new Blob([downloadText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ATS_Analysis_${message.jobId?.slice(0, 8) || 'result'}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-[#4CAF50] rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-[#F5F5F5]" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">ATS Resume Checker</h1>
        </div>
        <p className="text-muted-foreground">
          Upload job description and resumes for AI-powered ATS analysis with follow-up queries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload/Query Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* New Analysis Button (Always Visible) */}
          <button
            onClick={handleNewAnalysis}
            disabled={loading}
            className={`w-full bg-[#4CAF50] hover:bg-[#45a049] disabled:bg-[#388E3C] disabled:cursor-not-allowed text-white rounded-lg p-4 flex items-center justify-center space-x-2 transition-colors ${
              mode === 'upload' ? 'ring-2 ring-[#81C784]' : ''
            }`}
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">New Analysis</span>
          </button>

          {/* Upload Section (Visible when mode === 'upload') */}
          {mode === 'upload' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-4">Start Analysis</h2>

              {/* Job Description Upload */}
              <div>
                <label className="block text-sm font-semibold text-[#4CAF50] mb-3">
                  Job Description
                </label>
                <input
                  ref={jdInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleJDFileSelect}
                  className="hidden"
                  id="jd-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="jd-upload"
                  className={`flex items-center justify-between w-full bg-white border border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:border-[#4CAF50] transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="text-gray-900 text-sm font-medium">
                    {jobDescriptionFile ? jobDescriptionFile.name : 'Choose File'}
                  </span>
                  <FileText className="w-5 h-5 text-gray-400" />
                </label>
                <p className="text-xs text-gray-500 mt-2">Supported: PDF, DOCX, TXT</p>

                {/* JD File Preview */}
                {jobDescriptionFile && (
                  <div className="mt-3 flex items-center space-x-2 bg-[#4CAF50]/10 rounded-lg p-3 border border-[#4CAF50]/30">
                    <FileText className="w-4 h-4 text-[#4CAF50] flex-shrink-0" />
                    <span className="text-sm text-gray-900 flex-1 truncate">{jobDescriptionFile.name}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(jobDescriptionFile.size)}</span>
                    <button
                      onClick={removeJDFile}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Resumes/CVs Upload */}
              <div>
                <label className="block text-sm font-semibold text-[#4CAF50] mb-3">
                  Resumes/CVs
                </label>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleResumeFilesSelect}
                  className="hidden"
                  id="resume-upload"
                  multiple
                  disabled={loading}
                />
                                <label
                  htmlFor="resume-upload"
                  className={`flex items-center justify-between w-full bg-white border border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:border-[#4CAF50] transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="text-gray-900 text-sm font-medium">
                    {resumeFiles.length > 0 ? `${resumeFiles.length} files` : 'Choose Files'}
                  </span>
                  <Upload className="w-5 h-5 text-gray-400" />
                </label>
                <p className="text-xs text-gray-500 mt-2">Select multiple files</p>

                {/* Resume Files Preview */}
                {resumeFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{resumeFiles.length} file(s) selected</span>
                      <button
                        onClick={removeAllResumeFiles}
                        className="text-xs text-red-500 hover:text-red-600 transition-colors"
                        disabled={loading}
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {resumeFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 bg-muted rounded-lg p-2 border border-border"
                        >
                          <FileText className="w-4 h-4 text-[#4CAF50] flex-shrink-0" />
                          <span className="text-xs text-foreground flex-1 truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                          <button
                            onClick={() => removeResumeFile(index)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            disabled={loading}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Results to show */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <label className="block text-sm font-semibold text-[#4CAF50]">
                    Results to show
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-dark-900 border border-dark-600 rounded-lg text-xs text-gray-300 z-10">
                      Choose to see all results or only top N candidates
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Top N selector */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-300">Top</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={topCount}
                      onChange={(e) => setTopCount(parseInt(e.target.value) || 5)}
                      disabled={resultsFilter === 'all' || loading}
                      className="w-16 bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-900 text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] disabled:opacity-50"
                    />
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resultsFilter === 'all'}
                      onChange={(e) => setResultsFilter(e.target.checked ? 'all' : 'top')}
                      disabled={loading}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#81C784] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#4CAF50]"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">All</span>
                  </label>
                </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalysisSubmit}
                disabled={!jobDescriptionFile || resumeFiles.length === 0 || loading}
                className="w-full bg-[#4CAF50] hover:bg-[#45a049] disabled:bg-[#388E3C] text-white py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing Resumes...</span>
                  </div>
                ) : (
                  'Analyze Resumes'
                )}
              </button>

              {error && mode === 'upload' && (
                <ErrorMessage message={error} onDismiss={() => setError('')} />
              )}
            </div>
          )}

          {/* Query Section Info (Visible when mode === 'query') */}
          {mode === 'query' && currentJobId && (
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Active Analysis</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job ID:</span>
                  <span className="text-[#4CAF50] font-mono">{currentJobId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-[#4CAF50]">Active</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                You can now ask follow-up questions about the ATS analysis results.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Conversation Area */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg h-[600px] flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Empty State */}
              {conversation.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-[#4CAF50]/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-[#4CAF50]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome to ATS Resume Checker
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 max-w-md">
                    Upload a job description and candidate resumes to start analyzing. 
                    You can then ask follow-up questions about the results, candidate rankings, 
                    skill matches, and recommendations.
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
                        ? 'bg-[#4CAF50] text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <p className={`whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {msg.content}
                    </p>
                    {/* Report Download Link */}
                    {msg.role === 'assistant' && msg.reportUrl && (
                      <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                        <a 
                          href={msg.reportUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center text-[#4CAF50] hover:text-[#45a049] font-medium text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Detailed Report (Excel)
                        </a>
                      </div>
                    )}
                    <div className={`flex items-center justify-between mt-2 text-xs ${msg.role === 'user' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                      <div className="flex items-center space-x-3">
                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopy(msg)}
                          className={`flex items-center gap-1 hover:text-[#4CAF50] transition-colors ${msg.role === 'user' ? 'hover:text-white' : ''}`}
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
                          className={`flex items-center gap-1 hover:text-[#4CAF50] transition-colors ${msg.role === 'user' ? 'hover:text-white' : ''}`}
                          title="Share"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          <span>Share</span>
                        </button>

                        {/* Download Button */}
                        <button
                          onClick={() => handleDownload(msg)}
                          className={`flex items-center gap-1 hover:text-[#4CAF50] transition-colors ${msg.role === 'user' ? 'hover:text-white' : ''}`}
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
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 text-[#4CAF50] animate-spin" />
                    <span className="text-gray-900 dark:text-white">Processing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Query Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              {error && mode === 'query' && (
                <div className="mb-3">
                  <ErrorMessage message={error} onDismiss={() => setError('')} />
                </div>
              )}

              <div className="flex items-end space-x-2">
                {/* Job ID Display */}
                {currentJobId && (
                  <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs">
                    <span className="text-gray-600 dark:text-gray-400 mr-2">Job ID:</span>
                    <span className="text-[#4CAF50] font-mono">{currentJobId.slice(0, 12)}</span>
                  </div>
                )}

                {/* Query Input */}
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !loading && mode === 'query') {
                      handleQuerySubmit();
                    }
                  }}
                  placeholder={
                    mode === 'query' && currentJobId
                      ? 'Ask a follow-up question...'
                      : 'Start a new analysis to ask questions'
                  }
                  className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || mode !== 'query' || !currentJobId}
                />

                {/* Send Button */}
                <button
                  onClick={handleQuerySubmit}
                  disabled={loading || !query.trim() || mode !== 'query' || !currentJobId}
                  className="p-2.5 bg-[#4CAF50] hover:bg-[#45a049] disabled:bg-[#388E3C] text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* Helper Text */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {mode === 'upload' ? (
                  <p>Upload a file and start analysis to enable queries</p>
                ) : (
                  <p>Ask questions about candidate rankings, skill matches, and recommendations</p>
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
                className="px-4 py-2.5 text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#45a049] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:ring-offset-2"
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
