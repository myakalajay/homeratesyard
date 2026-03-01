'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, MoreHorizontal, 
  FileText, Download, Mic, Paperclip, Calendar, ShieldCheck,
  Loader2, Maximize2, Minimize2
} from 'lucide-react';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/primitives/Button';
import { IconButton } from '@/components/ui/primitives/IconButton';
import { Avatar } from '@/components/ui/primitives/Avatar';

// Assets
const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
const SARAH_IMAGE = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200&h=200";

const DEFAULT_MSG = [{ 
  id: 1, 
  text: "Hello! I'm Sarah, your Senior Loan Officer. I can generate rate reports, schedule calls, or calculate your payments.", 
  sender: 'bot', 
  timestamp: null, 
  recommendations: ["Download Rate PDF", "Book a Call", "Check Rates"] 
}];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const [toast, setToast] = useState(null); 
  
  const [messages, setMessages] = useState(DEFAULT_MSG);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sessionId, setSessionId] = useState("guest-session");
  const [isMounted, setIsMounted] = useState(false);
  const [nudgeSent, setNudgeSent] = useState(false);
  
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const textareaRef = useRef(null);

  // --- HELPERS ---
  const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const playSound = () => {
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {}); 
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    setIsMounted(true);
    audioRef.current = new Audio(NOTIFICATION_SOUND);
    audioRef.current.volume = 0.5;

    const savedSession = localStorage.getItem('chat_session_id');
    if (savedSession) {
      setSessionId(savedSession);
    } else {
      const newId = "session-" + Math.random().toString(36).substr(2, 9);
      setSessionId(newId);
      localStorage.setItem('chat_session_id', newId);
    }

    const savedMsgs = localStorage.getItem('chat_history');
    if (savedMsgs) {
      try { setMessages(JSON.parse(savedMsgs)); } catch (e) {}
    } else {
      setMessages(prev => [{ ...prev[0], timestamp: getTime() }]);
    }
  }, []);

  // Handle Scroll & Unread Logic
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('chat_history', JSON.stringify(messages));
    
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.sender === 'bot') {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        } else {
            if (lastMsg.id !== 1) {
                setUnreadCount(prev => prev + 1);
                playSound();
            }
        }
    } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isMounted]);

  // Reset unread on open
  useEffect(() => {
      if (isOpen && !isMinimized) setUnreadCount(0);
  }, [isOpen, isMinimized]);

  // "Passive Nudge" Logic
  useEffect(() => {
    if (!isMounted) return;
    if (!isOpen && !nudgeSent && messages.length === 1 && messages[0].sender === 'bot') {
      const timer = setTimeout(() => {
        setNudgeSent(true);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "I noticed you're checking our loan products. Would you like me to generate a PDF rate sheet for you?",
          sender: 'bot',
          timestamp: getTime(),
          recommendations: ["Yes, generate PDF", "No, thanks"]
        }]);
      }, 15000); 
      return () => clearTimeout(timer);
    }
  }, [isOpen, nudgeSent, messages, isMounted]);

  // --- HANDLERS ---
  const processMessage = async (text) => {
    if (!text.trim()) return;
    
    const userMsg = { id: Date.now(), text: text, sender: 'user', timestamp: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    if(textareaRef.current) textareaRef.current.style.height = 'auto'; 
    setIsTyping(true);

    try {
      await new Promise(r => setTimeout(r, 1000)); 

      let data;
      try {
          const response = await fetch('http://localhost:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, session_id: sessionId }),
          });
          if (!response.ok) throw new Error('API Error');
          data = await response.json();
      } catch (err) {
          data = {
              response: "I'm currently operating in offline mode. For accurate rates, please visit our Rates page.",
              recommendations: ["Check Live Rates", "Contact Support"]
          };
      }
      
      const botMsg = { 
        id: Date.now() + 1, 
        text: data.response, 
        sender: 'bot', 
        timestamp: getTime(),
        recommendations: data.recommendations || [],
        intent: data.intent,
        file_download: data.file_download 
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          processMessage(input);
      }
  };

  const handleInput = (e) => {
      setInput(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleClearHistory = () => {
    localStorage.removeItem('chat_history');
    localStorage.removeItem('chat_session_id');
    const newId = "session-" + Math.random().toString(36).substr(2, 9);
    setSessionId(newId);
    setUnreadCount(0);
    localStorage.setItem('chat_session_id', newId);
    setMessages([{ 
      id: Date.now(), 
      text: "History cleared. Hi again! How can I help you now?", 
      sender: 'bot', 
      timestamp: getTime(), 
      recommendations: ["Download Rate PDF", "Book a Call"]
    }]);
  };

  if (!isMounted) return null;

  return (
    // 🟢 FIX 1: z-[999] guarantees it floats above the z-[100] Navbar
    <div className="fixed bottom-0 right-0 z-[999] flex flex-col items-end font-sans pointer-events-none sm:bottom-6 sm:right-6 isolate">
      
      {/* 🟢 THE CHAT WINDOW */}
      <div 
        className={cn(
          "pointer-events-auto origin-bottom-right transition-all duration-500 ease-in-out bg-white shadow-2xl flex flex-col",
          // Mobile vs Desktop styling
          "fixed inset-0 w-full h-full rounded-none border-0 z-[1000]", 
          // 🟢 FIX 2: max-h-[calc(100vh-100px)] forces it to stop before hitting the navbar
          "sm:relative sm:z-auto sm:w-[380px] sm:max-w-[calc(100vw-2rem)] sm:h-[600px] sm:max-h-[calc(100vh-100px)] sm:rounded-3xl sm:border sm:border-slate-200", 
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none",
          isMinimized ? "translate-y-[calc(100%-64px)] sm:translate-y-[calc(100%-72px)]" : "translate-y-0"
        )}
      >
        
        {/* --- Header (Premium Dark Theme) --- */}
        <div 
          className="z-10 flex items-center justify-between p-4 text-white cursor-pointer bg-slate-900 shrink-0 sm:rounded-t-3xl"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar src={SARAH_IMAGE} alt="Sarah" className="w-10 h-10 border-2 border-slate-700" />
              <span className="absolute bottom-0 right-0 w-3 h-3 border-2 rounded-full bg-emerald-500 border-slate-900"></span>
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight tracking-wide">Sarah Jenkins</h3>
              <p className="flex items-center gap-1 mt-0.5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Senior Loan Officer
              </p>
            </div>
          </div>
          <div className="flex gap-1">
             <button onClick={(e) => { e.stopPropagation(); handleClearHistory(); }} className="p-2 transition-colors rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
               <MoreHorizontal size={16} />
             </button>
             <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="hidden p-2 transition-colors rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 sm:block">
               {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
             </button>
             <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-2 transition-colors rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800">
               <X size={18} />
             </button>
          </div>
        </div>

        {/* --- Messages Area --- */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto bg-slate-50 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex flex-col animate-in fade-in slide-in-from-bottom-2", msg.sender === 'user' ? 'items-end' : 'items-start')}>
              <div className={cn("flex items-end gap-2", msg.sender === 'user' ? "max-w-[85%]" : "max-w-[95%]")}>
                {msg.sender === 'bot' && (
                  <Avatar src={SARAH_IMAGE} size="sm" className="hidden w-6 h-6 mb-1 sm:flex shrink-0" />
                )}
                <div className="flex flex-col min-w-0 gap-2">
                  
                  {/* Text Bubble */}
                  <div className={cn(
                    "px-4 py-3 text-[13px] font-medium leading-relaxed relative whitespace-pre-wrap shadow-sm",
                    msg.sender === 'user' 
                      ? "bg-slate-900 text-white rounded-2xl rounded-br-none" 
                      : "bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-bl-none"
                  )}>
                    {msg.text}
                  </div>

                  {/* Intent: PDF Card */}
                  {msg.intent === 'download_pdf' && msg.file_download && (
                    <div className="flex items-center gap-3 p-3 transition-all bg-white border shadow-sm border-slate-200 rounded-xl hover:shadow-md">
                      <div className="flex items-center justify-center w-10 h-10 text-red-600 rounded-lg bg-red-50 shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-slate-900">Rate_Summary.pdf</p>
                        <p className="text-xs font-medium text-slate-500">Secure Document • 24 KB</p>
                      </div>
                      <a href={`http://localhost:8000/download/${msg.file_download}`} target="_blank" rel="noreferrer" className="p-2 transition-colors rounded-full bg-slate-50 text-slate-600 hover:bg-red-600 hover:text-white">
                        <Download size={18} />
                      </a>
                    </div>
                  )}

                  {/* Intent: Scheduler */}
                  {msg.intent === 'scheduler' && (
                    <div className="w-64 p-4 bg-white border shadow-sm border-slate-200 rounded-xl">
                      <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                        <Calendar size={16} className="text-slate-900" />
                        <span className="text-xs font-bold text-slate-900">Select Date</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {['Mon', 'Tue', 'Wed'].map(d => (
                          <div key={d} className="p-2 text-xs font-bold text-center transition-colors border rounded-lg cursor-pointer text-slate-600 bg-slate-50 border-slate-200 hover:border-slate-900 hover:text-slate-900">
                            {d}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className={cn("flex items-center gap-1 mt-0.5", msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                    <span suppressHydrationWarning className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      {msg.timestamp || 'Just now'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Chips */}
              {msg.sender === 'bot' && msg.recommendations?.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-8 mt-2 delay-100 animate-in fade-in">
                  {msg.recommendations.map((rec, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => processMessage(rec)} 
                      className="px-3 py-1.5 bg-white text-slate-700 text-[11px] font-bold rounded-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
                    >
                      {rec}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
             <div className="flex items-end gap-2 pr-8 animate-in fade-in">
               <Avatar src={SARAH_IMAGE} size="sm" className="hidden w-6 h-6 mb-1 sm:flex shrink-0" />
               <div className="px-4 py-3 bg-white border rounded-bl-none shadow-sm rounded-2xl border-slate-200">
                 <div className="flex gap-1.5 items-center h-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce"></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce delay-75"></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce delay-150"></div>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* --- Toast Feedback --- */}
        {toast && (
          <div className="absolute z-50 flex items-center justify-center w-full px-4 pointer-events-none top-20">
             <div className="px-4 py-2 text-xs font-bold text-white shadow-xl bg-slate-900 rounded-xl animate-in slide-in-from-top-4">
               {toast}
             </div>
          </div>
        )}

        {/* --- Input Area --- */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
          <div className="flex items-end gap-2 p-1 transition-all border shadow-sm rounded-2xl border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:bg-white focus-within:border-slate-300">
            <button onClick={() => showToast("Uploads enabled in secure portal")} className="p-2 transition-colors rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
              <Paperclip size={18} />
            </button>
            
            <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask Sarah a question..."
                rows={1}
                className="flex-1 py-2.5 px-1 text-sm font-medium bg-transparent border-none outline-none resize-none text-slate-900 placeholder:text-slate-400 max-h-32 scrollbar-hide"
            />
            
            {input.trim() ? (
              <button 
                onClick={() => processMessage(input)} 
                className="p-2 mb-1 mr-1 text-white transition-all shadow-md rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 shrink-0"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            ) : (
              <button onClick={() => showToast("Microphone access required")} className="p-2 mb-1 mr-1 transition-colors rounded-xl text-slate-400 hover:bg-slate-100">
                <Mic size={18} />
              </button>
            )}
          </div>
          <div className="flex justify-center mt-3 mb-1">
            <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1">
               <ShieldCheck size={10} /> 256-bit encrypted connection
            </span>
          </div>
        </div>
      </div>

      {/* 🟢 FLOATING TOGGLE BUTTON */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (isMinimized) setIsMinimized(false);
        }} 
        className={cn(
          "pointer-events-auto absolute bottom-0 right-0 sm:fixed sm:bottom-6 sm:right-6 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 z-[990] m-4 sm:m-0",
          isOpen && !isMinimized ? "scale-0 opacity-0" : "scale-100 opacity-100 bg-slate-900 hover:scale-105 active:scale-95"
        )}
        aria-label="Open Chat"
      >
        <MessageSquare size={24} className="text-white" />
        
        {/* Unread Badge Ping */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex w-4 h-4">
            <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
            <span className="relative flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-500 border-2 border-slate-900 rounded-full">
               {unreadCount}
            </span>
          </span>
        )}
      </button>

    </div>
  );
}