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

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    materialName: '',
    physicalLocation: '',
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
    try {
      if (activeTab === 'inventory') {
        const res = await getMaterials();
        setMaterials(res.data);
      } else {
        const res = await getAuditLogs();
        setAuditLogs(res.data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
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
      setFormData({
        materialName: material.materialName,
        physicalLocation: material.physicalLocation,
        isAvailable: material.isAvailable,
        quantity: material.quantity
      });
    } else {
      setEditingId(null);
      setFormData({
        materialName: '',
        physicalLocation: '',
        isAvailable: true,
        quantity: 0
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMaterial(editingId, formData);
      } else {
        await createMaterial(formData);
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

            <div className="bg-[var(--table-bg)] border border-[var(--border-subtle)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-center text-sm whitespace-nowrap">
                  <thead className="bg-[var(--table-header)] border-b border-[var(--border-subtle)]">
                    <tr>
                      <th className="px-6 py-4 font-medium text-[var(--text-muted)] text-left">Name</th>
                      <th className="px-6 py-4 font-medium text-[var(--text-muted)] text-left">Location</th>
                      <th className="px-6 py-4 font-medium text-[var(--text-muted)] text-center">Status</th>
                      <th className="px-6 py-4 font-medium text-[var(--text-muted)] text-center">Qty</th>
                      <th className="px-6 py-4 font-medium text-[var(--text-muted)] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {materials.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-[var(--text-dim)]">
                          No materials found. Add one to get started.
                        </td>
                      </tr>
                    ) : materials.map(m => (
                      <tr key={m.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                        <td className="px-6 py-4 text-[var(--text-main)] font-medium text-left">{m.materialName}</td>
                        <td className="px-6 py-4 text-[var(--text-muted)] text-left">{m.physicalLocation}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                            m.isAvailable 
                              ? 'bg-[#51cf661a] text-[var(--success-500)]' 
                              : 'bg-[#ff6b6b1a] text-[var(--danger-500)]'
                          }`}>
                            {m.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[var(--text-muted)] text-center">{m.quantity}</td>
                        <td className="px-6 py-4 flex justify-center gap-2">
                          <button
                            onClick={() => openModal(m)}
                            className="p-2 rounded-lg text-[var(--primary-400)] hover:bg-[#5c7cfa1a] transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="p-2 rounded-lg text-[var(--danger-500)] hover:bg-[#ff6b6b1a] transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
             <h2 className="text-lg font-semibold text-[var(--text-main)] mb-6">User Activity Logs</h2>
             
             <div className="bg-[var(--table-bg)] border border-[var(--border-subtle)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-center text-sm whitespace-nowrap">
                  <thead className="bg-[var(--table-header)] border-b border-[var(--border-subtle)]">
                    <tr>
                      <th className="px-6 py-4 font-medium text-[var(--text-muted)] text-left">User</th>
                      <th className="px-6 py-4 font-medium text-[var(--text-muted)] text-center">Login Time</th>
                      <th className="px-6 py-4 font-medium text-[var(--text-muted)] text-center">Searched Keywords</th>
                      <th className="px-6 py-4 font-medium text-[var(--text-muted)] text-center">Logout Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-[var(--text-dim)]">
                          No audit logs recorded yet.
                        </td>
                      </tr>
                    ) : auditLogs.map(log => (
                      <tr key={log.logId} className="hover:bg-[var(--bg-hover)] transition-colors">
                        <td className="px-6 py-4 text-[var(--text-main)] font-medium text-left">{log.userName}</td>
                        <td className="px-6 py-4 text-[var(--text-muted)] text-center">{formatDate(log.loginTime)}</td>
                        <td className="px-6 py-4 text-[var(--text-muted)] italic text-center">
                          {log.searchKeywords || '—'}
                        </td>
                        <td className="px-6 py-4 text-[var(--text-muted)] text-center flex justify-center">
                          {log.logoutTime ? formatDate(log.logoutTime) : (
                            <span className="text-[var(--success-500)] flex items-center justify-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-[var(--success-500)] animate-pulse" /> Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 animate-fade-in-up">
            <h3 className="text-lg font-bold text-[var(--text-main)] mb-4">
              {editingId ? 'Edit Material' : 'Add Material'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-[var(--text-muted)]">Material Name</label>
                <input
                  required
                  value={formData.materialName}
                  onChange={e => setFormData({...formData, materialName: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-500)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-[var(--text-muted)]">Physical Location</label>
                <input
                  required
                  value={formData.physicalLocation}
                  onChange={e => setFormData({...formData, physicalLocation: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-500)]"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1 text-[var(--text-muted)]">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-500)]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1 text-[var(--text-muted)]">Status</label>
                  <select
                    value={formData.isAvailable}
                    onChange={e => setFormData({...formData, isAvailable: e.target.value === 'true'})}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-500)]"
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-main)] transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))' }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
