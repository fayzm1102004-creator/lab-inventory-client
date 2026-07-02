import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Package, LogOut, FlaskConical,
  CheckCircle, XCircle, Hash, Beaker, SearchX
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
  const userName = localStorage.getItem('userName') || 'مستخدم';
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
    <div className="min-h-screen bg-[#0B1121] text-slate-100 font-sans flex flex-col" dir="rtl">
      {/* ═══════════════════ Navbar ═══════════════════════════════════ */}
      <nav className="sticky top-0 z-50 w-full bg-white/5 backdrop-blur-md border-b border-white/10 px-6 md:px-12 lg:px-16 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FlaskConical size={24} className="text-emerald-400" />
          <span className="font-semibold text-white text-lg hidden sm:inline-block">نظام إدارة المعمل</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 max-w-[120px] sm:max-w-xs truncate">
            {userName}
          </span>
          <button
            onClick={handleLogout}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">تسجيل خروج</span>
          </button>
        </div>
      </nav>

      {/* ═══════════════════ Main ═════════════════════════════════════ */}
      <main className="flex-grow w-full px-4 md:px-8 xl:px-12 mx-auto pt-12 md:pt-20 flex flex-col items-center">
        <div className="w-full animate-fade-in-up">

          {/* ── Search Bar Wrapper ─────────────────────────────────────────── */}
          <div className="text-center w-full mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center w-full">البحث عن المواد الكيميائية</h1>
            <p className="text-slate-400 text-sm sm:text-base text-center w-full">ابحث عن أي مادة لتحديد مكانها بدقة داخل المعمل</p>
          </div>

          <div className="w-full mx-auto mt-8 relative">
            <form onSubmit={handleSearch} className="relative mb-10 w-full">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search size={24} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="أدخل اسم المادة..."
                className="w-full bg-slate-900/80 border-2 border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-2xl py-4 pr-12 pl-24 sm:pl-32 text-base sm:text-lg text-slate-100 placeholder-slate-500 shadow-xl transition-all duration-300 outline-none"
              />
              <button
                type="submit"
                disabled={loading || !keyword.trim()}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 sm:px-6 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-emerald-900/20 text-sm sm:text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  </span>
                ) : 'بحث'}
              </button>
            </form>
          </div>

          {/* ── Results Area ───────────────────────────────────────── */}
          {results === null ? (
            /* ▸ Initial / idle state */
            <div className="mt-16 flex flex-col items-center justify-center text-center animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-800/30 border border-slate-700/50 mb-6 shadow-lg shadow-slate-900/20">
                <Beaker size={48} className="text-slate-600" />
              </div>
              <p className="text-slate-400 text-lg mt-4 font-medium">جاهز للبحث...</p>
              <p className="text-sm text-slate-500 mt-2">
                اكتب اسم المادة في الأعلى للبحث عن أماكن توفرها
              </p>
            </div>

          ) : results.length === 0 ? (
            /* ▸ Empty state */
            <div className="bg-rose-950/30 border border-rose-900 text-rose-300 p-6 rounded-xl text-center mt-8 w-full mx-auto animate-fade-in-up">
              <SearchX size={40} className="mx-auto mb-4 opacity-80" />
              <p className="text-lg font-semibold mb-2">لم يتم العثور على نتائج</p>
              <p className="text-sm opacity-80">
                لا توجد مادة تطابق "{keyword}" في المخزون الحالي. يرجى التأكد من التهجئة.
              </p>
            </div>

          ) : (
            /* ▸ Results */
            <div className="animate-fade-in-up mt-8 w-full">

              {/* Stats chips */}
              <div className="flex flex-wrap items-center gap-3 mb-6 justify-center md:justify-start w-full">
                <span className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
                  <Package size={16} />
                  {totalResults} نتيجة
                </span>
                {availableCount > 0 && (
                  <span className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
                    <CheckCircle size={16} />
                    {availableCount} متوفر
                  </span>
                )}
                {outOfStockCount > 0 && (
                  <span className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
                    <XCircle size={16} />
                    {outOfStockCount} غير متوفر
                  </span>
                )}
              </div>

              {/* ═══ Desktop / Tablet Table ═══════════════════════════ */}
              <div className="hidden md:block bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-800 shadow-2xl overflow-hidden w-full mx-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-800/80 text-emerald-400 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="py-4 px-6 text-right">اسم المادة</th>
                      <th className="py-4 px-6 text-right">المكان (الموقع)</th>
                      <th className="py-4 px-6 text-center">الحالة</th>
                      <th className="py-4 px-6 text-center">الكمية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {results.map((m) => {
                      const loc = parseLocation(m.physicalLocation);
                      return (
                        <tr key={m.id} className="hover:bg-emerald-950/20 transition-colors duration-200">
                          {/* Name */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${m.isAvailable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                <FlaskConical size={18} />
                              </div>
                              <span className="font-semibold text-white text-base">
                                {m.materialName}
                              </span>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-900/50 text-emerald-300 font-bold px-4 py-2 rounded-lg w-fit">
                              <MapPin size={18} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                              <span className="text-slate-400 font-normal mr-1">الدولاب:</span>
                              {loc.cabinet}
                              {loc.shelf && (
                                <>
                                  <span className="text-emerald-500/50 mx-2">|</span>
                                  <span className="text-slate-400 font-normal mr-1">الرف:</span>
                                  {loc.shelf}
                                </>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6 text-center">
                            {m.isAvailable ? (
                              <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-28">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                متوفر
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 w-28">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                غير متوفر
                              </span>
                            )}
                          </td>

                          {/* Quantity */}
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-lg text-sm font-mono">
                              <Hash size={14} className="text-slate-500" />
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
              <div className="md:hidden space-y-4 w-full">
                {results.map((m) => {
                  const loc = parseLocation(m.physicalLocation);
                  return (
                    <div
                      key={m.id}
                      className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg w-full"
                    >
                      {/* Top row: name + badge */}
                      <div className="flex items-start justify-between gap-3 mb-4 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2.5 rounded-lg shrink-0 ${m.isAvailable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            <FlaskConical size={20} />
                          </div>
                          <h3 className="font-bold text-white text-base truncate">
                            {m.materialName}
                          </h3>
                        </div>
                        {m.isAvailable ? (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                             متوفر
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                             غير متوفر
                           </span>
                        )}
                      </div>

                      {/* Location highlight */}
                      <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <MapPin size={24} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)] shrink-0" />
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400 font-medium">المكان داخل المعمل</span>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="text-emerald-300 font-bold">الدولاب: {loc.cabinet}</span>
                              {loc.shelf && (
                                <>
                                  <span className="text-emerald-900">|</span>
                                  <span className="text-emerald-300 font-bold">الرف: {loc.shelf}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center justify-between text-sm">
                         <span className="text-slate-400">الكمية المتوفرة:</span>
                         <span className="font-mono text-white font-bold bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                           {m.quantity}
                         </span>
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
