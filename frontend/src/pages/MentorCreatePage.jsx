import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useRole } from '../context/RoleContext';

export default function MentorCreatePage() {
  const navigate = useNavigate();
  const { userId } = useRole();

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    industry: '',
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addQuestion = () => setQuestions([...questions, '']);
  const removeQuestion = (i) => setQuestions(questions.filter((_, idx) => idx !== i));
  const updateQuestion = (i, value) => {
    const updated = [...questions];
    updated[i] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/mentors', {
        ...form,
        employerId: userId,
        status: 'active',
        customQuestions: questions
          .filter((q) => q.trim())
          .map((q, i) => ({ questionText: q, questionOrder: i })),
      });
      navigate(`/employer/dashboard/${userId}`);
    } catch (err) {
      setError(err.data?.detail || 'Failed to save mentorship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create Mentorship Posting
      </h1>
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mentorship Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="e.g., Frontend Mentorship"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Describe the mentorship, expected time commitment, and any prerequisites..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., Remote or Dallas, TX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <input
              name="industry"
              value={form.industry}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., Technology, Finance"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Custom Questions</label>
            <button
              type="button"
              onClick={addQuestion}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              + Add Question
            </button>
          </div>
          {questions.map((q, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                value={q}
                onChange={(e) => updateQuestion(i, e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder={`Question ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => removeQuestion(i)}
                className="text-red-500 hover:text-red-700 px-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Saving...' : 'Create Mentorship'}
        </button>
      </form>
    </div>
  );
}
