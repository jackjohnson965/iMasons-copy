import { Link } from 'react-router-dom';

export default function CompanyCard({ company }) {
  const initials = company.companyName?.[0]?.toUpperCase() || 'C';

  return (
    <div className="bg-brand-dark-card border border-white/[0.06] rounded-xl p-5 hover:border-white/15 transition-all border-l-[3px] border-l-brand-purple/40 group">
      <div className="flex items-start gap-3">
        {/* Initials avatar */}
        <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center text-sm font-bold text-brand-cyan shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <Link
              to={`/companies/${company.id}`}
              className="font-semibold text-white group-hover:text-brand-cyan transition-colors truncate"
            >
              {company.companyName}
            </Link>
          </div>

          {company.industry && (
            <p className="text-sm text-white/40 mt-0.5">{company.industry}</p>
          )}

          {company.location && (
            <p className="text-sm text-white/40 mt-0.5 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {company.location}
            </p>
          )}

          {company.description && (
            <p className="text-white/50 text-sm mt-2 line-clamp-2 leading-relaxed">{company.description}</p>
          )}

          {company.websiteUrl && (
            <div className="flex gap-3 mt-3 text-xs text-white/30">
              <a href={company.websiteUrl} target="_blank" rel="noreferrer" className="hover:text-brand-cyan transition-colors">Website</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}