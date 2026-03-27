import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../lib/axios';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [editingProblem, setEditingProblem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    reward: 50,
    testCode: '',
    testcases: [{ input: '', output: '', isHidden: false }]
  });

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchProblems();
  }, [user, navigate]);

  const fetchProblems = async () => {
    try {
      const response = await axios.get('/api/problem/list');
      setProblems(response.data.problems);
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProblem) {
        // Update logic would go here if implemented
        alert('Update functionality not yet fully implemented in this node.');
      } else {
        const problemResponse = await axios.post('/api/problem/create', {
          title: formData.title,
          description: formData.description,
          difficulty: formData.difficulty,
          reward: parseInt(formData.reward),
          testCode: formData.testCode
        });

        const problemId = problemResponse.data.problem.id;

        await axios.post('/api/testcase/add', {
          problemId,
          testcases: formData.testcases
        });

        alert('Protocol Authorized: New problem record established.');
      }

      setFormData({
        title: '',
        description: '',
        difficulty: 'EASY',
        reward: 50,
        testCode: '',
        testcases: [{ input: '', output: '', isHidden: false }]
      });
      setEditingProblem(null);
      fetchProblems();
    } catch (error) {
      console.error('Error:', error);
      alert('Security Exception: Failed to commit record.');
    }
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem);
    setFormData({
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      reward: problem.reward || 50,
      testCode: problem.testCode || '',
      testcases: problem.testcases || [{ input: '', output: '', isHidden: false }]
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Authorize Purge: Are you sure you want to permanently delete this protocol record?')) {
      try {
        await axios.delete(`/api/problem/${id}`);
        fetchProblems();
      } catch (error) {
        console.error('Error deleting problem:', error);
        alert('Purge Failed: Record protected or network failure.');
      }
    }
  };

  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--color-text-main)] py-20 px-6 font-[family:var(--font-body)]">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-[var(--color-primary)] opacity-[0.015] blur-[150px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-end mb-20">
          <div>
            <div className="text-[10px] font-bold tracking-[0.6em] text-[var(--color-primary)] uppercase mb-4 flex gap-6 items-center">
              <span>Command Center // Oversight</span>
              <a href="/admin-contests" className="text-white hover:text-[var(--color-primary)] transition-colors underline underline-offset-4 decoration-white/20">Manage Contests →</a>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase font-[family:var(--font-heading)]">Dataset Management</h1>
          </div>
          <div className="flex gap-12 text-right">
            <div>
              <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mb-1">Total Problems</p>
              <p className="text-3xl font-black text-white tabular-nums">{problems.length}</p>
            </div>
            <div className="border-l border-white/10 pl-12">
              <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mb-1">Active Protocols</p>
              <p className="text-3xl font-black text-[var(--color-primary)] tabular-nums">LIVE</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* PROBLEM FORM */}
          <div className="lg:col-span-5">
            <div className="premium-card p-10 sticky top-24" style={{ borderRadius: "2px" }}>
              <div className="text-[10px] font-bold tracking-[0.4em] text-[var(--color-primary)] uppercase mb-8">
                {editingProblem ? "Edit Record" : "New Entry Protocol"}
              </div>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Target Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-[#050505] border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
                    style={{ borderRadius: "2px" }}
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
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Complexity</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="w-full bg-[#050505] border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm appearance-none"
                      style={{ borderRadius: "2px" }}
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
                      name="reward"
                      value={formData.reward}
                      onChange={handleChange}
                      className="w-full bg-[#050505] border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-sm"
                      style={{ borderRadius: "2px" }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">Validation Logic (.js)</label>
                  <textarea
                    name="testCode"
                    value={formData.testCode}
                    onChange={handleChange}
                    className="w-full bg-[#050505] border border-white/10 px-4 py-5 text-[var(--color-primary)] font-mono focus:outline-none focus:border-[var(--color-primary)]/40 transition-all text-xs h-64 leading-relaxed"
                    style={{ borderRadius: "2px" }}
                    placeholder="// Test cases execution logic"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-[var(--color-primary)] text-black font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all transform active:scale-95 shadow-xl"
                    style={{ borderRadius: "2px" }}
                  >
                    {editingProblem ? "Commit Changes" : "Authorize Addition"}
                  </button>
                  {editingProblem && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProblem(null);
                        setFormData({
                          title: '',
                          description: '',
                          difficulty: 'EASY',
                          reward: 50,
                          testCode: '',
                          testcases: [{ input: '', output: '', isHidden: false }]
                        });
                      }}
                      className="px-6 py-4 border border-white/10 text-slate-500 font-bold uppercase tracking-widest text-[9px] hover:text-white transition-colors"
                      style={{ borderRadius: "2px" }}
                    >
                      Abort
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* PROBLEM LIST */}
          <div className="lg:col-span-7">
            <div className="premium-card overflow-hidden" style={{ borderRadius: "2px" }}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="py-6 px-8 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">Protocol</th>
                    <th className="py-6 px-8 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">Complexity</th>
                    <th className="py-6 px-8 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem) => (
                    <tr key={problem.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors group">
                      <td className="py-6 px-8">
                        <p className="text-white font-bold text-sm mb-1">{problem.title}</p>
                        <p className="text-[9px] text-slate-600 font-mono">ID: {problem.id}</p>
                      </td>
                      <td className="py-6 px-8">
                        <span className={`text-[10px] font-bold px-3 py-1 border ${problem.difficulty === 'EASY' ? 'border-emerald-500/20 text-emerald-500' :
                          problem.difficulty === 'MEDIUM' ? 'border-amber-500/20 text-amber-500' :
                            'border-red-500/20 text-red-500'
                          }`} style={{ borderRadius: "1px" }}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex justify-end gap-6">
                          <button
                            onClick={() => handleEdit(problem)}
                            className="text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                          >
                            Modify
                          </button>
                          <button
                            onClick={() => handleDelete(problem.id)}
                            className="text-[9px] font-bold text-red-900 hover:text-red-500 uppercase tracking-widest transition-colors"
                          >
                            Purge
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {problems.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-20 text-center text-slate-700 text-[10px] font-bold uppercase tracking-widest">
                        No active protocols found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
