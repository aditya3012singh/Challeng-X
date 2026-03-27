import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../lib/axios';
import { useNavigate, Link } from 'react-router-dom';

const AdminContests = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    problemIds: '' // Commma separated
  });

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

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    setHandlingProblem(true);
    try {
      // Use standard problem creation endpoint exactly like Admin.jsx
      const pRes = await axiosInstance.post('/api/problem/create', {
        title: problemForm.title,
        description: problemForm.description,
        difficulty: problemForm.difficulty,
        reward: parseInt(problemForm.reward),
        testCode: problemForm.testCode
      });
      const problemId = pRes.data.problem.id;
      
      await axiosInstance.post('/api/testcase/add', {
        problemId,
        testcases: problemForm.testcases
      });

      // Inject dynamically into main contest form
      setFormData(prev => ({
        ...prev,
        problemIds: prev.problemIds ? `${prev.problemIds}, ${problemId}` : problemId
      }));

      setShowProblemModal(false);
      setProblemForm({
        title: '', description: '', difficulty: 'EASY', reward: 50, testCode: '',
        testcases: [{ input: '', output: '', isHidden: false }]
      });
    } catch (err) {
      console.error(err);
      alert('Security Exception: Failed to generate custom problem payload.');
    } finally {
      setHandlingProblem(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

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

    // Parse problem IDs
    const formattedProblemIds = formData.problemIds
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    try {
      await axiosInstance.post('/contest/create', {
        title: formData.title,
        description: formData.description,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        problemIds: formattedProblemIds
      });

      setMessage("Protocol Authorized: Contest Scheduled.");
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        problemIds: ''
      });
      setTimeout(() => navigate('/contests'), 2000);
    } catch (error) {
      console.error('Error creating contest:', error);
      alert('Security Exception: Failed to create contest. Check if problem IDs are valid UUIDs.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--color-text-main)] py-20 px-6 font-[family:var(--font-body)]">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-[var(--color-primary)] opacity-[0.015] blur-[150px] rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-end mb-16">
          <div>
            <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4 flex gap-6 items-center">
              <span>Command Center // Tournaments</span>
              <Link to="/admin" className="text-white hover:text-[var(--color-primary)] transition-colors underline underline-offset-4 decoration-white/20">← Manage Problems</Link>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)]">Contest Operations</h1>
          </div>
        </div>

        <div className="premium-card p-10" style={{ borderRadius: "2px" }}>
          <div className="text-[10px] font-bold tracking-[0.4em] text-[var(--color-primary)] uppercase mb-8">
            Deploy New Contest Event
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
                className="w-full bg-[#050505] border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
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
                className="w-full bg-[#050505] border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm h-32"
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
                  className="w-full bg-[#050505] border border-white/10 px-4 py-3 text-gray-300 font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
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
                  className="w-full bg-[#050505] border border-white/10 px-4 py-3 text-gray-300 font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
                  style={{ borderRadius: "2px" }}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                 <div className="flex gap-2 items-center">
                   <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Target Vectors (Problem IDs)</label>
                   <span className="text-[8px] tracking-widest font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">COMMA SEPARATED</span>
                 </div>
                 <button 
                   type="button" 
                   onClick={() => setShowProblemModal(true)}
                   className="text-[9px] font-bold uppercase tracking-widest text-[#050505] bg-[var(--color-primary)] px-3 py-1 hover:bg-white transition-colors"
                   style={{ borderRadius: "2px" }}
                 >
                   🚀 Create Custom Problem
                 </button>
              </div>
              <textarea
                name="problemIds"
                value={formData.problemIds}
                onChange={handleChange}
                className="w-full bg-[#050505] border border-white/10 px-4 py-5 text-[var(--color-primary)] font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-xs h-32 leading-relaxed"
                style={{ borderRadius: "2px" }}
                placeholder="550e8400-e29b-41d4-a716-446655440000, 7f8h9j2k-qwer-4567-zxcv-987poiu1234..."
                required
              />
               <p className="text-[8px] text-gray-600 mt-2">You can copy Problem UUIDs directly from the "Manage Problems" matrix.</p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all transform active:scale-95 shadow-xl disabled:opacity-50"
                style={{ borderRadius: "2px" }}
              >
                {loading ? "Transmitting..." : "Authorize Contest Deployment"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CUSTOM PROBLEM OVERLAY MODAL */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative max-w-4xl w-full premium-card p-10 shadow-2xl my-auto" style={{ borderRadius: "2px" }}>
            <div className="flex justify-between items-start mb-8">
              <div className="text-[10px] font-bold tracking-[0.4em] text-[var(--color-primary)] uppercase">
                Inject Custom Protocol
              </div>
              <button 
                onClick={() => setShowProblemModal(false)}
                className="text-white hover:text-red-500 font-bold px-2 py-1 text-xs uppercase"
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
                  className="w-full bg-[#050505] border border-white/10 px-4 py-3 text-white focus:border-[var(--color-primary)]/40 transition-all text-sm"
                  style={{ borderRadius: "2px" }}
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Manifest Description</label>
                <textarea
                  value={problemForm.description}
                  onChange={(e) => setProblemForm({...problemForm, description: e.target.value})}
                  className="w-full bg-[#050505] border border-white/10 px-4 py-3 text-white focus:border-[var(--color-primary)]/40 transition-all text-sm h-24"
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
                    className="w-full bg-[#050505] border border-white/10 px-4 py-3 text-white focus:border-[var(--color-primary)]/40 transition-all text-sm"
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
                    className="w-full bg-[#050505] border border-white/10 px-4 py-3 text-white focus:border-[var(--color-primary)]/40 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Validation Logic (.js)</label>
                <textarea
                  value={problemForm.testCode}
                  onChange={(e) => setProblemForm({...problemForm, testCode: e.target.value})}
                  className="w-full bg-[#050505] border border-white/10 px-4 py-5 text-[var(--color-primary)] font-mono focus:border-[var(--color-primary)]/40 transition-all text-xs h-32"
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
