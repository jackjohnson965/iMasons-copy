import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useRole } from '../context/RoleContext';

export default function JobCreatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useRole();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'internship',
    industry: '',
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      api.get(`/job-postings/${id}`).then((data) => {
        setForm({
          title: data.title,
          description: data.description,
          location: data.location,
          jobType: data.jobType,
          industry: data.industry,
        });
        setQuestions(data.customQuestions?.map((q) => q.questionText) || []);
      }).catch(() => setError('Failed to load posting'));
    }
  }, [id, isEdit]);

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
      if (isEdit) {
        await api.put(`/job-postings/${id}`, form);
      } else {
        await api.post('/job-postings', {
          ...form,
          employerId: userId,
          customQuestions: questions
            .filter((q) => q.trim())
            .map((q, i) => ({ questionText: q, questionOrder: i })),
        });
      }
      navigate(`/employer/dashboard/${userId}`);
    } catch (err) {
      setError(err.data?.detail || 'Failed to save posting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Job Posting' : 'Create Job Posting'}
      </h1>
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="e.g., Software Engineering Intern"
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
            placeholder="Describe the role, responsibilities, and requirements..."
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
              placeholder="e.g., Dallas, TX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
            <select
              name="jobType"
              value={form.jobType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="internship">Internship</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="mentorship">Mentorship</option>
            </select>
          </div>
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

        {!isEdit && (
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
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Posting' : 'Create Posting'}
        </button>
      </form>
    </div>
  );
}
