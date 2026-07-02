import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Package, LogOut, FlaskConical,
  AlertCircle, CheckCircle, XCircle, Archive,
  Layers, Hash, Beaker, SearchX
} from 'lucide-react';
import { userSearch, userLogout } from '../api';

/* ── Helper: parse "دولاب: X - رف: Y" into { cabinet, shelf } ──────── */
function parseLocation(loc) {
  if (!loc) return { cabinet: loc || '—', shelf: null };
  const match = loc.match(/دولاب:\s*(.+?)\s*-\s*رف:\s*(.+)/);
  if (match) return { cabinet: match[1].trim(), shelf: match[2].trim() };
  return { cabinet: loc, shelf: null };
}

export default function UserSearch() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const userName = localStorage.getItem('userName') || 'User';
  const logId = parseInt(localStorage.getItem('userLogId') || '0');

  useEffect(() => {
    if (!logId) navigate('/user/login', { replace: true });
  }, [logId, navigate]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (logId) {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        fetch(`${apiUrl}/user/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
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
    try { await userLogout(logId); } catch { /* best effort */ }
    localStorage.removeItem('userLogId');
    localStorage.removeItem('userName');
    navigate('/', { replace: true });
  };

  /* ── Stats from results ──────────────────────────────────────────── */
  const totalResults = results?.length || 0;
  const availableCount = results?.filter(m => m.isAvailable).length || 0;
  const outOfStockCount = totalResults - availableCount;

  return (
    <div className="min-h-screen flex flex-col">

      {/* ═══════════════════ Navbar ═══════════════════════════════════ */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
           style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <FlaskConical size={20} style={{ color: 'var(--accent-400)' }} />
          <span className="font-semibold text-[var(--text-main)] text-sm">Lab Inventory</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs px-3 py-1 rounded-full"
                style={{ background: 'rgba(59, 201, 219, 0.1)', color: 'var(--accent-400)' }}>
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

      {/* ═══════════════════ Main ═════════════════════════════════════ */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-fade-in-up">

          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-2 tracking-tight">
              Find Your Material
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
              Search by name to instantly locate any chemical in the lab — cabinet &amp; shelf included.
            </p>
          </div>

          {/* ── Search Bar ─────────────────────────────────────────── */}
          <form onSubmit={handleSearch} className="search-bar-wrap relative mb-10">
            <div className="search-icon-circle">
              <Search size={18} />
            </div>
            <input
              id="search-input"
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Search materials... (e.g. Sodium Chloride, HCl, Ethanol)"
              className="search-input"
            />
            <button
              id="search-submit-btn"
              type="submit"
              disabled={loading || !keyword.trim()}
              className="search-btn"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Searching…
                </span>
              ) : 'Search'}
            </button>
          </form>

          {/* ── Results Area ───────────────────────────────────────── */}
          {results === null ? (
            /* ▸ Initial / idle state */
            <div className="text-center py-20 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
                   style={{ background: 'var(--bg-hover)' }}>
                <Beaker size={36} style={{ color: 'var(--text-dim)', opacity: 0.5 }} />
              </div>
              <p className="text-base font-medium text-[var(--text-muted)] mb-1">Ready to search</p>
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
                Type a material name above and press <kbd className="kbd">Enter</kbd> or click <strong>Search</strong>
              </p>
            </div>

          ) : results.length === 0 ? (
            /* ▸ Empty state */
            <div className="text-center py-20 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
                   style={{ background: 'rgba(255, 107, 107, 0.08)' }}>
                <SearchX size={36} style={{ color: 'var(--danger-500)', opacity: 0.7 }} />
              </div>
              <p className="text-lg font-semibold text-[var(--text-main)] mb-2">No Results Found</p>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-dim)' }}>
                No material matching "<span className="text-[var(--text-main)] font-medium">{keyword}</span>" exists in the inventory.
                <br />Please try another chemical name or formula.
              </p>
            </div>

          ) : (
            /* ▸ Results */
            <div className="animate-fade-in-up">

              {/* Stats chips */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="stat-chip">
                  <Package size={14} />
                  {totalResults} result{totalResults !== 1 ? 's' : ''}
                </span>
                {availableCount > 0 && (
                  <span className="stat-chip stat-chip--green">
                    <CheckCircle size={14} />
                    {availableCount} Available
                  </span>
                )}
                {outOfStockCount > 0 && (
                  <span className="stat-chip stat-chip--red">
                    <XCircle size={14} />
                    {outOfStockCount} Out of Stock
                  </span>
                )}
              </div>

              {/* ═══ Desktop / Tablet Table ═══════════════════════════ */}
              <div className="result-table-wrapper hidden md:block">
                <table className="result-table">
                  <thead>
                    <tr>
                      <th className="text-left pl-6">Material</th>
                      <th className="text-left">Location</th>
                      <th className="text-center">Status</th>
                      <th className="text-center pr-6">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((m, i) => {
                      const loc = parseLocation(m.physicalLocation);
                      return (
                        <tr key={m.id} className="result-row" style={{ animationDelay: `${i * 60}ms` }}>
                          {/* Name */}
                          <td className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="material-icon-box"
                                   style={{
                                     background: m.isAvailable ? 'rgba(81, 207, 102, 0.08)' : 'rgba(255, 107, 107, 0.08)',
                                     color: m.isAvailable ? 'var(--success-500)' : 'var(--danger-500)'
                                   }}>
                                <FlaskConical size={16} />
                              </div>
                              <span className="font-semibold text-sm text-[var(--text-main)]">
                                {m.materialName}
                              </span>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-4">
                            <div className="location-tag">
                              <Archive size={14} className="location-tag-icon" />
                              <span className="location-tag-label">Cabinet</span>
                              <span className="location-tag-value">{loc.cabinet}</span>
                              {loc.shelf && (
                                <>
                                  <span className="location-tag-sep">›</span>
                                  <Layers size={14} className="location-tag-icon" />
                                  <span className="location-tag-label">Shelf</span>
                                  <span className="location-tag-value">{loc.shelf}</span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 text-center">
                            {m.isAvailable ? (
                              <span className="badge badge--green">
                                <CheckCircle size={12} />
                                Available
                              </span>
                            ) : (
                              <span className="badge badge--red">
                                <XCircle size={12} />
                                Out of Stock
                              </span>
                            )}
                          </td>

                          {/* Quantity */}
                          <td className="py-4 pr-6 text-center">
                            <span className="qty-chip">
                              <Hash size={12} />
                              {m.quantity}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ═══ Mobile Cards ═════════════════════════════════════ */}
              <div className="md:hidden space-y-4">
                {results.map((m, i) => {
                  const loc = parseLocation(m.physicalLocation);
                  return (
                    <div
                      key={m.id}
                      className="mobile-card animate-fade-in-up"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      {/* Top row: name + badge */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="material-icon-box"
                               style={{
                                 background: m.isAvailable ? 'rgba(81, 207, 102, 0.08)' : 'rgba(255, 107, 107, 0.08)',
                                 color: m.isAvailable ? 'var(--success-500)' : 'var(--danger-500)'
                               }}>
                            <FlaskConical size={16} />
                          </div>
                          <h3 className="font-semibold text-sm text-[var(--text-main)] truncate">
                            {m.materialName}
                          </h3>
                        </div>
                        {m.isAvailable ? (
                          <span className="badge badge--green shrink-0">
                            <CheckCircle size={12} /> Available
                          </span>
                        ) : (
                          <span className="badge badge--red shrink-0">
                            <XCircle size={12} /> Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Location highlight */}
                      <div className="location-card-highlight">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="shrink-0" style={{ color: 'var(--primary-400)' }} />
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span style={{ color: 'var(--text-dim)' }}>Cabinet</span>
                            <span className="font-bold text-[var(--text-main)]">{loc.cabinet}</span>
                            {loc.shelf && (
                              <>
                                <span style={{ color: 'var(--border-subtle)' }}>|</span>
                                <span style={{ color: 'var(--text-dim)' }}>Shelf</span>
                                <span className="font-bold text-[var(--text-main)]">{loc.shelf}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Hash size={13} style={{ color: 'var(--text-dim)' }} />
                        Quantity: <span className="font-semibold text-[var(--text-main)]">{m.quantity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
