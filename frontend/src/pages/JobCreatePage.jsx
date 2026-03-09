import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useRole } from '../context/RoleContext';

const inputCls = 'w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors';
const labelCls = 'block text-sm font-medium text-white/60 mb-1';

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
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">
        {isEdit ? 'Edit Job Posting' : 'Create Job Posting'}
      </h1>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Job Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className={inputCls}
            placeholder="e.g., Software Engineering Intern"
          />
        </div>
        <div>
          <label className={labelCls}>Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={6}
            className={inputCls}
            placeholder="Describe the role, responsibilities, and requirements..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className={inputCls}
              placeholder="e.g., Dallas, TX"
            />
          </div>
          <div>
            <label className={labelCls}>Job Type *</label>
            <select
              name="jobType"
              value={form.jobType}
              onChange={handleChange}
              className={inputCls}
            >
              <option value="internship" className="bg-brand-dark-elevated">Internship</option>
              <option value="full-time" className="bg-brand-dark-elevated">Full Time</option>
              <option value="part-time" className="bg-brand-dark-elevated">Part Time</option>
              <option value="mentorship" className="bg-brand-dark-elevated">Mentorship</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Industry</label>
          <input
            name="industry"
            value={form.industry}
            onChange={handleChange}
            className={inputCls}
            placeholder="e.g., Technology, Finance"
          />
        </div>

        {!isEdit && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls}>Custom Questions</label>
              <button
                type="button"
                onClick={addQuestion}
                className="text-sm text-brand-cyan hover:text-white font-medium transition-colors"
              >
                + Add Question
              </button>
            </div>
            {questions.map((q, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={q}
                  onChange={(e) => updateQuestion(i, e.target.value)}
                  className={`flex-1 ${inputCls}`}
                  placeholder={`Question ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="text-red-400/70 hover:text-red-400 px-2 transition-colors text-sm"
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
          className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white py-2.5 px-4 rounded-lg disabled:opacity-50 font-semibold transition-colors"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Posting' : 'Create Posting'}
        </button>
      </form>
    </div>
  );
}
