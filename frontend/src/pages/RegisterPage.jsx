import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { api } from '../api';
import ImasonsLogo from '../components/ImasonsLogo';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useRole();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    imasonsIdentifier: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const identifierHint = {
    student: 'STU-XXXX (e.g., STU-1234)',
    employer: 'EMP-XXXX (e.g., EMP-1234)',
    admin: 'ADM-XXXX (e.g., ADM-0001)',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        role: form.role,
        imasonsIdentifier: form.imasonsIdentifier,
      });
      setAuth(res);

      if (res.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/employer/dashboard');
      }
    } catch (err) {
      setError(err.data?.detail || 'Registration failed');
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
        <div className="bg-brand-dark-card border border-white/[0.06] rounded-2xl overflow-hidden w-full">
          <div className="h-1 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-teal" />

          <div className="p-8">
            <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
            <p className="text-white/40 text-sm mb-8">Join the iMasons network</p>

            {error && (
              <div className="bg-accent-rose/10 border border-accent-rose/30 text-accent-rose p-3 rounded-lg mb-6 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">I am a...</label>
                <div className="grid grid-cols-2 gap-2">
                  {['student', 'employer'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, role: r, imasonsIdentifier: '' })}
                      className={`py-2.5 px-4 rounded-lg border text-sm font-medium capitalize transition-colors ${
                        form.role === r
                          ? 'border-brand-purple bg-brand-purple text-white'
                          : 'border-white/15 text-white/50 hover:border-brand-cyan/40 hover:text-white/70'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* iMasons Identifier */}
              <div>
                <label className="block text-sm font-medium text-white/50 mb-1.5">iMasons Identifier</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={form.imasonsIdentifier}
                    onChange={(e) => setForm({ ...form, imasonsIdentifier: e.target.value.toUpperCase() })}
                    required
                    className="w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors"
                    placeholder={identifierHint[form.role]}
                  />
                </div>
                <p className="text-xs text-white/25 mt-1.5">
                  Provided by iMasons: {identifierHint[form.role]}
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white/50 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white/50 mb-1.5">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="new-password"
                  className="w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors"
                  placeholder="At least 6 characters"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-white/50 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                  className="w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-purple hover:bg-brand-purple-light text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-white/30 mt-8">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-cyan font-semibold hover:text-white transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <p className="text-white/15 text-xs text-center mt-6">
          Secure access for iMasons members only
        </p>
      </div>
    </div>
  );
}
