import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useRole } from '../context/RoleContext';
import { api } from '../api';

export default function StudentProfileViewPage() {
  const { id } = useParams();
  const { role } = useRole();
  const { data: student, loading } = useFetch(`/students/${id}`);

  useEffect(() => {
    if (id && role) {
      api.post('/analytics/events', {
        eventType: 'profile_view',
        targetId: Number(id),
        viewerRole: role,
      }).catch(() => {});
    }
  }, [id, role]);

  if (loading) return <div className="text-center py-12 text-white/50">Loading...</div>;
  if (!student) return <div className="text-center py-12 text-white/50">Student not found</div>;

  const skills = student.skills ? student.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const initials = [student.firstName?.[0], student.lastName?.[0]].filter(Boolean).join('').toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Back link */}
      <Link
        to="/students"
        className="inline-flex items-center gap-1 text-brand-cyan hover:text-white text-sm font-medium mb-6 transition-colors"
      >
        ← Back to Students
      </Link>

      {/* Profile header — gradient card */}
      <div className="bg-gradient-to-br from-brand-purple-dark to-brand-purple rounded-2xl p-6 mb-4 text-white">
        {/* Initials avatar */}
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white mb-4">
          {initials}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {student.firstName} {student.lastName}
            </h1>
            {student.location && (
              <p className="text-white/70 text-sm mt-1">📍 {student.location}</p>
            )}
          </div>
          <span
            className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium ${
              student.isActive
                ? 'bg-brand-cyan text-brand-purple-dark'
                : 'bg-white/20 text-white/70'
            }`}
          >
            {student.isActive ? 'Available' : 'Not looking'}
          </span>
        </div>
      </div>

      {/* Content card */}
      <div className="bg-brand-dark-card border border-white/10 rounded-2xl p-6 space-y-6">

        {student.bio && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-cyan mb-2">About</h3>
            <p className="text-white/70 whitespace-pre-wrap text-sm leading-relaxed">{student.bio}</p>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-cyan mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-full px-3 py-1 text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {(student.resumeLink || student.linkedinUrl || student.githubUrl || student.portfolioUrl) && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-cyan mb-3">Links</h3>
            <div className="space-y-2">
              {student.resumeLink && (
                <a
                  href={student.resumeLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-brand-cyan hover:text-white font-medium text-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Resume
                </a>
              )}
              {student.linkedinUrl && (
                <a
                  href={student.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-brand-cyan hover:text-white font-medium text-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
              )}
              {student.githubUrl && (
                <a
                  href={student.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-brand-cyan hover:text-white font-medium text-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              )}
              {student.portfolioUrl && (
                <a
                  href={student.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-brand-cyan hover:text-white font-medium text-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                  </svg>
                  Portfolio
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
