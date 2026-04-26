const creators = [
  {
    name: 'Adrian Alfonso',
    role: 'Computer Science Major · Software Engineering Specialization · Data Science Minor',
    skills: ['C++', 'C', 'Java', 'JavaScript', 'React', 'Python', 'Docker', 'Git/GitHub', 'MySQL'],
    highlights: [
      'Software Developer Intern at Epsilon focused on scalable backend systems and RESTful API design.',
      'Software Engineer Intern at VoiceWare, building web UI/UX with HTML, CSS, and JavaScript.',
      'Built full-stack AI applications with React/Next.js and PostgreSQL.',
    ],
    plans: 'Plans to work full-time as a software developer in the Dallas–Irving area.',
  },
  {
    name: 'Ben King',
    role: 'Computer Science Major · Business Minor',
    skills: ['Java', 'Python', 'C/C++', 'JavaScript', 'React', 'Node.js', 'Docker', 'MySQL', 'R', 'Git/GitHub'],
    highlights: [
      'Summer Intern at Augment AI supporting valuation analysis, investor research, and outreach strategy.',
      'Technology Associate at BKBM, managing SQL databases and technical infrastructure support.',
      'Built advanced C++ tooling with custom memory management and performance profiling.',
    ],
    plans: 'Interested in tech consulting after graduation.',
  },
  {
    name: 'Eli Chesnut',
    role: 'Computer Science Major · AI/ML Specialization · Data Science Minor',
    skills: ['Python', 'C++', 'SQL', 'R', 'Java', 'Docker', 'Jupyter', 'Tableau', 'Git/GitHub'],
    highlights: [
      'AI & Automation Intern at Inflo Design Group building ETL pipelines and analytics dashboards.',
      'IT Intern at HCA supporting multi-department device deployment and system operations.',
      'Applied clustering/classification models and large-scale SQL analytics for outreach optimization.',
    ],
    plans: 'Focused on AI/data engineering work after graduation.',
  },
  {
    name: 'Jack Johnson',
    role: 'B.A. in Computer Science & Data Science · Security Specialization · Business Minor ',
    skills: ['Java', 'C/C++', 'SQL', 'Python', 'R', 'MySQL', 'Git/GitHub', 'Linux VMs', 'VS Code'],
    highlights: [
      'Built a private-lending business website and software-focused academic projects.',
      'Implemented custom data structures and search/sentiment processing tools.',
      'Combines software engineering fundamentals with practical web and database experience.',
    ],
    plans: 'Seeking software-focused opportunities to keep building practical systems.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-dark">
      <section className="bg-gradient-to-r from-brand-purple-dark/40 via-brand-dark to-brand-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-brand-cyan text-xs font-semibold uppercase tracking-[0.2em] mb-2">About</p>
          <h1 className="text-3xl md:text-4xl font-black text-white">Meet the Team Behind This Platform</h1>
          <p className="text-white/50 mt-3 max-w-3xl">
            This project was created by SMU computer science students focused on connecting student talent with meaningful opportunities.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 gap-5">
          {creators.map((creator) => (
            <article key={creator.name} className="bg-brand-dark-card border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-brand-purple/25 text-brand-cyan flex items-center justify-center font-bold shrink-0">
                  {creator.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{creator.name}</h2>
                  <p className="text-white/50 text-sm mt-1">{creator.role}</p>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan mb-2">Key Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {creator.skills.map((skill) => (
                    <span key={skill} className="text-xs rounded-full px-2.5 py-1 bg-white/5 border border-white/10 text-white/70">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan mb-2">Highlights</h3>
                <ul className="space-y-1.5 text-sm text-white/70 list-disc pl-5">
                  {creator.highlights.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>

              <p className="mt-5 text-sm text-white/60">
                <span className="text-white/80 font-medium">Next step:</span> {creator.plans}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
