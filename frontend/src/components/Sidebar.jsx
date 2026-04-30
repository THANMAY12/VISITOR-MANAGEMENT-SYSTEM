import { Link, useNavigate } from "react-router-dom";
import API from "../api";

function Sidebar() {
  const navigate = useNavigate();
  const userData = localStorage.getItem("user");

  if (!userData) return null;

  const user = JSON.parse(userData);

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch(e) {
      console.error(e);
    }
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="w-full bg-gray-900 text-white px-6 py-3 flex justify-between items-center shadow">
      
      {/* Left side */}
      <div className="flex items-center gap-6">
        <h2 className="text-xl font-bold">VMS</h2>

        {/* Visitor sees their own dashboard */}
        {user.role === "visitor" && (
          <>
            <Link to="/app/visitor-dashboard" className="hover:text-blue-400">
              My Dashboard
            </Link>
            <Link to="/app/appointments" className="hover:text-blue-400">
              My Appointments
            </Link>
          </>
        )}

        {/* Non-visitor, non-security users see the main dashboard */}
        {user.role !== "visitor" && (
          <Link to="/app/dashboard" className="hover:text-blue-400">
            Dashboard
          </Link>
        )}

        {/* Employee and Admin manage visitors and appointments */}
        {(user.role === "employee" || user.role === "admin") && (
          <>
            <Link to="/app/visitor-register" className="hover:text-blue-400">
              Register Visitor
            </Link>
            <Link to="/app/manage-visitors" className="hover:text-blue-400">
              Manage Visitors
            </Link>
            <Link to="/app/appointments" className="hover:text-blue-400">
              Appointments
            </Link>
          </>
        )}

        {/* Security sees appointments (to issue passes) and scan */}
        {user.role === "security" && (
          <>
            <Link to="/app/appointments" className="hover:text-blue-400">
              Appointments
            </Link>
            <Link to="/app/scan" className="hover:text-blue-400">
              Scan
            </Link>
            <Link to="/app/check-pass" className="hover:text-blue-400">Lookup Pass</Link>
          </>
        )}

        {/* Admin-only links */}
        {user.role === "admin" && (
          <>
            <Link to="/app/scan" className="hover:text-blue-400">
              Scan
            </Link>
            <Link to="/app/logs" className="hover:text-blue-400">
              Logs
            </Link>
            <Link to="/app/create-user" className="hover:text-blue-400">
              Create User
            </Link>
            <Link to="/app/passes" className="hover:text-blue-400">All Passes</Link>
          </>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400 uppercase">
          {user.role}
        </span>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;