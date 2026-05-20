import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { adminLogin } from '../api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin(username.trim(), password);
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUsername', res.data.username);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
           style={{ background: 'radial-gradient(circle, var(--primary-500), transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Card */}
        <div className="glass-card p-10 md:p-12">
          {/* Back button */}
          <button
            id="back-to-home-btn"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm mb-6 transition-colors cursor-pointer hover:text-[var(--text-main)]"
            style={{ color: 'var(--text-dim)' }}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))' }}>
              <ShieldCheck size={24} className="text-[var(--text-main)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-main)]">Admin Login</h1>
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Authorized personnel only</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="admin-username" className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
                Username
              </label>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter admin username"
                autoComplete="username"
                className="w-full px-5 py-4 rounded-2xl text-sm text-[var(--text-main)] placeholder:text-gray-600 outline-none transition-all duration-200 focus:ring-2"
                style={{
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border-subtle)',
                  focusRing: 'var(--primary-500)',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium mb-3 mt-6" style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full px-5 py-4 pr-12 rounded-2xl text-sm text-[var(--text-main)] placeholder:text-gray-600 outline-none transition-all duration-200"
                  style={{
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border-subtle)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: 'var(--text-dim)' }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm px-5 py-4 rounded-2xl mt-6"
                   style={{ background: 'rgba(255, 107, 107, 0.1)', color: 'var(--danger-500)', border: '1px solid rgba(255, 107, 107, 0.2)' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="mt-8">
              <button
                id="admin-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-sm font-semibold text-[var(--text-main)] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Authenticating...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
