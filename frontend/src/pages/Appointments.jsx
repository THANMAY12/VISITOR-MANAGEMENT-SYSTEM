import { useState, useEffect } from "react";
import API from "../api";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data);
    } catch (e) {
      console.error(e);
      setError("Failed to load appointments");
    }
  };

  const approveAppointment = async (id) => {
    try {
      setProcessingId(id);
      setError("");
      setMessage("");
      await API.patch("/appointments/" + id, { status: "approved" });
      setMessage("Appointment approved successfully");
      fetchAppointments();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || "Failed to approve");
    } finally {
      setProcessingId(null);
    }
  };

  const issuePass = async (id) => {
    try {
      setProcessingId(id);
      setError("");
      setMessage("");
      await API.post("/appointments/" + id + "/issue-pass");
      setMessage("Pass issued and sent to visitor");
      fetchAppointments();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || "Failed to issue pass");
    } finally {
      setProcessingId(null);
    }
  };

  let visibleAppointments = appointments;
  if (user && user.role === "security") {
    visibleAppointments = appointments.filter((a) => a.status === "approved");
  }

  const StatusBadge = ({ status }) => {
    const styles = {
      approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
      pending: "bg-amber-50 text-amber-700 border-amber-100",
      rejected: "bg-rose-50 text-rose-700 border-rose-100"
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Appointments</h2>
          <p className="text-slate-500 mt-1">Review and manage visitor entry requests.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <p className="text-red-700 text-sm font-bold">{error}</p>
        </div>
      )}

      {message && (
        <div className="mb-6 bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <p className="text-emerald-700 text-sm font-bold">{message}</p>
        </div>
      )}

      <div className="card overflow-hidden !p-0 border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Visitor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Purpose</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                {user.role !== "visitor" && (
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visibleAppointments.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                        {a.visitorId?.name?.charAt(0) || "?"}
                      </div>
                      <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {a.visitorId?.name || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 font-medium">{a.purpose}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">
                      {new Date(a.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={a.status} />
                  </td>
                  {user.role !== "visitor" && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {(user?.role === "employee" || user?.role === "admin") && a.status === "pending" && (
                          <button
                            onClick={() => approveAppointment(a._id)}
                            disabled={processingId === a._id}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm disabled:opacity-50 transition-all"
                          >
                            {processingId === a._id ? "..." : "Approve"}
                          </button>
                        )}

                        {user?.role === "security" && a.status === "approved" && (
                          <button
                            onClick={() => issuePass(a._id)}
                            disabled={processingId === a._id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm disabled:opacity-50 transition-all"
                          >
                            {processingId === a._id ? "..." : "Issue Pass"}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {visibleAppointments.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <p className="text-slate-400 font-medium italic">No appointments found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Appointments;