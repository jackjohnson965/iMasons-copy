import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { api } from '../api';
import PillarCard from '../components/PillarCard';
import Skeleton from '../components/Skeleton';

const inputCls = 'w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors text-sm';
const labelCls = 'block text-sm font-medium text-white/50 mb-1.5';

export default function EmployerDashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { linkedProfileId, setAuth } = useRole();
  const [showSetup, setShowSetup] = useState(!id && !linkedProfileId);

  const employerId = id || linkedProfileId;
  const { data: employer, loading: employerLoading } = useFetch(employerId ? `/employers/${employerId}` : null);
  const { data: postings, loading: postingsLoading, refetch: refetchPostings } = useFetch(employerId ? `/job-postings?employerId=${employerId}` : null);
  const { data: analytics } = useFetch(employerId ? `/analytics/employer/${employerId}` : null);
  const { data: applications, loading: applicationsLoading } = useFetch(employerId ? `/applications?employerId=${employerId}` : null);

  const [setupForm, setSetupForm] = useState({
    companyName: '',
    contactEmail: '',
    industry: '',
    location: '',
    description: '',
    websiteUrl: '',
  });
  const [setupError, setSetupError] = useState(null);

  const handleSetup = async (e) => {
    e.preventDefault();
    setSetupError(null);
    try {
      const emp = await api.post('/employers', setupForm);
      const linkRes = await api.post(`/auth/link-profile/${emp.id}`, {});
      setAuth(linkRes);
      setShowSetup(false);
      navigate(`/employer/dashboard/${emp.id}`);
    } catch (err) {
      setSetupError(err.data?.detail || 'Failed to create employer profile');
    }
  };

  const handleDeactivate = async (postingId) => {
    await api.delete(`/job-postings/${postingId}`);
    refetchPostings();
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-brand-dark">
        <div className="max-w-lg mx-auto px-6 py-12">
          <div className="bg-brand-dark-card border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-teal" />
            <div className="p-8">
              <h1 className="text-2xl font-bold text-white mb-2">Set Up Employer Profile</h1>
              <p className="text-white/40 mb-8 text-sm">Create your company profile to start posting opportunities.</p>
              {setupError && (
                <div className="bg-accent-rose/10 border border-accent-rose/30 text-accent-rose p-3 rounded-lg mb-6 text-sm">{setupError}</div>
              )}
              <form onSubmit={handleSetup} className="space-y-5">
                <div>
                  <label className={labelCls}>Company Name *</label>
                  <input value={setupForm.companyName} onChange={(e) => setSetupForm({ ...setupForm, companyName: e.target.value })} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Contact Email *</label>
                  <input type="email" value={setupForm.contactEmail} onChange={(e) => setSetupForm({ ...setupForm, contactEmail: e.target.value })} required className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Industry</label>
                    <input value={setupForm.industry} onChange={(e) => setSetupForm({ ...setupForm, industry: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Location</label>
                    <input value={setupForm.location} onChange={(e) => setSetupForm({ ...setupForm, location: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={setupForm.description} onChange={(e) => setSetupForm({ ...setupForm, description: e.target.value })} rows={3} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Website</label>
                  <input value={setupForm.websiteUrl} onChange={(e) => setSetupForm({ ...setupForm, websiteUrl: e.target.value })} className={inputCls} />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-purple hover:bg-brand-purple-light text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  Create Employer Profile
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (employerLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3">
        <div className="w-6 h-6 border-2 border-brand-purple border-t-brand-cyan rounded-full animate-spin" />
        <span className="text-white/40 text-sm">Loading...</span>
      </div>
    );
  }
  if (!employer) return <div className="text-center py-12 text-white/40">Employer not found</div>;

  const statusBadge = {
    active: 'bg-accent-green/15 text-accent-green border border-accent-green/25',
    closed: 'bg-accent-rose/15 text-accent-rose border border-accent-rose/25',
    archived: 'bg-white/10 text-white/40 border border-white/10',
  };

  const jobPostings = postings?.filter((p) => p.jobType !== 'mentorship') ?? [];
  const mentorships = postings?.filter((p) => p.jobType === 'mentorship') ?? [];

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Dashboard header */}
      <section className="bg-gradient-to-r from-brand-purple-dark/40 via-brand-dark to-brand-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-cyan text-xs font-semibold uppercase tracking-[0.2em] mb-1">Employer Dashboard</p>
              <h1 className="text-3xl font-black text-white">{employer.companyName}</h1>
              <p className="text-white/40 text-sm mt-1">{employer.contactEmail}</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <Link
                to="/jobs/new"
                className="bg-brand-purple hover:bg-brand-purple-light text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                + New Job
              </Link>
              <Link
                to="/mentors/new"
                className="bg-brand-dark-card border border-white/10 hover:border-brand-cyan/40 text-white hover:text-brand-cyan px-4 py-2 rounded-lg transition-all text-sm font-medium"
              >
                + Mentorship
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Pillar cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <PillarCard
            label="Total Views"
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
            label="Email Clicks"
            value={analytics?.totalEmailClicks ?? 0}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <PillarCard
            label="Active Postings"
            value={postings?.filter((p) => p.status === 'active').length ?? 0}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
              </svg>
            }
          />
          <PillarCard
            label="Total Postings"
            value={postings?.length ?? 0}
            color="amber"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
        </div>

        {/* Analytics by posting */}
        {analytics?.postingBreakdown?.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4">Analytics by Posting</h2>
            <div className="bg-brand-dark-card border border-white/[0.06] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Posting</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Views</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.postingBreakdown.map((item, i) => (
                    <tr key={item.postingId} className={`hover:bg-white/[0.02] ${i > 0 ? 'border-t border-white/5' : ''}`}>
                      <td className="px-5 py-3.5">
                        <Link to={`/jobs/${item.postingId}`} className="text-brand-cyan hover:text-white transition-colors font-medium">
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-right text-white/50">{item.views}</td>
                      <td className="px-5 py-3.5 text-right text-white/50">{item.emailClicks ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Job Postings */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">My Postings</h2>
          <Link to="/jobs/new" className="text-xs text-brand-cyan hover:text-white font-medium transition-colors">
            + New Posting
          </Link>
        </div>
        {postingsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton.Card key={i} />
            ))}
          </div>
        ) : jobPostings.length > 0 ? (
          <div className="space-y-2 mb-10">
            {jobPostings.map((p) => (
              <div
                key={p.id}
                className="bg-brand-dark-card border border-white/[0.06] rounded-xl p-4 flex items-center justify-between hover:border-white/15 transition-colors"
              >
                <div className="min-w-0">
                  <Link to={`/jobs/${p.id}`} className="font-semibold text-white hover:text-brand-cyan transition-colors truncate block">
                    {p.title}
                  </Link>
                  <div className="flex items-center gap-3 text-sm text-white/40 mt-1">
                    <span className="capitalize">{p.jobType}</span>
                    {p.location && <span>· {p.location}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusBadge[p.status] || 'bg-white/10 text-white/40'}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <Link to={`/jobs/${p.id}/applications`} className="text-sm text-brand-cyan hover:text-white transition-colors font-medium">
                    Applications
                  </Link>
                  <Link to={`/jobs/${p.id}/edit`} className="text-sm text-white/50 hover:text-brand-cyan transition-colors">
                    Edit
                  </Link>
                  {p.status === 'active' && (
                    <button
                      onClick={() => handleDeactivate(p.id)}
                      className="text-sm text-accent-rose/60 hover:text-accent-rose transition-colors"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-brand-dark-card border border-white/[0.06] rounded-xl mb-10">
            <p className="text-white/30 text-sm">No job postings yet.</p>
            <Link to="/jobs/new" className="text-brand-cyan text-sm font-medium hover:text-white transition-colors mt-1 inline-block">
              Create Your First Posting →
            </Link>
          </div>
        )}

        {/* Mentorships */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">My Mentorships</h2>
          <Link to="/mentors/new" className="text-xs text-brand-cyan hover:text-white font-medium transition-colors">
            + New Mentorship
          </Link>
        </div>
        {postingsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton.Card key={i} />
            ))}
          </div>
        ) : mentorships.length > 0 ? (
          <div className="space-y-2">
            {mentorships.map((p) => (
              <div
                key={p.id}
                className="bg-brand-dark-card border border-white/[0.06] rounded-xl p-4 flex items-center justify-between hover:border-white/15 transition-colors"
              >
                <div className="min-w-0">
                  <Link to={`/jobs/${p.id}`} className="font-semibold text-white hover:text-brand-cyan transition-colors truncate block">
                    {p.title}
                  </Link>
                  <div className="flex items-center gap-3 text-sm text-white/40 mt-1">
                    <span className="capitalize">{p.jobType}</span>
                    {p.location && <span>· {p.location}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusBadge[p.status] || 'bg-white/10 text-white/40'}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <Link to={`/jobs/${p.id}/edit`} className="text-sm text-white/50 hover:text-brand-cyan transition-colors">
                    Edit
                  </Link>
                  {p.status === 'active' && (
                    <button
                      onClick={() => handleDeactivate(p.id)}
                      className="text-sm text-accent-rose/60 hover:text-accent-rose transition-colors"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-brand-dark-card border border-white/[0.06] rounded-xl">
            <p className="text-white/30 text-sm">No mentorships yet.</p>
            <Link to="/mentors/new" className="text-brand-cyan text-sm font-medium hover:text-white transition-colors mt-1 inline-block">
              Create Your First Mentorship →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
