import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sendMessageToAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';
import { TRANSLATIONS } from '../constants';

interface AIChatProps {
    contextData?: string; 
}

const AIChat: React.FC<AIChatProps> = ({ contextData }) => {
  const { language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', content: language === 'ar' ? 'مرحباً! أنا مساعد نيكسوس الذكي. كيف يمكنني مساعدتك اليوم بخصوص التكنولوجيا أو السوق؟' : 'Hello! I am Nexus AI. How can I assist you with tech trends, startups, or market data today?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.slice(-10);
    const responseText = await sendMessageToAssistant(history, userMsg.content, contextData);

    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', content: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-nexus-600 hover:bg-nexus-500 text-white rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-6 h-6" />
          <span className="font-semibold hidden md:inline">{t.common.chatTitle}</span>
        </button>
      )}

      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden ${language === 'ar' ? 'rtl' : 'ltr'}`}>
          {/* Header */}
          <div className="bg-nexus-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <h3 className="font-bold">{t.common.chatTitle}</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-nexus-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-nexus-600 dark:text-nexus-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.common.searchPlaceholder}
                className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-nexus-500 text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-nexus-600 text-white rounded-lg hover:bg-nexus-500 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;