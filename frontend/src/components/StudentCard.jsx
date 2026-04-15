import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SkillTag from './SkillTag';

export default function StudentCard({ student }) {
  const skills = student.skills ? student.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const initials = [student.firstName?.[0], student.lastName?.[0]].filter(Boolean).join('').toUpperCase();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';

    const loadProfilePhoto = async () => {
      const link = student?.profileImageLink;
      if (!link) {
        setProfilePhotoUrl('');
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        setProfilePhotoUrl('');
        return;
      }
      try {
        const res = await fetch(link, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setProfilePhotoUrl('');
          return;
        }
        const blob = await res.blob();
        objectUrl = window.URL.createObjectURL(blob);
        if (!cancelled) {
          setProfilePhotoUrl(objectUrl);
        }
      } catch {
        if (!cancelled) setProfilePhotoUrl('');
      }
    };

    loadProfilePhoto();
    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [student?.profileImageLink]);

  return (
    <div className="bg-brand-dark-card border border-white/[0.06] rounded-xl p-5 hover:border-white/15 transition-all border-l-[3px] border-l-brand-purple/40 group">
      <div className="flex items-start gap-3">
        {profilePhotoUrl ? (
          <img
            src={profilePhotoUrl}
            alt={`${student.firstName} ${student.lastName}`}
            className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center text-sm font-bold text-brand-cyan shrink-0">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <Link
              to={`/student/profile/${student.id}/view`}
              className="font-semibold text-white group-hover:text-brand-cyan transition-colors truncate"
            >
              {student.firstName} {student.lastName}
            </Link>
            {student.isActive ? (
              <span className="shrink-0 bg-accent-green/15 text-accent-green border border-accent-green/25 text-xs px-2 py-0.5 rounded-full font-medium">
                Available
              </span>
            ) : (
              <span className="shrink-0 bg-white/5 text-white/40 border border-white/10 text-xs px-2 py-0.5 rounded-full">
                Not looking
              </span>
            )}
          </div>

          {student.location && (
            <p className="text-sm text-white/40 mt-0.5 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {student.location}
            </p>
          )}

          {student.bio && (
            <p className="text-white/50 text-sm mt-2 line-clamp-2 leading-relaxed">{student.bio}</p>
          )}

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {skills.slice(0, 5).map((skill) => (
                <SkillTag key={skill} skill={skill} />
              ))}
              {skills.length > 5 && (
                <span className="text-xs text-white/25 self-center">+{skills.length - 5} more</span>
              )}
            </div>
          )}

          {(student.linkedinUrl || student.githubUrl) && (
            <div className="flex gap-3 mt-3 text-xs text-white/30">
              {student.linkedinUrl && (
                <a href={student.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-brand-cyan transition-colors">LinkedIn</a>
              )}
              {student.githubUrl && (
                <a href={student.githubUrl} target="_blank" rel="noreferrer" className="hover:text-brand-cyan transition-colors">GitHub</a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
