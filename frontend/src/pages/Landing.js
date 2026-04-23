import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const floatingTasks = [
  { text: "Design UI mockups", priority: "High", status: "In Progress", x: 8, y: 15, delay: 0 },
  { text: "Fix auth bug", priority: "Critical", status: "Todo", x: 72, y: 10, delay: 0.4 },
  { text: "Write unit tests", priority: "Medium", status: "Done", x: 80, y: 60, delay: 0.8 },
  { text: "Deploy to staging", priority: "High", status: "Todo", x: 5, y: 65, delay: 1.2 },
  { text: "Code review PR #42", priority: "Low", status: "In Progress", x: 60, y: 78, delay: 0.6 },
];

const priorityColors = {
  Critical: "text-red-400 bg-red-400/10 border-red-400/20",
  High: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  Medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  Low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

const statusDot = {
  "In Progress": "bg-blue-400",
  Todo: "bg-slate-400",
  Done: "bg-emerald-400",
};

function FloatingCard({ task }) {
  return (
    <div
      className="absolute hidden lg:block"
      style={{
        left: `${task.x}%`,
        top: `${task.y}%`,
        animation: `floatCard 6s ease-in-out infinite`,
        animationDelay: `${task.delay}s`,
      }}
    >
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl p-3 w-52 shadow-xl shadow-black/40">
        <div className="flex items-start gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${statusDot[task.status]}`} />
          <p className="text-slate-200 text-xs font-medium leading-snug">{task.text}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className="text-slate-500 text-[10px]">{task.status}</span>
        </div>
      </div>
    </div>
  );
}

function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Landing() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14] text-white overflow-hidden relative font-sans">

      {/* Inject keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, .font-display { font-family: 'Syne', sans-serif; }

        @keyframes floatCard {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-14px) rotate(1deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .delay-1 { animation-delay: 0.15s; opacity: 0; }
        .delay-2 { animation-delay: 0.3s; opacity: 0; }
        .delay-3 { animation-delay: 0.45s; opacity: 0; }
        .delay-4 { animation-delay: 0.6s; opacity: 0; }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          transition: all 0.3s ease;
          box-shadow: 0 0 0 0 rgba(99,102,241,0.4);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.45), 0 0 0 1px rgba(139,92,246,0.4);
        }
        .btn-secondary {
          transition: all 0.3s ease;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.08);
          transform: translateY(-2px);
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          border-color: rgba(99,102,241,0.4);
        }
        .glow-text {
          background: linear-gradient(135deg, #fff 30%, #a5b4fc 70%, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Dynamic background glow that follows mouse */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(99,102,241,0.08) 0%, transparent 70%)`,
          transition: "background 0.3s ease",
        }}
      />

      {/* Static background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", animation: "pulse-glow 4s ease-in-out infinite" }} />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)", animation: "pulse-glow 5s ease-in-out infinite", animationDelay: "2s" }} />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Floating task cards */}
      {floatingTasks.map((task, i) => <FloatingCard key={i} task={task} />)}

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-slate-800/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <span className="font-display font-700 text-lg text-white tracking-tight">TaskAI</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="btn-secondary text-slate-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg border border-transparent hover:border-slate-700"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="btn-primary text-white text-sm font-semibold px-5 py-2 rounded-lg"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20 max-w-5xl mx-auto">

        {/* Badge */}
        <div className="fade-up delay-1 inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 rounded-full px-4 py-1.5 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" style={{ animation: "pulse-glow 2s ease-in-out infinite" }} />
          <span className="text-indigo-300 text-xs font-medium tracking-wide">Powered by Gemini AI</span>
        </div>

        {/* Headline */}
        <h1 className="fade-up delay-2 font-display text-5xl md:text-7xl font-800 leading-[1.05] tracking-tight mb-6">
          <span className="glow-text">Manage tasks</span>
          <br />
          <span className="text-slate-400 font-600">like never before</span>
        </h1>

        {/* Subheadline */}
        <p className="fade-up delay-3 text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
          AI writes your task descriptions, suggests priorities, and keeps your team in sync — automatically.
        </p>

        {/* CTA Buttons */}
        <div className="fade-up delay-4 flex items-center gap-4 flex-wrap justify-center">
          <button
            onClick={() => navigate("/register")}
            className="btn-primary text-white font-semibold px-8 py-3.5 rounded-xl text-base flex items-center gap-2"
          >
            Start for free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => navigate("/login")}
            className="btn-secondary text-slate-300 hover:text-white font-medium px-8 py-3.5 rounded-xl text-base border border-slate-700/60"
          >
            Sign in
          </button>
        </div>

        {/* Stats */}
        <div className="fade-up delay-4 mt-20 grid grid-cols-3 gap-8 md:gap-16 border-t border-slate-800/60 pt-10 w-full max-w-lg">
          {[
            { value: 10, suffix: "k+", label: "Tasks created" },
            { value: 98, suffix: "%", label: "Uptime" },
            { value: 3, suffix: "x", label: "Faster delivery" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-3xl font-800 glow-text">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Feature Cards */}
      <section className="relative z-10 px-6 md:px-12 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" /><path d="M12 8v4l3 3" />
                </svg>
              ),
              color: "text-indigo-400",
              bg: "bg-indigo-400/10 border-indigo-400/20",
              title: "Auto Descriptions",
              desc: "Type a task title — AI writes the full description, acceptance criteria, and steps instantly.",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              ),
              color: "text-violet-400",
              bg: "bg-violet-400/10 border-violet-400/20",
              title: "Smart Priority",
              desc: "AI reads your task and suggests the right priority so critical work never gets buried.",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
              color: "text-pink-400",
              bg: "bg-pink-400/10 border-pink-400/20",
              title: "Role-Based Teams",
              desc: "Admins assign, devs execute. Secure RBAC keeps everyone in their lane.",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="card-hover bg-slate-900/50 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-6"
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
              <h3 className="font-display font-700 text-white text-lg mb-2">{card.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 px-6 pb-24 text-center">
        <div className="max-w-xl mx-auto bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-3xl p-10">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"
            style={{ animation: "spin-slow 8s linear infinite" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-800 glow-text mb-3">Ready to ship faster?</h2>
          <p className="text-slate-400 text-sm mb-6">Join developers who've upgraded their workflow with AI-powered task management.</p>
          <button
            onClick={() => navigate("/register")}
            className="btn-primary text-white font-semibold px-8 py-3 rounded-xl text-sm"
          >
            Create free account →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 px-6 py-6 text-center">
        <p className="text-slate-600 text-xs">Built with Spring Boot + Gemini AI · © 2025 TaskAI</p>
      </footer>
    </div>
  );
}