import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { api } from '../api';
import ImasonsLogo from '../components/ImasonsLogo';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useRole();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      setAuth(res);

      if (res.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.role === 'student') {
        navigate(res.linkedProfileId ? `/student/dashboard/${res.linkedProfileId}` : '/student/dashboard');
      } else {
        navigate(res.linkedProfileId ? `/employer/dashboard/${res.linkedProfileId}` : '/employer/dashboard');
      }
    } catch (err) {
      setError(err.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <ImasonsLogo variant="dark" className="h-12" />
        </div>

        {/* Card */}
        <div className="bg-brand-dark-card border border-white/10 rounded-2xl overflow-hidden w-full">
          {/* Cyan accent top border */}
          <div className="h-1 bg-brand-cyan" />

          <div className="p-8">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-white/50 text-sm mb-6">Sign in to your iMasons account</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  className="w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-cyan font-semibold hover:text-white transition-colors">
                Register
              </Link>
            </p>
          </div>
        </div>

        <p className="text-white/20 text-xs text-center mt-4">
          Secure access for iMasons members only
        </p>
      </div>
    </div>
  );
}
