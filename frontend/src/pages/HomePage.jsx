import { Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import ImasonsLogo from '../components/ImasonsLogo';

const footerLinks = (
  <div className="bg-brand-dark border-t border-white/5 py-6">
    <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-4">
      <p className="text-white/20 text-sm">iMasons Foundation · Shaping the Digital Future for All</p>
      <div className="flex gap-6 text-sm text-white/40">
        <a href="https://imasons.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">iMasons Foundation</a>
        <a href="https://www.linkedin.com/company/infrastructure-masons/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
        <a href="https://imasons.org/privacy-policy/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy Policy</a>
      </div>
    </div>
  </div>
);

export default function HomePage() {
  const { isAuthenticated, role, linkedProfileId } = useRole();

  // Authenticated — color-block dashboard cards
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 py-16 w-full">
          <p className="text-brand-cyan text-sm font-semibold uppercase tracking-widest mb-4">
            iMasons Job &amp; Internship Platform
          </p>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-4">
            Welcome Back.
          </h1>
          <p className="text-white/50 text-lg max-w-xl">
            Choose where you'd like to go.
          </p>
        </div>

        {/* Color-block CTA cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1">
          <Link
            to="/jobs"
            className="bg-brand-purple p-10 min-h-[280px] flex flex-col justify-between group transition-opacity hover:opacity-90"
          >
            <div className="w-10 h-10 border-2 border-white/40 rounded-lg flex items-center justify-center mb-8">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Browse Jobs</h2>
              <p className="text-white/60 text-sm">Search and filter job postings</p>
            </div>
          </Link>

          <Link
            to="/students"
            className="bg-brand-teal p-10 min-h-[280px] flex flex-col justify-between group transition-opacity hover:opacity-90"
          >
            <div className="w-10 h-10 border-2 border-white/40 rounded-lg flex items-center justify-center mb-8">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Browse Students</h2>
              <p className="text-white/60 text-sm">Search the student directory</p>
            </div>
          </Link>

          {role === 'student' && (
            <Link
              to={linkedProfileId ? `/student/dashboard/${linkedProfileId}` : '/student/dashboard'}
              className="bg-brand-dark-card border-l border-white/5 p-10 min-h-[280px] flex flex-col justify-between group transition-colors hover:bg-brand-dark-elevated"
            >
              <div className="w-10 h-10 border-2 border-brand-cyan/40 rounded-lg flex items-center justify-center mb-8">
                <svg className="w-5 h-5 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">My Dashboard</h2>
                <p className="text-white/50 text-sm">Saved jobs and analytics</p>
              </div>
            </Link>
          )}

          {role === 'employer' && (
            <Link
              to={linkedProfileId ? `/employer/dashboard/${linkedProfileId}` : '/employer/dashboard'}
              className="bg-brand-dark-card border-l border-white/5 p-10 min-h-[280px] flex flex-col justify-between group transition-colors hover:bg-brand-dark-elevated"
            >
              <div className="w-10 h-10 border-2 border-brand-cyan/40 rounded-lg flex items-center justify-center mb-8">
                <svg className="w-5 h-5 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">My Dashboard</h2>
                <p className="text-white/50 text-sm">Manage postings and analytics</p>
              </div>
            </Link>
          )}

          {role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="bg-brand-purple-dark p-10 min-h-[280px] flex flex-col justify-between group transition-opacity hover:opacity-90"
            >
              <div className="w-10 h-10 border-2 border-brand-cyan/40 rounded-lg flex items-center justify-center mb-8">
                <svg className="w-5 h-5 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Admin Panel</h2>
                <p className="text-white/50 text-sm">Manage users and content</p>
              </div>
            </Link>
          )}
        </div>

        {footerLinks}
      </div>
    );
  }

  // Unauthenticated landing page
  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-brand-purple-dark via-black to-black overflow-hidden">
        {/* Background grid texture */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-32">
          <p className="text-brand-cyan text-sm font-semibold uppercase tracking-widest mb-6">
            iMasons Job &amp; Internship Platform
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none mb-6 max-w-4xl">
            Shaping The<br />
            <span className="text-brand-cyan">Digital</span> Future.
          </h1>
          <p className="text-white/50 text-lg md:text-xl mb-12 max-w-xl leading-relaxed">
            Connecting students and employers through the iMasons network for
            internships, mentorships, and employment opportunities.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="border border-white text-white hover:bg-white hover:text-black px-8 py-3 font-medium transition-all text-sm uppercase tracking-wide"
            >
              Start Now
            </Link>
            <Link
              to="/login"
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              Sign In →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-dark-card border-y border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-white/40 text-sm text-center mb-12 uppercase tracking-widest">
            Connecting digital infrastructure stakeholders globally
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '6,000+', label: 'Committed Participants' },
              { value: '130', label: 'Operational Countries' },
              { value: '800+', label: 'Technology Opportunities' },
              { value: '11,400+', label: 'Industry Publications' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-black text-white">{stat.value}</p>
                <p className="text-white/40 text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Color-block CTA section */}
      <section className="grid grid-cols-1 md:grid-cols-3">
        <div className="bg-brand-purple p-10 md:p-14 min-h-[320px] flex flex-col justify-between">
          <div className="w-10 h-10 border-2 border-white/30 rounded flex items-center justify-center mb-8">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Students</h2>
            <p className="text-white/60 text-sm mb-6">Build your profile, discover opportunities, and connect with leading digital infrastructure companies.</p>
            <Link to="/register" className="text-white font-semibold text-sm border-b border-white/40 hover:border-white pb-0.5 transition-colors">
              Create Profile →
            </Link>
          </div>
        </div>

        <div className="bg-brand-teal p-10 md:p-14 min-h-[320px] flex flex-col justify-between">
          <div className="w-10 h-10 border-2 border-white/30 rounded flex items-center justify-center mb-8">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Employers</h2>
            <p className="text-white/60 text-sm mb-6">Post internships and jobs, discover talented students from the iMasons community.</p>
            <Link to="/register" className="text-white font-semibold text-sm border-b border-white/40 hover:border-white pb-0.5 transition-colors">
              Post a Job →
            </Link>
          </div>
        </div>

        <div className="bg-brand-dark-card border-t border-white/5 p-10 md:p-14 min-h-[320px] flex flex-col justify-between">
          <div className="w-10 h-10 border-2 border-brand-cyan/40 rounded flex items-center justify-center mb-8">
            <svg className="w-5 h-5 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Network</h2>
            <p className="text-white/50 text-sm mb-6">Join the global iMasons network of digital infrastructure professionals and shape the future together.</p>
            <Link to="/register" className="text-brand-cyan font-semibold text-sm border-b border-brand-cyan/40 hover:border-brand-cyan pb-0.5 transition-colors">
              Join Network →
            </Link>
          </div>
        </div>
      </section>

      {footerLinks}
    </div>
  );
}
