import { Link } from 'react-router-dom';

const colorMap = {
  purple: {
    bg: 'bg-brand-purple',
    hover: 'hover:bg-brand-purple-light',
    icon: 'text-white',
    border: 'border-brand-purple-light',
  },
  teal: {
    bg: 'bg-brand-teal',
    hover: 'hover:brightness-110',
    icon: 'text-white',
    border: 'border-white/20',
  },
  cyan: {
    bg: 'bg-brand-cyan/10',
    hover: 'hover:bg-brand-cyan/15',
    icon: 'text-brand-cyan',
    border: 'border-brand-cyan/20',
  },
  dark: {
    bg: 'bg-brand-dark-card',
    hover: 'hover:bg-brand-dark-hover',
    icon: 'text-brand-cyan',
    border: 'border-white/10',
  },
  green: {
    bg: 'bg-accent-green/10',
    hover: 'hover:bg-accent-green/15',
    icon: 'text-accent-green',
    border: 'border-accent-green/20',
  },
  amber: {
    bg: 'bg-accent-amber/10',
    hover: 'hover:bg-accent-amber/15',
    icon: 'text-accent-amber',
    border: 'border-accent-amber/20',
  },
  rose: {
    bg: 'bg-accent-rose/10',
    hover: 'hover:bg-accent-rose/15',
    icon: 'text-accent-rose',
    border: 'border-accent-rose/20',
  },
};

export default function PillarCard({ label, value, icon, color = 'dark', to }) {
  const scheme = colorMap[color] || colorMap.dark;

  const content = (
    <div className={`${scheme.bg} ${scheme.hover} border ${scheme.border} rounded-xl p-6 transition-all group`}>
      <div className="flex items-start justify-between mb-4">
        <span className={`${scheme.icon} opacity-60 group-hover:opacity-100 transition-opacity`}>
          {icon}
        </span>
        {to && (
          <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
      <p className="text-3xl font-black text-white leading-none">{value}</p>
      <p className="text-sm text-white/50 mt-1.5 font-medium uppercase tracking-wide">{label}</p>
    </div>
  );

  if (to) {
    return <Link to={to} className="block">{content}</Link>;
  }

  return content;
}
