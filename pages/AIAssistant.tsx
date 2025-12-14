import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { sendMessageToAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';
import { TRANSLATIONS } from '../constants';
import { Bot, Send, Save, Trash2, MessageSquare, Loader2, Sparkles } from 'lucide-react';

const AIAssistant: React.FC = () => {
    const { language, user, saveCurrentChat, savedChats } = useApp();
    const t = TRANSLATIONS[language];
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        if (savedChats.length > 0) {
            return savedChats[0].messages; // Load the most recent one
        }
        return [{ id: '0', role: 'model', content: 'Welcome to the full-screen AI Knowledge Assistant. How can I explain a tech concept or summarize a trend for you today?', timestamp: Date.now() }];
    });
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-save logic (optional: saves deeply on every message or just keeps state in sync)
    useEffect(() => {
        if (messages.length > 1) {
            // We can implement auto-save here if we want continuous persistence without clicking save
            // But user specifically asked for "Chat Saved", implying the manual save provided.
            // However, "when refresh open new chat" implies they want the STATE to persist.
            // Since we added persistence to AppContext, let's ensure we are syncing.
        }
    }, [messages]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        const response = await sendMessageToAssistant(messages, userMsg.content);
        
        const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', content: response, timestamp: Date.now() };
        const updatedMessagesWithBot = [...newMessages, botMsg];
        setMessages(updatedMessagesWithBot);
        saveCurrentChat(updatedMessagesWithBot); // Auto-save after response
        setIsLoading(false);
    };

    const handleSave = () => {
        saveCurrentChat(messages);
        alert(language === 'ar' ? 'تم حفظ المحادثة' : 'Chat saved successfully!');
    };

    return (
        <div className="h-[calc(100vh-100px)] flex gap-6">
            {/* Sidebar (History) */}
            <div className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-colors">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> History
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {savedChats.length === 0 && <div className="text-center text-xs text-slate-400 mt-4">No saved chats yet.</div>}
                    {savedChats.map(chat => (
                        <button key={chat.id} className="w-full text-left p-3 rounded-lg hover:bg-nexus-50 dark:hover:bg-nexus-900/30 text-sm border border-transparent hover:border-nexus-100 dark:hover:border-nexus-800 transition-all group">
                            <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{chat.title}</div>
                            <div className="text-xs text-slate-400">{new Date(chat.date).toLocaleDateString()}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm transition-colors">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-nexus-600 to-nexus-700 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6" />
                        <div>
                            <h2 className="font-bold">{t.sections.aiPageTitle}</h2>
                            <p className="text-xs opacity-80">Powered by Gemini 2.5</p>
                        </div>
                    </div>
                    {user && (
                        <button onClick={handleSave} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-1 text-sm">
                            <Save className="w-4 h-4" /> {t.common.save}
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-nexus-100 dark:bg-nexus-900/50 flex items-center justify-center mr-2"><Bot className="w-5 h-5 text-nexus-600 dark:text-nexus-400"/></div>}
                            <div className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-nexus-600 text-white rounded-br-none' 
                                : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-bl-none'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="w-8 h-8 rounded-full bg-nexus-100 dark:bg-nexus-900/50 flex items-center justify-center mr-2"><Bot className="w-5 h-5 text-nexus-600 dark:text-nexus-400"/></div>
                             <div className="bg-white dark:bg-slate-700 p-4 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-600 shadow-sm flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-nexus-600 dark:text-nexus-400" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">Processing...</span>
                             </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask detailed questions about startups, market trends, or events..."
                            className="flex-1 p-3 bg-slate-100 dark:bg-slate-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-500 transition-shadow"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="px-6 py-2 bg-nexus-600 text-white rounded-xl hover:bg-nexus-700 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
                        >
                            Send <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;