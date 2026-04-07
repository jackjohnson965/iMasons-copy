import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useRole } from '../context/RoleContext';
import Skeleton from '../components/Skeleton';

const inputCls = 'w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors';
const labelCls = 'block text-sm font-medium text-white/50 mb-1.5';

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
  const [pageLoading, setPageLoading] = useState(isEdit);
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
      }).catch(() => setError('Failed to load posting')).finally(() => setPageLoading(false));
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
    <div className="min-h-screen bg-brand-dark">
      {/* Page header */}
      <section className="bg-gradient-to-r from-brand-purple-dark/40 via-brand-dark to-brand-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-brand-cyan text-xs font-semibold uppercase tracking-[0.2em] mb-1">Employer</p>
          <h1 className="text-3xl font-black text-white">
            {isEdit ? 'Edit Job Posting' : 'Create Job Posting'}
          </h1>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {pageLoading ? (
          <div className="bg-brand-dark-card border border-white/[0.06] rounded-2xl p-8 space-y-5">
            <Skeleton.Line w="w-48" h="h-5" />
            <Skeleton.Line w="w-full" h="h-10" />
            <Skeleton.Line w="w-48" h="h-5" />
            <Skeleton.Line w="w-full" h="h-28" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton.Line w="w-full" h="h-10" />
              <Skeleton.Line w="w-full" h="h-10" />
            </div>
            <Skeleton.Line w="w-full" h="h-10" />
            <Skeleton.Line w="w-full" h="h-12" className="rounded-lg" />
          </div>
        ) : (
          <div className="bg-brand-dark-card border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-teal" />
            <div className="p-8">
              {error && (
                <div className="bg-accent-rose/10 border border-accent-rose/30 text-accent-rose p-3 rounded-lg mb-6 text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
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

                {/* Custom questions */}
                {!isEdit && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className={labelCls + ' mb-0'}>Custom Questions</label>
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="text-sm text-brand-cyan hover:text-white font-medium transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Question
                      </button>
                    </div>
                    {questions.length > 0 ? (
                      <div className="space-y-2">
                        {questions.map((q, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-xs text-white/25 font-mono w-6 text-right shrink-0">{i + 1}.</span>
                            <input
                              value={q}
                              onChange={(e) => updateQuestion(i, e.target.value)}
                              className={`flex-1 ${inputCls}`}
                              placeholder={`Question ${i + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeQuestion(i)}
                              className="text-accent-rose/50 hover:text-accent-rose p-1 transition-colors shrink-0"
                              aria-label="Remove question"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/20 text-sm">No custom questions added yet.</p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-purple hover:bg-brand-purple-light text-white py-3 px-4 rounded-lg disabled:opacity-50 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {loading ? 'Saving...' : isEdit ? 'Update Posting' : 'Create Posting'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
