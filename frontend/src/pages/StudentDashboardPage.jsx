import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { api } from '../api';
import JobCard from '../components/JobCard';
import PillarCard from '../components/PillarCard';
import Skeleton from '../components/Skeleton';

const inputCls = 'w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors text-sm';
const labelCls = 'block text-sm font-medium text-white/50 mb-1.5';

export default function StudentDashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, linkedProfileId, setLinkedProfileId, setAuth, token, role } = useRole();
  const [showSetup, setShowSetup] = useState(!id && !linkedProfileId);

  const studentId = id || linkedProfileId;
  const { data: student, loading: studentLoading } = useFetch(studentId ? `/students/${studentId}` : null);
  const { data: saved, loading: savedLoading, refetch: refetchSaved } = useFetch(studentId ? `/saved-postings?studentId=${studentId}` : null);
  const { data: analytics } = useFetch(studentId ? `/analytics/student/${studentId}` : null);

  const [setupForm, setSetupForm] = useState({
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
  const [setupError, setSetupError] = useState(null);
  const [setupLoading, setSetupLoading] = useState(false);

  const handleSetupChange = (e) => {
    setSetupForm({ ...setupForm, [e.target.name]: e.target.value });
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setResumeFile(null);
      return;
    }
    if (file.type !== 'application/pdf') {
      setSetupError('Resume must be a PDF.');
      e.target.value = '';
      setResumeFile(null);
      return;
    }
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setSetupError('Resume too large (max 5 MB).');
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
      setSetupError('Profile photo must be a JPG, PNG, or WebP image.');
      e.target.value = '';
      setProfilePhotoFile(null);
      return;
    }
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setSetupError('Profile photo too large (max 5 MB).');
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

  const handleSetup = async (e) => {
    e.preventDefault();
    setSetupError(null);
    setSetupLoading(true);
    try {
      const stu = await api.post('/students', setupForm);
      const linkRes = await api.post(`/auth/link-profile/${stu.id}`, {});
      setAuth(linkRes);
      if (resumeFile) {
        await uploadResume(stu.id, resumeFile);
      }
      if (profilePhotoFile) {
        await uploadProfilePhoto(stu.id, profilePhotoFile);
      }
      setShowSetup(false);
      navigate(`/student/dashboard/${stu.id}`);
    } catch (err) {
      setSetupError(err.data?.detail || err.message || 'Failed to create student profile');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleUnsave = async (savedId) => {
    await api.delete(`/saved-postings/${savedId}`);
    refetchSaved();
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-brand-dark">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-brand-dark-card border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-teal" />
            <div className="p-8">
              <h1 className="text-2xl font-bold text-white mb-2">Set Up Student Profile</h1>
              <p className="text-white/40 mb-8 text-sm">Create your profile to start browsing and saving job opportunities.</p>
              {setupError && (
                <div className="bg-accent-rose/10 border border-accent-rose/30 text-accent-rose p-3 rounded-lg mb-6 text-sm">{setupError}</div>
              )}
              <form onSubmit={handleSetup} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>First Name *</label>
                    <input name="firstName" value={setupForm.firstName} onChange={handleSetupChange} required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name *</label>
                    <input name="lastName" value={setupForm.lastName} onChange={handleSetupChange} required className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <input name="email" type="email" value={setupForm.email} onChange={handleSetupChange} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Bio</label>
                  <textarea
                    name="bio"
                    value={setupForm.bio}
                    onChange={handleSetupChange}
                    rows={3}
                    className={inputCls}
                    placeholder="Tell employers about yourself..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Location</label>
                    <input name="location" value={setupForm.location} onChange={handleSetupChange} className={inputCls} placeholder="e.g., Dallas, TX" />
                  </div>
                  <div>
                    <label className={labelCls}>Skills</label>
                    <input name="skills" value={setupForm.skills} onChange={handleSetupChange} className={inputCls} placeholder="e.g., Python, React, SQL" />
                  </div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>LinkedIn</label>
                    <input name="linkedinUrl" value={setupForm.linkedinUrl} onChange={handleSetupChange} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>GitHub</label>
                    <input name="githubUrl" value={setupForm.githubUrl} onChange={handleSetupChange} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Portfolio</label>
                    <input name="portfolioUrl" value={setupForm.portfolioUrl} onChange={handleSetupChange} className={inputCls} />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={setupLoading}
                  className="w-full bg-brand-purple hover:bg-brand-purple-light text-white py-3 px-4 rounded-lg disabled:opacity-50 font-semibold transition-colors"
                >
                  {setupLoading ? 'Creating...' : 'Create Student Profile'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (studentLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3">
        <div className="w-6 h-6 border-2 border-brand-purple border-t-brand-cyan rounded-full animate-spin" />
        <span className="text-white/40 text-sm">Loading...</span>
      </div>
    );
  }
  if (!student) return <div className="text-center py-12 text-white/40">Student not found</div>;

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Dashboard header */}
      <section className="bg-gradient-to-r from-brand-purple-dark/40 via-brand-dark to-brand-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-cyan text-xs font-semibold uppercase tracking-[0.2em] mb-1">Student Dashboard</p>
              <h1 className="text-3xl font-black text-white">
                Welcome, {student.firstName}
              </h1>
              <p className="text-white/40 text-sm mt-1">{student.email}</p>
            </div>
            <Link
              to={`/student/profile/${studentId}`}
              className="hidden sm:flex items-center gap-2 bg-brand-dark-card border border-white/10 hover:border-brand-cyan/40 text-white hover:text-brand-cyan px-4 py-2 rounded-lg transition-all text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Pillar cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <PillarCard
            label="Profile Views"
            value={analytics?.totalViews ?? 0}
            color="cyan"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
          <PillarCard
            label="Saved Jobs"
            value={saved?.length ?? 0}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            }
          />
          <PillarCard
            label="Status"
            value={student.isActive ? 'Active' : 'Inactive'}
            color={student.isActive ? 'green' : 'rose'}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Recent profile views */}
        {analytics?.recentViews?.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4">Recent Profile Views</h2>
            <div className="bg-brand-dark-card border border-white/[0.06] rounded-xl overflow-hidden">
              {analytics.recentViews.map((view, i) => (
                <div key={view.id} className={`px-5 py-3.5 flex justify-between items-center text-sm ${i > 0 ? 'border-t border-white/5' : ''}`}>
                  <span className="text-white/60 capitalize">
                    {view.viewerRole === 'employer' ? 'An employer' : 'A ' + view.viewerRole} viewed your profile
                  </span>
                  <span className="text-white/25 text-xs">
                    {view.createdAt ? new Date(view.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Jobs */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Saved Jobs</h2>
          <Link to="/jobs" className="text-xs text-brand-cyan hover:text-white font-medium transition-colors">
            Browse More →
          </Link>
        </div>
        {savedLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton.JobCard key={i} />
            ))}
          </div>
        ) : saved?.length > 0 ? (
          <div className="space-y-3">
            {saved.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <JobCard job={s.jobPosting} />
                </div>
                <button
                  onClick={() => handleUnsave(s.id)}
                  className="text-accent-rose/60 hover:text-accent-rose text-xs font-medium whitespace-nowrap transition-colors px-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-brand-dark-card border border-white/[0.06] rounded-xl">
            <svg className="w-10 h-10 mx-auto mb-3 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <p className="text-white/30 text-sm">No saved jobs yet.</p>
            <Link to="/jobs" className="text-brand-cyan text-sm font-medium hover:text-white transition-colors mt-1 inline-block">
              Browse Jobs →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
