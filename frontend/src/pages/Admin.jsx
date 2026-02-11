import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../lib/axios';

const Admin = () => {
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    timeLimitMs: 2000,
    testcases: [{ input: '', output: '', isHidden: false }]
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await axios.get('/api/problem/list');
      setProblems(response.data.problems);
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create problem
      const problemResponse = await axios.post('/api/problem/create', {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        timeLimitMs: formData.timeLimitMs
      });

      const problemId = problemResponse.data.problem.id;

      // Add test cases
      await axios.post('/api/testcase/add', {
        problemId,
        testcases: formData.testcases
      });

      // Reset form and refresh problems
      setFormData({
        title: '',
        description: '',
        difficulty: 'EASY',
        timeLimitMs: 2000,
        testcases: [{ input: '', output: '', isHidden: false }]
      });
      setShowAddForm(false);
      fetchProblems();
      
      alert('Problem created successfully!');
    } catch (error) {
      console.error('Error creating problem:', error);
      alert('Error creating problem');
    }
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testcases: [...formData.testcases, { input: '', output: '', isHidden: true }]
    });
  };

  const updateTestCase = (index, field, value) => {
    const updatedTestcases = [...formData.testcases];
    updatedTestcases[index][field] = value;
    setFormData({ ...formData, testcases: updatedTestcases });
  };

  const removeTestCase = (index) => {
    if (formData.testcases.length > 1) {
      setFormData({
        ...formData,
        testcases: formData.testcases.filter((_, i) => i !== index)
      });
    }
  };

  // Check if user is admin
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Problem Management</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          >
            Add New Problem
          </button>
        </div>

        {/* Problems List */}
        <div className="grid gap-4 mb-8">
          {problems.map((problem) => (
            <div key={problem.id} className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{problem.title}</h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
                    problem.difficulty === 'EASY' ? 'bg-green-900 text-green-300' :
                    problem.difficulty === 'MEDIUM' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-red-900 text-red-300'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm">
                    Edit
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Problem Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add New Problem</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Time Limit (ms)</label>
                    <input
                      type="number"
                      value={formData.timeLimitMs}
                      onChange={(e) => setFormData({ ...formData, timeLimitMs: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium">Test Cases</label>
                    <button
                      type="button"
                      onClick={addTestCase}
                      className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                    >
                      Add Test Case
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.testcases.map((testcase, index) => (
                      <div key={index} className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">Test Case {index + 1}</h4>
                          {formData.testcases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTestCase(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Input</label>
                            <textarea
                              value={testcase.input}
                              onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-20"
                              placeholder="Test input..."
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Output</label>
                            <textarea
                              value={testcase.output}
                              onChange={(e) => updateTestCase(index, 'output', e.target.value)}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-20"
                              placeholder="Expected output..."
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`hidden-${index}`}
                            checked={testcase.isHidden}
                            onChange={(e) => updateTestCase(index, 'isHidden', e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor={`hidden-${index}`} className="text-sm text-gray-400">
                            Hidden test case (not visible to users)
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
                  >
                    Create Problem
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
