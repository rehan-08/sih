import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('chartering@maritime-energy.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center text-[#1A1A1A] antialiased overflow-hidden relative bg-[#F9F7F2]">
      {/* Editorial paper grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40 maritime-grid" />

      {/* Decorative Editorial Border Lines & Vignettes */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 50%, rgba(188, 65, 43, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 85% 30%, rgba(36, 62, 86, 0.04) 0%, transparent 50%)
          `
        }}
      />

      {/* Animated SVG Route Paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path
          d="M-10,50 Q20,30 50,50 T110,50"
          fill="none"
          opacity="0.25"
          stroke="#BC412B"
          strokeDasharray="0.6 1.2"
          strokeWidth="0.2"
        />
        <path
          d="M20,110 Q40,60 70,50 T110,-10"
          fill="none"
          opacity="0.2"
          stroke="#243E56"
          strokeWidth="0.12"
        />
      </svg>

      <main className="relative z-10 w-full max-w-md px-4 sm:px-0">
        <div className="bg-white border border-[#DDD8CE] rounded-lg p-8 sm:p-10 flex flex-col gap-8 shadow-md">
          {/* Branding */}
          <div className="flex flex-col gap-1.5 text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <span className="h-[1px] w-6 bg-[#BC412B]" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#BC412B]">Maritime Intelligence</span>
              <span className="h-[1px] w-6 bg-[#BC412B]" />
            </div>
            <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A]">
              MARLIN
            </h1>
            <h2 className="text-sm font-editorial italic text-[#6B645C]">
              Commercial Bulk Chartering &amp; Freight Advisory
            </h2>
            <p className="text-xs text-[#7A7268] font-serif-body mt-1 leading-relaxed">
              Forecast freight markets. Select optimal vessel classes. Execute chartering decisions with rigor.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#7A7268] uppercase tracking-wider" htmlFor="email">
                Institutional Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7268] text-[18px]">
                  mail
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-[#F4F0E8] border border-[#DDD8CE] rounded text-[#1A1A1A] text-sm pl-10 pr-3 py-2.5 focus:border-[#BC412B] focus:bg-white transition-colors placeholder:text-[#999999] outline-none font-mono-data"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-[#7A7268] uppercase tracking-wider" htmlFor="password">
                  Security Key
                </label>
                <span className="text-xs text-[#BC412B] font-serif-body italic">
                  Demo credentials active
                </span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7268] text-[18px]">
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#F4F0E8] border border-[#DDD8CE] rounded text-[#1A1A1A] text-sm pl-10 pr-3 py-2.5 focus:border-[#BC412B] focus:bg-white transition-colors placeholder:text-[#999999] outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-2">
              <button
                type="submit"
                className="w-full bg-[#BC412B] text-white font-editorial font-bold text-base rounded py-2.5 px-6 hover:bg-[#A33420] transition-all flex justify-center items-center gap-2 shadow-sm active:scale-[0.99] cursor-pointer"
              >
                <span>Access Terminal</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={onLogin}
                className="w-full bg-transparent border border-[#DDD8CE] text-[#1A1A1A] font-serif-body font-semibold text-sm rounded py-2.5 px-6 hover:bg-[#F4F0E8] hover:border-[#BC412B]/40 transition-colors cursor-pointer"
              >
                Launch Analytical Overview
              </button>
            </div>
          </form>

          {/* Footer minimal */}
          <div className="text-center text-[11px] text-[#7A7268] font-serif-body italic border-t border-[#DDD8CE] pt-4">
            MARLIN Freight Terminal • Baltic Exchange &amp; Newcastle Index Grounded
          </div>
        </div>
      </main>
    </div>
  );
};
