import { Link } from 'react-router-dom';

const typeStyles = {
  internship: {
    badge: 'bg-brand-purple/20 text-brand-cyan border-brand-purple/30',
    accent: 'border-l-brand-purple',
  },
  'full-time': {
    badge: 'bg-brand-teal/20 text-brand-cyan border-brand-teal/30',
    accent: 'border-l-brand-teal',
  },
  'part-time': {
    badge: 'bg-white/10 text-white/60 border-white/10',
    accent: 'border-l-white/20',
  },
  mentorship: {
    badge: 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/20',
    accent: 'border-l-brand-cyan',
  },
};

export default function JobCard({ job, showSave, isSaved, onSave }) {
  const style = typeStyles[job.jobType] || typeStyles['part-time'];

  return (
    <div className={`bg-brand-dark-card border border-white/[0.06] rounded-xl p-5 hover:border-white/15 transition-all group border-l-[3px] ${style.accent}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-3 mb-2">
            <Link
              to={`/jobs/${job.id}`}
              className="font-semibold text-white group-hover:text-brand-cyan transition-colors truncate"
            >
              {job.title}
            </Link>
            <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.badge}`}>
              {job.jobType}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/40 mb-3">
            {job.employer?.companyName && (
              <span className="font-medium text-white/60">{job.employer.companyName}</span>
            )}
            {job.location && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
            )}
            {job.industry && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {job.industry}
              </span>
            )}
          </div>

          {/* Description */}
          {job.description && (
            <p className="text-white/50 text-sm line-clamp-2 leading-relaxed">{job.description}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Link
            to={`/jobs/${job.id}`}
            className="bg-brand-purple hover:bg-brand-purple-light text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            Apply
          </Link>
          {showSave && (
            <button
              onClick={(e) => { e.preventDefault(); onSave(); }}
              disabled={isSaved}
              className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                isSaved
                  ? 'border-brand-cyan/20 text-brand-cyan/50 cursor-default'
                  : 'border-white/15 text-white/50 hover:border-brand-cyan/40 hover:text-brand-cyan'
              }`}
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
