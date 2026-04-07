export default function SkillTag({ skill }) {
  return (
    <span className="bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 text-xs px-2.5 py-0.5 rounded-full font-medium hover:bg-brand-cyan/15 transition-colors">
      {skill}
    </span>
  );
}
