import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../api/api";

// ─── helpers ────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HTTP_ERRORS = {
  400: "Invalid credentials format. Please check your inputs.",
  401: "Incorrect email or password.",
  403: "Your account has been suspended. Please contact support.",
  404: "No account found with this email address.",
  429: "Too many login attempts. Please wait a moment and try again.",
  500: "Server error. Please try again later.",
  503: "Service temporarily unavailable. Please try again later.",
};

// ─── component ───────────────────────────────────────────────────────────────

export default function Login() {
  const [form, setForm]               = useState({ email: "", password: "" });
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate   = useNavigate();
  const abortRef   = useRef(null);
  const isMounted  = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      abortRef.current?.abort();
    };
  }, []);

  // ── field helpers ──────────────────────────────────────────────────────────

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key] && !prev.general) return prev;
      const next = { ...prev };
      delete next[key];
      delete next.general;
      return next;
    });
  }, []);

  // ── validation ─────────────────────────────────────────────────────────────

  const validate = () => {
    const errs = {};
    const email = form.email.trim();

    if (!email)                    errs.email    = "Email address is required.";
    else if (!EMAIL_RE.test(email)) errs.email   = "Enter a valid email address.";

    if (!form.password)            errs.password = "Password is required.";

    return errs;
  };

  // ── submit ─────────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        }),
        signal: abortRef.current.signal,
      });

      if (!isMounted.current) return;

      if (!res.ok) {
        // try to get server message, fall back to status map
        let serverMsg = "";
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          try {
            const data = await res.json();
            serverMsg = data?.message || data?.error || "";
          } catch { /* ignore */ }
        }

        const msg = serverMsg || HTTP_ERRORS[res.status] || `Login failed (${res.status}). Please try again.`;

        // pin 401/404 to the fields for tighter UX
        if (res.status === 401 || res.status === 404) {
          setErrors({ general: msg });
        } else if (res.status === 403) {
          setErrors({ general: msg });
        } else {
          setErrors({ general: msg });
        }

        setLoading(false);
        return;
      }

      // parse token — server sends plain text or JSON wrapper
      let token = "";
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        try {
          const data = await res.json();
          token = data?.token || data?.accessToken || "";
        } catch { /* fall through */ }
      } else {
        token = (await res.text()).trim();
      }

      if (!token) {
        setErrors({ general: "Authentication failed. Please try again." });
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);

      if (isMounted.current) {
        try { navigate("/dashboard"); } catch { window.location.href = "/dashboard"; }
      }

    } catch (err) {
      if (!isMounted.current) return;
      setLoading(false);

      if (err.name === "AbortError") return;

      const msg =
        err instanceof TypeError
          ? "Cannot reach the server. Check your connection and try again."
          : "An unexpected error occurred. Please try again.";

      setErrors({ general: msg });
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !loading) handleLogin(); };

  // ── derived ────────────────────────────────────────────────────────────────

  const hasError   = (key) => Boolean(errors[key]);
  const errorMsg   = (key) => errors[key] || "";
  const inputClass = (key) =>
    `input-field w-full py-3 rounded-xl text-white text-sm ${hasError(key) ? "input-error" : ""}`;

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center px-4 relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, .font-display { font-family: 'Syne', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.65; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }

        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }
        .delay-4 { animation-delay: 0.4s; opacity: 0; }

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
        .input-field.input-error {
          border-color: rgba(248,113,113,0.5) !important;
          background: rgba(248,113,113,0.04) !important;
        }
        .input-field.input-error:focus {
          box-shadow: 0 0 0 3px rgba(248,113,113,0.12) !important;
        }

        .btn-login {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          transition: all 0.3s ease;
        }
        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(99,102,241,0.4);
        }
        .btn-login:active:not(:disabled) { transform: translateY(0); }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

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
        .field-error {
          color: #f87171;
          font-size: 11px;
          margin-top: 5px;
          margin-left: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[15%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)", animation: "pulse-glow 4s ease-in-out infinite" }} />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", animation: "pulse-glow 5s ease-in-out infinite", animationDelay: "2s" }} />
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
            <h2 className="font-display text-3xl font-800 glow-text mb-2">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to your workspace</p>
          </div>

          {/* Global error banner */}
          {errors.general && (
            <div key={errors.general} className="error-shake flex items-center gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          <div className="space-y-4">

            {/* Email */}
            <div className="fade-up delay-2">
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
                  className={`${inputClass("email")} pl-10 pr-4`}
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="email"
                  aria-invalid={hasError("email")}
                  aria-describedby={hasError("email") ? "email-error" : undefined}
                />
              </div>
              {hasError("email") && (
                <p id="email-error" className="field-error">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                  {errorMsg("email")}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="fade-up delay-3">
              <label className="block text-slate-400 text-xs font-medium mb-1.5 ml-0.5">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`${inputClass("password")} pl-10 pr-11`}
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                  aria-invalid={hasError("password")}
                  aria-describedby={hasError("password") ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {hasError("password") && (
                <p id="password-error" className="field-error">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                  {errorMsg("password")}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="fade-up delay-4 pt-2">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="btn-login w-full text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="fade-up delay-4 flex items-center gap-4 my-6">
            <div className="divider-line flex-1" />
            <span className="text-slate-700 text-xs">or</span>
            <div className="divider-line flex-1" />
          </div>

          {/* Register link */}
          <div className="fade-up delay-4 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Create one free
              </button>
            </p>
          </div>
        </div>

        {/* Bottom note */}
        <div className="fade-up delay-4 text-center mt-6">
          <p className="text-slate-700 text-xs">Secured with JWT · Spring Boot backend</p>
        </div>
      </div>
    </div>
  );
}