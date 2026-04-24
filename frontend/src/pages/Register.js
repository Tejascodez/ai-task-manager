import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../api/api";

export default function Register() {
const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const calcStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-400"];
  const strengthTextColor = ["", "text-red-400", "text-orange-400", "text-yellow-400", "text-emerald-400"];

  const handlePasswordChange = (val) => {
    setForm({ ...form, password: val });
    setStrength(calcStrength(val));
  };

const handleSubmit = async () => {
  if (!form.name || !form.email || !form.password) {
    setError("Please fill in all fields.");
    return;
  }
  if (strength < 2) {
    setError("Please choose a stronger password.");
    return;
  }
  setError("");
  setLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      // ✅ role removed from payload too — not just UI
    });

    const data = await res.json().catch(() => ({})); // safe parse
    
    if (!res.ok) {
      setError(data.message || "Registration failed. Try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/login");

  } catch {
    setError("Server unreachable. Please try again.");
    setLoading(false);
  }
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center px-4 relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, .font-display { font-family: 'Syne', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.65; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }

        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }
        .delay-4 { animation-delay: 0.4s; opacity: 0; }
        .delay-5 { animation-delay: 0.5s; opacity: 0; }
        .delay-6 { animation-delay: 0.6s; opacity: 0; }

        .input-field {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.25s ease;
          outline: none;
        }
        .input-field:focus {
          background: rgba(99,102,241,0.06);
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .input-field::placeholder { color: rgba(255,255,255,0.2); }

        .role-field {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(234,179,8,0.2);
          transition: all 0.25s ease;
          outline: none;
          appearance: none;
          cursor: pointer;
        }
        .role-field:focus {
          background: rgba(234,179,8,0.05);
          border-color: rgba(234,179,8,0.45);
          box-shadow: 0 0 0 3px rgba(234,179,8,0.1);
        }
        .role-field option { background: #1e293b; color: white; }

        .btn-register {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          transition: all 0.3s ease;
        }
        .btn-register:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(99,102,241,0.4);
        }
        .btn-register:active:not(:disabled) { transform: translateY(0px); }
        .btn-register:disabled { opacity: 0.6; cursor: not-allowed; }

        .error-shake { animation: shake 0.4s ease; }

        .card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(16px);
        }
        .glow-text {
          background: linear-gradient(135deg, #fff 30%, #a5b4fc 70%, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .divider-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        }
        .strength-bar {
          transition: width 0.4s ease, background-color 0.4s ease;
        }
        .check-item {
          transition: color 0.2s ease;
        }
        .dev-badge {
          font-size: 10px;
          font-weight: 600;
          background: rgba(234,179,8,0.12);
          color: #ca8a04;
          border: 1px solid rgba(234,179,8,0.25);
          border-radius: 4px;
          padding: 1px 6px;
          letter-spacing: 0.04em;
          vertical-align: middle;
          margin-left: 6px;
        }
      `}</style>

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[15%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)", animation: "pulse-glow 4s ease-in-out infinite" }} />
        <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", animation: "pulse-glow 5s ease-in-out infinite", animationDelay: "2s" }} />
      </div>

      {/* Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="fade-up delay-1 flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <span className="font-display font-700 text-xl text-white tracking-tight">TaskAI</span>
        </div>

        <div className="card rounded-2xl p-8 md:p-10">

          {/* Header */}
          <div className="fade-up delay-2 text-center mb-8">
            <h2 className="font-display text-3xl font-800 glow-text mb-2">Create account</h2>
            <p className="text-slate-500 text-sm">Start managing tasks smarter with AI</p>
          </div>

          {/* Error */}
          {error && (
            <div className="error-shake flex items-center gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">

            {/* Name */}
            <div className="fade-up delay-2">
              <label className="block text-slate-400 text-xs font-medium mb-1.5 ml-0.5">Full name</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {/* Email */}
            <div className="fade-up delay-3">
              <label className="block text-slate-400 text-xs font-medium mb-1.5 ml-0.5">Email address</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {/* Password */}
            <div className="fade-up delay-4">
              <label className="block text-slate-400 text-xs font-medium mb-1.5 ml-0.5">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input-field w-full pl-10 pr-11 py-3 rounded-xl text-white text-sm"
                  value={form.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password strength */}
              {form.password.length > 0 && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full strength-bar ${i <= strength ? strengthColor[strength] : "bg-transparent"}`}
                          style={{ width: i <= strength ? "100%" : "0%" }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      {[
                        { label: "8+ chars", met: form.password.length >= 8 },
                        { label: "Uppercase", met: /[A-Z]/.test(form.password) },
                        { label: "Number", met: /[0-9]/.test(form.password) },
                      ].map((check) => (
                        <span key={check.label} className={`check-item text-[10px] flex items-center gap-1 ${check.met ? "text-emerald-400" : "text-slate-600"}`}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            {check.met ? <path d="M20 6L9 17l-5-5" /> : <path d="M18 6L6 18M6 6l12 12" />}
                          </svg>
                          {check.label}
                        </span>
                      ))}
                    </div>
                    <span className={`text-[10px] font-semibold ${strengthTextColor[strength]}`}>
                      {strengthLabel[strength]}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Role — dev only */}
            {/* <div className="fade-up delay-5">
              <label className="block text-slate-400 text-xs font-medium mb-1.5 ml-0.5">
                Role
                <span className="dev-badge">DEV ONLY</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    <path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
                  </svg>
                </div>
                <select
                  className="role-field w-full pl-10 pr-9 py-3 rounded-xl text-white text-sm"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="USER">user (default)</option>
                  <option value="DEVELOPER">DEVELOPER</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div> */}

            {/* Submit */}
            <div className="fade-up delay-6 pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-register w-full text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="fade-up delay-6 flex items-center gap-4 my-6">
            <div className="divider-line flex-1" />
            <span className="text-slate-700 text-xs">or</span>
            <div className="divider-line flex-1" />
          </div>

          {/* Login link */}
          <div className="fade-up delay-6 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Bottom note */}
        <div className="fade-up delay-6 text-center mt-6">
          <p className="text-slate-700 text-xs">Secured with BCrypt · Spring Boot backend</p>
        </div>
      </div>
    </div>
  );
}