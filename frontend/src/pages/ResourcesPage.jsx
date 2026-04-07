import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { api } from '../api';
import Skeleton from '../components/Skeleton';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useRole();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const data = await api.get('/resources');
      setResources(data);
    } catch (err) {
      setError('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }
    try {
      await api.delete(`/resources/${id}`);
      setResources(resources.filter(resource => resource.id !== id));
    } catch (err) {
      setError('Failed to delete resource');
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Page header */}
      <section className="bg-gradient-to-r from-brand-teal/20 via-brand-dark to-brand-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-brand-cyan text-xs font-semibold uppercase tracking-[0.2em] mb-2">Learning</p>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Resources</h1>
              <p className="text-white/40 text-sm max-w-lg">
                Explore helpful resources and links to support your journey in digital infrastructure.
              </p>
            </div>
            {isAdmin && (
              <Link
                to="/admin/dashboard?tab=resources"
                className="bg-brand-purple hover:bg-brand-purple-light text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shrink-0"
              >
                Manage Resources
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-accent-rose/10 border border-accent-rose/30 text-accent-rose p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton.ResourceCard key={i} />
            ))}
          </div>
        ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="bg-brand-dark-card border border-white/[0.06] rounded-xl p-6 hover:border-white/15 transition-all group relative"
              >
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Link
                      to={`/admin/dashboard?editResource=${resource.id}`}
                      className="text-xs text-white/30 hover:text-accent-blue transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="text-xs text-white/30 hover:text-accent-rose transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}

                <div className="w-10 h-10 rounded-lg bg-brand-teal/15 flex items-center justify-center text-brand-teal mb-4 group-hover:bg-brand-teal/25 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>

                <h3 className="text-base font-semibold text-white mb-2 pr-16 group-hover:text-brand-cyan transition-colors">
                  {resource.title}
                </h3>
                <p className="text-white/40 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {resource.description}
                </p>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-brand-cyan hover:text-white text-sm font-medium transition-colors"
                >
                  Visit Resource
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-dark-card border border-white/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-white/40 font-medium mb-1">No resources available</p>
            <p className="text-white/25 text-sm">Check back later for new learning materials.</p>
          </div>
        )}
      </div>
    </div>
  );
}
