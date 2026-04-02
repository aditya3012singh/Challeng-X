import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, 
    User, 
    Award, 
    Clock, 
    Check, 
    Trash2, 
    ExternalLink 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { 
    getNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
} from '../../../store/api/notification.thunk';

const NotificationsDropdown = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const { notifications = [], unreadCount = 0, loading = false } = useSelector(state => state.notification || {});

    useEffect(() => {
        if (isOpen) {
            dispatch(getNotifications());
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target) && !event.target.closest('.bell-button')) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed md:absolute inset-x-4 md:inset-auto md:right-0 top-24 md:top-full md:mt-4 md:w-[420px] bg-[var(--color-bg-card)] backdrop-blur-2xl border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.8)] z-[201] overflow-hidden flex flex-col max-h-[70vh] md:max-h-[550px]"
                    style={{ borderRadius: '2px' }}
                >
                    {/* Header */}
                    <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                <Bell size={14} className="text-[var(--color-primary)]" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]" />
                                )}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-main)]">Arena Transmissions</span>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-[var(--color-primary)] text-black text-[8px] font-black rounded-sm tracking-widest">
                                    {unreadCount} NEW
                                </span>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <button 
                                onClick={() => dispatch(markAllAsRead())}
                                className="text-[8px] font-black text-slate-500 hover:text-[var(--color-primary)] transition-colors uppercase tracking-[0.2em]"
                            >
                                Clear Signal
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {loading && notifications.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="w-10 h-10 border-2 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-5"></div>
                                <div className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">Deciphering Data...</div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-16 text-center opacity-40">
                                <Bell size={32} className="text-slate-800 mx-auto mb-5" />
                                <div className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em]">No incoming frequencies</div>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((n) => (
                                    <div 
                                        key={n.id}
                                        className={`p-5 group relative cursor-pointer transition-all hover:bg-white/[0.04] ${!n.isRead ? 'bg-[var(--color-primary)]/[0.03]' : ''}`}
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        {!n.isRead && (
                                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)]"></div>
                                        )}
                                        
                                        <div className="flex gap-5">
                                            <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 border border-white/5 ${
                                                n.type === 'FRIEND_REQUEST' ? 'bg-blue-500/10 text-blue-400' :
                                                n.type === 'MATCH_INVITE' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' :
                                                'bg-white/5 text-[var(--color-text-muted)]'
                                            }`}>
                                                {n.type === 'FRIEND_REQUEST' ? <User size={16} /> : 
                                                 n.type === 'MATCH_INVITE' ? <Award size={16} /> : 
                                                 <Bell size={16} />}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1.5 gap-3">
                                                    <h4 className={`text-[12px] font-black tracking-tight truncate ${!n.isRead ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-muted)]'}`}>
                                                        {n.title}
                                                    </h4>
                                                    <span className="text-[8px] font-bold text-slate-600 flex items-center gap-1.5 shrink-0 mt-1 uppercase tracking-tighter">
                                                        <Clock size={8} />
                                                        {n.createdAt ? (
                                                            (() => {
                                                                try {
                                                                    return formatDistanceToNow(new Date(n.createdAt), { addSuffix: true });
                                                                } catch (e) {
                                                                    return 'Recently';
                                                                }
                                                            })()
                                                        ) : 'Recently'}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-[var(--color-text-muted)] leading-[1.6] mb-3 line-clamp-2 font-medium opacity-80">
                                                    {n.message}
                                                </p>
                                                
                                                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                                    {!n.isRead && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); dispatch(markAsRead(n.id)); }}
                                                            className="text-[9px] font-black text-[var(--color-primary)] uppercase tracking-widest hover:brightness-125 flex items-center gap-1.5"
                                                        >
                                                            <Check size={12} /> Acknowledge
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); dispatch(deleteNotification(n.id)); }}
                                                        className="text-[9px] font-black text-red-500/60 uppercase tracking-widest hover:text-red-500 flex items-center gap-1.5 ml-auto"
                                                    >
                                                        <Trash2 size={12} /> Purge
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
                        <div className="p-4 bg-white/[0.01] border-t border-white/5 text-center">
                             <button 
                                onClick={() => { navigate('/notifications'); onClose(); }}
                                className="w-full py-2.5 text-[9px] font-black text-slate-600 hover:text-[var(--color-text-main)] hover:bg-white/5 transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-3 mx-auto"
                                style={{ borderRadius: "2px" }}
                             >
                                Browse All Signal Logs <ExternalLink size={12} />
                             </button>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationsDropdown;
