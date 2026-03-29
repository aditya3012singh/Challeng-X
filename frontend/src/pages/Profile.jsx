import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserProfile, updateUserProfile, getPublicProfile, changePassword } from '../../store/api/auth.thunk';
import { getSocialStatus, toggleFollow, sendFriendRequest, getIncomingRequests, respondToFriendRequest } from '../../store/api/social.thunk';
import { 
  User, Users, Mail, LayoutDashboard, Shield, Trophy, Activity, 
  Github, Linkedin, Instagram, Twitter, Edit2, Check, X,
  ExternalLink, Calendar, Code, Target, Award, Camera, Upload, Zap, Flame
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
    const isLoading = isOwner ? false : publicProfileLoading; // currentUser is usually already loaded

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

    // Analytics state
    const [analytics, setAnalytics] = useState(null);
    const [matchHistory, setMatchHistory] = useState([]);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    useEffect(() => {
        if (!isOwner && urlUsername) {
            dispatch(getPublicProfile(urlUsername));
            setIsEditing(false); // Can't edit someone else's profile
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

        // Basic validation
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
            // 1. Get presigned URL
            const { data } = await api.get(`/auth/profile/upload-url`, {
                params: {
                    fileName: file.name,
                    fileType: file.type
                }
            });

            const { uploadUrl, fileUrl } = data;

            // 2. Upload to Cloudflare R2
            await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            // 3. Update local state
            setFormData(prev => ({ ...prev, profilePic: fileUrl }));
            
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image. Please try again.");
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
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
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
            <div className="min-h-screen pt-24 bg-[#050505] flex justify-center">
                <div className="animate-spin text-[var(--color-primary)] mt-20">
                    <Activity size={32} />
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen pt-24 bg-[#050505] flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-bold text-gray-400 mb-4 font-mono uppercase tracking-widest">Profile Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-md">The user profile you are looking for does not exist or has been deleted.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-[var(--color-primary)] text-black font-bold font-mono uppercase tracking-widest hover:bg-white transition-all rounded-sm"
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
                <div className="flex items-center gap-3 w-full bg-[#111] p-3 rounded-lg border border-[#222]">
                    <Icon size={18} className="text-gray-400" />
                    <input 
                        type="text" 
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="bg-transparent text-sm text-gray-200 outline-none w-full"
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
                className="flex items-center justify-between p-3 rounded-lg bg-[#111] border border-[#222] hover:border-[var(--color-primary)] transition-all group"
            >
                <div className="flex items-center gap-3">
                    <Icon size={18} className="text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                    <span className="text-sm text-gray-300">{placeholder}</span>
                </div>
                <ExternalLink size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
        );
    };

    return (
        <div className="min-h-screen pt-12 pb-12 bg-[#050505] text-white selection:bg-[var(--color-primary)] selection:text-black">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Action */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="text-xl sm:text-2xl font-bold font-mono text-[var(--color-primary)] tracking-tight uppercase">PLAYER PROFILE</h1>
                    
                    {isOwner && (
                        !isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] text-gray-300 border border-[#333] hover:border-[var(--color-primary)] rounded-md transition-all text-sm font-mono uppercase tracking-wider"
                            >
                                <Edit2 size={14} /> Update
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-[#333] hover:border-red-500/30 rounded-md transition-all text-sm font-mono uppercase tracking-wider"
                                    disabled={saving}
                                >
                                    <X size={14} /> Cancel
                                </button>
                                <button 
                                    onClick={handleSubmit}
                                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[#ccff00] text-black border border-transparent rounded-md transition-all text-sm font-bold font-mono uppercase tracking-wider disabled:opacity-50"
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
                    
                    {/* LEft Col - Main Info */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Profile Card */}
                        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl overflow-hidden relative group">
                            <div className="h-32 bg-gradient-to-br from-[#111] to-[#222] relative">
                                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 MixBlendMode-overlay" />
                            </div>
                            
                            <div className="relative px-6 pb-6 text-center -mt-16">
                                <div className="inline-block relative">
                                    {isEditing ? (
                                        <div className="w-32 h-32 rounded-xl bg-[#111] border-2 border-[var(--color-primary)] mx-auto overflow-hidden relative group/avatar">
                                            {formData.profilePic ? (
                                                <img src={formData.profilePic} alt="Preview" className="w-full h-full object-cover opacity-50" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-[#111] text-gray-600">
                                                    <User size={40} />
                                                </div>
                                            )}
                                            
                                            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                                {uploading ? (
                                                    <Activity size={24} className="animate-spin text-[var(--color-primary)]" />
                                                ) : (
                                                    <>
                                                        <Camera size={24} className="text-white mb-1" />
                                                        <span className="text-[10px] font-mono text-white uppercase tracking-wider">Upload</span>
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

                                            {/* Manual URL Input Overlay (Subtle) */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1 transform translate-y-full group-hover/avatar:translate-y-0 transition-transform">
                                                <input 
                                                    type="text"
                                                    name="profilePic"
                                                    value={formData.profilePic}
                                                    onChange={handleChange}
                                                    placeholder="Or enter URL..."
                                                    className="bg-transparent text-[8px] text-center w-full outline-none text-gray-400 font-mono"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 rounded-xl bg-[#111] border-2 border-[#333] group-hover:border-[var(--color-primary)] transition-colors mx-auto overflow-hidden">
                                            {profileData.profilePic ? (
                                                <img src={profileData.profilePic} alt={profileData.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-4xl font-bold text-gray-500 uppercase">
                                                    {profileData.username?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-2 -right-2 bg-[#050505] p-1 rounded-sm border border-[#333]">
                                        <div className="bg-green-500/20 text-green-500 text-[10px] font-mono px-2 py-0.5 rounded-sm flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            ONLINE
                                        </div>
                                    </div>
                                </div>
                                
                                <h2 className="text-xl font-bold mt-4 text-white">{profileData.username}</h2>
                                <p className="text-gray-400 text-sm flex items-center justify-center gap-2 mt-1">
                                    <Mail size={12} /> {profileData.email || 'Email Protected'}
                                </p>
                                
                                <div className="mt-6 flex justify-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111] border border-[#222] rounded-full text-xs font-mono text-gray-300">
                                        <Shield size={12} className={profileData.role === 'ADMIN' ? 'text-red-500' : 'text-blue-500'} />
                                        {profileData.role}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-full text-xs font-mono text-[var(--color-primary)]">
                                        <Activity size={12} />
                                        LVL {Math.floor(profileData.rankPoints / 100)}
                                    </span>
                                </div>

                                {!isOwner && profileData && (
                                    <div className="mt-6 flex flex-col gap-2 w-full">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => dispatch(toggleFollow(profileData.id))}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all border ${
                                                    isFollowing 
                                                        ? 'bg-transparent border-[#333] text-gray-400 hover:border-red-500/50 hover:text-red-400' 
                                                        : 'bg-[var(--color-primary)] border-transparent text-black font-bold hover:shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                                                }`}
                                            >
                                                {isFollowing ? <X size={14} /> : <Zap size={14} />}
                                                {isFollowing ? 'Unfollow' : 'Follow Player'}
                                            </button>
                                            
                                            <button 
                                                onClick={() => !friendStatus && dispatch(sendFriendRequest(profileData.id))}
                                                disabled={friendStatus === 'PENDING' || friendStatus === 'ACCEPTED'}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all border ${
                                                    friendStatus === 'ACCEPTED'
                                                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                                        : friendStatus === 'PENDING'
                                                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                                                            : 'bg-[#111] border-[#333] text-gray-300 hover:border-[var(--color-primary)]'
                                                }`}
                                            >
                                                <Users size={14} />
                                                {friendStatus === 'ACCEPTED' ? 'Friends' : friendStatus === 'PENDING' ? 'Pending' : 'Add Friend'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pending Requests for Owner */}
                        {isOwner && (useSelector(state => state.social.incomingRequests) || []).length > 0 && (
                            <div className="bg-[#0a0a0a] border border-yellow-500/20 rounded-xl p-6 shadow-[0_0_20px_rgba(234,179,8,0.05)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-sm font-mono text-yellow-500 mb-4 flex items-center gap-2">
                                    <Users size={14} /> PENDING CONNECTIONS
                                </h3>
                                <div className="space-y-3">
                                    {(useSelector(state => state.social.incomingRequests) || []).map(req => (
                                        <div key={req.id} className="flex items-center justify-between p-3 bg-[#111] border border-[#222] rounded-lg group/req">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] border border-[#333] overflow-hidden">
                                                    {req.sender.profilePic ? (
                                                        <img src={req.sender.profilePic} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold bg-[#1a1a1a]">
                                                            {req.sender.username.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs font-mono text-gray-300 group-hover/req:text-[var(--color-primary)] transition-colors">{req.sender.username}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => dispatch(respondToFriendRequest({ requestId: req.id, status: 'ACCEPTED' }))}
                                                    className="p-1.5 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black transition-all border border-green-500/20"
                                                    title="Accept"
                                                >
                                                    <Check size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => dispatch(respondToFriendRequest({ requestId: req.id, status: 'REJECTED' }))}
                                                    className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-black transition-all border border-red-500/20"
                                                    title="Reject"
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
                        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
                            <h3 className="text-sm font-mono text-gray-500 mb-4 flex items-center gap-2">
                                <Users size={14} /> NETWORK PRESTIGE
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#111] p-4 rounded-xl border border-[#222] text-center group hover:border-[var(--color-primary)] transition-all">
                                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Followers</div>
                                    <div className="text-2xl font-bold font-mono text-white group-hover:text-[var(--color-primary)] transition-colors">{followersCount}</div>
                                </div>
                                <div className="bg-[#111] p-4 rounded-xl border border-[#222] text-center group hover:border-[var(--color-primary)] transition-all">
                                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Following</div>
                                    <div className="text-2xl font-bold font-mono text-white group-hover:text-[var(--color-primary)] transition-colors">{followingCount}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Col - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Radar Chart (New) */}
                        <ProfileRadarChart 
                            data={analytics?.radarData} 
                            loading={analyticsLoading} 
                        />
                        
                        {/* Stats Card (Kept but refined) */}
                        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
                            <h3 className="text-sm font-mono text-gray-500 mb-6 flex items-center gap-2">
                                <Trophy size={14} /> ARENA STANDINGS
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <div className="text-[10px] text-gray-600 uppercase font-mono">Combat Rating</div>
                                    <div className="text-3xl font-black text-[var(--color-primary)] font-mono">{profileData.rankPoints}</div>
                                    <div className="h-1 bg-[#111] rounded-full overflow-hidden">
                                        <div className="h-full bg-[var(--color-primary)]" style={{ width: `${Math.min(100, (profileData.rankPoints / 2000) * 100)}%` }} />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 col-span-2">
                                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-center">
                                        <div className="text-2xl font-black text-green-500 font-mono">{profileData.wins || 0}</div>
                                        <div className="text-[9px] text-gray-600 uppercase font-mono mt-1">Victories</div>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-center">
                                        <div className="text-2xl font-black text-blue-500 font-mono">{profileData.cyberCores || 0}</div>
                                        <div className="text-[9px] text-gray-600 uppercase font-mono mt-1">Cyber-Cores</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Flame size={16} className="text-orange-500" />
                                        <span className="text-[10px] text-gray-400 uppercase font-mono">Daily Streak</span>
                                    </div>
                                    <span className="text-sm font-black text-white font-mono">{profileData.dailyLoginStreak || 0} Days</span>
                                </div>
                                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Award size={16} className="text-purple-500" />
                                        <span className="text-[10px] text-gray-400 uppercase font-mono">Badges</span>
                                    </div>
                                    <span className="text-sm font-black text-white font-mono">{profileData.achievements?.length || 0} Earned</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5">
                                <div className="flex justify-between text-[10px] mb-2 font-mono text-gray-500 uppercase">
                                    <span>Combat Success Rate</span>
                                    <span className="text-gray-300">{winRate}%</span>
                                </div>
                                <div className="h-1.5 bg-[#111] rounded-full overflow-hidden flex">
                                    <div className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all" style={{ width: `${winRate}%` }} />
                                    <div className="h-full bg-red-500/50 flex-1" />
                                </div>
                                <div className="text-[10px] text-right text-gray-700 mt-2 font-mono italic">Total Encounters: {totalMatches}</div>
                            </div>
                        </div>

                        {/* Earned Badges Section */}
                        {(profileData.achievements?.length > 0) && (
                            <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
                                <h3 className="text-sm font-mono text-gray-500 mb-6 flex items-center gap-2">
                                    <Award size={14} /> EARNED BADGES
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {profileData.achievements.map((ach) => (
                                        <div key={ach.id} className="group relative">
                                            <div className="aspect-square bg-[#111] border border-[#222] hover:border-[var(--color-primary)]/40 transition-all p-4 flex flex-col items-center justify-center text-center gap-2" style={{ borderRadius: '4px' }}>
                                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                                                    <Trophy size={20} />
                                                </div>
                                                <span className="text-[9px] font-black text-white uppercase tracking-tighter truncate w-full">{ach.badge.name}</span>
                                            </div>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-black border border-white/10 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-center z-10 pointer-events-none shadow-2xl">
                                                <div className="text-[10px] font-black text-[var(--color-primary)] uppercase mb-1">{ach.badge.name}</div>
                                                <div className="text-[8px] text-slate-400 font-medium leading-relaxed">{ach.badge.description}</div>
                                                <div className="text-[7px] text-slate-600 uppercase mt-2">Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Match History (New) */}
                        <MatchHistory 
                            history={matchHistory} 
                            loading={analyticsLoading} 
                        />
                        
                        {/* Coding Platforms */}
                        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
                            <h3 className="text-sm font-mono text-gray-500 mb-4 flex items-center gap-2">
                                <Code size={14} /> CODING PROFILES
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
                            
                            {!isEditing && !DEPARTMENTS.some(d => profileData[d.value]) && (
                                <div className="text-center py-8 border border-dashed border-[#333] rounded-lg text-gray-500 text-sm font-mono">
                                    No coding profiles linked
                                </div>
                            )}
                        </div>

                        {/* Social Links */}
                        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
                            <h3 className="text-sm font-mono text-gray-500 mb-4 flex items-center gap-2">
                                <LayoutDashboard size={14} /> SOCIAL MEDIA
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SocialLink icon={Github} value={isEditing ? formData.github : profileData.github} placeholder="GitHub" name="github" isUrl={true} />
                                <SocialLink icon={Linkedin} value={isEditing ? formData.linkedin : profileData.linkedin} placeholder="LinkedIn" name="linkedin" isUrl={true} />
                                <SocialLink icon={Twitter} value={isEditing ? formData.twitter : profileData.twitter} placeholder="Twitter / X" name="twitter" isUrl={true} />
                                <SocialLink icon={Instagram} value={isEditing ? formData.instagram : profileData.instagram} placeholder="Instagram" name="instagram" isUrl={true} />
                            </div>

                            {!isEditing && !profileData.github && !profileData.linkedin && !profileData.twitter && !profileData.instagram && (
                                <div className="text-center py-8 border border-dashed border-[#333] rounded-lg text-gray-500 text-sm font-mono">
                                    No social networks linked
                                </div>
                            )}
                        </div>

                        {/* Security Section (Only for Owner and Non-OAuth accounts) */}
                        {isOwner && profileData.hasPassword && (
                            <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
                                <h3 className="text-sm font-mono text-gray-500 mb-4 flex items-center gap-2">
                                    <Shield size={14} /> SECURITY & AUTHENTICATION
                                </h3>

                                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                                    {passwordStatus.error && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-md font-mono">
                                            {passwordStatus.error}
                                        </div>
                                    )}
                                    {passwordStatus.success && (
                                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs p-3 rounded-md font-mono">
                                            {passwordStatus.success}
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-mono text-gray-500">Current Password</label>
                                        <input 
                                            type="password"
                                            name="oldPassword"
                                            value={passwordData.oldPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full bg-[#111] border border-[#222] rounded-md px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-mono text-gray-500">New Password</label>
                                            <input 
                                                type="password"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full bg-[#111] border border-[#222] rounded-md px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-mono text-gray-500">Confirm New</label>
                                            <input 
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full bg-[#111] border border-[#222] rounded-md px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={passwordStatus.loading}
                                        className="w-full py-2 bg-[#111] hover:bg-[#1a1a1a] text-gray-300 border border-[#333] hover:border-[var(--color-primary)] rounded-md transition-all text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2"
                                    >
                                        {passwordStatus.loading ? <Activity size={14} className="animate-spin" /> : <Shield size={14} />}
                                        Update Password
                                    </button>
                                </form>
                            </div>
                        )}
                        
                        {/* Meta Info */}
                        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl px-6 py-4 flex justify-between items-center text-xs text-gray-500 font-mono">
                            <span className="flex items-center gap-2">
                                <Calendar size={12} /> Joined {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Unknown'}
                            </span>
                            <span className="flex items-center gap-2 text-[var(--color-primary)]">
                                <Award size={12} /> ID: {profileData.id ? profileData.id.substring(0, 8) : 'N/A'}...
                            </span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
