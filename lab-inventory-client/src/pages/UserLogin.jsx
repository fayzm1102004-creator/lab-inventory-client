import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight, Loader2 } from 'lucide-react';
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
      setError('الرجاء إدخال اسمك.');
      return;
    }

    setLoading(true);
    try {
      const res = await userLogin(name.trim());
      localStorage.setItem('userLogId', res.data.logId);
      localStorage.setItem('userName', res.data.userName);
      navigate('/user/search');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0B1121] text-slate-100 min-h-screen flex items-center justify-center font-sans p-4 relative overflow-hidden" dir="rtl">
      {/* Background Glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

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
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <User size={28} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">مرحباً بك في المعمل</h1>
            <p className="text-sm text-slate-400 mt-1">أدخل اسمك للبحث في المخزون</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="user-name" className="block text-sm font-medium mb-2 text-slate-300">
              الاسم الكامل
            </label>
            <input
              id="user-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: أ. أحمد حسن"
              autoFocus
              className="w-full bg-slate-900/60 border border-slate-700 focus:ring-2 focus:ring-emerald-500 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:border-transparent outline-none transition-all"
            />
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
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-medium rounded-xl text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" /> جاري الدخول...
                </span>
              ) : (
                'دخول المعمل'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
