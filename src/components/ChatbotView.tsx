import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, AlertCircle, RefreshCw, Bot, User } from 'lucide-react';
import { ChatMessage, Student } from '../types';

interface ChatbotViewProps {
  user: Student;
  token: string;
}

export default function ChatbotView({ user, token }: ChatbotViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello ${user.name}! I am your AI Campus Advisor. 🎓\n\nI am dynamically connected to our live database. Ask me anything about:\n- Your **Attendance Rates** or Class Schedules 📅\n- Upcoming **Examination dates** and Room layouts 📝\n- Active **Placements & Internships** (Google, Microsoft, etc.) 💼\n- Peer **Study Materials** uploaded inside the Hub 📚`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested Prompts
  const suggestions = [
    "What is my current attendance stats?",
    "Tell me about the Google placement drive",
    "Show me Monday's lecture schedule",
    "Are there compiler design notes?"
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setError('');
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: textToSend })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'The AI assistant was unable to formulate a response.');
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (err: any) {
      setError(err.message || 'Network delay. Check that your GEMINI_API_KEY is configured correctly.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `History cleared. How can I assist you with your campus academic plans next? 🚀`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setError('');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col justify-between select-none">
      
      {/* Tab Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/15">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Smart Campus AI Advisor</h2>
            <p className="text-xs text-slate-400 mt-0.5">Powered by Google Gemini 3.5 Flash for authentic workspace query handling</p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Suggested prompts helper section */}
      <div className="mt-4 flex flex-wrap gap-2 shrink-0">
        {suggestions.map((s, index) => (
          <button
            key={index}
            onClick={() => handleSendMessage(s)}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat Messages Log Panel */}
      <div className="flex-1 my-6 overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 pr-3 flex flex-col">
        {messages.map((m) => {
          const isAI = m.sender === 'assistant';
          return (
            <div 
              key={m.id} 
              className={`flex items-start space-x-3.5 max-w-[85%] ${isAI ? 'self-start' : 'self-end flex-row-reverse space-x-reverse'}`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${isAI ? 'bg-blue-600/10 border border-blue-500/25 text-blue-400' : 'bg-slate-850 text-slate-300'}`}>
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="space-y-1">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  isAI 
                    ? 'bg-slate-950 text-slate-100 border border-slate-800/60 rounded-tl-none' 
                    : 'bg-blue-600 text-white rounded-tr-none font-medium'
                }`}>
                  {m.text}
                </div>
                <p className={`text-[10px] text-slate-500 font-mono ${isAI ? 'text-left' : 'text-right'}`}>
                  {m.timestamp}
                </p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start space-x-3.5 max-w-[80%] self-start">
            <div className="p-2 bg-blue-600/10 border border-blue-500/25 rounded-xl shrink-0 text-blue-400">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-slate-950 border border-slate-800/60 p-4 rounded-2xl rounded-tl-none flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-400 flex items-start space-x-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Query Interrupted</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Prompt Box */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="relative shrink-0 flex items-center space-x-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Smart Campus AI anything..."
          disabled={loading}
          className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-2xl pl-4 pr-16 py-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-all focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
        />
        
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-3.5 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer disabled:opacity-40 disabled:hover:bg-blue-600"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
