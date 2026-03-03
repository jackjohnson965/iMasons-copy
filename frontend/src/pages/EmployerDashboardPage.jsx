import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { api } from '../api';
import StatCard from '../components/StatCard';

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
      // Link the newly created employer profile to the authenticated user
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
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Set Up Employer Profile</h1>
        {setupError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{setupError}</div>
        )}
        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <input
              value={setupForm.companyName}
              onChange={(e) => setSetupForm({ ...setupForm, companyName: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
            <input
              type="email"
              value={setupForm.contactEmail}
              onChange={(e) => setSetupForm({ ...setupForm, contactEmail: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input
                value={setupForm.industry}
                onChange={(e) => setSetupForm({ ...setupForm, industry: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                value={setupForm.location}
                onChange={(e) => setSetupForm({ ...setupForm, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={setupForm.description}
              onChange={(e) => setSetupForm({ ...setupForm, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              value={setupForm.websiteUrl}
              onChange={(e) => setSetupForm({ ...setupForm, websiteUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium"
          >
            Create Employer Profile
          </button>
        </form>
      </div>
    );
  }

  if (employerLoading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!employer) return <div className="text-center py-12 text-gray-500">Employer not found</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <img src="/images/desktop-icon.png" alt="Employer dashboard" className="h-8 w-8 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employer.companyName}</h1>
            <p className="text-gray-500">{employer.contactEmail}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/jobs/new"
            className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-brand-purple-dark transition-colors"
          >
            + New Posting
          </Link>
          <Link
            to="/mentors/new"
            className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-brand-purple-dark transition-colors"
          >
            + New Mentorship
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Posting Views" value={analytics?.totalViews ?? 0} />
        <StatCard label="Email Clicks" value={analytics?.totalEmailClicks ?? 0} />
        <StatCard label="Active Postings" value={postings?.filter((p) => p.status === 'active').length ?? 0} />
        <StatCard label="Total Postings" value={postings?.length ?? 0} />
      </div>

      {analytics?.postingBreakdown?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics by Posting</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Posting</th>
                  <th className="px-4 py-3 font-medium text-right">Views</th>
                  <th className="px-4 py-3 font-medium text-right">Email Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {analytics.postingBreakdown.map((item) => (
                  <tr key={item.postingId}>
                    <td className="px-4 py-3">
                      <Link to={`/jobs/${item.postingId}`} className="text-blue-600 hover:text-blue-800">
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{item.views}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{item.emailClicks ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <img src="/images/handshake-icon.png" alt="Job matches" className="h-6 w-6 object-contain" />
        My Postings
      </h2>
      {postingsLoading ? (
        <p className="text-gray-500">Loading postings...</p>
      ) : postings?.filter(p=>p.jobType!=='mentorship').length > 0 ? (
        <div className="space-y-3">
          {postings.filter(p=>p.jobType!=='mentorship').map((p) => {
            const statusColors = {
              active: 'text-green-600',
              closed: 'text-red-500',
              archived: 'text-gray-500',
            };
            return (
              <div
                key={p.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between"
              >
                <div>
                  <Link to={`/jobs/${p.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                    {p.title}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1">
                    {p.jobType} {p.location && `- ${p.location}`}
                    <span className={`ml-2 capitalize ${statusColors[p.status] || ''}`}>
                      ({p.status})
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/jobs/${p.id}/edit`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                  {p.status === 'active' && (
                    <button
                      onClick={() => handleDeactivate(p.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400 py-8 text-center">No job postings yet. Create your first job posting!</p>
      )}

      <h2 className="text-xl font-semibold text-gray-900 mb-4 mt-8 flex items-center gap-2">
        <img src="/images/handshake-icon.png" alt="Mentorships" className="h-6 w-6 object-contain" />
        My Mentorships
      </h2>
      {postingsLoading ? (
        <p className="text-gray-500">Loading postings...</p>
      ) : postings?.filter(p=>p.jobType==='mentorship').length > 0 ? (
        <div className="space-y-3">
          {postings.filter(p=>p.jobType==='mentorship').map((p) => {
            const statusColors = {
              active: 'text-green-600',
              closed: 'text-red-500',
              archived: 'text-gray-500',
            };
            return (
              <div
                key={p.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between"
              >
                <div>
                  <Link to={`/jobs/${p.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                    {p.title}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1">
                    {p.jobType} {p.location && `- ${p.location}`}
                    <span className={`ml-2 capitalize ${statusColors[p.status] || ''}`}>
                      ({p.status})
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/jobs/${p.id}/edit`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                  {p.status === 'active' && (
                    <button
                      onClick={() => handleDeactivate(p.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400 py-8 text-center">No mentorships yet. Create your first mentorship posting!</p>
      )}
    </div>
  );
}
