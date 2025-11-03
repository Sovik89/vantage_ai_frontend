'use client';

import { useState, useRef } from 'react';
import { FileText, Upload, Send, Paperclip, Sparkles, X } from 'lucide-react';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import PageLayout from '@/components/PageLayout';
import { formatFileSize, cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import api from '@/lib/api';

export default function JournalPage() {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [conversation, setConversation] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  // Quick response templates
  const quickResponses = [
    'Summarize this document',
    'Extract key insights',
    'Identify action items',
    'Analyze performance trends',
    'Check compliance issues',
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleQuickResponse = (response: string) => {
    setMessage(response);
  };

  const handleSubmit = async () => {
    if (!message.trim() && !file) {
      setError('Please enter a message or upload a file');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Add user message to conversation
      const userMessage = {
        role: 'user',
        content: message || 'Analyze this document',
        file: file?.name,
        timestamp: new Date(),
      };
      
      // Add user message immediately to show in UI
      setConversation(prev => [...prev, userMessage]);

      let aiMessage;
      
      if (file) {
        // Handle file upload case
        console.log('Uploading file:', file.name);
        
        // Create FormData with file and query
        const formData = new FormData();
        formData.append('file', file);
        if (message.trim()) {
          formData.append('query', message);
        }
        
        // First upload the file
        console.log('Calling uploadFiles API...');
        const uploadResponse = await api.journal.uploadFiles([file], message);
        console.log('Upload response:', uploadResponse);
        
        if (!uploadResponse) {
          throw new Error('No response received from upload');
        }
        
        // Create AI response from file upload
        aiMessage = {
          role: 'assistant',
          content: uploadResponse.generated_insight || uploadResponse.message || 'No insights generated.',
          timestamp: new Date(),
        };
        
        setResult(uploadResponse);
      } else if (message.trim()) {
        // Handle question without file case
        console.log('Asking question without file:', message);
        
        const askResponse = await api.journal.askQuestion(message);
        console.log('Ask response:', askResponse);
        
        // Create AI response from question
        aiMessage = {
          role: 'assistant',
          content: askResponse.response_text || askResponse.message || 'No response generated.',
          timestamp: new Date(),
        };
        
        setResult(askResponse);
      } else {
        // Neither file nor message case
        aiMessage = {
          role: 'assistant',
          content: 'Please upload a document or ask a question.',
          timestamp: new Date(),
        };
      }
      
      // Add AI response to conversation
      console.log('Adding AI response to conversation:', aiMessage);
      setConversation(prev => [...prev, aiMessage]);

      // Reset input
      setMessage('');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to process. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <PageLayout
      heading="orvahr.ai Journal Analysis"
      subheading="Chat with AI about your documents"
    >
      <div className="h-[calc(100vh-16rem)] flex flex-col animate-fadeIn">
        {/* Chat Area */}
        <div className={cn(
          "flex-1 border rounded-lg overflow-hidden flex flex-col",
          theme === 'dark' 
            ? 'bg-[#0d1526] border-[#1a2235]' 
            : 'bg-white border-gray-200'
        )}>
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Welcome Message */}
            {conversation.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                  theme === 'dark' 
                    ? 'bg-primary-500/20' 
                    : 'bg-primary-500/10'
                )}>
                  <Sparkles className="w-8 h-8 text-primary-500" />
                </div>
                <h2 className={cn(
                  "text-2xl font-bold mb-2",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  Hey Sovik, what's on your mind today?
                </h2>
                <p className={cn(
                  "mb-6 max-w-md",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Upload a document and ask me anything about it. I can summarize, extract insights, or answer specific questions.
                </p>

              {/* Quick Response Buttons */}
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                {quickResponses.map((response, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickResponse(response)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm transition-colors",
                      theme === 'dark'
                        ? 'bg-[#1a2235] hover:bg-[#2a3449] text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    )}
                  >
                    {response}
                  </button>
                ))}
              </div>
            </div>
          )}

                  {/* Conversation Messages */}
          {conversation.map((msg, index) => (
            <div
              key={index}
              className="flex w-full"
            >
              <div
                className={cn(
                  'max-w-3xl rounded-lg p-4',
                  msg.role === 'user'
                    ? 'ml-auto bg-primary-500 text-white'
                    : theme === 'dark'
                      ? 'mr-auto bg-[#1a2235] text-gray-100'
                      : 'mr-auto bg-gray-100 text-gray-900'
                )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.file && (
                  <div className="mt-2 text-sm opacity-80">
                    <Paperclip className="w-4 h-4 inline mr-1" />
                    {msg.file}
                  </div>
                )}
                {msg.role === 'assistant' && (
                  <div className={cn(
                    "flex items-center space-x-2 mt-3 pt-2 border-t",
                    theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
                  )}>
                    <button 
                      onClick={() => {
                        const url = window.URL.createObjectURL(new Blob([msg.content], { type: 'text/plain' }));
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `response-${new Date(msg.timestamp).toISOString().slice(0,10)}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      }}
                      className={cn(
                        "text-xs transition-colors flex items-center space-x-1 px-2 py-1 rounded",
                        theme === 'dark'
                          ? 'text-gray-400 hover:text-primary-400 hover:bg-primary-500/10'
                          : 'text-gray-600 hover:text-primary-600 hover:bg-primary-500/5'
                      )}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content, null, 2));
                      }}
                      className="text-xs text-gray-400 hover:text-primary-400 transition-colors flex items-center space-x-1 hover:bg-primary-500/10 px-2 py-1 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => {
                        const text = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content, null, 2);
                        const shareData = {
                          title: 'PA+HR Journal Analysis',
                          text: text
                          // Removed URL to focus on sharing the content
                        };
                        if (navigator.share) {
                          navigator.share(shareData)
                            .catch((error) => {
                              console.log('Error sharing:', error);
                              navigator.clipboard.writeText(text);
                              alert('Content copied to clipboard!');
                            });
                        } else {
                          navigator.clipboard.writeText(text);
                          alert('Content copied to clipboard!');
                        }
                      }}
                      className="text-xs text-gray-400 hover:text-primary-400 transition-colors flex items-center space-x-1 hover:bg-primary-500/10 px-2 py-1 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"/>
                        <circle cx="6" cy="12" r="3"/>
                        <circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                      <span>Share</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-2">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}

        {/* Input Area */}
        <div className={cn(
          "border-t p-4",
          theme === 'dark' ? 'border-[#1a2235]' : 'border-gray-200'
        )}>
          {/* File Attachment Preview */}
          {file && (
            <div className={cn(
              "mb-3 flex items-center space-x-2 rounded-lg p-2",
              theme === 'dark' 
                ? 'bg-[#1a2235] text-gray-300' 
                : 'bg-gray-100 text-gray-900'
            )}>
              <Paperclip className={cn(
                "w-4 h-4",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )} />
              <span className="text-sm flex-1">{file.name}</span>
              <span className={cn(
                "text-xs",
                theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
              )}>{formatFileSize(file.size)}</span>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Message Input */}
          <div className="flex items-end space-x-2">
            {/* Quick Response Dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleQuickResponse(e.target.value);
                  e.target.value = '';
                }
              }}
              className={cn(
                "rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 border",
                theme === 'dark'
                  ? 'bg-[#1a2235] border-[#2a3449] text-white'
                  : 'bg-gray-100 border-gray-200 text-gray-900'
              )}
              disabled={loading}
            >
              <option value="">Quick response</option>
              {quickResponses.map((response) => (
                <option 
                  key={response} 
                  value={response}
                  className={cn(
                    theme === 'dark'
                      ? 'bg-[#1a2235] text-white'
                      : 'bg-white text-gray-900'
                  )}
                >
                  {response}
                </option>
              ))}
            </select>

            {/* File Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className={cn(
                "rounded-lg p-2 cursor-pointer transition-colors border",
                theme === 'dark'
                  ? 'bg-[#1a2235] hover:bg-[#2a3449] border-[#2a3449]'
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-200'
              )}
            >
              <Upload className={cn(
                "w-5 h-5",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )} />
            </label>

            {/* Text Input */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleSubmit();
                }
              }}
              placeholder="Message Sovik or @ mention a tab"
              className={cn(
                "flex-1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 border",
                theme === 'dark'
                  ? 'bg-[#1a2235] border-[#2a3449] text-white placeholder-gray-500'
                  : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500'
              )}
              disabled={loading}
            />

            {/* Send Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || (!message.trim() && !file)}
              className="!p-2"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          {/* Helper Text */}
          <div className={cn(
            "flex items-center justify-between mt-2 text-xs",
            theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
          )}>
            <div className="flex space-x-4">
              <button className={cn(
                "hover:text-primary-500 transition-colors",
                theme === 'dark' ? 'hover:text-primary-400' : 'hover:text-primary-600'
              )}>
                Create a summary of this page
              </button>
              <button className={cn(
                "hover:text-primary-500 transition-colors",
                theme === 'dark' ? 'hover:text-primary-400' : 'hover:text-primary-600'
              )}>
                Expand on this topic
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageLayout>
  );
}

