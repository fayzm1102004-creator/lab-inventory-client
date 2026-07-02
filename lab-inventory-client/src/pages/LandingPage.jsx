import { useNavigate } from 'react-router-dom';
import { FlaskConical, ShieldCheck, Search } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0B1121] text-slate-100 min-h-screen flex items-center justify-center font-sans relative overflow-hidden px-4" dir="rtl">
      {/* Animated background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center animate-fade-in-up">
        {/* Title Section */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-lg">
            <FlaskConical size={40} className="text-cyan-400" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
          نظام إدارة معمل الكيمياء
        </h1>
        <p className="text-slate-400 text-center text-lg max-w-xl mb-8">
          اختر دورك للدخول إلى النظام
        </p>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mt-8">
          
          {/* Admin Card */}
          <button
            onClick={() => navigate('/admin/login')}
            className="group flex flex-col items-center gap-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.6)] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:border-cyan-500/50 transition-all duration-300 cursor-pointer"
          >
            <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-all duration-300">
              <ShieldCheck size={48} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-100 mb-2">مدير النظام</h2>
              <p className="text-slate-400 text-sm">
                إدارة المخزون، سجلات الدخول، وإضافة المواد
              </p>
            </div>
          </button>

          {/* Lab User Card */}
          <button
            onClick={() => navigate('/user/login')}
            className="group flex flex-col items-center gap-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.6)] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:border-emerald-500/50 transition-all duration-300 cursor-pointer"
          >
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all duration-300">
              <Search size={48} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-100 mb-2">مستخدم المعمل</h2>
              <p className="text-slate-400 text-sm">
                البحث عن المواد الكيميائية وأماكنها
              </p>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}
