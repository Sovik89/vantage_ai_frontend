'use client';

import { useState } from 'react';
import { CheckCircle, Upload } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { getScoreColor } from '@/lib/utils';
import api from '@/lib/api';

export default function ATSPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setResult(null);
  };

  const handleCheck = async () => {
    if (!file) {
      setError('Please select a resume file first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await api.ats.checkFile(file, jobDescription || undefined);
      
      if (response.data) {
        setResult(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check resume. Please try again.');
      console.error('ATS check error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">ATS Resume Checker</h1>
        </div>
        <p className="text-gray-400">
          Optimize resumes for ATS systems with keyword analysis and formatting tips
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Upload Resume</h2>
          <FileUpload
            onFileSelect={handleFileSelect}
            accept=".pdf,.doc,.docx"
            disabled={loading}
          />
        </div>

        {/* Optional Job Description */}
        <div>
          <label className="block text-white font-medium mb-2">
            Job Description (Optional)
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description to get tailored keyword recommendations..."
            className="w-full h-32 bg-dark-900 border border-dark-600 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
            disabled={loading}
          />
        </div>

        {file && !loading && !result && (
          <Button
            onClick={handleCheck}
            fullWidth
            size="lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Check ATS Compatibility
          </Button>
        )}

        {error && (
          <ErrorMessage message={error} onDismiss={() => setError('')} />
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-12">
          <LoadingSpinner size="lg" text="Checking ATS compatibility..." />
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">ATS Analysis Results</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setResult(null);
                setFile(null);
                setJobDescription('');
              }}
            >
              Check Another
            </Button>
          </div>

          {/* Overall Score */}
          {result.ats_score && (
            <div className="text-center py-6 bg-dark-900 rounded-lg">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.ats_score.overall_score)}`}>
                {result.ats_score.overall_score}
              </div>
              <p className="text-gray-400">Overall ATS Score</p>
            </div>
          )}

          {/* Score Breakdown */}
          {result.ats_score && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-dark-900 rounded-lg p-4 text-center">
                <p className={`text-2xl font-bold mb-1 ${getScoreColor(result.ats_score.formatting_score)}`}>
                  {result.ats_score.formatting_score}
                </p>
                <p className="text-gray-400 text-sm">Formatting</p>
              </div>
              <div className="bg-dark-900 rounded-lg p-4 text-center">
                <p className={`text-2xl font-bold mb-1 ${getScoreColor(result.ats_score.keyword_score)}`}>
                  {result.ats_score.keyword_score}
                </p>
                <p className="text-gray-400 text-sm">Keywords</p>
              </div>
              <div className="bg-dark-900 rounded-lg p-4 text-center">
                <p className={`text-2xl font-bold mb-1 ${getScoreColor(result.ats_score.content_score)}`}>
                  {result.ats_score.content_score}
                </p>
                <p className="text-gray-400 text-sm">Content</p>
              </div>
            </div>
          )}

          {/* Detected Sections */}
          {result.detected_sections && result.detected_sections.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Detected Sections</h3>
              <div className="flex flex-wrap gap-2">
                {result.detected_sections.map((section: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm"
                  >
                    ✓ {section}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Sections */}
          {result.missing_sections && result.missing_sections.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Missing Sections</h3>
              <div className="flex flex-wrap gap-2">
                {result.missing_sections.map((section: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm"
                  >
                    ✗ {section}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span className="text-gray-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Keyword Analysis */}
          {result.keyword_analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.keyword_analysis.matched_keywords && result.keyword_analysis.matched_keywords.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Matched Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keyword_analysis.matched_keywords.map((keyword: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.keyword_analysis.missing_keywords && result.keyword_analysis.missing_keywords.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Missing Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keyword_analysis.missing_keywords.map((keyword: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
