import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useRole } from '../context/RoleContext';
import Skeleton from '../components/Skeleton';

const inputCls = 'w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors';
const labelCls = 'block text-sm font-medium text-white/50 mb-1.5';

export default function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setAuth } = useRole();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
    skills: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      api.get(`/students/${id}`).then((data) => {
        setForm(data);
      }).catch(() => setError('Failed to load profile')).finally(() => setPageLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setResumeFile(null);
      return;
    }
    if (file.type !== 'application/pdf') {
      setError('Resume must be a PDF.');
      e.target.value = '';
      setResumeFile(null);
      return;
    }
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError('Resume too large (max 5 MB).');
      e.target.value = '';
      setResumeFile(null);
      return;
    }
    setResumeFile(file);
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setProfilePhotoFile(null);
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Profile photo must be a JPG, PNG, or WebP image.');
      e.target.value = '';
      setProfilePhotoFile(null);
      return;
    }
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError('Profile photo too large (max 5 MB).');
      e.target.value = '';
      setProfilePhotoFile(null);
      return;
    }
    setProfilePhotoFile(file);
  };

  const uploadResume = async (studentId, file) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const fd = new FormData();
    fd.append('resume', file);
    const res = await fetch(`/api/students/${studentId}/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) {
      let detail = 'Failed to upload resume';
      try {
        const data = await res.json();
        detail = data?.detail || detail;
      } catch {}
      const err = new Error(detail);
      err.status = res.status;
      throw err;
    }
    return res.json();
  };

  const uploadProfilePhoto = async (studentId, file) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const fd = new FormData();
    fd.append('profile_photo', file);
    const res = await fetch(`/api/students/${studentId}/profile-photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) {
      let detail = 'Failed to upload profile photo';
      try {
        const data = await res.json();
        detail = data?.detail || detail;
      } catch {}
      const err = new Error(detail);
      err.status = res.status;
      throw err;
    }
    return res.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await api.put(`/students/${id}`, form);
        if (resumeFile) {
          await uploadResume(id, resumeFile);
        }
        if (profilePhotoFile) {
          await uploadProfilePhoto(id, profilePhotoFile);
        }
        navigate(`/student/dashboard/${id}`);
      } else {
        const student = await api.post('/students', form);
        const linkRes = await api.post(`/auth/link-profile/${student.id}`, {});
        setAuth(linkRes);
        if (resumeFile) {
          await uploadResume(student.id, resumeFile);
        }
        if (profilePhotoFile) {
          await uploadProfilePhoto(student.id, profilePhotoFile);
        }
        navigate(`/student/dashboard/${student.id}`);
      }
    } catch (err) {
      setError(err.data?.detail || err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Page header */}
      <section className="bg-gradient-to-r from-brand-purple-dark/40 via-brand-dark to-brand-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-brand-cyan text-xs font-semibold uppercase tracking-[0.2em] mb-1">Student</p>
          <h1 className="text-3xl font-black text-white">
            {isEdit ? 'Edit Profile' : 'Create Student Profile'}
          </h1>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {pageLoading ? (
          <div className="bg-brand-dark-card border border-white/[0.06] rounded-2xl p-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton.Line w="w-full" h="h-10" />
              <Skeleton.Line w="w-full" h="h-10" />
            </div>
            <Skeleton.Line w="w-full" h="h-10" />
            <Skeleton.Line w="w-full" h="h-24" />
            <Skeleton.Line w="w-full" h="h-10" />
            <Skeleton.Line w="w-full" h="h-10" />
            <Skeleton.Line w="w-full" h="h-10" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton.Line w="w-full" h="h-10" />
              <Skeleton.Line w="w-full" h="h-10" />
              <Skeleton.Line w="w-full" h="h-10" />
            </div>
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
                    value={form.bio || ''}
                    onChange={handleChange}
                    rows={4}
                    className={inputCls}
                    placeholder="Tell employers about yourself..."
                  />
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <input name="location" value={form.location || ''} onChange={handleChange} className={inputCls} placeholder="e.g., Dallas, TX" />
                </div>
                <div>
                  <label className={labelCls}>Skills</label>
                  <input name="skills" value={form.skills || ''} onChange={handleChange} className={inputCls} placeholder="e.g., Python, React, SQL (comma-separated)" />
                </div>
                <div>
                  <label className={labelCls}>Profile Photo</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    onChange={handleProfilePhotoChange}
                    className={inputCls}
                  />
                  <p className="text-white/30 text-xs mt-1">JPG, PNG, or WebP. Max 5 MB.</p>
                  {isEdit && form.profileImageLink && !profilePhotoFile && (
                    <p className="text-white/50 text-xs mt-1">Current profile photo is set. Choose a new file to replace it.</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Resume (PDF)</label>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleResumeChange}
                    className={inputCls}
                  />
                  <p className="text-white/30 text-xs mt-1">PDF only. Max 5 MB.</p>
                </div>

                {/* Social links section */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-3">Social Links</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>LinkedIn</label>
                      <input name="linkedinUrl" value={form.linkedinUrl || ''} onChange={handleChange} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>GitHub</label>
                      <input name="githubUrl" value={form.githubUrl || ''} onChange={handleChange} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Portfolio</label>
                      <input name="portfolioUrl" value={form.portfolioUrl || ''} onChange={handleChange} className={inputCls} />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-purple hover:bg-brand-purple-light text-white py-3 px-4 rounded-lg disabled:opacity-50 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {loading ? 'Saving...' : isEdit ? 'Update Profile' : 'Create Profile'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
