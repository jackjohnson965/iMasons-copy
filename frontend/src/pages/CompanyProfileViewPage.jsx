import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { api } from '../api';
import Skeleton from '../components/Skeleton';

export default function CompanyProfileViewPage() {
  const { id } = useParams();
  const { role } = useRole();
  const { data: company, loading } = useFetch(`/employers/${id}`);

  useEffect(() => {
    if (id && role) {
      api.post('/analytics/events', {
        eventType: 'profile_view',
        targetId: Number(id),
        viewerRole: role,
      }).catch(() => {});
    }
  }, [id, role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <Skeleton.Line w="w-32" h="h-4" className="mb-6" />
          <div className="bg-gradient-to-br from-brand-purple-dark to-brand-purple rounded-2xl p-6 mb-4">
            <Skeleton.Circle size="w-16 h-16" className="mb-4 bg-white/10" />
            <Skeleton.Line w="w-48" h="h-7" className="bg-white/10" />
            <Skeleton.Line w="w-32" h="h-4" className="mt-2 bg-white/10" />
          </div>
          <div className="bg-brand-dark-card border border-white/[0.06] rounded-2xl p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton.Line w="w-16" h="h-3" />
              <Skeleton.Line w="w-full" h="h-3" />
              <Skeleton.Line w="w-3/4" h="h-3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) return <div className="text-center py-12 text-white/40">Company not found</div>;

  const initials = company.companyName?.[0]?.toUpperCase() || 'C';
  const openJobs = company.jobPostings?.filter(job => job.status === 'active' && job.jobType === 'full-time') || [];
  const openInternships = company.jobPostings?.filter(job => job.status === 'active' && job.jobType === 'internship') || [];
  const openMentorships = company.jobPostings?.filter(job => job.status === 'active' && job.jobType === 'mentorship') || [];

  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          to="/companies"
          className="inline-flex items-center gap-1.5 text-brand-cyan hover:text-white text-sm font-medium mb-6 transition-colors group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Companies
        </Link>

        {/* Profile header */}
        <div className="bg-gradient-to-br from-brand-purple-dark to-brand-purple rounded-2xl p-6 mb-4 text-white">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white mb-4">
            {initials}
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{company.companyName}</h1>
              {company.industry && (
                <p className="text-white/70 text-sm mt-1">{company.industry}</p>
              )}
              {company.location && (
                <p className="text-white/70 text-sm mt-1 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {company.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content card */}
        <div className="bg-brand-dark-card border border-white/[0.06] rounded-2xl p-6 space-y-6">
          {company.description && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan mb-2">About</h3>
              <p className="text-white/70 whitespace-pre-wrap text-sm leading-relaxed">{company.description}</p>
            </div>
          )}

          {company.websiteUrl && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan mb-3">Website</h3>
              <a href={company.websiteUrl} target="_blank" rel="noreferrer" className="text-brand-cyan hover:text-white font-medium text-sm transition-colors">
                {company.websiteUrl}
              </a>
            </div>
          )}

          {/* Open Positions */}
          {(openJobs.length > 0 || openInternships.length > 0 || openMentorships.length > 0) && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan mb-4">Open Positions</h3>
              <div className="space-y-4">
                {openJobs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Full-Time Jobs ({openJobs.length})</h4>
                    <div className="space-y-2">
                      {openJobs.map((job) => (
                        <Link
                          key={job.id}
                          to={`/jobs/${job.id}`}
                          className="block bg-brand-dark-elevated border border-white/5 rounded-lg p-3 hover:border-brand-cyan/30 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-white text-sm">{job.title}</h5>
                              <p className="text-white/50 text-xs">{job.location} • {job.industry}</p>
                            </div>
                            <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {openInternships.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Internships ({openInternships.length})</h4>
                    <div className="space-y-2">
                      {openInternships.map((job) => (
                        <Link
                          key={job.id}
                          to={`/jobs/${job.id}`}
                          className="block bg-brand-dark-elevated border border-white/5 rounded-lg p-3 hover:border-brand-cyan/30 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-white text-sm">{job.title}</h5>
                              <p className="text-white/50 text-xs">{job.location} • {job.industry}</p>
                            </div>
                            <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {openMentorships.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Mentorships ({openMentorships.length})</h4>
                    <div className="space-y-2">
                      {openMentorships.map((job) => (
                        <Link
                          key={job.id}
                          to={`/jobs/${job.id}`}
                          className="block bg-brand-dark-elevated border border-white/5 rounded-lg p-3 hover:border-brand-cyan/30 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-white text-sm">{job.title}</h5>
                              <p className="text-white/50 text-xs">{job.location} • {job.industry}</p>
                            </div>
                            <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {openJobs.length === 0 && openInternships.length === 0 && openMentorships.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm">No open positions at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}