import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { api } from '../api';
import JobCard from '../components/JobCard';
import StatCard from '../components/StatCard';

const inputCls = 'w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors';
const labelCls = 'block text-sm font-medium text-white/60 mb-1';

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
    resumeLink: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });
  const [setupError, setSetupError] = useState(null);
  const [setupLoading, setSetupLoading] = useState(false);

  const handleSetupChange = (e) => {
    setSetupForm({ ...setupForm, [e.target.name]: e.target.value });
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setSetupError(null);
    setSetupLoading(true);
    try {
      const stu = await api.post('/students', setupForm);
      const linkRes = await api.post(`/auth/link-profile/${stu.id}`, {});
      setAuth(linkRes);
      setShowSetup(false);
      navigate(`/student/dashboard/${stu.id}`);
    } catch (err) {
      setSetupError(err.data?.detail || 'Failed to create student profile');
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
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-2">Set Up Student Profile</h1>
        <p className="text-white/50 mb-6">Create your profile to start browsing and saving job opportunities.</p>
        {setupError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">{setupError}</div>
        )}
        <form onSubmit={handleSetup} className="space-y-4">
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
            <label className={labelCls}>Resume Link</label>
            <input name="resumeLink" value={setupForm.resumeLink} onChange={handleSetupChange} className={inputCls} placeholder="Link to your resume (Google Drive, etc.)" />
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
            className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white py-2.5 px-4 rounded-lg disabled:opacity-50 font-semibold transition-colors"
          >
            {setupLoading ? 'Creating...' : 'Create Student Profile'}
          </button>
        </form>
      </div>
    );
  }

  if (studentLoading) return <div className="text-center py-12 text-white/50">Loading...</div>;
  if (!student) return <div className="text-center py-12 text-white/50">Student not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome, {student.firstName}!
          </h1>
          <p className="text-white/50 mt-1">{student.email}</p>
        </div>
        <Link
          to={`/student/profile/${studentId}`}
          className="flex items-center gap-2 border border-white/20 text-white hover:border-brand-cyan hover:text-brand-cyan px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <img src="/images/graduation-cap-icon.png" alt="" className="h-5 w-5 object-contain" aria-hidden="true" />
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <StatCard label="Profile Views" value={analytics?.totalViews ?? 0} />
        <StatCard label="Saved Jobs" value={saved?.length ?? 0} />
        <StatCard label="Status" value={student.isActive ? 'Active' : 'Inactive'} />
      </div>

      {analytics?.recentViews?.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Profile Views</h2>
          <div className="bg-brand-dark-card border border-white/10 rounded-xl divide-y divide-white/5">
            {analytics.recentViews.map((view) => (
              <div key={view.id} className="px-4 py-3 flex justify-between items-center text-sm">
                <span className="text-white/70 capitalize">
                  {view.viewerRole === 'employer' ? 'An employer' : 'A ' + view.viewerRole} viewed your profile
                </span>
                <span className="text-white/30 text-xs">
                  {view.createdAt ? new Date(view.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <img src="/images/saved-icon.png" alt="Saved jobs" className="h-6 w-6 object-contain" />
        Saved Jobs
      </h2>
      {savedLoading ? (
        <p className="text-white/50">Loading saved jobs...</p>
      ) : saved?.length > 0 ? (
        <div className="space-y-4">
          {saved.map((s) => (
            <div key={s.id} className="flex items-center gap-4">
              <div className="flex-1">
                <JobCard job={s.jobPosting} />
              </div>
              <button
                onClick={() => handleUnsave(s.id)}
                className="text-red-400/70 hover:text-red-400 text-sm whitespace-nowrap transition-colors"
              >
                Unsave
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/30 py-8 text-center">No saved jobs yet. Browse jobs to save some!</p>
      )}
    </div>
  );
}
