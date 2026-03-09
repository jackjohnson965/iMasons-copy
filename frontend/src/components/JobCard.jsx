import { Link } from 'react-router-dom';

const typeColors = {
  internship: 'bg-brand-purple/30 text-brand-cyan border border-brand-purple/40',
  'full-time': 'bg-brand-teal/30 text-brand-cyan border border-brand-teal/40',
  'part-time': 'bg-brand-purple/20 text-white/70 border border-white/10',
  mentorship: 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30',
};

export default function JobCard({ job, showSave, isSaved, onSave }) {
  return (
    <div className="bg-brand-dark-card border border-white/10 rounded-lg p-4 hover:border-brand-cyan/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            to={`/jobs/${job.id}`}
            className="font-semibold text-white hover:text-brand-cyan transition-colors"
          >
            {job.title}
          </Link>
          <div className="flex items-center gap-3 mt-2 text-sm text-white/50">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[job.jobType] || 'bg-white/10 text-white/60 border border-white/10'}`}>
              {job.jobType}
            </span>
            {job.location && <span>📍 {job.location}</span>}
            {job.industry && <span>🏭 {job.industry}</span>}
          </div>
          <p className="text-white/60 text-sm mt-2 line-clamp-2">{job.description}</p>
        </div>
        {showSave && (
          <button
            onClick={(e) => { e.preventDefault(); onSave(); }}
            disabled={isSaved}
            className={`ml-4 text-sm px-3 py-1 rounded-lg border transition-colors ${
              isSaved
                ? 'border-white/10 text-white/30 cursor-default'
                : 'border-white/20 text-white/70 hover:border-brand-cyan hover:text-brand-cyan'
            }`}
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
}
