import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check, Trash2, ExternalLink, Clock, User, Award } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../../store/api/notification.thunk';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationsDropdown = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const { notifications, unreadCount, loading } = useSelector(state => state.notification);

    useEffect(() => {
        if (isOpen) {
            dispatch(getNotifications());
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await dispatch(markAsRead(notification.id));
        }
        if (notification.link) {
            navigate(notification.link);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-[320px] md:w-[380px] bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden flex flex-col max-h-[500px]"
            style={{ borderRadius: '2px' }}
        >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <Bell size={14} className="text-[var(--color-primary)]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-[var(--color-primary)] text-black text-[9px] font-black rounded-sm">
                            {unreadCount} NEW
                        </span>
                    )}
                </div>
                {notifications.length > 0 && (
                    <button 
                        onClick={() => dispatch(markAllAsRead())}
                        className="text-[9px] font-bold text-slate-500 hover:text-[var(--color-primary)] transition-colors uppercase tracking-widest"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 scrollbar-hide">
                {loading && notifications.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Syncing Arena...</div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell size={24} className="text-slate-800 mx-auto mb-4 opacity-20" />
                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No transmissions found</div>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.map((n) => (
                            <div 
                                key={n.id}
                                className={`p-4 group relative cursor-pointer transition-all hover:bg-white/[0.03] ${!n.isRead ? 'bg-[var(--color-primary)]/[0.04]' : ''}`}
                                onClick={() => handleNotificationClick(n)}
                            >
                                {!n.isRead && (
                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--color-primary)] shadow-[0_0_10px_rgba(255,170,0,0.5)]"></div>
                                )}
                                
                                <div className="flex gap-4">
                                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${
                                        n.type === 'FRIEND_REQUEST' ? 'bg-blue-500/10 text-blue-400' :
                                        n.type === 'MATCH_INVITE' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' :
                                        'bg-slate-800/50 text-slate-400'
                                    }`}>
                                        {n.type === 'FRIEND_REQUEST' ? <User size={14} /> : 
                                         n.type === 'MATCH_INVITE' ? <Award size={14} /> : 
                                         <Bell size={14} />}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1 gap-2">
                                            <h4 className={`text-[11px] font-bold truncate ${!n.isRead ? 'text-white' : 'text-slate-400'}`}>
                                                {n.title}
                                            </h4>
                                            <span className="text-[8px] font-medium text-slate-600 flex items-center gap-1 shrink-0 mt-0.5">
                                                <Clock size={8} />
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 leading-relaxed mb-2 line-clamp-2">
                                            {n.message}
                                        </p>
                                        
                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!n.isRead && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); dispatch(markAsRead(n.id)); }}
                                                    className="text-[8px] font-black text-[var(--color-primary)] uppercase tracking-widest hover:underline flex items-center gap-1"
                                                >
                                                    <Check size={10} /> Mark Read
                                                </button>
                                            )}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); dispatch(deleteNotification(n.id)); }}
                                                className="text-[8px] font-black text-red-500/60 uppercase tracking-widest hover:text-red-500 flex items-center gap-1 ml-auto"
                                            >
                                                <Trash2 size={10} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 bg-white/[0.01] border-t border-white/5 text-center">
                     <button 
                        onClick={() => { navigate('/notifications'); onClose(); }}
                        className="text-[9px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto"
                     >
                        View All Transmissions <ExternalLink size={10} />
                     </button>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
