import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Package, LogOut, FlaskConical, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { userSearch, userLogout } from '../api';

export default function UserSearch() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState(null); // null = not searched yet
  const [loading, setLoading] = useState(false);
  const userName = localStorage.getItem('userName') || 'User';
  const logId = parseInt(localStorage.getItem('userLogId') || '0');

  // Redirect if no session
  useEffect(() => {
    if (!logId) navigate('/user/login', { replace: true });
  }, [logId, navigate]);

  // Handle browser close / tab close — send logout beacon
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (logId) {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        fetch(`${apiUrl}/user/logout`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('11310561:60-dayfreetrial')
          },
          body: JSON.stringify({ logId }),
          keepalive: true
        }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [logId]);

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const res = await userSearch(logId, keyword.trim());
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, logId]);

  const handleLogout = async () => {
    try {
      await userLogout(logId);
    } catch { /* best effort */ }
    localStorage.removeItem('userLogId');
    localStorage.removeItem('userName');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
           style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <FlaskConical size={20} style={{ color: 'var(--accent-400)' }} />
          <span className="font-semibold text-[var(--text-main)] text-sm">Lab Inventory</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(59, 201, 219, 0.1)', color: 'var(--accent-400)' }}>
            {userName}
          </span>
          <button
            id="user-logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all cursor-pointer hover:bg-red-500/10"
            style={{ color: 'var(--danger-500)' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-2">
            Find Your Material
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-dim)' }}>
            Search by name to instantly find the exact location of any chemical in the lab.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative mb-10">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
            <input
              id="search-input"
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Search materials... (e.g. Sodium Chloride, HCl, Ethanol)"
              className="w-full pl-12 pr-28 py-5 rounded-2xl text-sm text-[var(--text-main)] placeholder:text-gray-600 outline-none transition-all duration-200"
              style={{
                background: 'var(--bg-card-solid)',
                border: '1px solid var(--border-subtle)',
              }}
            />
            <button
              id="search-submit-btn"
              type="submit"
              disabled={loading || !keyword.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl text-sm font-medium text-[var(--text-main)] transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))' }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Results */}
          {results === null ? (
            <div className="text-center py-16">
              <Search size={40} className="mx-auto mb-4 opacity-10" />
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
                Start typing to search for materials
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 animate-fade-in-up">
              <AlertCircle size={40} className="mx-auto mb-4" style={{ color: 'var(--warning-500)', opacity: 0.5 }} />
              <p className="text-lg font-semibold text-[var(--text-main)] mb-2">No Results Found</p>
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
                No material matching "<span className="text-[var(--text-main)]">{keyword}</span>" exists in the inventory.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-dim)' }}>
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
              {results.map((m, i) => (
                <div
                  key={m.id}
                  className="glass-card p-6 flex items-start gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="p-4 rounded-2xl shrink-0"
                       style={{ background: m.isAvailable ? 'rgba(81, 207, 102, 0.1)' : 'rgba(255, 107, 107, 0.1)' }}>
                    <Package size={22} style={{ color: m.isAvailable ? 'var(--success-500)' : 'var(--danger-500)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[var(--text-main)] text-sm truncate">{m.materialName}</h3>
                      {m.isAvailable ? (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full shrink-0"
                              style={{ background: 'rgba(81, 207, 102, 0.1)', color: 'var(--success-500)' }}>
                          <CheckCircle size={10} /> Available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full shrink-0"
                              style={{ background: 'rgba(255, 107, 107, 0.1)', color: 'var(--danger-500)' }}>
                          <XCircle size={10} /> Unavailable
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <MapPin size={12} style={{ color: 'var(--primary-400)' }} />
                      <span>{m.physicalLocation}</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
                      Quantity: <span className="text-[var(--text-main)] font-medium">{m.quantity}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
