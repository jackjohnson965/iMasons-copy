import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useRole } from '../context/RoleContext';

const inputCls = 'w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors';
const labelCls = 'block text-sm font-medium text-white/60 mb-1';

export default function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setUserId } = useRole();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
    skills: '',
    resumeLink: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      api.get(`/students/${id}`).then(setForm).catch(() => setError('Failed to load profile'));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await api.put(`/students/${id}`, form);
        navigate(`/student/dashboard/${id}`);
      } else {
        const student = await api.post('/students', form);
        setUserId(student.id);
        navigate(`/student/dashboard/${student.id}`);
      }
    } catch (err) {
      setError(err.data?.detail || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">
        {isEdit ? 'Edit Profile' : 'Create Student Profile'}
      </h1>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>First Name *</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Last Name *</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} required className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            className={inputCls}
            placeholder="Tell employers about yourself..."
          />
        </div>
        <div>
          <label className={labelCls}>Location</label>
          <input name="location" value={form.location} onChange={handleChange} className={inputCls} placeholder="e.g., Dallas, TX" />
        </div>
        <div>
          <label className={labelCls}>Skills</label>
          <input name="skills" value={form.skills} onChange={handleChange} className={inputCls} placeholder="e.g., Python, React, SQL (comma-separated)" />
        </div>
        <div>
          <label className={labelCls}>Resume Link</label>
          <input name="resumeLink" value={form.resumeLink} onChange={handleChange} className={inputCls} placeholder="Link to your resume (Google Drive, etc.)" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>LinkedIn</label>
            <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>GitHub</label>
            <input name="githubUrl" value={form.githubUrl} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Portfolio</label>
            <input name="portfolioUrl" value={form.portfolioUrl} onChange={handleChange} className={inputCls} />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white py-2.5 px-4 rounded-lg disabled:opacity-50 font-semibold transition-colors"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
}
