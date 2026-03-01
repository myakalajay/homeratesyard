import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import api from '@/services/api';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        loadNotifications();
        // Poll every 30 seconds for new alerts
        const interval = setInterval(loadNotifications, 30000); 
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (e) { console.error(e); }
    };

    const handleRead = async (id, link) => {
        try {
            await api.put(`/notifications/${id}/read`);
            loadNotifications();
            if (link) window.location.href = link;
        } catch (e) {}
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 transition-colors rounded-full text-slate-500 hover:bg-slate-100">
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 overflow-hidden bg-white border shadow-xl w-80 border-slate-200 rounded-xl">
                    <div className="p-3 text-sm font-bold border-b bg-slate-50 text-slate-700">
                        Notifications
                    </div>
                    <div className="overflow-y-auto max-h-80">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-sm text-center text-slate-400">No new notifications</div>
                        ) : notifications.map(n => (
                            <div 
                                key={n.id} 
                                onClick={() => handleRead(n.id, n.actionLink)}
                                className={`p-3 border-b cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <h4 className={`text-sm ${!n.isRead ? 'font-bold text-slate-800' : 'text-slate-600'}`}>{n.title}</h4>
                                    <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}