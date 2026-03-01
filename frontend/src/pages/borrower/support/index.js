'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import { 
  LifeBuoy, Phone, Mail, MessageSquare, Send, 
  ChevronDown, ChevronUp, ShieldCheck, Clock, 
  CheckCircle2, User, HelpCircle, Paperclip, 
  FileText, FileImage, RefreshCw, X // 🟢 FIX: Swapped Image alias for FileImage to prevent DOM collisions
} from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import RouteGuard from '@/components/auth/RouteGuard';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/utils';

// --- FORMATTERS ---
const formatTime = (date) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const formatRelativeDate = (date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

export default function SupportPage() {
  const { user } = useAuthContext();
  const { addToast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // --- CHAT STATE ---
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [stagedAttachment, setStagedAttachment] = useState(null);
  
  const chatScrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- DB STATE ---
  const [team, setTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [openFaqId, setOpenFaqId] = useState('faq-1');

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate DB latency
        
        setTeam({
          lo: { name: 'Sarah Jenkins', role: 'Senior Loan Officer', phone: '(555) 123-4567', email: 's.jenkins@homeratesyard.com', status: 'online' },
          processor: { name: 'David Chen', role: 'Loan Processor', phone: '(555) 987-6543', email: 'd.chen@homeratesyard.com', status: 'away' }
        });

        const now = new Date();
        const yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24);

        setMessages([
          { id: 'msg-1', sender: 'team', author: 'Sarah Jenkins', text: 'Hi there! I am reviewing your application now. Do you have any questions about the Loan Estimate I sent over?', timestamp: new Date(yesterday.getTime() - 1000 * 60 * 30), isMine: false },
          { id: 'msg-2', sender: 'user', author: 'You', text: 'Yes, I was wondering why the cash to close is slightly higher than the initial quote?', timestamp: new Date(yesterday.getTime() - 1000 * 60 * 5), isMine: true, status: 'read' },
          { id: 'msg-3', sender: 'team', author: 'Sarah Jenkins', text: 'Great question. The property taxes in that specific county were updated yesterday, which increased the escrow reserves required.', timestamp: new Date(now.getTime() - 1000 * 60 * 120), isMine: false },
          { id: 'msg-4', sender: 'team', author: 'Sarah Jenkins', text: 'I also attached a breakdown of the specific tax rates for your reference.', timestamp: new Date(now.getTime() - 1000 * 60 * 119), isMine: false, attachment: { name: 'Travis_County_Tax_Rates_2024.pdf', type: 'pdf', size: '1.2 MB' } },
        ]);

      } catch (error) {
        addToast('Failed to load support center.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  // --- AUTO-SCROLL ENGINE ---
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, stagedAttachment]);

  // --- DERIVED: MESSAGE DATE GROUPING ---
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = null;

    messages.forEach(msg => {
      const msgDate = new Date(msg.timestamp);
      const dateLabel = formatRelativeDate(msgDate);

      if (dateLabel !== currentDate) {
        groups.push({ type: 'separator', label: dateLabel, id: `sep-${msg.id}` });
        currentDate = dateLabel;
      }
      groups.push({ type: 'message', ...msg });
    });

    return groups;
  }, [messages]);

  // --- HANDLERS ---
  const handleAttachmentSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('Chat attachments are limited to 5MB.', 'warning');
        return;
      }
      setStagedAttachment({
        name: file.name,
        type: file.type.includes('image') ? 'image' : 'pdf',
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      });
    }
    e.target.value = ''; // Reset file input
  };

  const handleSendMessage = async (e, predefinedText = null) => {
    if (e) e.preventDefault();
    const textToSend = predefinedText || newMessage;
    
    // Prevent empty sends unless there is an attachment
    if (!textToSend.trim() && !stagedAttachment) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      author: 'You',
      text: textToSend.trim(),
      timestamp: new Date(),
      isMine: true,
      status: 'sent',
      attachment: stagedAttachment
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');
    setStagedAttachment(null);
    setIsSending(true);

    // Simulate network delay for "delivered" status
    await new Promise(resolve => setTimeout(resolve, 600));
    setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'delivered' } : m));
    setIsSending(false);

    // Simulate Live Team Response (Auto-Reply)
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 2500)); 
    
    // Update user msg to "read" by Loan Officer
    setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'read' } : m));

    const replyMsg = {
      id: `msg-${Date.now() + 1}`,
      sender: 'team',
      author: 'David Chen',
      text: stagedAttachment ? 'Received your document, I will add this to your underwriting file right now.' : 'Understood. Let me check your file and I will get right back to you.',
      timestamp: new Date(),
      isMine: false
    };
    
    setIsTyping(false);
    setMessages(prev => [...prev, replyMsg]);
  };

  const QUICK_ACTIONS = [
    "What is my current status?",
    "Can we schedule a quick call?",
    "I need help with an upload."
  ];

  const FAQS = [
    { id: 'faq-1', q: 'What is "Cash to Close"?', a: 'Cash to close is the total amount of money you need to bring on closing day. It includes your down payment minus your earnest money deposit, plus all closing costs, lender fees, and prepaid escrow items.' },
    { id: 'faq-2', q: 'Why do you need so many bank statements?', a: 'Underwriting guidelines require us to verify the source of all funds used for your down payment. We must trace the money to ensure it has been in your account for at least 60 days.' },
    { id: 'faq-3', q: 'Will a soft credit pull hurt my score?', a: 'No. Our initial Pre-Approval uses a "Soft Pull", which does not impact your credit score. A "Hard Pull" is only required later in the process once you find a home and officially lock your loan.' }
  ];

  const isEmpty = (str) => !str || str.trim().length === 0;

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <>
      <Head><title>Support Center | HomeRatesYard</title></Head>

      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
              <LifeBuoy className="text-[#B91C1C]" size={32} /> 
              Support & Secure Messaging
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Get immediate help from your dedicated loan team and find answers to common questions.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-4 py-2.5 rounded-full border border-blue-200 shadow-sm">
            <ShieldCheck size={16} className="text-blue-500" />
            End-to-End Encrypted
          </div>
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : (
          <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* --- LEFT: SECURE INBOX (CHAT) --- */}
            <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden flex flex-col h-[750px]">
               
               {/* Chat Header */}
               <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80 shrink-0">
                  <div className="flex items-center gap-3">
                     <div className="p-2 text-blue-600 bg-blue-100 rounded-lg">
                       <MessageSquare size={20} />
                     </div>
                     <div>
                       <h2 className="text-lg font-bold text-slate-900">Message your Loan Team</h2>
                       <p className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 mt-0.5">
                         <span className="relative flex w-2 h-2">
                            <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-400"></span>
                            <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500"></span>
                         </span>
                         Sarah is online
                       </p>
                     </div>
                  </div>
                  <button onClick={() => addToast('Refreshing thread...', 'info')} className="p-2 transition-colors border border-transparent rounded-lg shadow-sm text-slate-400 hover:bg-white hover:text-blue-600 hover:border-slate-200" title="Refresh">
                     <RefreshCw size={16} />
                  </button>
               </div>

               {/* Chat Body */}
               <div 
                 ref={chatScrollRef}
                 className="flex-1 p-6 space-y-6 overflow-y-auto md:p-8 bg-slate-50/30 custom-scrollbar"
               >
                  <div className="pb-2 text-center">
                     <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 bg-slate-100/80 px-4 py-1.5 rounded-full border border-slate-200/50">Secure Connection Established</span>
                  </div>

                  {groupedMessages.map((item) => {
                     // Date Separator
                     if (item.type === 'separator') {
                       return (
                         <div key={item.id} className="flex items-center justify-center my-6">
                           <div className="h-px bg-slate-200 flex-1 max-w-[50px]"></div>
                           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3">{item.label}</span>
                           <div className="h-px bg-slate-200 flex-1 max-w-[50px]"></div>
                         </div>
                       );
                     }

                     // Message Bubble
                     const msg = item;
                     return (
                       <div key={msg.id} className={cn("flex w-full animate-in fade-in slide-in-from-bottom-1 duration-300", msg.isMine ? "justify-end" : "justify-start")}>
                          <div className={cn("flex flex-col max-w-[85%] md:max-w-[70%]", msg.isMine ? "items-end" : "items-start")}>
                             
                             {/* Author Label */}
                             {!msg.isMine && (
                               <span className="text-[10px] font-bold text-slate-500 ml-1 mb-1.5 flex items-center gap-1.5">
                                 {msg.author} <ShieldCheck size={10} className="text-blue-500" />
                               </span>
                             )}

                             {/* Bubble Container */}
                             <div className={cn(
                               "flex flex-col overflow-hidden shadow-sm",
                               msg.isMine ? "bg-[#0A1128] text-white rounded-2xl rounded-br-sm" : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm"
                             )}>
                               
                               {/* Attachment Renderer */}
                               {msg.attachment && (
                                 <div className={cn(
                                   "flex items-center gap-3 p-3 m-1 rounded-xl border",
                                   msg.isMine ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-100"
                                 )}>
                                    <div className={cn("p-2 rounded-lg", msg.isMine ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600")}>
                                      {msg.attachment.type === 'image' ? <FileImage size={18} /> : <FileText size={18} />}
                                    </div>
                                    <div className="pr-2 overflow-hidden">
                                      <p className="text-xs font-bold truncate max-w-[150px]">{msg.attachment.name}</p>
                                      <p className={cn("text-[10px] mt-0.5", msg.isMine ? "text-slate-400" : "text-slate-500")}>{msg.attachment.size}</p>
                                    </div>
                                 </div>
                               )}

                               {/* Text Payload */}
                               {msg.text && (
                                 <div className="px-5 py-3.5 text-sm leading-relaxed">
                                   {msg.text}
                                 </div>
                               )}
                             </div>
                             
                             {/* Timestamp & Read Receipts */}
                             <div className={cn("flex items-center gap-1.5 mt-1.5 text-[10px] font-semibold text-slate-400", msg.isMine ? "mr-1" : "ml-1")}>
                               {formatTime(msg.timestamp)}
                               {msg.isMine && msg.status && (
                                 <span className="flex items-center gap-0.5 ml-1">
                                   {msg.status === 'sent' && <CheckCircle2 size={10} className="text-slate-300" />}
                                   {msg.status === 'delivered' && <CheckCircle2 size={10} className="text-slate-400" />}
                                   {msg.status === 'read' && <CheckCircle2 size={10} className="text-emerald-500" />}
                                 </span>
                               )}
                             </div>
                          </div>
                       </div>
                     );
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start w-full animate-in fade-in zoom-in slide-in-from-bottom-2">
                       <div className="flex flex-col items-start">
                         <span className="text-[10px] font-bold text-slate-500 ml-1 mb-1">Loan Team is typing...</span>
                         <div className="px-5 py-4 bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                           <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                           <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                           <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                         </div>
                       </div>
                    </div>
                  )}
               </div>

               {/* Chat Input & Tools */}
               <div className="flex flex-col bg-white border-t border-slate-100 shrink-0">
                  
                  {/* Quick Actions (Deflection) */}
                  <div className="flex items-center gap-2 px-6 pt-4 pb-2 overflow-x-auto custom-scrollbar">
                    {QUICK_ACTIONS.map((action, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSendMessage(null, action)}
                        disabled={isSending}
                        className="whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-xs font-semibold text-slate-600 hover:text-blue-700 rounded-full transition-colors disabled:opacity-50"
                      >
                        {action}
                      </button>
                    ))}
                  </div>

                  {/* Input Form */}
                  <div className="px-4 pt-2 pb-6 md:px-6">
                    
                    {/* Staged Attachment Indicator */}
                    {stagedAttachment && (
                      <div className="mb-3 mx-2 flex items-center justify-between p-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Paperclip size={14} />
                          <span className="text-xs font-bold truncate max-w-[200px]">{stagedAttachment.name}</span>
                        </div>
                        <button onClick={() => setStagedAttachment(null)} className="p-1 text-blue-400 hover:text-blue-700"><X size={14} /></button>
                      </div>
                    )}

                    <form onSubmit={(e) => handleSendMessage(e)} className="relative flex items-end gap-3">
                       
                       {/* Hidden File Input for Attachments */}
                       <input type="file" ref={fileInputRef} onChange={handleAttachmentSelect} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                       
                       {/* Attachment Button */}
                       <button 
                         type="button"
                         onClick={() => fileInputRef.current?.click()}
                         className="absolute z-10 p-2 transition-colors left-3 bottom-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                         title="Attach File"
                       >
                         <Paperclip size={18} />
                       </button>

                       <textarea 
                         value={newMessage}
                         onChange={(e) => setNewMessage(e.target.value)}
                         onKeyDown={(e) => {
                           if (e.key === 'Enter' && !e.shiftKey) {
                             e.preventDefault();
                             handleSendMessage(e);
                           }
                         }}
                         placeholder="Type a secure message..."
                         className="w-full min-h-[56px] max-h-[120px] bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-14 py-4 text-sm font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none custom-scrollbar"
                         rows={1}
                       />
                       
                       <button 
                         type="submit"
                         disabled={(isEmpty(newMessage) && !stagedAttachment) || isSending}
                         className="absolute right-2 bottom-2 p-2.5 bg-[#B91C1C] text-white rounded-xl hover:bg-red-800 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                       >
                         <Send size={18} className={cn(isSending && "translate-x-1 -translate-y-1 opacity-50 transition-transform")} />
                       </button>
                    </form>
                    <p className="text-[10px] text-center font-semibold text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                      <Lock size={10} /> Bank-Level Encryption. Press Enter to send.
                    </p>
                  </div>
               </div>

            </div>

            {/* --- 3. RIGHT: SIDEBAR (TEAM & FAQ) --- */}
            <div className="space-y-6 lg:col-span-4">
               
               {/* 🟢 DEDICATED TEAM WIDGET */}
               {team && (
                 <div className="bg-[#0A1128] border border-slate-800 shadow-xl rounded-[24px] p-6 md:p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10">
                       <User size={120} className="-mt-10 -mr-10" />
                    </div>
                    <div className="relative z-10">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                         <ShieldCheck size={16} className="text-blue-500" /> Your Dedicated Team
                       </h3>
                       
                       <div className="space-y-6">
                          {/* Loan Officer */}
                          <div className="relative flex items-start gap-4 group">
                            <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-blue-400 transition-colors border rounded-2xl bg-blue-600/20 border-blue-500/30 shrink-0 group-hover:bg-blue-600/30">
                              {team.lo.name.charAt(0)}
                            </div>
                            {/* Online Status Dot */}
                            <div className={cn("absolute top-0 left-9 w-3 h-3 rounded-full border-2 border-[#0A1128]", team.lo.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400')} title={team.lo.status} />
                            
                            <div>
                              <p className="text-base font-bold tracking-tight text-white">{team.lo.name}</p>
                              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5 mb-2">{team.lo.role}</p>
                              <div className="flex flex-col gap-2 mt-2">
                                <a href={`tel:${team.lo.phone}`} className="text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-2 w-fit px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5">
                                  <Phone size={12} className="text-blue-400" /> {team.lo.phone}
                                </a>
                                <a href={`mailto:${team.lo.email}`} className="text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-2 w-fit px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5">
                                  <Mail size={12} className="text-blue-400" /> Direct Email
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="h-px bg-slate-800" />

                          {/* Processor */}
                          <div className="relative flex items-start gap-4 group">
                            <div className="flex items-center justify-center w-12 h-12 text-lg font-bold transition-colors border rounded-2xl bg-emerald-600/20 border-emerald-500/30 text-emerald-400 shrink-0 group-hover:bg-emerald-600/30">
                              {team.processor.name.charAt(0)}
                            </div>
                            <div className={cn("absolute top-0 left-9 w-3 h-3 rounded-full border-2 border-[#0A1128]", team.processor.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400')} title={team.processor.status} />

                            <div>
                              <p className="text-base font-bold tracking-tight text-white">{team.processor.name}</p>
                              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5 mb-2">{team.processor.role}</p>
                              <div className="flex flex-col gap-2 mt-2">
                                <a href={`tel:${team.processor.phone}`} className="text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-2 w-fit px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5">
                                  <Phone size={12} className="text-emerald-400" /> {team.processor.phone}
                                </a>
                              </div>
                            </div>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {/* 🟢 FAQ ACCORDION WIDGET */}
               <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-6 md:p-8">
                  <h3 className="flex items-center gap-2 mb-6 text-sm font-bold text-slate-900">
                    <HelpCircle size={18} className="text-blue-600" /> Knowledge Base
                  </h3>
                  
                  <div className="space-y-3">
                     {FAQS.map(faq => {
                        const isOpen = openFaqId === faq.id;
                        return (
                          <div 
                            key={faq.id} 
                            className={cn(
                              "border rounded-2xl transition-all duration-300 overflow-hidden",
                              isOpen ? "border-blue-200 bg-blue-50/30 shadow-sm" : "border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300"
                            )}
                          >
                             <button 
                               onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                               className="flex items-center justify-between w-full p-4 text-left focus:outline-none"
                             >
                                <span className={cn("text-sm font-bold pr-4", isOpen ? "text-blue-900" : "text-slate-800")}>{faq.q}</span>
                                {isOpen ? <ChevronUp size={16} className="text-blue-500 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                             </button>
                             
                             <div className={cn(
                               "grid transition-all duration-300 ease-in-out",
                               isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                             )}>
                                <div className="overflow-hidden">
                                   <p className="p-4 pt-0 mt-1 text-sm leading-relaxed border-t text-slate-600 border-blue-100/50">
                                     {faq.a}
                                   </p>
                                </div>
                             </div>
                          </div>
                        );
                     })}
                  </div>
               </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}

const SkeletonLoader = () => (
  <div className="grid grid-cols-1 gap-8 mt-8 lg:grid-cols-12 animate-pulse">
    <div className="lg:col-span-8">
      <div className="h-[750px] bg-slate-200 rounded-[24px]" />
    </div>
    <div className="space-y-6 lg:col-span-4">
      <div className="h-[350px] bg-slate-200 rounded-[24px]" />
      <div className="h-[400px] bg-slate-200 rounded-[24px]" />
    </div>
  </div>
);

SupportPage.getLayout = (page) => (
  <RouteGuard allowedRoles={['borrower']}>
    <DashboardLayout>{page}</DashboardLayout>
  </RouteGuard>
);