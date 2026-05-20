import { useNavigate } from 'react-router-dom';
import { FlaskConical, ShieldCheck, Search, Atom } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 animate-float"
             style={{ background: 'radial-gradient(circle, var(--primary-500), transparent 70%)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full opacity-8"
             style={{ background: 'radial-gradient(circle, var(--accent-500), transparent 70%)', animation: 'float 8s ease-in-out infinite reverse' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full opacity-5"
             style={{ background: 'radial-gradient(circle, var(--success-500), transparent 70%)', animation: 'float 10s ease-in-out infinite' }} />
      </div>

      {/* Hero content */}
      <div className="relative z-10 text-center max-w-2xl animate-fade-in-up">
        {/* Logo / Icon cluster */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))' }}>
            <FlaskConical size={36} className="text-[var(--text-main)]" />
          </div>
          <Atom size={20} className="opacity-40 animate-float" style={{ color: 'var(--accent-400)' }} />
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3"
            style={{ background: 'linear-gradient(135deg, #e4e4e7, var(--primary-300))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Lab Inventory
        </h1>
        <p className="text-lg md:text-xl font-light mb-2" style={{ color: 'var(--text-muted)' }}>
          Location Management System
        </p>
        <p className="text-sm mb-12" style={{ color: 'var(--text-dim)' }}>
          Track every chemical. Know exactly where it is.
        </p>

        {/* Role selection cards */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {/* Admin card */}
          <button
            id="admin-login-btn"
            onClick={() => navigate('/admin/login')}
            className="glass-card glass-card-hover group cursor-pointer flex flex-col items-center gap-5 p-10 w-full sm:w-72 transition-all duration-300"
          >
            <div className="p-5 rounded-2xl transition-all duration-300"
                 style={{ background: 'rgba(92, 124, 250, 0.1)' }}>
              <ShieldCheck size={36} style={{ color: 'var(--primary-400)' }}
                           className="group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-main)] mb-2">Administrator</h2>
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
                Manage inventory & logs
              </p>
            </div>
          </button>

          {/* User card */}
          <button
            id="user-login-btn"
            onClick={() => navigate('/user/login')}
            className="glass-card glass-card-hover group cursor-pointer flex flex-col items-center gap-5 p-10 w-full sm:w-72 transition-all duration-300"
          >
            <div className="p-5 rounded-2xl transition-all duration-300"
                 style={{ background: 'rgba(59, 201, 219, 0.1)' }}>
              <Search size={36} style={{ color: 'var(--accent-400)' }}
                      className="group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-main)] mb-2">Lab User</h2>
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
                Search materials
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs" style={{ color: 'var(--gray-700)' }}>
        Chemistry Laboratory Inventory System © {new Date().getFullYear()}
      </p>
    </div>
  );
}
