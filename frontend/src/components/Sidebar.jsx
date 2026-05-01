import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../api";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          isActive 
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center">
      
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">VMS</h2>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {user.role === "visitor" && (
            <>
              <NavLink to="/app/visitor-dashboard">My Dashboard</NavLink>
              <NavLink to="/app/appointments">My Appointments</NavLink>
            </>
          )}

          {user.role !== "visitor" && (
            <NavLink to="/app/dashboard">Dashboard</NavLink>
          )}

          {(user.role === "employee" || user.role === "admin") && (
            <>
              <NavLink to="/app/visitor-register">Register</NavLink>
              <NavLink to="/app/manage-visitors">Manage</NavLink>
              <NavLink to="/app/appointments">Appointments</NavLink>
            </>
          )}

          {user.role === "security" && (
            <>
              <NavLink to="/app/appointments">Appointments</NavLink>
              <NavLink to="/app/scan">Scan</NavLink>
              <NavLink to="/app/check-pass">Lookup</NavLink>
            </>
          )}

          {user.role === "admin" && (
            <>
              <NavLink to="/app/scan">Scan</NavLink>
              <NavLink to="/app/logs">Logs</NavLink>
              <NavLink to="/app/create-user">Users</NavLink>
              <NavLink to="/app/passes">Passes</NavLink>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end mr-2">
          <span className="text-sm font-semibold text-slate-900 leading-none">{user.name}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">
            {user.role}
          </span>
        </div>

        <button
          onClick={logout}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;