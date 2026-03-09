import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { api } from '../api';

export default function JobDetailPage() {
  const { id } = useParams();
  const { isStudent, linkedProfileId, role } = useRole();
  const { data: job, loading } = useFetch(`/job-postings/${id}`);
  const { data: employer } = useFetch(job ? `/employers/${job.employerId}` : null);

  useEffect(() => {
    if (id && role) {
      api.post('/analytics/events', {
        eventType: 'posting_view',
        targetId: Number(id),
        viewerRole: role,
      }).catch(() => {});
    }
  }, [id, role]);

  const handleSave = async () => {
    try {
      await api.post('/saved-postings', { studentId: linkedProfileId, jobPostingId: Number(id) });
      alert('Job saved!');
    } catch {
      alert('Already saved or error occurred');
    }
  };

  const handleApplyEmail = () => {
    api.post('/analytics/events', {
      eventType: 'email_click',
      targetId: Number(id),
      viewerRole: role,
    }).catch(() => {});

    const subject = encodeURIComponent(`Application Inquiry: ${job.title}`);
    window.location.href = `mailto:${employer.contactEmail}?subject=${subject}`;
  };

  if (loading) return <div className="text-center py-12 text-white/50">Loading...</div>;
  if (!job) return <div className="text-center py-12 text-white/50">Job not found</div>;

  const typeColors = {
    internship: 'bg-brand-purple/30 text-brand-cyan border border-brand-purple/40',
    'full-time': 'bg-brand-teal/30 text-brand-cyan border border-brand-teal/40',
    'part-time': 'bg-brand-purple/20 text-white/70 border border-white/10',
    mentorship: 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30',
  };

  const statusColors = {
    active: 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30',
    closed: 'bg-red-500/20 text-red-400 border border-red-500/30',
    archived: 'bg-white/10 text-white/40 border border-white/10',
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/jobs" className="text-brand-cyan hover:text-white text-sm mb-6 inline-flex items-center gap-1 transition-colors">
        ← Back to Jobs
      </Link>
      <div className="bg-brand-dark-card border border-white/10 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            {employer && (
              <p className="text-white/50 mt-1">{employer.companyName}</p>
            )}
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeColors[job.jobType] || 'bg-white/10 text-white/60'}`}>
              {job.jobType}
            </span>
            {job.status && job.status !== 'active' && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[job.status] || ''}`}>
                {job.status}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-white/50 mb-6">
          {job.location && <span>📍 {job.location}</span>}
          {job.industry && <span>🏭 {job.industry}</span>}
          {job.createdAt && (
            <span className="flex items-center gap-1">
              <img src="/images/calendar-icon.png" alt="Posted date" className="h-4 w-4 object-contain" />
              {new Date(job.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-base font-semibold text-white/60 uppercase tracking-wide text-xs mb-3">Description</h3>
          <p className="text-white/70 whitespace-pre-wrap leading-relaxed">{job.description}</p>
        </div>

        {job.customQuestions?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-semibold text-white/60 uppercase tracking-wide text-xs mb-3">Application Questions</h3>
            <ol className="list-decimal list-inside space-y-2">
              {job.customQuestions.map((q) => (
                <li key={q.id} className="text-white/70">{q.questionText}</li>
              ))}
            </ol>
          </div>
        )}

        {employer && (
          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-base font-semibold text-white/60 uppercase tracking-wide text-xs mb-3">About the Employer</h3>
            <p className="font-medium text-white">{employer.companyName}</p>
            {employer.description && <p className="text-white/50 text-sm mt-1">{employer.description}</p>}
            {employer.websiteUrl && (
              <a href={employer.websiteUrl} target="_blank" rel="noreferrer" className="text-brand-cyan hover:text-white text-sm mt-2 inline-block transition-colors">
                Visit website →
              </a>
            )}
          </div>
        )}

        {isStudent && linkedProfileId && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 border border-white/20 text-white hover:border-brand-cyan hover:text-brand-cyan px-6 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              <img src="/images/saved-icon.png" alt="" className="h-5 w-5 object-contain" aria-hidden="true" />
              Save for Later
            </button>
            {employer?.contactEmail && job.status === 'active' && (
              <button
                onClick={handleApplyEmail}
                className="flex items-center gap-2 bg-brand-purple hover:bg-brand-purple-dark text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                <img src="/images/messages-icon.png" alt="" className="h-5 w-5 object-contain" aria-hidden="true" />
                Apply via Email
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
