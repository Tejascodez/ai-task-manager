import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../api/api";

const PAGE_SIZE = 10;

const priorityConfig = {
  CRITICAL: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/25", dot: "bg-red-400" },
  HIGH:     { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/25", dot: "bg-orange-400" },
  MEDIUM:   { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/25", dot: "bg-yellow-400" },
  LOW:      { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/25", dot: "bg-emerald-400" },
};

const columns = [
  {
    key: "TODO",
    label: "Todo",
    accent: "#94a3b8",
    accentBg: "rgba(148,163,184,0.08)",
    accentBorder: "rgba(148,163,184,0.2)",
    icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z",
  },
  {
    key: "IN_PROGRESS",
    label: "In Progress",
    accent: "#60a5fa",
    accentBg: "rgba(96,165,250,0.08)",
    accentBorder: "rgba(96,165,250,0.2)",
    icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  },
  {
    key: "DONE",
    label: "Done",
    accent: "#34d399",
    accentBg: "rgba(52,211,153,0.08)",
    accentBorder: "rgba(52,211,153,0.2)",
    icon: "M20 6L9 17l-5-5",
  },
];

function TaskCard({ task, onStatusChange, onAssign, canAssign }) {
  const p = priorityConfig[task.priority] || priorityConfig.LOW;

  const [assigning, setAssigning] = useState(false);
  const [assignEmail, setAssignEmail] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState(false);

  const handleAssignSubmit = async () => {
    if (!assignEmail.trim()) { setAssignError("Enter an email."); return; }
    setAssignError("");
    setAssignLoading(true);
    const ok = await onAssign(task.id, assignEmail.trim());
    setAssignLoading(false);
    if (ok) {
      setAssignSuccess(true);
      setAssignEmail("");
      setTimeout(() => { setAssigning(false); setAssignSuccess(false); }, 1500);
    } else {
      setAssignError("Failed. Check email or permissions.");
    }
  };

  return (
    <div className="task-card bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-white font-semibold text-xs leading-snug flex-1">{task.title}</h3>
        <span className={`flex-shrink-0 flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${p.color} ${p.bg} ${p.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-slate-500 text-[11px] leading-relaxed mb-3 line-clamp-2">{task.description}</p>
      )}

      {task.assignedTo && (
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px] text-slate-400 font-bold uppercase">
            {task.assignedTo[0]}
          </div>
          <span className="text-slate-600 text-[10px] truncate">{task.assignedTo}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="status-select text-[10px] text-slate-500 bg-transparent border-none outline-none cursor-pointer hover:text-slate-300 transition-colors"
        >
          <option value="TODO">→ Todo</option>
          <option value="IN_PROGRESS">→ In Progress</option>
          <option value="DONE">→ Done</option>
        </select>

        {canAssign && (
          <button
            onClick={() => { setAssigning((v) => !v); setAssignError(""); setAssignEmail(""); setAssignSuccess(false); }}
            className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border transition-all
              ${assigning
                ? "text-violet-300 bg-violet-500/10 border-violet-500/30"
                : "text-slate-600 border-slate-800 hover:text-slate-300 hover:border-slate-700"}`}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Assign
          </button>
        )}
      </div>

      {assigning && (
        <div className="assign-panel mt-3 pt-3 border-t border-slate-800/60">
          {assignSuccess ? (
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              Assigned!
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={assignEmail}
                  onChange={(e) => setAssignEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAssignSubmit()}
                  placeholder="user@example.com"
                  className="assign-input flex-1 px-2.5 py-1.5 rounded-lg text-white text-[11px]"
                />
                <button
                  onClick={handleAssignSubmit}
                  disabled={assignLoading}
                  className="assign-btn text-[11px] font-semibold px-2.5 py-1.5 rounded-lg text-white disabled:opacity-50"
                >
                  {assignLoading ? "..." : "Save"}
                </button>
              </div>
              {assignError && (
                <p className="text-red-400 text-[10px] mt-1.5">{assignError}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ column, tasks, onStatusChange, onAssign, canAssign }) {
  return (
    <div className="kanban-col flex flex-col min-h-[200px]">
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 border"
        style={{ background: column.accentBg, borderColor: column.accentBorder }}
      >
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={column.accent} strokeWidth="2.5">
            <path d={column.icon} />
          </svg>
          <span className="text-xs font-semibold" style={{ color: column.accent }}>{column.label}</span>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: column.accentBg, color: column.accent, border: `1px solid ${column.accentBorder}` }}
        >
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 flex-1">
        {tasks.length === 0 ? (
          <div
            className="flex-1 flex items-center justify-center rounded-xl border border-dashed py-8"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <p className="text-slate-700 text-[11px]">No tasks</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onAssign={onAssign}
              canAssign={canAssign}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Pagination control ──────────────────────────────────────────────────────
function Pagination({ page, hasMore, fetching, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <button
        onClick={onPrev}
        disabled={page === 0 || fetching}
        className="pagination-btn flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg border border-slate-800
          text-slate-500 hover:text-slate-200 hover:border-indigo-500/50 hover:bg-indigo-500/5
          disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        Prev
      </button>

      <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/60 rounded-lg px-4 py-2">
        <span className="text-slate-600 text-[11px]">Page</span>
        <span className="text-white text-xs font-semibold font-display">{page + 1}</span>
      </div>

      <button
        onClick={onNext}
        disabled={!hasMore || fetching}
        className="pagination-btn flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg border border-slate-800
          text-slate-500 hover:text-slate-200 hover:border-indigo-500/50 hover:bg-indigo-500/5
          disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Next
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [newTask, setNewTask] = useState(null);
  const [error, setError] = useState("");

  // pagination state
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const getPayload = () => {
    try { return JSON.parse(atob(token.split(".")[1])); }
    catch { return {}; }
  };

  const getUserName = () => {
    const p = getPayload();
    return p.name || p.sub?.split("@")[0] || "there";
  };

  const canAssign = () => {
    const p = getPayload();
    const roles = p.roles || p.role || p.authorities || [];
    const roleArr = Array.isArray(roles) ? roles : [roles];
    return roleArr.some((r) =>
      typeof r === "string" && (r.toUpperCase().includes("ADMIN") || r.toUpperCase().includes("MANAGER"))
    );
  };

  const fetchTasks = useCallback(async (targetPage) => {
    setFetching(true);
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/my-tasks?page=${targetPage}&size=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 401) { navigate("/login"); return; }
      const data = await res.json();

      // Backend returns a plain List → infer hasMore from result count
      // If backend returns a Spring Page object, use data.content / data.last instead
      const list = Array.isArray(data) ? data : (data.content ?? []);
      setTasks(list);
      // If we got a full page, there might be more
      setHasMore(Array.isArray(data) ? list.length === PAGE_SIZE : !data.last);
    } catch {
      setTasks([]);
      setHasMore(false);
    } finally {
      setFetching(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchTasks(page);
  }, [page]);                       // re-fetch whenever page changes

  const goToPage = (next) => {
    if (next < 0 || (next > page && !hasMore)) return;
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const createTask = async () => {
    if (!title.trim()) { setError("Please enter a task title."); return; }
    setError("");
    setLoading(true);
    setNewTask(null);
    try {
      const res =  await fetch(`${BASE_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      setNewTask(data);
      setTitle("");
      // Jump back to page 0 so the new task is visible
      if (page !== 0) {
        setPage(0);
      } else {
        fetchTasks(0);
      }
    } catch { setError("Failed to create task. Try again."); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${BASE_URL}/api/tasks/${id}/status?status=${status}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch { /* silent */ }
  };

  const assignTask = async (id, email) => {
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${id}/assign?email=${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return false;
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, assignedTo: updated.assignedTo ?? email } : t)));
      return true;
    } catch { return false; }
  };

  const logout = () => { localStorage.removeItem("token"); navigate("/login"); };

  const grouped = {
    TODO: tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: tasks.filter((t) => t.status === "DONE"),
  };

  const userCanAssign = canAssign();

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, h3, .font-display { font-family: 'Syne', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.92) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }

        .task-card { transition: all 0.2s ease; }
        .task-card:hover { transform: translateY(-2px); border-color: rgba(99,102,241,0.3); }

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

        .btn-create {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          transition: all 0.25s ease;
          white-space: nowrap;
        }
        .btn-create:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }
        .btn-create:disabled { opacity: 0.6; cursor: not-allowed; }

        .glow-text {
          background: linear-gradient(135deg, #fff 30%, #a5b4fc 70%, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .new-task-pop { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

        .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .status-select option { background: #0f172a; color: #94a3b8; }

        .assign-panel { animation: slideDown 0.2s ease forwards; }

        .assign-input {
          background: rgba(139,92,246,0.06);
          border: 1px solid rgba(139,92,246,0.2);
          outline: none;
          transition: all 0.2s ease;
          color: white;
        }
        .assign-input:focus {
          border-color: rgba(139,92,246,0.5);
          box-shadow: 0 0 0 2px rgba(139,92,246,0.1);
        }
        .assign-input::placeholder { color: rgba(255,255,255,0.15); }

        .assign-btn {
          background: linear-gradient(135deg, #7c3aed, #6366f1);
          transition: all 0.2s ease;
        }
        .assign-btn:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(124,58,237,0.4); }

        .kanban-col { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .kanban-col:nth-child(1) { animation-delay: 0.15s; }
        .kanban-col:nth-child(2) { animation-delay: 0.25s; }
        .kanban-col:nth-child(3) { animation-delay: 0.35s; }

        .pagination-btn { font-family: 'DM Sans', sans-serif; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 2px; }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-[30%] w-[600px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", animation: "pulse-glow 5s ease-in-out infinite" }} />
        <div className="fixed inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-4 border-b border-slate-800/50 backdrop-blur-sm sticky top-0 bg-[#080c14]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <span className="font-display font-700 text-lg text-white tracking-tight">TaskAI</span>
        </div>

        <div className="flex items-center gap-3">
          {userCanAssign && (
            <div className="hidden md:flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/25 rounded-full px-3 py-1.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-violet-400 text-[10px] font-semibold">Admin</span>
            </div>
          )}
          <div className="hidden md:flex items-center gap-2 bg-slate-800/50 border border-slate-700/40 rounded-full px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "pulse-glow 2s ease-in-out infinite" }} />
            <span className="text-slate-400 text-xs">Hey, {getUserName()} 👋</span>
          </div>
          <button onClick={logout}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-10">

        {/* Header */}
        <div className="fade-up delay-1 mb-8">
          <h2 className="font-display text-3xl font-800 glow-text mb-1">My Workspace</h2>
          <p className="text-slate-500 text-sm">AI will auto-generate descriptions and priority for every task.</p>
        </div>

        {/* Create Task */}
        <div className="fade-up delay-2 bg-slate-900/50 border border-slate-800/60 rounded-2xl p-5 mb-8 backdrop-blur-sm">
          <label className="block text-slate-400 text-xs font-medium mb-3">✨ Create a new task</label>
          <div className="flex gap-3">
            <input
              className="input-field flex-1 px-4 py-3 rounded-xl text-white text-sm"
              placeholder="e.g. Implement JWT refresh token logic..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createTask()}
            />
            <button onClick={createTask} disabled={loading}
              className="btn-create text-white font-semibold px-5 py-3 rounded-xl text-sm flex items-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="hidden sm:inline">Create</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs mt-3 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
              {error}
            </p>
          )}

          {newTask && (
            <div className="new-task-pop mt-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <span className="text-indigo-300 text-xs font-semibold">AI Generated</span>
                {newTask.priority && (
                  <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border
                    ${priorityConfig[newTask.priority]?.color} ${priorityConfig[newTask.priority]?.bg} ${priorityConfig[newTask.priority]?.border}`}>
                    {newTask.priority}
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-xs font-medium mb-1">{newTask.title}</p>
              {newTask.description && <p className="text-slate-500 text-xs leading-relaxed">{newTask.description}</p>}
            </div>
          )}
        </div>

        {/* Summary bar */}
        <div className="fade-up delay-2 flex items-center gap-4 mb-6">
          <span className="text-slate-600 text-xs">{tasks.length} tasks on this page</span>
          <div className="flex-1 h-px bg-slate-800/60" />
          <div className="flex items-center gap-3">
            {columns.map((col) => (
              <span key={col.key} className="flex items-center gap-1.5 text-[11px]" style={{ color: col.accent }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: col.accent }} />
                {grouped[col.key].length} {col.label}
              </span>
            ))}
          </div>
        </div>

        {/* Kanban board */}
        {fetching ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton rounded-xl h-10" />
                <div className="skeleton rounded-xl h-28" />
                <div className="skeleton rounded-xl h-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((col) => (
              <KanbanColumn
                key={col.key}
                column={col}
                tasks={grouped[col.key]}
                onStatusChange={updateStatus}
                onAssign={assignTask}
                canAssign={userCanAssign}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={page}
          hasMore={hasMore}
          fetching={fetching}
          onPrev={() => goToPage(page - 1)}
          onNext={() => goToPage(page + 1)}
        />

      </main>
    </div>
  );
}