import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { api } from '../api';
import StatCard from '../components/StatCard';

const inputCls = 'w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors';
const labelCls = 'block text-sm font-medium text-white/60 mb-1';

export default function EmployerDashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { linkedProfileId, setAuth } = useRole();
  const [showSetup, setShowSetup] = useState(!id && !linkedProfileId);

  const employerId = id || linkedProfileId;
  const { data: employer, loading: employerLoading } = useFetch(employerId ? `/employers/${employerId}` : null);
  const { data: postings, loading: postingsLoading, refetch: refetchPostings } = useFetch(employerId ? `/job-postings?employerId=${employerId}` : null);
  const { data: analytics } = useFetch(employerId ? `/analytics/employer/${employerId}` : null);

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
      <div className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-6">Set Up Employer Profile</h1>
        {setupError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">{setupError}</div>
        )}
        <form onSubmit={handleSetup} className="space-y-4">
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
            className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white py-2.5 px-4 rounded-lg font-semibold transition-colors"
          >
            Create Employer Profile
          </button>
        </form>
      </div>
    );
  }

  if (employerLoading) return <div className="text-center py-12 text-white/50">Loading...</div>;
  if (!employer) return <div className="text-center py-12 text-white/50">Employer not found</div>;

  const statusBadge = {
    active: 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30',
    closed: 'bg-red-500/20 text-red-400 border border-red-500/30',
    archived: 'bg-white/10 text-white/40 border border-white/10',
  };

  const jobPostings = postings?.filter((p) => p.jobType !== 'mentorship') ?? [];
  const mentorships = postings?.filter((p) => p.jobType === 'mentorship') ?? [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{employer.companyName}</h1>
          <p className="text-white/50 mt-1">{employer.contactEmail}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/jobs/new"
            className="border border-white/20 text-white hover:border-brand-cyan hover:text-brand-cyan px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            + New Posting
          </Link>
          <Link
            to="/mentors/new"
            className="border border-white/20 text-white hover:border-brand-cyan hover:text-brand-cyan px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            + New Mentorship
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Posting Views" value={analytics?.totalViews ?? 0} />
        <StatCard label="Email Clicks" value={analytics?.totalEmailClicks ?? 0} />
        <StatCard label="Active Postings" value={postings?.filter((p) => p.status === 'active').length ?? 0} />
        <StatCard label="Total Postings" value={postings?.length ?? 0} />
      </div>

      {analytics?.postingBreakdown?.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">Analytics by Posting</h2>
          <div className="bg-brand-dark-card border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/40 text-left uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-medium">Posting</th>
                  <th className="px-4 py-3 font-medium text-right">Views</th>
                  <th className="px-4 py-3 font-medium text-right">Email Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analytics.postingBreakdown.map((item) => (
                  <tr key={item.postingId} className="hover:bg-white/2">
                    <td className="px-4 py-3">
                      <Link to={`/jobs/${item.postingId}`} className="text-brand-cyan hover:text-white transition-colors">
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-white/60">{item.views}</td>
                    <td className="px-4 py-3 text-right text-white/60">{item.emailClicks ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <img src="/images/handshake-icon.png" alt="Job matches" className="h-6 w-6 object-contain" />
        My Postings
      </h2>
      {postingsLoading ? (
        <p className="text-white/50">Loading postings...</p>
      ) : jobPostings.length > 0 ? (
        <div className="space-y-3">
          {jobPostings.map((p) => (
            <div
              key={p.id}
              className="bg-brand-dark-card border border-white/10 rounded-lg p-4 flex items-center justify-between hover:border-white/20 transition-colors"
            >
              <div>
                <Link to={`/jobs/${p.id}`} className="font-medium text-white hover:text-brand-cyan transition-colors">
                  {p.title}
                </Link>
                <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
                  <span className="capitalize">{p.jobType}</span>
                  {p.location && <span>— {p.location}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusBadge[p.status] || 'bg-white/10 text-white/40'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Link to={`/jobs/${p.id}/edit`} className="text-sm text-brand-cyan hover:text-white transition-colors">
                  Edit
                </Link>
                {p.status === 'active' && (
                  <button
                    onClick={() => handleDeactivate(p.id)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/30 py-8 text-center">No job postings yet. Create your first job posting!</p>
      )}

      <h2 className="text-xl font-semibold text-white mb-4 mt-8 flex items-center gap-2">
        <img src="/images/handshake-icon.png" alt="Mentorships" className="h-6 w-6 object-contain" />
        My Mentorships
      </h2>
      {postingsLoading ? (
        <p className="text-white/50">Loading...</p>
      ) : mentorships.length > 0 ? (
        <div className="space-y-3">
          {mentorships.map((p) => (
            <div
              key={p.id}
              className="bg-brand-dark-card border border-white/10 rounded-lg p-4 flex items-center justify-between hover:border-white/20 transition-colors"
            >
              <div>
                <Link to={`/jobs/${p.id}`} className="font-medium text-white hover:text-brand-cyan transition-colors">
                  {p.title}
                </Link>
                <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
                  <span className="capitalize">{p.jobType}</span>
                  {p.location && <span>— {p.location}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusBadge[p.status] || 'bg-white/10 text-white/40'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Link to={`/jobs/${p.id}/edit`} className="text-sm text-brand-cyan hover:text-white transition-colors">
                  Edit
                </Link>
                {p.status === 'active' && (
                  <button
                    onClick={() => handleDeactivate(p.id)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/30 py-8 text-center">No mentorships yet. Create your first mentorship posting!</p>
      )}
    </div>
  );
}
