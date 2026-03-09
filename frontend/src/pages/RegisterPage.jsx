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
        <div className="bg-brand-dark-card border border-white/10 rounded-2xl overflow-hidden w-full">
          {/* Cyan accent top border */}
          <div className="h-1 bg-brand-cyan" />

          <div className="p-8">
            <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
            <p className="text-white/50 text-sm mb-6">Join the iMasons network</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">I am a...</label>
                <div className="grid grid-cols-2 gap-2">
                  {['student', 'employer'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, role: r, imasonsIdentifier: '' })}
                      className={`py-2 px-4 rounded-xl border text-sm font-medium capitalize transition-colors ${
                        form.role === r
                          ? 'border-brand-purple bg-brand-purple text-white'
                          : 'border-white/20 text-white/50 hover:border-brand-cyan/50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* iMasons Identifier */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">iMasons Identifier</label>
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
                    className="w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors"
                    placeholder={identifierHint[form.role]}
                  />
                </div>
                <p className="text-xs text-white/30 mt-1">
                  Provided by iMasons: {identifierHint[form.role]}
                </p>
              </div>

              {/* Email */}
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

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="new-password"
                  className="w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors"
                  placeholder="At least 6 characters"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                  className="w-full bg-brand-dark-elevated border border-white/10 text-white placeholder:text-white/30 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-cyan font-semibold hover:text-white transition-colors">
                Sign In
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
