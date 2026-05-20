import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Loader2 } from 'lucide-react';
import { userLogin } from '../api';

export default function UserLogin() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);
    try {
      const res = await userLogin(name.trim());
      localStorage.setItem('userLogId', res.data.logId);
      localStorage.setItem('userName', res.data.userName);
      navigate('/user/search');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
           style={{ background: 'radial-gradient(circle, var(--accent-500), transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="glass-card p-10 md:p-12">
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
            <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))' }}>
              <User size={24} className="text-[var(--text-main)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-main)]">Welcome</h1>
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Enter your name to search the lab inventory</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="user-name" className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
                Your Name
              </label>
              <input
                id="user-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Dr. Ahmed Hassan"
                autoFocus
                className="w-full px-5 py-4 rounded-2xl text-sm text-[var(--text-main)] placeholder:text-gray-600 outline-none transition-all duration-200"
                style={{
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border-subtle)',
                }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm px-5 py-4 rounded-2xl mt-6"
                   style={{ background: 'rgba(255, 107, 107, 0.1)', color: 'var(--danger-500)', border: '1px solid rgba(255, 107, 107, 0.2)' }}>
                {error}
              </div>
            )}

            <div className="mt-8">
              <button
                id="user-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-sm font-semibold text-[var(--text-main)] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Entering...
                  </span>
                ) : (
                  'Enter Lab'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
