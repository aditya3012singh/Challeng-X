import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserProfile, updateUserProfile, getPublicProfile, changePassword } from '../../store/api/auth.thunk';
import { getSocialStatus, toggleFollow, sendFriendRequest, getIncomingRequests, respondToFriendRequest } from '../../store/api/social.thunk';
import { 
  User, Users, Mail, LayoutDashboard, Shield, Trophy, Activity, 
  Github, Linkedin, Instagram, Twitter, Edit2, Check, X,
  ExternalLink, Calendar, Code, Target, Award, Camera, Zap, Flame
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/axios';
import ProfileRadarChart from '../components/profile/ProfileRadarChart';
import MatchHistory from '../components/profile/MatchHistory';

const DEPARTMENTS = [
  { value: 'leetcode', label: 'LeetCode', icon: Code, color: 'text-yellow-500' },
  { value: 'gfg', label: 'GeeksforGeeks', icon: Code, color: 'text-green-500' },
  { value: 'hackerrank', label: 'HackerRank', icon: Code, color: 'text-green-600' },
  { value: 'codeforces', label: 'Codeforces', icon: Target, color: 'text-blue-500' },
];

const Profile = () => {
    const { username: urlUsername } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: currentUser, publicProfile, publicProfileLoading } = useSelector((state) => state.auth);
    const { followersCount, followingCount, isFollowing, friendStatus, isLoading: socialLoading } = useSelector((state) => state.social);
    
    const isOwner = currentUser?.username === urlUsername;
    const profileData = isOwner ? currentUser : publicProfile;
    const isLoading = isOwner ? false : publicProfileLoading;

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const [formData, setFormData] = useState({
        profilePic: '',
        linkedin: '',
        github: '',
        leetcode: '',
        gfg: '',
        hackerrank: '',
        codeforces: '',
        instagram: '',
        twitter: ''
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: '', success: '' });

    const [analytics, setAnalytics] = useState(null);
    const [matchHistory, setMatchHistory] = useState([]);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    useEffect(() => {
        if (!isOwner && urlUsername) {
            dispatch(getPublicProfile(urlUsername));
            setIsEditing(false);
        }
    }, [urlUsername, isOwner, dispatch]);

    useEffect(() => {
        if (profileData?.id) {
            dispatch(getSocialStatus(profileData.id));
        }
        if (isOwner) {
            dispatch(getIncomingRequests());
        }
    }, [profileData?.id, isOwner, dispatch]);

    useEffect(() => {
        if (profileData && isOwner) {
            setFormData({
                profilePic: profileData.profilePic || '',
                linkedin: profileData.linkedin || '',
                github: profileData.github || '',
                leetcode: profileData.leetcode || '',
                gfg: profileData.gfg || '',
                hackerrank: profileData.hackerrank || '',
                codeforces: profileData.codeforces || '',
                instagram: profileData.instagram || '',
                twitter: profileData.twitter || ''
            });
        }
    }, [profileData, isOwner]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!profileData?.username) return;
            setAnalyticsLoading(true);
            try {
                const { data } = await api.get(`/analytics/${profileData.username}`);
                setAnalytics(data.analytics);
                setMatchHistory(data.history);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setAnalyticsLoading(false);
            }
        };

        fetchAnalytics();
    }, [profileData?.username]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const { data } = await api.get(`/auth/profile/upload-url`, {
                params: { fileName: file.name, fileType: file.type }
            });

            const { uploadUrl, fileUrl } = data;

            await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            setFormData(prev => ({ ...prev, profilePic: fileUrl }));
            
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await dispatch(updateUserProfile(formData)).unwrap();
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordStatus({ ...passwordStatus, error: 'New passwords do not match' });
            return;
        }

        setPasswordStatus({ loading: true, error: '', success: '' });
        try {
            await dispatch(changePassword({ 
                oldPassword: passwordData.oldPassword, 
                newPassword: passwordData.newPassword 
            })).unwrap();
            setPasswordStatus({ loading: false, error: '', success: 'Password updated successfully!' });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setPasswordStatus({ loading: false, error: error.message || 'Failed to update password', success: '' });
        }
    };

    if (isLoading && !profileData) {
        return (
            <div className="min-h-screen pt-24 bg-[var(--color-bg-dark)] flex justify-center">
                <div className="animate-spin text-[var(--color-primary)] mt-20">
                    <Activity size={32} />
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen pt-24 bg-[var(--color-bg-dark)] flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-bold text-[var(--color-text-muted)] mb-4 font-mono uppercase tracking-widest">Profile Not Found</h2>
                <p className="text-[var(--color-text-muted)] opacity-60 mb-8 max-w-md">The user profile you are looking for does not exist or has been deleted.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-[var(--color-primary)] text-black font-black font-mono uppercase tracking-widest hover:brightness-110 transition-all rounded-sm"
                >
                    Return Home
                </button>
            </div>
        );
    }

    const totalMatches = (profileData.wins || 0) + (profileData.losses || 0);
    const winRate = totalMatches > 0 ? (((profileData.wins || 0) / totalMatches) * 100).toFixed(1) : 0;

    const SocialLink = ({ icon: Icon, value, placeholder, name, isUrl }) => {
        if (isEditing) {
            return (
                <div className="flex items-center gap-3 w-full bg-white/5 p-3 rounded-lg border border-[var(--glass-border)]">
                    <Icon size={18} className="text-[var(--color-text-muted)]" />
                    <input 
                        type="text" 
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="bg-transparent text-sm text-[var(--color-text-main)] outline-none w-full placeholder:opacity-30"
                    />
                </div>
            );
        }

        if (!value) return null;

        return (
            <a 
                href={isUrl ? value : `https://${value}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-[var(--glass-border)] hover:border-[var(--color-primary)]/40 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <Icon size={18} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                    <span className="text-sm text-[var(--color-text-main)] font-medium">{placeholder}</span>
                </div>
                <ExternalLink size={14} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
        );
    };

    return (
        <div className="min-h-screen pt-12 pb-12 bg-[var(--color-bg-dark)] text-[var(--color-text-main)] selection:bg-[var(--color-primary)] selection:text-black font-sans">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Action */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="text-xl sm:text-2xl font-black font-mono text-[var(--color-primary)] tracking-tight uppercase">Player Profile</h1>
                    
                    {isOwner && (
                        !isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-[var(--color-text-main)] border border-[var(--glass-border)] hover:border-[var(--color-primary)] rounded-md transition-all text-xs font-black uppercase tracking-wider shadow-sm"
                            >
                                <Edit2 size={14} /> Update
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 border border-[var(--glass-border)] hover:border-red-500/30 rounded-md transition-all text-xs font-black uppercase tracking-wider"
                                    disabled={saving}
                                >
                                    <X size={14} /> Cancel
                                </button>
                                <button 
                                    onClick={handleSubmit}
                                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-black border border-transparent rounded-md transition-all text-xs font-black uppercase tracking-wider disabled:opacity-50 shadow-[0_10px_20px_rgba(var(--color-primary-rgb),0.1)]"
                                    disabled={saving}
                                >
                                    {saving ? <Activity size={14} className="animate-spin" /> : <Check size={14} />} 
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Col - Main Info */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Profile Card */}
                        <div className="bg-[var(--color-bg-card)] border border-[var(--glass-border)] rounded-xl overflow-hidden relative group shadow-sm backdrop-blur-md">
                            <div className="h-32 bg-white/[0.03] relative border-b border-[var(--glass-border)]">
                                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                            </div>
                            
                            <div className="relative px-6 pb-6 text-center -mt-16">
                                <div className="inline-block relative">
                                    {isEditing ? (
                                        <div className="w-32 h-32 rounded-xl bg-[var(--color-bg-dark)] border-2 border-[var(--color-primary)] mx-auto overflow-hidden relative group/avatar shadow-2xl">
                                            {formData.profilePic ? (
                                                <img src={formData.profilePic} alt="Preview" className="w-full h-full object-cover opacity-50" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-[var(--color-text-muted)]">
                                                    <User size={40} />
                                                </div>
                                            )}
                                            
                                            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                                {uploading ? (
                                                    <Activity size={24} className="animate-spin text-[var(--color-primary)]" />
                                                ) : (
                                                    <>
                                                        <Camera size={24} className="text-white mb-1" />
                                                        <span className="text-[10px] font-black text-white uppercase tracking-wider">Upload</span>
                                                    </>
                                                )}
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    disabled={uploading}
                                                />
                                            </label>

                                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1 transform translate-y-full group-hover/avatar:translate-y-0 transition-transform">
                                                <input 
                                                    type="text"
                                                    name="profilePic"
                                                    value={formData.profilePic}
                                                    onChange={handleChange}
                                                    placeholder="Or enter URL..."
                                                    className="bg-transparent text-[8px] text-center w-full outline-none text-white/50 font-mono"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 rounded-xl bg-white/5 border-2 border-[var(--glass-border)] group-hover:border-[var(--color-primary)]/40 transition-all mx-auto overflow-hidden shadow-2xl">
                                            {profileData.profilePic ? (
                                                <img src={profileData.profilePic} alt={profileData.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/[0.03] text-4xl font-black text-[var(--color-text-muted)] uppercase italic">
                                                    {profileData.username?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-2 -right-2 bg-[var(--color-bg-dark)] p-1 rounded-sm border border-[var(--glass-border)]">
                                        <div className="bg-green-500/10 text-green-500 text-[9px] font-black px-2 py-0.5 rounded-sm flex items-center gap-1.5 border border-green-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                            ONLINE
                                        </div>
                                    </div>
                                </div>
                                
                                <h2 className="text-xl font-black mt-4 text-[var(--color-text-main)] uppercase">{profileData.username}</h2>
                                <p className="text-[var(--color-text-muted)] text-xs flex items-center justify-center gap-2 mt-1 font-medium opacity-60">
                                    <Mail size={12} className="opacity-40" /> {profileData.email || 'PROTECTED_SIG'}
                                </p>
                                
                                <div className="mt-6 flex justify-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-[var(--glass-border)] rounded-full text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                                        <Shield size={10} className={profileData.role === 'ADMIN' ? 'text-red-500' : 'text-blue-500'} />
                                        {profileData.role}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-full text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)]">
                                        <Activity size={10} />
                                        LVL {Math.floor(profileData.rankPoints / 100)}
                                    </span>
                                </div>

                                {!isOwner && profileData && (
                                    <div className="mt-8 flex flex-col gap-2 w-full pt-6 border-t border-[var(--glass-border)]">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => dispatch(toggleFollow(profileData.id))}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                    isFollowing 
                                                        ? 'bg-transparent border-[var(--glass-border)] text-[var(--color-text-muted)] hover:border-red-500/30 hover:text-red-500' 
                                                        : 'bg-[var(--color-primary)] border-transparent text-black shadow-[0_10px_20px_rgba(var(--color-primary-rgb),0.1)]'
                                                }`}
                                            >
                                                {isFollowing ? <X size={14} /> : <Zap size={14} fill="currentColor" />}
                                                {isFollowing ? 'Unfollow' : 'Connect'}
                                            </button>
                                            
                                            <button 
                                                onClick={() => !friendStatus && dispatch(sendFriendRequest(profileData.id))}
                                                disabled={friendStatus === 'PENDING' || friendStatus === 'ACCEPTED'}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                    friendStatus === 'ACCEPTED'
                                                        ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                                        : friendStatus === 'PENDING'
                                                            ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                                                            : 'bg-white/5 border-[var(--glass-border)] text-[var(--color-text-main)] hover:border-[var(--color-primary)]/40'
                                                }`}
                                            >
                                                <Users size={14} strokeWidth={3} />
                                                {friendStatus === 'ACCEPTED' ? 'Partner' : friendStatus === 'PENDING' ? 'Waiting' : 'Add'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pending Requests */}
                        {isOwner && (useSelector(state => state.social.incomingRequests) || []).length > 0 && (
                            <div className="bg-[var(--color-bg-card)] border border-yellow-500/20 rounded-xl p-6 backdrop-blur-md">
                                <h3 className="text-[10px] font-black text-yellow-500 mb-4 flex items-center gap-2 tracking-widest uppercase italic">
                                    <Users size={14} /> PENDING CONTACTS
                                </h3>
                                <div className="space-y-3">
                                    {(useSelector(state => state.social.incomingRequests) || []).map(req => (
                                        <div key={req.id} className="flex items-center justify-between p-3 bg-white/5 border border-[var(--glass-border)] rounded-lg group/req">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-[var(--glass-border)] overflow-hidden">
                                                    {req.sender.profilePic ? (
                                                        <img src={req.sender.profilePic} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] font-black uppercase transition-all group-hover/req:text-[var(--color-primary)]">
                                                            {req.sender.username.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[11px] font-black text-[var(--color-text-main)] uppercase tracking-tight">{req.sender.username}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => dispatch(respondToFriendRequest({ requestId: req.id, status: 'ACCEPTED' }))}
                                                    className="p-1.5 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black transition-all border border-green-500/20"
                                                >
                                                    <Check size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => dispatch(respondToFriendRequest({ requestId: req.id, status: 'REJECTED' }))}
                                                    className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-black transition-all border border-red-500/20"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Social Stats */}
                        <div className="bg-[var(--color-bg-card)] border border-[var(--glass-border)] rounded-xl p-6 backdrop-blur-md">
                            <h3 className="text-[10px] font-black text-[var(--color-text-muted)] opacity-30 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                <Users size={14} /> Network Prestige
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-[var(--glass-border)] text-center group hover:border-[var(--color-primary)]/40 transition-all">
                                    <div className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1 opacity-40">Followers</div>
                                    <div className="text-2xl font-black text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors">{followersCount}</div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-[var(--glass-border)] text-center group hover:border-[var(--color-primary)]/40 transition-all">
                                    <div className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1 opacity-40">Following</div>
                                    <div className="text-2xl font-black text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors">{followingCount}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Col - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Radar Chart */}
                        <ProfileRadarChart 
                            data={analytics?.radarData} 
                            loading={analyticsLoading} 
                        />
                        
                        {/* Arena Standings */}
                        <div className="bg-[var(--color-bg-card)] border border-[var(--glass-border)] rounded-xl p-8 backdrop-blur-md">
                            <h3 className="text-[10px] font-black text-[var(--color-text-muted)] mb-8 flex items-center gap-2 uppercase tracking-widest opacity-30">
                                <Trophy size={14} /> Arena Standings
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-black tracking-widest opacity-40">Combat Rating</div>
                                    <div className="text-4xl font-black text-[var(--color-primary)] font-mono drop-shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.3)]">{profileData.rankPoints}</div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-[var(--color-primary)]" style={{ width: `${Math.min(100, (profileData.rankPoints / 2500) * 100)}%` }} />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 col-span-2">
                                    <div className="bg-white/5 border border-[var(--glass-border)] p-5 rounded-sm text-center">
                                        <div className="text-2xl font-black text-green-500 font-mono">{profileData.wins || 0}</div>
                                        <div className="text-[9px] text-[var(--color-text-muted)] uppercase font-black mt-2 opacity-30">Victories</div>
                                    </div>
                                    <div className="bg-white/5 border border-[var(--glass-border)] p-5 rounded-sm text-center">
                                        <div className="text-2xl font-black text-blue-500 font-mono">{profileData.cyberCores || 0}</div>
                                        <div className="text-[9px] text-[var(--color-text-muted)] uppercase font-black mt-2 opacity-30">Cybercores</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="bg-white/[0.03] border border-[var(--glass-border)] p-4 rounded-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Flame size={14} className="text-orange-500/60" />
                                        <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-black opacity-40">Daily Streak</span>
                                    </div>
                                    <span className="text-[11px] font-black text-[var(--color-text-main)] uppercase">{profileData.dailyLoginStreak || 0} Days</span>
                                </div>
                                <div className="bg-white/[0.03] border border-[var(--glass-border)] p-4 rounded-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Award size={14} className="text-purple-500/60" />
                                        <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-black opacity-40">Badges</span>
                                    </div>
                                    <span className="text-[11px] font-black text-[var(--color-text-main)] uppercase">{profileData.achievements?.length || 0} Earned</span>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-[var(--glass-border)]">
                                <div className="flex justify-between text-[10px] mb-3 font-black text-[var(--color-text-muted)] uppercase tracking-widest opacity-40">
                                    <span>Combat Success Rate</span>
                                    <span className="text-[var(--color-text-main)]">{winRate}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden flex border border-white/5">
                                    <div className="h-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all" style={{ width: `${winRate}%` }} />
                                    <div className="h-full bg-red-500/20 flex-1" />
                                </div>
                                <div className="text-[9px] text-right text-[var(--color-text-muted)] mt-3 font-black italic opacity-20 uppercase tracking-widest">Total Encounters: {totalMatches}</div>
                            </div>
                        </div>

                        {/* Earned Badges */}
                        {(profileData.achievements?.length > 0) && (
                            <div className="bg-[var(--color-bg-card)] border border-[var(--glass-border)] rounded-xl p-8 backdrop-blur-md">
                                <h3 className="text-[10px] font-black text-[var(--color-text-muted)] mb-8 flex items-center gap-2 uppercase tracking-widest opacity-30">
                                    <Award size={14} /> Earned Badges
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {profileData.achievements.map((ach) => (
                                        <div key={ach.id} className="group relative">
                                            <div className="aspect-square bg-white/5 border border-[var(--glass-border)] hover:border-[var(--color-primary)]/40 transition-all p-4 flex flex-col items-center justify-center text-center gap-3 rounded-sm">
                                                <div className="w-12 h-12 bg-[var(--color-primary)]/5 rounded-full flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/10 transition-all">
                                                    <Trophy size={20} strokeWidth={2.5} />
                                                </div>
                                                <span className="text-[9px] font-black text-[var(--color-text-main)] uppercase tracking-tighter truncate w-full opacity-60 group-hover:opacity-100">{ach.badge.name}</span>
                                            </div>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-4 bg-black border border-white/10 rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-center z-10 pointer-events-none shadow-2xl">
                                                <div className="text-[10px] font-black text-[var(--color-primary)] uppercase mb-2">{ach.badge.name}</div>
                                                <div className="text-[9px] text-white/40 font-medium leading-relaxed">{ach.badge.description}</div>
                                                <div className="text-[8px] text-white/10 font-black uppercase mt-3 tracking-widest border-t border-white/5 pt-2">Captured {new Date(ach.unlockedAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <MatchHistory history={matchHistory} loading={analyticsLoading} />
                        
                        {/* Coding Profiles */}
                        <div className="bg-[var(--color-bg-card)] border border-[var(--glass-border)] rounded-xl p-6 backdrop-blur-md">
                            <h3 className="text-[10px] font-black text-[var(--color-text-muted)] opacity-30 mb-6 flex items-center gap-2 uppercase tracking-widest">
                                <Code size={14} /> Coding Platforms
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {DEPARTMENTS.map(dept => (
                                    <SocialLink 
                                        key={dept.value}
                                        icon={dept.icon} 
                                        value={isEditing ? formData[dept.value] : profileData[dept.value]} 
                                        placeholder={dept.label} 
                                        name={dept.value} 
                                        isUrl={true}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-[var(--color-bg-card)] border border-[var(--glass-border)] rounded-xl p-6 backdrop-blur-md">
                            <h3 className="text-[10px] font-black text-[var(--color-text-muted)] opacity-30 mb-6 flex items-center gap-2 uppercase tracking-widest">
                                <LayoutDashboard size={14} /> Social Grid
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SocialLink icon={Github} value={isEditing ? formData.github : profileData.github} placeholder="GitHub" name="github" isUrl={true} />
                                <SocialLink icon={Linkedin} value={isEditing ? formData.linkedin : profileData.linkedin} placeholder="LinkedIn" name="linkedin" isUrl={true} />
                                <SocialLink icon={Twitter} value={isEditing ? formData.twitter : profileData.twitter} placeholder="Twitter / X" name="twitter" isUrl={true} />
                                <SocialLink icon={Instagram} value={isEditing ? formData.instagram : profileData.instagram} placeholder="Instagram" name="instagram" isUrl={true} />
                            </div>
                        </div>

                        {/* Security Section */}
                        {isOwner && profileData.hasPassword && (
                            <div className="bg-[var(--color-bg-card)] border border-[var(--glass-border)] rounded-xl p-8 backdrop-blur-md">
                                <h3 className="text-[10px] font-black text-[var(--color-text-muted)] opacity-30 mb-8 flex items-center gap-2 uppercase tracking-widest">
                                    <Shield size={14} /> Protection Services
                                </h3>

                                <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
                                    {passwordStatus.error && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest p-4 rounded-sm">
                                            {passwordStatus.error}
                                        </div>
                                    )}
                                    {passwordStatus.success && (
                                        <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest p-4 rounded-sm">
                                            {passwordStatus.success}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-[var(--color-text-muted)] opacity-40 tracking-widest">Current Signature</label>
                                        <input 
                                            type="password"
                                            name="oldPassword"
                                            value={passwordData.oldPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full bg-white/5 border border-[var(--glass-border)] rounded-sm px-4 py-3 text-sm focus:border-[var(--color-primary)]/50 outline-none transition-all font-mono"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-[var(--color-text-muted)] opacity-40 tracking-widest">New Protocol</label>
                                            <input 
                                                type="password"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full bg-white/5 border border-[var(--glass-border)] rounded-sm px-4 py-3 text-sm focus:border-[var(--color-primary)]/50 outline-none transition-all font-mono"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-[var(--color-text-muted)] opacity-40 tracking-widest">Confirm Link</label>
                                            <input 
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full bg-white/5 border border-[var(--glass-border)] rounded-sm px-4 py-3 text-sm focus:border-[var(--color-primary)]/50 outline-none transition-all font-mono"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={passwordStatus.loading}
                                        className="w-full py-4 bg-white/5 hover:bg-[var(--color-primary)] text-[var(--color-text-muted)] hover:text-black border border-[var(--glass-border)] hover:border-transparent rounded-sm transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                                    >
                                        {passwordStatus.loading ? <Activity size={14} className="animate-spin" /> : <Shield size={14} strokeWidth={3} />}
                                        Override Protocol
                                    </button>
                                </form>
                            </div>
                        )}
                        
                        {/* Meta Info */}
                        <div className="bg-white/[0.03] border border-[var(--glass-border)] rounded-xl px-8 py-5 flex justify-between items-center text-[10px] text-[var(--color-text-muted)] font-black uppercase tracking-widest opacity-40 shadow-sm">
                            <span className="flex items-center gap-3">
                                <Calendar size={14} className="opacity-40" /> Active Since {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className="flex items-center gap-3 text-[var(--color-primary)] opacity-100">
                                <Award size={14} /> ID_{profileData.id ? profileData.id.substring(0, 8) : 'UNK'}
                            </span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
