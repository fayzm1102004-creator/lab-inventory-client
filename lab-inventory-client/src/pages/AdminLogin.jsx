import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
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
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin(username.trim(), password);
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUsername', res.data.username);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تسجيل الدخول. تأكد من بياناتك.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0B1121] text-slate-100 min-h-screen flex items-center justify-center font-sans p-4 relative overflow-hidden" dir="rtl">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Container */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.6)] relative z-10 animate-fade-in-up">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer mb-8 w-fit"
        >
          <ArrowRight size={18} />
          العودة للرئيسية
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <ShieldCheck size={28} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">تسجيل دخول المشرف</h1>
            <p className="text-sm text-slate-400 mt-1">للمشرفين المصرح لهم فقط</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="admin-username" className="block text-sm font-medium mb-2 text-slate-300">
              اسم المستخدم
            </label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
              autoComplete="username"
              className="w-full bg-slate-900/60 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium mb-2 text-slate-300">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                autoComplete="current-password"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all pl-12"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-medium rounded-xl text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" /> جاري التحقق...
                </span>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
