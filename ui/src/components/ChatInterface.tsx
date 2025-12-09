import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Code, Database, Brain } from 'lucide-react';
import { conversationApi, appApi, Message } from '../api';
import ReactMarkdown from 'react-markdown';

export default function ChatInterface() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentSpec, setCurrentSpec] = useState<any>(null);
  const [currentMLUseCase, setCurrentMLUseCase] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start session on mount
    const initSession = async () => {
      try {
        const result = await conversationApi.startSession('web-user');
        setSessionId(result.sessionId);
        
        // Add welcome message
        setMessages([
          {
            role: 'assistant',
            content: `# Welcome to Synthora! 🚀

I'm your AI app builder. I can help you create complete full-stack applications with integrated machine learning capabilities.

**Here's what I can do:**
- 🎨 Design and build web applications from your description
- 🗄️ Create database models and APIs automatically
- 🤖 Add ML features like predictions, recommendations, and analytics
- 📊 Set up dashboards and insights
- 🚀 Generate production-ready code

**Try saying something like:**
- "Create a CRM with client tracking and deal pipeline"
- "Build an e-commerce store with product recommendations"
- "Make a task manager with priority prediction"

What would you like to build today?`,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error('Failed to start session:', error);
        setMessages([
          {
            role: 'system',
            content: '⚠️ Failed to connect to Synthora API. Please make sure the server is running.',
            timestamp: new Date(),
          },
        ]);
      }
    };

    initSession();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !sessionId || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await conversationApi.sendMessage(sessionId, input);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        artifacts: result.artifacts,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update current spec and ML use case if present
      if (result.artifacts) {
        for (const artifact of result.artifacts) {
          if (artifact.type === 'spec') {
            setCurrentSpec(artifact.content);
          } else if (artifact.type === 'model') {
            setCurrentMLUseCase(artifact.content);
          }
        }
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          content: `❌ Error: ${error.response?.data?.error || error.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!sessionId || generating) return;

    setGenerating(true);
    
    const systemMessage: Message = {
      role: 'system',
      content: '🏗️ Generating your application... This may take a moment.',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, systemMessage]);

    try {
      const result = await appApi.generateApp(sessionId);
      
      const successMessage: Message = {
        role: 'assistant',
        content: `# ✅ App Generated Successfully!

Your app has been created at: \`${result.appPath}\`

## What's included:
- ✅ **Backend**: FastAPI with auto-generated models and routes
- ✅ **Frontend**: React with TypeScript and TailwindCSS
- ✅ **Database**: PostgreSQL schema
- ✅ **Event Tracking**: Automatic instrumentation
- ✅ **Docker**: Ready-to-deploy configuration

## To run your app:

\`\`\`bash
cd ${result.appPath}
docker-compose up
\`\`\`

Then visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

${currentMLUseCase ? '🤖 **ML models are configured and ready to train!**' : ''}

Would you like to add ML capabilities or make any changes?`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, successMessage]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          content: `❌ Failed to generate app: ${error.response?.data?.error || error.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`chat-message flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : message.role === 'system'
                  ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {message.role === 'assistant' && (
                    <Sparkles className="w-5 h-5 text-primary-600" />
                  )}
                  {message.role === 'system' && (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  )}
                </div>
                <div className="flex-1 prose prose-sm max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>

              {/* Show artifacts */}
              {message.artifacts && message.artifacts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  {message.artifacts.map((artifact, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      {artifact.type === 'spec' && (
                        <>
                          <Code className="w-4 h-4" />
                          <span>App specification generated</span>
                        </>
                      )}
                      {artifact.type === 'model' && (
                        <>
                          <Brain className="w-4 h-4" />
                          <span>ML use case configured</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="loading-dots">
                  Thinking<span>.</span><span>.</span><span>.</span>
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Action Bar */}
      {(currentSpec || currentMLUseCase) && (
        <div className="border-t bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              {currentSpec && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Database className="w-4 h-4" />
                  <span>App spec ready</span>
                </div>
              )}
              {currentMLUseCase && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Brain className="w-4 h-4" />
                  <span>ML configured</span>
                </div>
              )}
            </div>
            <button
              onClick={handleGenerate}
              disabled={!currentSpec || generating}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Code className="w-4 h-4" />
                  <span>Generate App</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto flex gap-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the app you want to build..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={2}
            disabled={loading || !sessionId}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || !sessionId}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
