'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  User,
  Send,
  Loader2,
  Sparkles,
  BarChart3,
  X,
  Maximize2,
  Minimize2,
  Trash2,
} from 'lucide-react';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PremiumAnalyticsChatProps {
  /** Compact inline mode (inside dashboard) vs expanded overlay */
  defaultExpanded?: boolean;
}

const QUICK_PROMPTS = [
  'How are my clinics performing this year?',
  'Show me month-over-month patient growth',
  'Which clinic has the most traffic?',
  'Summarize my Google Ads performance',
  'How is my social media doing?',
  'What should I focus on next?',
];

export default function PremiumAnalyticsChat({ defaultExpanded = false }: PremiumAnalyticsChatProps) {
  const { theme, t } = useSitePreferences();
  const isDark = theme === 'dark';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Greeting
  useEffect(() => {
    if (!hasGreeted) {
      const greeting: Message = {
        id: 'greeting',
        role: 'assistant',
        content:
          "Hey! 👋 I'm your **Premium Analytics AI**. I have access to your real clinic performance data — patient counts, traffic, ad spend, conversions, and more.\n\nAsk me anything about your analytics, and I'll give you a data-driven answer. Try one of the quick prompts below, or ask your own question!",
        timestamp: new Date(),
      };
      setMessages([greeting]);
      setHasGreeted(true);
    }
  }, [hasGreeted]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages.filter((m) => m.id !== 'greeting'), userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/analytics-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await res.json();

      if (res.status === 403) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: data.error || 'This feature requires a Premium (Scale Elite) plan.',
            timestamp: new Date(),
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply || data.error || t('Sorry, something went wrong.'),
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: t("Sorry, I couldn't connect to the analytics service. Please try again."),
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const clearChat = () => {
    setHasGreeted(false);
    setMessages([]);
  };

  /** Render markdown-like bold (**text**) and bullet lists */
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Bold
      let processed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (processed.trim().startsWith('- ') || processed.trim().startsWith('• ')) {
        processed = `<span class="ml-2">•</span> ${processed.trim().substring(2)}`;
        return (
          <div key={i} className="flex gap-1 pl-1" dangerouslySetInnerHTML={{ __html: processed }} />
        );
      }
      if (processed.trim() === '') return <div key={i} className="h-2" />;
      return <div key={i} dangerouslySetInnerHTML={{ __html: processed }} />;
    });
  };

  return (
    <motion.div
      layout
      className={`rounded-3xl border overflow-hidden flex flex-col ${
        isDark
          ? 'bg-slate-900 border-slate-700'
          : 'bg-white border-slate-200'
      } ${expanded ? 'h-[700px]' : 'h-[500px]'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Analytics AI</h3>
            <p className="text-[11px] text-violet-200 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Premium · Real-Time Data
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label={t('Clear chat')}
            title={t('Clear chat')}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label={expanded ? t('Collapse') : t('Expand')}
            title={expanded ? t('Collapse') : t('Expand')}
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-violet-500 text-white'
                  : isDark
                    ? 'bg-slate-800 text-violet-400'
                    : 'bg-violet-100 text-violet-600'
              }`}
            >
              {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-violet-500 text-white rounded-br-md'
                  : isDark
                    ? 'bg-slate-800 text-slate-200 rounded-bl-md border border-slate-700'
                    : 'bg-white text-slate-700 rounded-bl-md border border-slate-200 shadow-sm'
              }`}
            >
              {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center ${
                isDark ? 'bg-slate-800 text-violet-400' : 'bg-violet-100 text-violet-600'
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div
              className={`px-4 py-3 rounded-2xl rounded-bl-md ${
                isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Loader2
                  className={`h-3.5 w-3.5 animate-spin ${isDark ? 'text-violet-400' : 'text-violet-500'}`}
                />
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('Analyzing your data...')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick prompts on first load */}
        {messages.length <= 1 && !isLoading && (
          <div className="space-y-2 pt-2">
            <p className={`text-xs font-medium px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {t('Try asking:')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((q, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    sendMessage(t(q));
                    // Scroll only the chat container, not the page
                    setTimeout(() => {
                      const container = messagesContainerRef.current;
                      if (container) {
                        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className={`text-left text-sm px-4 py-2.5 rounded-xl transition-all hover:scale-[1.01] ${
                    isDark
                      ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/50 hover:border-violet-500/30'
                      : 'bg-white text-slate-600 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 shadow-sm'
                  }`}
                >
                  {t(q)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-3 border-t shrink-0 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('Ask about your analytics...')}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
              isDark
                ? 'bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:border-violet-500'
                : 'bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-violet-500 focus:bg-white'
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-xl transition-all ${
              input.trim() && !isLoading
                ? 'bg-violet-500 text-white hover:bg-violet-400 shadow-lg shadow-violet-500/20'
                : isDark
                  ? 'bg-slate-800 text-slate-600'
                  : 'bg-slate-100 text-slate-400'
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className={`text-xs text-center mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          {t('Premium AI · Real-time analytics data')}
        </p>
      </div>
    </motion.div>
  );
}
