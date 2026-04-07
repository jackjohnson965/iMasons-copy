import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { api } from '../api';
import Skeleton from '../components/Skeleton';

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

  const typeColors = {
    internship: 'bg-brand-purple/20 text-brand-cyan border border-brand-purple/30',
    'full-time': 'bg-brand-teal/20 text-brand-cyan border border-brand-teal/30',
    'part-time': 'bg-white/10 text-white/60 border border-white/10',
    mentorship: 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/20',
  };

  const statusColors = {
    active: 'bg-accent-green/15 text-accent-green border border-accent-green/25',
    closed: 'bg-accent-rose/15 text-accent-rose border border-accent-rose/25',
    archived: 'bg-white/10 text-white/40 border border-white/10',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <Skeleton.Line w="w-32" h="h-4" className="mb-6" />
          <div className="bg-brand-dark-card border border-white/[0.06] rounded-xl p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton.Line w="w-72" h="h-7" />
                <Skeleton.Line w="w-40" h="h-4" />
              </div>
              <Skeleton.Line w="w-24" h="h-7" className="rounded-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton.Line w="w-28" h="h-4" />
              <Skeleton.Line w="w-24" h="h-4" />
              <Skeleton.Line w="w-32" h="h-4" />
            </div>
            <div className="space-y-2 pt-4">
              <Skeleton.Line w="w-20" h="h-3" />
              <Skeleton.Line w="w-full" h="h-3" />
              <Skeleton.Line w="w-full" h="h-3" />
              <Skeleton.Line w="w-3/4" h="h-3" />
              <Skeleton.Line w="w-full" h="h-3" />
              <Skeleton.Line w="w-2/3" h="h-3" />
            </div>
            <div className="flex gap-3 pt-4">
              <Skeleton.Line w="w-32" h="h-10" className="rounded-lg" />
              <Skeleton.Line w="w-36" h="h-10" className="rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) return <div className="text-center py-12 text-white/40">Job not found</div>;

  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link to="/jobs" className="text-brand-cyan hover:text-white text-sm mb-6 inline-flex items-center gap-1.5 transition-colors group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </Link>

        <div className="bg-brand-dark-card border border-white/[0.06] rounded-xl overflow-hidden">
          {/* Header with gradient accent */}
          <div className="h-1 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-teal" />

          <div className="p-8">
            {/* Title + badges */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{job.title}</h1>
                {employer && (
                  <p className="text-white/50 mt-1">{employer.companyName}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
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

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-white/40 mb-8">
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </span>
              )}
              {job.industry && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {job.industry}
                </span>
              )}
              {job.createdAt && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-3">Description</h3>
              <p className="text-white/70 whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </div>

            {/* Application questions */}
            {job.customQuestions?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-3">Application Questions</h3>
                <ol className="space-y-2">
                  {job.customQuestions.map((q, i) => (
                    <li key={q.id} className="flex gap-3 text-white/70">
                      <span className="text-brand-cyan font-mono text-sm shrink-0">{i + 1}.</span>
                      {q.questionText}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Employer info */}
            {employer && (
              <div className="border-t border-white/[0.06] pt-6 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-3">About the Employer</h3>
                <p className="font-medium text-white">{employer.companyName}</p>
                {employer.description && <p className="text-white/50 text-sm mt-1 leading-relaxed">{employer.description}</p>}
                {employer.websiteUrl && (
                  <a href={employer.websiteUrl} target="_blank" rel="noreferrer" className="text-brand-cyan hover:text-white text-sm mt-2 inline-flex items-center gap-1 transition-colors">
                    Visit website
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            )}

            {/* CTA buttons */}
            {isStudent && linkedProfileId && (
              <div className="border-t border-white/[0.06] pt-6 flex flex-wrap gap-3">
                {employer?.contactEmail && job.status === 'active' && (
                  <button
                    onClick={handleApplyEmail}
                    className="bg-brand-purple hover:bg-brand-purple-light text-white px-6 py-2.5 rounded-lg font-semibold transition-colors text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Apply via Email
                  </button>
                )}
                <button
                  onClick={handleSave}
                  className="border border-white/15 text-white/70 hover:border-brand-cyan/40 hover:text-brand-cyan px-6 py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Save for Later
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
