import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { api } from '../api';
import Skeleton from '../components/Skeleton';

const statusBadge = {
  submitted: 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/25',
  reviewed: 'bg-brand-purple/15 text-brand-purple border border-brand-purple/25',
  accepted: 'bg-accent-green/15 text-accent-green border border-accent-green/25',
  rejected: 'bg-accent-rose/15 text-accent-rose border border-accent-rose/25',
};

export default function ApplicationsPage() {
  const { jobId } = useParams();
  const { data: job } = useFetch(jobId ? `/job-postings/${jobId}` : null);
  const { data: applications, loading, refetch } = useFetch(
    jobId ? `/applications?jobPostingId=${jobId}` : null
  );
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(null);

  const handleStatusUpdate = async (appId, newStatus) => {
    setUpdating(appId);
    try {
      await api.put(`/applications/${appId}/status?status=${newStatus}`);
      refetch();
    } catch {
      alert('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      <section className="bg-gradient-to-r from-brand-purple-dark/40 via-brand-dark to-brand-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link to={jobId ? `/jobs/${jobId}` : '/employer/dashboard'} className="text-brand-cyan hover:text-white text-sm mb-3 inline-flex items-center gap-1.5 transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Posting
          </Link>
          <p className="text-brand-cyan text-xs font-semibold uppercase tracking-[0.2em] mb-1">Applications</p>
          <h1 className="text-3xl font-black text-white">
            {job ? job.title : 'Loading...'}
          </h1>
          {applications && (
            <p className="text-white/40 text-sm mt-1">{applications.length} application{applications.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton.Card key={i} />)}
          </div>
        ) : !applications?.length ? (
          <div className="text-center py-16 bg-brand-dark-card border border-white/[0.06] rounded-xl">
            <p className="text-white/30 text-sm">No applications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const isExpanded = expandedId === app.id;
              return (
                <div key={app.id} className="bg-brand-dark-card border border-white/[0.06] rounded-xl overflow-hidden">
                  {/* Header row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    className="w-full text-left p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-cyan font-bold text-sm shrink-0">
                        {app.student.firstName[0]}{app.student.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">
                          {app.student.firstName} {app.student.lastName}
                        </p>
                        <p className="text-white/40 text-sm truncate">{app.student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${statusBadge[app.status] || 'bg-white/10 text-white/40'}`}>
                        {app.status}
                      </span>
                      <span className="text-white/25 text-xs">{new Date(app.createdAt).toLocaleDateString()}</span>
                      <svg className={`w-4 h-4 text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.06] p-5">
                      {/* Student info */}
                      <div className="flex flex-wrap gap-4 text-sm text-white/50 mb-5">
                        {app.student.location && <span>Location: {app.student.location}</span>}
                        {app.student.skills && <span>Skills: {app.student.skills}</span>}
                        {app.student.linkedinUrl && (
                          <a href={app.student.linkedinUrl} target="_blank" rel="noreferrer" className="text-brand-cyan hover:text-white transition-colors">LinkedIn</a>
                        )}
                        {app.student.githubUrl && (
                          <a href={app.student.githubUrl} target="_blank" rel="noreferrer" className="text-brand-cyan hover:text-white transition-colors">GitHub</a>
                        )}
                        {app.student.portfolioUrl && (
                          <a href={app.student.portfolioUrl} target="_blank" rel="noreferrer" className="text-brand-cyan hover:text-white transition-colors">Portfolio</a>
                        )}
                      </div>

                      {/* Answers */}
                      {app.answers.length > 0 ? (
                        <div className="space-y-4 mb-5">
                          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Responses</h4>
                          {app.answers.map((a) => (
                            <div key={a.id} className="bg-brand-dark-elevated border border-white/[0.04] rounded-lg p-4">
                              <p className="text-white/50 text-sm font-medium mb-1.5">{a.question.questionText}</p>
                              <p className="text-white/80 text-sm whitespace-pre-wrap">{a.answerText}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/30 text-sm mb-5">No question responses (applied without questions).</p>
                      )}

                      {/* Status actions */}
                      <div className="flex flex-wrap gap-2">
                        {['reviewed', 'accepted', 'rejected'].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusUpdate(app.id, s)}
                            disabled={updating === app.id || app.status === s}
                            className={`text-xs px-3 py-1.5 rounded-lg capitalize font-medium transition-colors disabled:opacity-30 ${
                              s === 'accepted' ? 'bg-accent-green/15 text-accent-green hover:bg-accent-green/25 border border-accent-green/25' :
                              s === 'rejected' ? 'bg-accent-rose/15 text-accent-rose hover:bg-accent-rose/25 border border-accent-rose/25' :
                              'bg-brand-purple/15 text-brand-purple hover:bg-brand-purple/25 border border-brand-purple/25'
                            }`}
                          >
                            {s === 'reviewed' ? 'Mark Reviewed' : s === 'accepted' ? 'Accept' : 'Reject'}
                          </button>
                        ))}
                        <Link
                          to={`/student/profile/${app.studentId}/view`}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium border border-white/15 text-white/50 hover:text-brand-cyan hover:border-brand-cyan/40 transition-colors"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
