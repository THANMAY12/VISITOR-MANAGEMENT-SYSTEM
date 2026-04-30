import { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
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

  // Admin dashboard: fetch counts of visitors, appointments, passes, logs
  const fetchAdminStats = async () => {
    try {
      const res = await API.get("/check/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Security dashboard: fetch who is currently checked in but not out
  const fetchInsideVisitors = async () => {
    try {
      const res = await API.get("/check/logs");
      const logs = res.data.logs;

      // Filter down to only the logs where visitor hasn't checked out yet
      const inside = logs.filter((log) => !log.checkOutTime);
      setInsideLogs(inside);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">

      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {/* Admin: show system-wide counts */}
      {user?.role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
            <p className="text-gray-500">Total Visitors</p>
            <h2 className="text-3xl font-bold mt-2">{stats.visitorCount}</h2>
          </div>

          <div className="bg-blue-50 p-5 rounded-xl shadow hover:shadow-lg transition">
            <p className="text-blue-700">Appointments</p>
            <h2 className="text-3xl font-bold mt-2">{stats.appointmentCount}</h2>
          </div>

          <div className="bg-green-50 p-5 rounded-xl shadow hover:shadow-lg transition">
            <p className="text-green-700">Passes Issued</p>
            <h2 className="text-3xl font-bold mt-2">{stats.passCount}</h2>
          </div>

          <div className="bg-purple-50 p-5 rounded-xl shadow hover:shadow-lg transition">
            <p className="text-purple-700">Check-In Logs</p>
            <h2 className="text-3xl font-bold mt-2">{stats.logCount}</h2>
          </div>

        </div>
      )}

      {/* Security: show who is currently inside */}
      {user?.role === "security" && (
        <div>
          <div className="bg-green-50 text-green-700 p-3 rounded mb-4 w-fit">
            Currently Inside: <b>{insideLogs.length}</b>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-3">Visitors Currently Inside</h3>

            {insideLogs.length === 0 ? (
              <p className="text-gray-500">No visitors inside right now</p>
            ) : (
              insideLogs.map((log) => (
                <div key={log._id} className="border-b py-2">
                  <p className="font-medium">
                    {log.passId?.visitorId?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Checked in: {new Date(log.checkInTime).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Employee: simple welcome */}
      {user?.role === "employee" && (
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Welcome</h3>
          <p className="text-gray-600">
            Use the menu to register visitors and manage appointments.
          </p>
        </div>
      )}

    </div>
  );
}

export default Dashboard;