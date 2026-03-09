import { Link } from 'react-router-dom';
import SkillTag from './SkillTag';

export default function StudentCard({ student }) {
  const skills = student.skills ? student.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="bg-brand-dark-card border border-white/10 rounded-lg p-4 hover:border-brand-cyan/30 transition-colors">
      <Link
        to={`/student/profile/${student.id}/view`}
        className="font-semibold text-white hover:text-brand-cyan transition-colors"
      >
        {student.firstName} {student.lastName}
      </Link>
      {student.location && (
        <p className="text-sm text-white/50 mt-1">📍 {student.location}</p>
      )}
      {student.bio && (
        <p className="text-white/60 text-sm mt-2 line-clamp-2">{student.bio}</p>
      )}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {skills.slice(0, 5).map((skill) => (
            <SkillTag key={skill} skill={skill} />
          ))}
          {skills.length > 5 && (
            <span className="text-xs text-white/30">+{skills.length - 5} more</span>
          )}
        </div>
      )}
      <div className="flex gap-3 mt-3 text-xs">
        {student.linkedinUrl && <span className="text-brand-cyan">LinkedIn</span>}
        {student.githubUrl && <span className="text-brand-cyan">GitHub</span>}
        {student.isActive ? (
          <span className="bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 px-2 py-0.5 rounded-full">Available</span>
        ) : (
          <span className="bg-white/5 text-white/40 border border-white/10 px-2 py-0.5 rounded-full">Not looking</span>
        )}
      </div>
    </div>
  );
}
