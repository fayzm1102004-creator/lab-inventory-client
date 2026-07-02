import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Plus, Edit2, Trash2, Package, Search, Clock, List, FileText } from 'lucide-react';
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
           style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} style={{ color: 'var(--primary-400)' }} />
          <span className="font-semibold text-[var(--text-main)] text-sm">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(92, 124, 250, 0.1)', color: 'var(--primary-400)' }}>
            {adminUsername}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all cursor-pointer hover:bg-red-500/10"
            style={{ color: 'var(--danger-500)' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-8 border-b border-[var(--border-subtle)] pb-px">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'inventory' 
                ? 'text-[var(--text-main)] border-[var(--primary-500)]' 
                : 'text-[var(--text-dim)] border-transparent hover:text-[var(--text-main)]'
            }`}
          >
            <Package size={16} /> Inventory
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'audit' 
                ? 'text-[var(--text-main)] border-[var(--primary-500)]' 
                : 'text-[var(--text-dim)] border-transparent hover:text-[var(--text-main)]'
            }`}
          >
            <FileText size={16} /> Audit Logs
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--primary-500)] border-t-transparent animate-spin" />
          </div>
        ) : activeTab === 'inventory' ? (
          <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-[var(--text-main)]">Manage Materials</h2>
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-main)] transition-all cursor-pointer hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))' }}
              >
                <Plus size={16} /> Add Material
              </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-center text-sm whitespace-nowrap" dir="rtl">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-600 text-right">اسم المادة</th>
                    <th className="px-6 py-4 font-bold text-slate-600 text-right">المكان</th>
                    <th className="px-6 py-4 font-bold text-slate-600 text-center">الحالة</th>
                    <th className="px-6 py-4 font-bold text-slate-600 text-center">الكمية</th>
                    <th className="px-6 py-4 font-bold text-slate-600 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {materials.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                        لا توجد مواد مسجلة حالياً.
                      </td>
                    </tr>
                  ) : materials.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-800 font-bold text-right">{m.materialName}</td>
                      <td className="px-6 py-4 text-slate-500 text-right">{m.physicalLocation}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          m.isAvailable 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {m.isAvailable ? 'متوفر' : 'غير متوفر'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-bold text-center">{m.quantity}</td>
                      <td className="px-6 py-4 flex justify-center gap-2">
                        <button
                          onClick={() => openModal(m)}
                          className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4" dir="rtl">
              {materials.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                  لا توجد مواد مسجلة حالياً.
                </div>
              ) : materials.map(m => (
                <div key={m.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-lg text-slate-800">{m.materialName}</h4>
                    <div className="flex gap-1">
                      <button onClick={() => openModal(m)} className="p-2 text-blue-500 bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(m.id)} className="p-2 text-red-500 bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <MapPin size={14} className="inline ml-1 text-slate-400" /> {m.physicalLocation}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${m.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {m.isAvailable ? 'متوفر' : 'غير متوفر'}
                    </span>
                    <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">الكمية: {m.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
             <h2 className="text-lg font-semibold text-[var(--text-main)] mb-6">User Activity Logs</h2>
             
             {/* Desktop Table */}
             <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-center text-sm whitespace-nowrap" dir="rtl">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-600 text-right">اسم المستخدم</th>
                    <th className="px-6 py-4 font-bold text-slate-600 text-center">وقت الدخول</th>
                    <th className="px-6 py-4 font-bold text-slate-600 text-center">عمليات البحث</th>
                    <th className="px-6 py-4 font-bold text-slate-600 text-center">وقت الخروج</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                        لا يوجد سجل نشاطات حتى الآن.
                      </td>
                    </tr>
                  ) : auditLogs.map(log => (
                    <tr key={log.logId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-800 font-bold text-right">{log.userName}</td>
                      <td className="px-6 py-4 text-slate-500 text-center" dir="ltr">{formatDate(log.loginTime)}</td>
                      <td className="px-6 py-4 text-slate-500 italic text-center">
                        {log.searchKeywords || '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-center flex justify-center" dir="ltr">
                        {log.logoutTime ? formatDate(log.logoutTime) : (
                          <span className="text-green-500 font-bold flex items-center justify-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> متصل الآن
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4" dir="rtl">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                  لا يوجد سجل نشاطات حتى الآن.
                </div>
              ) : auditLogs.map(log => (
                <div key={log.logId} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-lg text-slate-800">{log.userName}</h4>
                    {!log.logoutTime && (
                      <span className="text-green-500 text-xs font-bold flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> متصل
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="text-xs flex justify-between bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-500">الدخول:</span>
                      <span className="font-bold text-slate-700" dir="ltr">{formatDate(log.loginTime)}</span>
                    </div>
                    {log.logoutTime && (
                      <div className="text-xs flex justify-between bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-500">الخروج:</span>
                        <span className="font-bold text-slate-700" dir="ltr">{formatDate(log.logoutTime)}</span>
                      </div>
                    )}
                  </div>

                  {log.searchKeywords && (
                    <div className="text-sm">
                      <span className="text-slate-400 block mb-1 text-xs">كلمات البحث:</span>
                      <p className="text-slate-700 bg-blue-50/50 p-2 rounded-lg italic text-xs leading-relaxed">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md transition-all">
          <div className="glass-card w-full max-w-lg p-8 sm:p-10 animate-fade-in-up relative overflow-hidden shadow-2xl">
            {/* Decorative background element for chemistry vibe */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--primary-300)] rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--accent-400)] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-3">
                  {editingId ? (
                    <><Edit2 className="text-[var(--primary-500)]" size={24} /> تعديل المادة</>
                  ) : (
                    <><Package className="text-[var(--primary-500)]" size={24} /> إضافة مادة جديدة</>
                  )}
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[var(--text-main)]">اسم المادة الكيميائية</label>
                  <input
                    required
                    value={formData.materialName}
                    onChange={e => setFormData({...formData, materialName: e.target.value})}
                    placeholder="مثال: حمض الهيدروكلوريك"
                    className="w-full px-4 py-3 rounded-xl text-base bg-white border-2 border-slate-200 text-slate-800 focus:outline-none focus:border-[var(--primary-400)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-2 text-[var(--text-main)]">الدولاب</label>
                    <input
                      required
                      value={formData.cabinet}
                      onChange={e => setFormData({...formData, cabinet: e.target.value})}
                      placeholder="مثال: دولاب أ"
                      className="w-full px-4 py-3 rounded-xl text-base bg-white border-2 border-slate-200 text-slate-800 focus:outline-none focus:border-[var(--primary-400)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-2 text-[var(--text-main)]">الرف</label>
                    <input
                      value={formData.shelf}
                      onChange={e => setFormData({...formData, shelf: e.target.value})}
                      placeholder="مثال: الرف 2"
                      className="w-full px-4 py-3 rounded-xl text-base bg-white border-2 border-slate-200 text-slate-800 focus:outline-none focus:border-[var(--primary-400)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-2 text-[var(--text-main)]">الكمية / العدد</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 rounded-xl text-base bg-white border-2 border-slate-200 text-slate-800 focus:outline-none focus:border-[var(--primary-400)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-2 text-[var(--text-main)]">الحالة</label>
                    <select
                      value={formData.isAvailable}
                      onChange={e => setFormData({...formData, isAvailable: e.target.value === 'true'})}
                      className="w-full px-4 py-3 rounded-xl text-base bg-white border-2 border-slate-200 text-slate-800 focus:outline-none focus:border-[var(--primary-400)] focus:ring-4 focus:ring-[var(--primary-100)] transition-all appearance-none cursor-pointer"
                    >
                      <option value="true">متوفر</option>
                      <option value="false">غير متوفر / نافذ</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-[var(--primary-400)]/30 transition-all hover:shadow-xl hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))' }}
                  >
                    {editingId ? 'حفظ التعديلات' : 'إضافة المادة'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
