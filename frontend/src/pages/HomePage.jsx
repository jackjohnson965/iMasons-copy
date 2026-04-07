import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import PillarCard from '../components/PillarCard';
import Footer from '../components/Footer';
import { useFetch } from '../hooks/useFetch';

/* ─── SVG icon helpers ─── */
const icons = {
  briefcase: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  chart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  bolt: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  star: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  bookmark: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  mentor: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197v-1" />
    </svg>
  ),
  gear: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

/* ─── Authenticated Dashboard ─── */
function AuthenticatedDashboard() {
  const { role, linkedProfileId, isStudent, isEmployer, isAdmin } = useRole();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch relevant stats
  const studentId = isStudent ? linkedProfileId : null;
  const employerId = isEmployer ? linkedProfileId : null;
  const { data: studentAnalytics } = useFetch(studentId ? `/analytics/student/${studentId}` : null);
  const { data: saved } = useFetch(studentId ? `/saved-postings?studentId=${studentId}` : null);
  const { data: postings } = useFetch(employerId ? `/job-postings?employerId=${employerId}` : null);
  const { data: employerAnalytics } = useFetch(employerId ? `/analytics/employer/${employerId}` : null);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">

      {/* Hero Search Section */}
      <section className="relative bg-gradient-to-br from-brand-purple-dark via-brand-dark to-brand-dark overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />
        {/* Gradient orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <p className="text-brand-cyan text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            iMasons Job & Internship Platform
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3">
            Search for Jobs
          </h1>
          <p className="text-white/40 text-base mb-8 max-w-lg">
            Discover opportunities in digital infrastructure from top employers in the iMasons network.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex max-w-2xl">
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-white/30">
                {icons.search}
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Job title, company, or keyword..."
                className="w-full bg-brand-dark-elevated/80 border border-white/10 text-white placeholder:text-white/30 rounded-l-xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-brand-purple hover:bg-brand-purple-light text-white font-semibold px-8 rounded-r-xl transition-colors text-sm"
            >
              Search
            </button>
          </form>

          {/* Quick links */}
          <div className="flex flex-wrap gap-2 mt-4">
            {['Internship', 'Full-Time', 'Mentorship', 'Remote'].map((tag) => (
              <Link
                key={tag}
                to={`/jobs?jobType=${tag.toLowerCase()}`}
                className="text-xs text-white/40 hover:text-brand-cyan border border-white/10 hover:border-brand-cyan/30 px-3 py-1 rounded-full transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pillar Cards — Quick Stats */}
      <section className="max-w-7xl mx-auto px-6 w-full -mt-1 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Quick Overview</h2>
          <Link
            to={
              isStudent && linkedProfileId ? `/student/dashboard/${linkedProfileId}` :
              isEmployer && linkedProfileId ? `/employer/dashboard/${linkedProfileId}` :
              isAdmin ? '/admin/dashboard' : '/jobs'
            }
            className="text-xs text-brand-cyan hover:text-white font-medium transition-colors"
          >
            View Full Dashboard →
          </Link>
        </div>

        {isStudent && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PillarCard
              label="Active Jobs"
              value="Browse"
              icon={icons.briefcase}
              color="purple"
              to="/jobs"
            />
            <PillarCard
              label="Saved Jobs"
              value={saved?.length ?? 0}
              icon={icons.bookmark}
              color="cyan"
              to={linkedProfileId ? `/student/dashboard/${linkedProfileId}` : '/jobs'}
            />
            <PillarCard
              label="Profile Views"
              value={studentAnalytics?.totalViews ?? 0}
              icon={icons.chart}
              color="green"
            />
            <PillarCard
              label="Profile Strength"
              value={linkedProfileId ? 'Active' : 'Setup'}
              icon={icons.star}
              color={linkedProfileId ? 'amber' : 'rose'}
              to={linkedProfileId ? `/student/profile/${linkedProfileId}` : '/student/profile/new'}
            />
          </div>
        )}

        {isEmployer && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PillarCard
              label="Active Postings"
              value={postings?.filter(p => p.status === 'active').length ?? 0}
              icon={icons.briefcase}
              color="purple"
              to={linkedProfileId ? `/employer/dashboard/${linkedProfileId}` : '/jobs/new'}
            />
            <PillarCard
              label="Total Views"
              value={employerAnalytics?.totalViews ?? 0}
              icon={icons.chart}
              color="cyan"
            />
            <PillarCard
              label="Email Clicks"
              value={employerAnalytics?.totalEmailClicks ?? 0}
              icon={icons.bolt}
              color="green"
            />
            <PillarCard
              label="Student Directory"
              value="Browse"
              icon={icons.users}
              color="amber"
              to="/students"
            />
          </div>
        )}

        {isAdmin && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <PillarCard
              label="Admin Panel"
              value="Manage"
              icon={icons.gear}
              color="purple"
              to="/admin/dashboard"
            />
            <PillarCard
              label="All Jobs"
              value="Browse"
              icon={icons.briefcase}
              color="cyan"
              to="/jobs"
            />
            <PillarCard
              label="Students"
              value="Directory"
              icon={icons.users}
              color="green"
              to="/students"
            />
          </div>
        )}
      </section>

      {/* Quick Access Cards */}
      <section className="max-w-7xl mx-auto px-6 w-full pb-10">
        <h2 className="text-lg font-bold text-white mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/jobs"
            className="group bg-brand-dark-card border border-white/[0.06] rounded-xl p-6 hover:border-brand-purple/40 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-purple/20 flex items-center justify-center text-brand-purple-light mb-4 group-hover:bg-brand-purple/30 transition-colors">
              {icons.briefcase}
            </div>
            <h3 className="text-white font-semibold mb-1">Browse Jobs</h3>
            <p className="text-white/40 text-sm">Search and filter open positions across the iMasons network.</p>
          </Link>

          <Link
            to="/mentors"
            className="group bg-brand-dark-card border border-white/[0.06] rounded-xl p-6 hover:border-brand-teal/40 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-teal/20 flex items-center justify-center text-brand-teal mb-4 group-hover:bg-brand-teal/30 transition-colors">
              {icons.mentor}
            </div>
            <h3 className="text-white font-semibold mb-1">Find Mentors</h3>
            <p className="text-white/40 text-sm">Connect with experienced professionals for guidance and growth.</p>
          </Link>

          <Link
            to="/students"
            className="group bg-brand-dark-card border border-white/[0.06] rounded-xl p-6 hover:border-brand-cyan/30 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-cyan/10 flex items-center justify-center text-brand-cyan mb-4 group-hover:bg-brand-cyan/20 transition-colors">
              {icons.users}
            </div>
            <h3 className="text-white font-semibold mb-1">Student Directory</h3>
            <p className="text-white/40 text-sm">Discover talented students from universities worldwide.</p>
          </Link>
        </div>
      </section>

      <div className="flex-1" />
      <Footer />
    </div>
  );
}

/* ─── Unauthenticated Landing ─── */
export default function HomePage() {
  const { isAuthenticated } = useRole();

  if (isAuthenticated) {
    return <AuthenticatedDashboard />;
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-brand-purple-dark via-black to-black overflow-hidden">
        {/* Background grid texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />
        {/* Gradient orb */}
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-brand-purple/15 rounded-full blur-3xl translate-x-1/3" />

        <div className="relative max-w-7xl mx-auto px-6 py-32">
          <p className="text-brand-cyan text-xs font-semibold uppercase tracking-[0.2em] mb-6">
            iMasons Job & Internship Platform
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
              className="bg-brand-purple hover:bg-brand-purple-light text-white px-8 py-3 font-semibold transition-colors text-sm uppercase tracking-wide rounded-lg"
            >
              Start Now
            </Link>
            <Link
              to="/login"
              className="text-white/60 hover:text-white text-sm font-medium transition-colors border border-white/20 hover:border-white/40 px-6 py-3 rounded-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-dark-card border-y border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-white/40 text-xs text-center mb-12 uppercase tracking-[0.2em]">
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

      {/* Pillar CTA cards */}
      <section className="grid grid-cols-1 md:grid-cols-3">
        <div className="bg-brand-purple p-10 md:p-14 min-h-[320px] flex flex-col justify-between group hover:brightness-110 transition-all">
          <div className="w-10 h-10 border-2 border-white/30 rounded-lg flex items-center justify-center mb-8">
            {icons.users}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Students</h2>
            <p className="text-white/60 text-sm mb-6">Build your profile, discover opportunities, and connect with leading digital infrastructure companies.</p>
            <Link to="/register" className="text-white font-semibold text-sm border-b border-white/40 hover:border-white pb-0.5 transition-colors">
              Create Profile →
            </Link>
          </div>
        </div>

        <div className="bg-brand-teal p-10 md:p-14 min-h-[320px] flex flex-col justify-between group hover:brightness-110 transition-all">
          <div className="w-10 h-10 border-2 border-white/30 rounded-lg flex items-center justify-center mb-8">
            {icons.briefcase}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Employers</h2>
            <p className="text-white/60 text-sm mb-6">Post internships and jobs, discover talented students from the iMasons community.</p>
            <Link to="/register" className="text-white font-semibold text-sm border-b border-white/40 hover:border-white pb-0.5 transition-colors">
              Post a Job →
            </Link>
          </div>
        </div>

        <div className="bg-brand-dark-card border-t border-white/5 p-10 md:p-14 min-h-[320px] flex flex-col justify-between group">
          <div className="w-10 h-10 border-2 border-brand-cyan/40 rounded-lg flex items-center justify-center mb-8">
            <span className="text-brand-cyan">{icons.bolt}</span>
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

      <Footer />
    </div>
  );
}
