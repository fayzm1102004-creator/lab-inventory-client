import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Plus, Edit2, Trash2, Package, Search, Clock, List, FileText, MapPin, FlaskConical, Activity, X, Beaker } from 'lucide-react';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial, getAuditLogs } from '../api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminUsername = localStorage.getItem('adminUsername');
  
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'audit'
  const [materials, setMaterials] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    materialName: '',
    cabinet: '',
    shelf: '',
    isAvailable: true,
    quantity: 0
  });

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login', { replace: true });
      return;
    }
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'inventory') {
        const res = await getMaterials();
        setMaterials(res.data);
      } else {
        const res = await getAuditLogs();
        setAuditLogs(res.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError(' انتهت صلاحية الجلسة أو أنك لا تملك الصلاحية (401/403). يرجى تسجيل الدخول مجدداً.');
      } else {
        setError('حدث خطأ أثناء جلب البيانات: ' + (err.message || 'خطأ غير معروف'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/', { replace: true });
  };

  const openModal = (material = null) => {
    if (material) {
      setEditingId(material.id);
      let cabinet = '';
      let shelf = '';
      const loc = material.physicalLocation || '';
      if (loc.startsWith('دولاب: ') && loc.includes(' - رف: ')) {
        const parts = loc.split(' - رف: ');
        cabinet = parts[0].replace('دولاب: ', '');
        shelf = parts[1];
      } else {
        cabinet = loc;
      }
      setFormData({
        materialName: material.materialName,
        cabinet,
        shelf,
        isAvailable: material.isAvailable,
        quantity: material.quantity
      });
    } else {
      setEditingId(null);
      setFormData({
        materialName: '',
        cabinet: '',
        shelf: '',
        isAvailable: true,
        quantity: 0
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const physicalLocation = formData.shelf 
        ? `دولاب: ${formData.cabinet} - رف: ${formData.shelf}` 
        : (formData.cabinet ? `دولاب: ${formData.cabinet}` : '');
        
      const payload = {
        materialName: formData.materialName,
        physicalLocation,
        isAvailable: formData.isAvailable,
        quantity: formData.quantity
      };

      if (editingId) {
        await updateMaterial(editingId, payload);
      } else {
        await createMaterial(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving material');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await deleteMaterial(id);
        fetchData();
      } catch (err) {
        alert('Error deleting material');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Active / Unknown';
    return new Date(dateString).toLocaleString();
  };

  /* ── Stat helpers ────────────────────────────────────────────────── */
  const totalMaterials = materials.length;
  const availableCount = materials.filter(m => m.isAvailable).length;
  const outOfStockCount = totalMaterials - availableCount;

  return (
    <div className="bg-[#0B1121] text-slate-100 min-h-screen flex flex-col">

      {/* ═══════════════════ TOP NAVBAR (Frosted Glass) ══════════════════ */}
      <nav className="sticky top-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="w-full px-4 md:px-8 xl:px-12 mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <FlaskConical size={20} className="text-cyan-400" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-white tracking-wide">Lab Inventory</h1>
              <p className="text-[11px] text-slate-500">Admin Control Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full">
              <ShieldCheck size={14} className="text-cyan-400" />
              <span className="text-xs font-medium text-cyan-300">{adminUsername}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-300 cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">تسجيل خروج</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════ MAIN CONTENT ════════════════════════════════ */}
      <main className="flex-1 w-full px-4 md:px-8 xl:px-12 mx-auto py-6 sm:py-10">

        {/* ── Tab Navigation ───────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-12 mx-auto justify-center bg-slate-900/60 backdrop-blur-sm p-1.5 rounded-xl border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Package size={16} />
            <span className="hidden sm:inline">المواد الكيميائية</span>
            <span className="sm:hidden">المواد</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Activity size={16} />
            <span className="hidden sm:inline">سجل النشاطات</span>
            <span className="sm:hidden">السجل</span>
          </button>
        </div>

        {/* ── Error Banner ─────────────────────────────────────────── */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" dir="rtl">
            <span className="text-rose-300 font-medium text-sm">{error}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-500 transition shrink-0"
            >
              تسجيل الخروج والعودة
            </button>
          </div>
        )}

        {/* ── Loading Spinner ──────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
              <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-b-cyan-600/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-sm text-slate-500 animate-pulse">جارٍ تحميل البيانات...</p>
          </div>

        ) : activeTab === 'inventory' ? (
          /* ═══════════════════ INVENTORY TAB ══════════════════════════ */
          <div className="animate-fade-in-up flex flex-col flex-1">

            {/* ── Header + Add Button ────────────────────────────────── */}
            <div className="flex flex-col items-center justify-center gap-6 mt-6 mb-14 text-center w-full">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">إدارة المواد الكيميائية</h2>
                <p className="text-base text-slate-500 mt-2">إضافة وتعديل وحذف المواد المسجلة في مختبر الكيمياء</p>
              </div>
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] px-6 py-3 rounded-xl text-white text-sm font-bold transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shrink-0"
              >
                <Plus size={20} />
                إضافة مادة جديدة
              </button>
            </div>

            {/* ── Stat Cards ─────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-10">
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-white font-mono">{totalMaterials}</p>
                <p className="text-xs text-slate-500 mt-1">إجمالي المواد</p>
              </div>
              <div className="bg-emerald-500/5 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">{availableCount}</p>
                <p className="text-xs text-emerald-500/70 mt-1">متوفر</p>
              </div>
              <div className="bg-rose-500/5 backdrop-blur-sm border border-rose-500/20 rounded-xl p-6 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-rose-400 font-mono">{outOfStockCount}</p>
                <p className="text-xs text-rose-500/70 mt-1">غير متوفر</p>
              </div>
            </div>

            {/* ═══ Desktop Table ═══════════════════════════════════════ */}
            <div className="hidden md:block bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl overflow-hidden">
              <table className="w-full text-sm" dir="rtl">
                <thead className="bg-slate-800/80">
                  <tr>
                    <th className="px-6 py-5 text-cyan-400 font-semibold text-right text-sm uppercase tracking-wider">اسم المادة</th>
                    <th className="px-6 py-5 text-cyan-400 font-semibold text-right text-sm uppercase tracking-wider">المكان</th>
                    <th className="px-6 py-5 text-cyan-400 font-semibold text-center text-sm uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-5 text-cyan-400 font-semibold text-center text-sm uppercase tracking-wider">الكمية</th>
                    <th className="px-6 py-5 text-cyan-400 font-semibold text-center text-sm uppercase tracking-wider">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                        <Beaker size={40} className="mx-auto text-slate-700 mb-3" />
                        <p className="text-slate-500">لا توجد مواد مسجلة حالياً.</p>
                      </td>
                    </tr>
                  ) : materials.map((m, i) => (
                    <tr
                      key={m.id}
                      className="hover:bg-cyan-950/20 transition-colors duration-200 border-b border-slate-800/60"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      {/* اسم المادة */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${m.isAvailable ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.5)]'}`} />
                          <span className="font-medium text-slate-200 text-base">{m.materialName}</span>
                        </div>
                      </td>

                      {/* المكان */}
                      <td className="px-6 py-5 text-right">
                        <span className="inline-flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/50 px-3 py-1.5 rounded-lg text-sm">
                          <MapPin size={14} className="text-cyan-400 shrink-0" />
                          <span className="text-slate-300">{m.physicalLocation || '—'}</span>
                        </span>
                      </td>

                      {/* الحالة */}
                      <td className="px-6 py-5 text-center">
                        {m.isAvailable ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-sm font-medium inline-block">
                            متوفر
                          </span>
                        ) : (
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-4 py-1.5 rounded-full text-sm font-medium inline-block">
                            غير متوفر
                          </span>
                        )}
                      </td>

                      {/* الكمية */}
                      <td className="px-6 py-5 text-center">
                        <span className="font-mono text-slate-300 bg-slate-800/60 px-4 py-1.5 rounded-md border border-slate-700/40 text-base">
                          {m.quantity}
                        </span>
                      </td>

                      {/* إجراءات */}
                      <td className="px-6 py-5">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openModal(m)}
                            className="p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all duration-200 cursor-pointer"
                            title="تعديل"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Footer */}
              <div className="border-t border-slate-800 p-4 flex items-center justify-between bg-slate-900/40" dir="rtl">
                <button className="border border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg transition-all text-sm font-medium cursor-pointer">
                  السابق
                </button>
                <span className="text-slate-400 text-sm">صفحة 1 من 5</span>
                <button className="border border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg transition-all text-sm font-medium cursor-pointer">
                  التالي
                </button>
              </div>
            </div>

            {/* ═══ Mobile Cards ════════════════════════════════════════ */}
            <div className="md:hidden space-y-3" dir="rtl">
              {materials.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-xl">
                  <Beaker size={40} className="mx-auto text-slate-700 mb-3" />
                  <p className="text-slate-500">لا توجد مواد مسجلة حالياً.</p>
                </div>
              ) : materials.map((m, i) => (
                <div
                  key={m.id}
                  className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-4 hover:border-cyan-800/40 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Row 1: Name + Actions */}
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${m.isAvailable ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.5)]'}`} />
                      <h4 className="font-bold text-white truncate">{m.materialName}</h4>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openModal(m)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </div>

                  {/* Row 2: Location */}
                  <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/40 px-3 py-2 rounded-lg mb-3 text-xs">
                    <MapPin size={13} className="text-cyan-400 shrink-0" />
                    <span className="text-slate-400">{m.physicalLocation || '—'}</span>
                  </div>

                  {/* Row 3: Status + Qty */}
                  <div className="flex justify-between items-center">
                    {m.isAvailable ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-medium">متوفر</span>
                    ) : (
                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-medium">غير متوفر</span>
                    )}
                    <span className="font-mono text-sm text-slate-300 bg-slate-800/60 border border-slate-700/40 px-3 py-1 rounded-md">
                      الكمية: {m.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        ) : (
          /* ═══════════════════ AUDIT LOGS TAB ═════════════════════════ */
          <div className="animate-fade-in-up flex flex-col flex-1">
            <div className="flex flex-col items-center justify-center gap-2 mt-6 mb-14 text-center w-full">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">سجل النشاطات</h2>
              <p className="text-base text-slate-500 mt-1">متابعة جميع عمليات تسجيل الدخول والبحث للمستخدمين</p>
            </div>

            {/* ═══ Desktop Table ═══════════════════════════════════════ */}
            <div className="hidden md:block bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl overflow-hidden">
              <table className="w-full text-sm" dir="rtl">
                <thead className="bg-slate-800/80">
                  <tr>
                    <th className="px-6 py-5 text-cyan-400 font-semibold text-right text-sm uppercase tracking-wider">اسم المستخدم</th>
                    <th className="px-6 py-5 text-cyan-400 font-semibold text-center text-sm uppercase tracking-wider">وقت الدخول</th>
                    <th className="px-6 py-5 text-cyan-400 font-semibold text-center text-sm uppercase tracking-wider">عمليات البحث</th>
                    <th className="px-6 py-5 text-cyan-400 font-semibold text-center text-sm uppercase tracking-wider">وقت الخروج</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-16 text-center">
                        <Activity size={40} className="mx-auto text-slate-700 mb-3" />
                        <p className="text-slate-500">لا يوجد سجل نشاطات حتى الآن.</p>
                      </td>
                    </tr>
                  ) : auditLogs.map((log, i) => (
                    <tr
                      key={log.logId}
                      className="hover:bg-cyan-950/20 transition-colors duration-200 border-b border-slate-800/60"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <td className="px-6 py-5 text-right">
                        <span className="font-medium text-slate-200 text-base">{log.userName}</span>
                      </td>
                      <td className="px-6 py-5 text-center" dir="ltr">
                        <span className="font-mono text-sm text-slate-400">{formatDate(log.loginTime)}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {log.searchKeywords ? (
                          <span className="text-xs text-slate-400 italic bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700/30 inline-block max-w-[200px] truncate">
                            {log.searchKeywords}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center" dir="ltr">
                        {log.logoutTime ? (
                          <span className="font-mono text-sm text-slate-400">{formatDate(log.logoutTime)}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-sm font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                            متصل الآن
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Footer */}
              <div className="border-t border-slate-800 p-4 flex items-center justify-between bg-slate-900/40" dir="rtl">
                <button className="border border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg transition-all text-sm font-medium cursor-pointer">
                  السابق
                </button>
                <span className="text-slate-400 text-sm">صفحة 1 من 5</span>
                <button className="border border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg transition-all text-sm font-medium cursor-pointer">
                  التالي
                </button>
              </div>
            </div>

            {/* ═══ Mobile Cards ════════════════════════════════════════ */}
            <div className="md:hidden space-y-3" dir="rtl">
              {auditLogs.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-xl">
                  <Activity size={40} className="mx-auto text-slate-700 mb-3" />
                  <p className="text-slate-500">لا يوجد سجل نشاطات حتى الآن.</p>
                </div>
              ) : auditLogs.map((log, i) => (
                <div
                  key={log.logId}
                  className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-4 hover:border-cyan-800/40 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-white">{log.userName}</h4>
                    {!log.logoutTime && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> متصل
                      </span>
                    )}
                  </div>

                  {/* Times */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-xs bg-slate-800/50 border border-slate-700/30 p-2.5 rounded-lg">
                      <span className="text-slate-500">الدخول:</span>
                      <span className="font-mono text-slate-400" dir="ltr">{formatDate(log.loginTime)}</span>
                    </div>
                    {log.logoutTime && (
                      <div className="flex justify-between text-xs bg-slate-800/50 border border-slate-700/30 p-2.5 rounded-lg">
                        <span className="text-slate-500">الخروج:</span>
                        <span className="font-mono text-slate-400" dir="ltr">{formatDate(log.logoutTime)}</span>
                      </div>
                    )}
                  </div>

                  {/* Search keywords */}
                  {log.searchKeywords && (
                    <div>
                      <span className="text-slate-600 block mb-1 text-[10px] uppercase tracking-wider">كلمات البحث:</span>
                      <p className="text-slate-400 bg-cyan-500/5 border border-cyan-500/10 p-2.5 rounded-lg italic text-xs leading-relaxed">
                        {log.searchKeywords}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ═══════════════════ MODAL ════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 transition-all">
          <div className="bg-[#0D1529] border border-slate-700/50 rounded-3xl w-full max-w-xl p-8 shadow-2xl relative overflow-hidden animate-fade-in-up">

            {/* Decorative glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-[60px]" />

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-white">
                {editingId ? 'تعديل بيانات المادة' : 'إضافة مادة جديدة'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-400">اسم المادة</label>
                  <input
                    required
                    value={formData.materialName}
                    onChange={e => setFormData({...formData, materialName: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-400">الدولاب</label>
                    <input
                      required
                      value={formData.cabinet}
                      onChange={e => setFormData({...formData, cabinet: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-400">الرف</label>
                    <input
                      value={formData.shelf}
                      onChange={e => setFormData({...formData, shelf: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-400">الكمية</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-400">الحالة</label>
                    <select
                      value={formData.isAvailable}
                      onChange={e => setFormData({...formData, isAvailable: e.target.value === 'true'})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="true">متوفر</option>
                      <option value="false">غير متوفر</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-4 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 rounded-xl text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-900/20 transition-all cursor-pointer"
                >
                  {editingId ? 'حفظ التعديلات' : 'إضافة المادة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
