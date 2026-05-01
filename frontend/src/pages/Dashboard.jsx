import { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    visitorCount: 0,
    appointmentCount: 0,
    passCount: 0,
    logCount: 0
  });

  const [insideLogs, setInsideLogs] = useState([]);

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAdminStats();
    }
    if (user && user.role === "security") {
      fetchInsideVisitors();
    }
  }, []);

  const fetchAdminStats = async () => {
    try {
      const res = await API.get("/check/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInsideVisitors = async () => {
    try {
      const res = await API.get("/check/logs");
      const logs = res.data.logs;
      const inside = logs.filter((log) => !log.checkOutTime);
      setInsideLogs(inside);
    } catch (err) {
      console.error(err);
    }
  };

  const StatCard = ({ label, value, colorClass }) => (
    <div className={`card group hover:border-indigo-200 transition-all cursor-default`}>
      <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">{label}</p>
      <div className="flex items-baseline gap-2 mt-4">
        <h2 className={`text-4xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors`}>{value}</h2>
        <span className="text-slate-400 text-xs font-semibold">Today</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Overview</h1>
        <p className="text-slate-500 mt-1">Monitor your visitor management system in real-time.</p>
      </div>

      {user?.role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Visitors" value={stats.visitorCount} />
          <StatCard label="Appointments" value={stats.appointmentCount} />
          <StatCard label="Passes Issued" value={stats.passCount} />
          <StatCard label="Check-In Logs" value={stats.logCount} />
        </div>
      )}

      {user?.role === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
              <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider">Live Occupancy</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <h2 className="text-4xl font-bold text-emerald-900">{insideLogs.length}</h2>
                <span className="text-emerald-700 font-medium">Inside Now</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card h-full">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                Visitors Currently Inside
              </h3>

              {insideLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <p>All visitors have checked out.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {insideLogs.map((log) => (
                    <div key={log._id} className="py-4 flex justify-between items-center group">
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {log.passId?.visitorId?.name || "Anonymous Visitor"}
                        </p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          Checked in at {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {user?.role === "employee" && (
        <div className="card max-w-2xl bg-indigo-600 border-none relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-2">Welcome back, {user.name}</h3>
            <p className="text-indigo-100 mb-6">
              You have access to register visitors and manage your upcoming appointments.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/app/visitor-register")}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors"
              >
                Quick Register
              </button>
              <button
                onClick={() => navigate("/app/appointments")}
                className="bg-indigo-500/50 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-500/70 transition-colors"
              >
                View Appointments
              </button>
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;