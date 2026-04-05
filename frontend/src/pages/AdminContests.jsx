import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../lib/axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Plus, Search, Calendar, Clock, Trophy, 
  ChevronRight, ArrowLeft, Loader2, Target, Activity, Check 
} from 'lucide-react';

const AdminContests = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: ''
  });

  const [availableProblems, setAvailableProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [showProblemModal, setShowProblemModal] = useState(false);
  const [handlingProblem, setHandlingProblem] = useState(false);
  const [problemForm, setProblemForm] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    reward: 50,
    testCode: '',
    testcases: [{ input: '', output: '', isHidden: false }]
  });

  // Contest monitoring state
  const [activeContests, setActiveContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [monitoringLoading, setMonitoringLoading] = useState(false);

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    setHandlingProblem(true);
    try {
      // Use standard problem creation endpoint exactly like Admin.jsx
      const pRes = await axiosInstance.post('/problem/create', {
        title: problemForm.title,
        description: problemForm.description,
        difficulty: problemForm.difficulty,
        reward: parseInt(problemForm.reward),
        testCode: problemForm.testCode
      });
      const problemId = pRes.data.problem.id;
      
      await axiosInstance.post('/testcase/add', {
        problemId,
        testcases: problemForm.testcases
      });

      // Inject dynamically into main contest form available pool and select it
      const newLocalProblem = {
        id: problemId,
        title: problemForm.title,
        difficulty: problemForm.difficulty,
        reward: problemForm.reward
      };
      
      setAvailableProblems(prev => [newLocalProblem, ...prev]);
      setSelectedProblems(prev => [...prev, problemId]);

      setShowProblemModal(false);
      setProblemForm({
        title: '', description: '', difficulty: 'EASY', reward: 50, testCode: '',
        testcases: [{ input: '', output: '', isHidden: false }]
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create problem.');
    } finally {
      setHandlingProblem(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    const fetchProblems = async () => {
      try {
        const res = await axiosInstance.get('/problem/list');
        setAvailableProblems(res.data.problems || []);
      } catch (err) {
        console.error("Failed to load problems", err);
      }
    };
    
    fetchProblems();
  }, [user, navigate]);

  const toggleProblemSelection = (problemId) => {
    setSelectedProblems(prev => 
      prev.includes(problemId) 
        ? prev.filter(id => id !== problemId)
        : [...prev, problemId]
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Use selected array
    const formattedProblemIds = selectedProblems;

    if (formattedProblemIds.length === 0) {
      toast.error('Security Exception: You must select at least 1 problem for the contest.');
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post('/contest/create', {
        title: formData.title,
        description: formData.description,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        problemIds: formattedProblemIds
      });

      setMessage("Contest created successfully.");
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: ''
      });
      setSelectedProblems([]);
      setTimeout(() => navigate('/contests'), 2000);
    } catch (error) {
      console.error('Error creating contest:', error);
      toast.error('Failed to create contest. Please check the problem IDs.');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveContests = async () => {
    try {
      const res = await axiosInstance.get('/contest/list');
      const active = res.data.contests.filter(c => c.status === 'ACTIVE');
      setActiveContests(active);
    } catch (err) {
      console.error("Failed to load active contests", err);
    }
  };

  const loadContestParticipants = async (contestId) => {
    setMonitoringLoading(true);
    try {
      const res = await axiosInstance.get(`/contest/${contestId}/participants`);
      setParticipants(res.data.participants);
      setSelectedContest(contestId);
    } catch (err) {
      console.error("Failed to load participants", err);
      toast.error("Failed to load participants");
    } finally {
      setMonitoringLoading(false);
    }
  };

  const disqualifyParticipant = async (contestId, userId) => {
    try {
      await axiosInstance.post(`/contest/${contestId}/disqualify/${userId}`);
      toast.success("Participant disqualified");
      // Reload participants
      loadContestParticipants(contestId);
    } catch (err) {
      console.error("Failed to disqualify participant", err);
      toast.error("Failed to disqualify participant");
    }
  };

  useEffect(() => {
    loadActiveContests();
  }, []);

  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)] text-[var(--color-text-main)] py-20 px-6 font-[family:var(--font-body)]">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-[var(--color-primary)] opacity-[0.015] blur-[150px] rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-[10px] font-black tracking-[0.6em] text-[var(--color-primary)] uppercase mb-6 flex gap-6 items-center">
              <Activity size={12} />
              Command Center // Contests
              <Link to="/admin" className="text-[var(--color-text-main)]/40 hover:text-[var(--color-primary)] transition-all flex items-center gap-2 group">
                <ArrowLeft size={10} className="group-hover:-translate-x-1 transition-transform" />
                Back to Admin
              </Link>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-[var(--color-text-main)] tracking-tighter uppercase leading-[0.85]">
              Contest<br/>Management
            </h1>
          </motion.div>
          
          <div className="flex items-center gap-8 py-4 px-8 border border-white/5 bg-white/[0.02] font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
             <div className="flex flex-col items-end gap-1">
                <span>Available Problems</span>
                <span className="text-[var(--color-text-main)] font-black">{availableProblems.length}</span>
             </div>
             <div className="h-8 w-[1px] bg-white/10" />
             <div className="flex flex-col items-end gap-1">
                <span>Status</span>
                <span className="text-emerald-500 font-black">ADMIN</span>
             </div>
          </div>
        </div>

        <div className="premium-card p-10" style={{ borderRadius: "2px" }}>
          <div className="text-[10px] font-bold tracking-[0.4em] text-[var(--color-primary)] uppercase mb-8">
            Create New Contest
          </div>

          {message && (
             <div className="mb-8 border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 text-[var(--color-success)] p-6 text-[10px] font-bold uppercase tracking-widest text-center" style={{ borderRadius: "2px" }}>
               ✓ {message}
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Event Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[var(--color-bg-dark)] border border-white/10 px-4 py-3 text-[var(--color-text-main)] font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
                style={{ borderRadius: "2px" }}
                placeholder="Weekly Global Cup #4"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Manifest Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-[var(--color-bg-dark)] border border-white/10 px-4 py-3 text-[var(--color-text-main)] font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm h-32"
                style={{ borderRadius: "2px" }}
                placeholder="Standard isolated contest parameters. Penalty enabled."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">T-Minus Start Sequence (Local Time)</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full bg-[var(--color-bg-dark)] border border-white/10 px-4 py-3 text-gray-300 font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
                  style={{ borderRadius: "2px" }}
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Event Termination</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full bg-[var(--color-bg-dark)] border border-white/10 px-4 py-3 text-gray-300 font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
                  style={{ borderRadius: "2px" }}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                 <div className="flex gap-4 items-center">
                   <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Target Vectors</label>
                   <span className="text-[9px] font-black text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 border border-[var(--color-primary)]/20 uppercase tracking-widest">{selectedProblems.length} Selected</span>
                 </div>
                 <button 
                   type="button" 
                   onClick={() => setShowProblemModal(true)}
                   className="text-[9px] font-black uppercase tracking-[0.3em] text-black bg-[var(--color-primary)] px-6 py-2 hover:bg-white transition-all transform active:scale-95 flex items-center gap-2 group"
                   style={{ borderRadius: "2px" }}
                 >
                   <Plus size={12} className="group-hover:rotate-90 transition-transform" />
                   Create Custom Problem
                 </button>
              </div>
              
              <div className="w-full bg-[var(--color-bg-dark)] border border-white/10 p-3 transition-all text-sm h-56 overflow-y-auto" style={{ borderRadius: "2px" }}>
                {availableProblems.map(p => (
                   <div 
                     key={p.id}
                     onClick={() => toggleProblemSelection(p.id)}
                     className={`cursor-pointer flex items-center justify-between p-4 mb-3 transition-all ${selectedProblems.includes(p.id) ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/50' : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]'}`}
                     style={{ borderRadius: "2px" }}
                   >
                     <div>
                       <div className={`text-xs font-bold uppercase tracking-wider ${selectedProblems.includes(p.id) ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-main)]'}`}>{p.title}</div>
                       <div className="text-[9px] text-gray-500 font-mono mt-1">{p.difficulty} • {p.reward} pts</div>
                     </div>
                     <div className={`flex items-center justify-center w-5 h-5 rounded-sm border transition-all ${selectedProblems.includes(p.id) ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-gray-600 bg-black/20'}`}>
                        {selectedProblems.includes(p.id) && <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                     </div>
                   </div>
                ))}
                {availableProblems.length === 0 && (
                   <div className="text-center py-12 text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest flex flex-col items-center gap-4">
                     <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                     Parsing Database Vectors...
                   </div>
                )}
              </div>
            </div>

            <div className="pt-10 border-t border-white/5">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full py-6 bg-[var(--color-primary)] text-black font-black uppercase tracking-[0.5em] text-[11px] hover:brightness-110 transition-all overflow-hidden disabled:opacity-50"
                style={{ borderRadius: "2px" }}
              >
                <div className="relative z-10 flex items-center justify-center gap-4">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Target size={16} />}
                  {loading ? "Creating Contest..." : "Create Contest"}
                </div>
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CONTEST MONITORING SECTION */}
      <div className="max-w-7xl mx-auto mt-20">
        <div className="premium-card p-10" style={{ borderRadius: "2px" }}>
          <div className="text-[10px] font-bold tracking-[0.4em] text-[var(--color-primary)] uppercase mb-8">
            Contest Monitoring & Enforcement
          </div>

          {/* Active Contests Selector */}
          <div className="mb-8">
            <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Select Active Contest</label>
            <select
              value={selectedContest || ''}
              onChange={(e) => {
                const contestId = e.target.value;
                if (contestId) {
                  loadContestParticipants(contestId);
                } else {
                  setSelectedContest(null);
                  setParticipants([]);
                }
              }}
              className="w-full bg-[var(--color-bg-dark)] border border-white/10 px-4 py-3 text-[var(--color-text-main)] font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all"
              style={{ borderRadius: "2px" }}
            >
              <option value="">Choose a contest to monitor...</option>
              {activeContests.map(contest => (
                <option key={contest.id} value={contest.id}>
                  {contest.title} ({contest._count?.participants || 0} participants)
                </option>
              ))}
            </select>
          </div>

          {/* Participants Table */}
          {selectedContest && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--color-text-main)] uppercase tracking-wider">
                Participants & Tab Switch Monitoring
              </h3>
              
              {monitoringLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-[var(--color-primary)]" size={24} />
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map(participant => (
                    <div 
                      key={participant.id}
                      className={`p-4 border transition-all ${
                        participant.disqualified 
                          ? 'border-red-500/50 bg-red-500/5' 
                          : (participant.tabSwitchCount || 0) > 5
                          ? 'border-yellow-500/50 bg-yellow-500/5'
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                      style={{ borderRadius: "2px" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center text-xs font-bold text-[var(--color-primary)]">
                            {participant.user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-[var(--color-text-main)]">
                              {participant.user.username}
                              {participant.disqualified && (
                                <span className="ml-2 text-xs text-red-500 font-bold uppercase tracking-wider">
                                  DISQUALIFIED
                                </span>
                              )}
                              {(participant.tabSwitchCount || 0) > 5 && !participant.disqualified && (
                                <span className="ml-2 text-xs text-yellow-500 font-bold uppercase tracking-wider">
                                  HIGH TAB SWITCHES
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[var(--color-text-muted)] font-mono">
                              Score: {participant.score} | Penalties: {Math.floor(participant.penaltyMs / 60000)}min | Tab Switches: {participant.tabSwitchCount || 0}
                            </div>
                          </div>
                        </div>
                        
                        {!participant.disqualified && (
                          <button
                            onClick={() => disqualifyParticipant(selectedContest, participant.userId)}
                            className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-500/30 transition-all"
                            style={{ borderRadius: "2px" }}
                          >
                            Disqualify
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CUSTOM PROBLEM OVERLAY MODAL */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative max-w-4xl w-full premium-card p-10 shadow-2xl my-auto" style={{ borderRadius: "2px" }}>
            <div className="flex justify-between items-start mb-8">
              <div className="text-[10px] font-bold tracking-[0.4em] text-[var(--color-primary)] uppercase">
                Create Custom Problem
              </div>
              <button 
                onClick={() => setShowProblemModal(false)}
                className="text-[var(--color-text-main)] hover:text-red-500 font-bold px-2 py-1 text-xs uppercase"
              >
                [X] Abort
              </button>
            </div>
            
            <form onSubmit={handleCreateProblem} className="space-y-6">
              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Target Title</label>
                <input
                  type="text"
                  value={problemForm.title}
                  onChange={(e) => setProblemForm({...problemForm, title: e.target.value})}
                  className="w-full bg-[var(--color-bg-dark)] border border-white/10 px-4 py-3 text-[var(--color-text-main)] focus:border-[var(--color-primary)]/40 transition-all text-sm"
                  style={{ borderRadius: "2px" }}
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Manifest Description</label>
                <textarea
                  value={problemForm.description}
                  onChange={(e) => setProblemForm({...problemForm, description: e.target.value})}
                  className="w-full bg-[var(--color-bg-dark)] border border-white/10 px-4 py-3 text-[var(--color-text-main)] focus:border-[var(--color-primary)]/40 transition-all text-sm h-24"
                  style={{ borderRadius: "2px" }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Complexity</label>
                  <select
                    value={problemForm.difficulty}
                    onChange={(e) => setProblemForm({...problemForm, difficulty: e.target.value})}
                    className="w-full bg-[var(--color-bg-dark)] border border-white/10 px-4 py-3 text-[var(--color-text-main)] focus:border-[var(--color-primary)]/40 transition-all text-sm"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Bounty Payout</label>
                  <input
                    type="number"
                    value={problemForm.reward}
                    onChange={(e) => setProblemForm({...problemForm, reward: e.target.value})}
                    className="w-full bg-[var(--color-bg-dark)] border border-white/10 px-4 py-3 text-[var(--color-text-main)] focus:border-[var(--color-primary)]/40 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Validation Logic (.js)</label>
                <textarea
                  value={problemForm.testCode}
                  onChange={(e) => setProblemForm({...problemForm, testCode: e.target.value})}
                  className="w-full bg-[var(--color-bg-dark)] border border-white/10 px-4 py-5 text-[var(--color-primary)] font-mono focus:border-[var(--color-primary)]/40 transition-all text-xs h-32"
                  placeholder="// Test cases execution logic"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={handlingProblem}
                  className="w-full py-4 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all transform active:scale-95 disabled:opacity-50"
                  style={{ borderRadius: "2px" }}
                >
                  {handlingProblem ? "Encrypting..." : "Authorize Extraction & Inject UUID"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminContests;
