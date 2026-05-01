import API from "../api";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/app/dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setError("All fields are required");
        return;
      }

      setLoading(true);
      setError("");

      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("user", JSON.stringify(res.data));

      if (res.data.role === "visitor") {
        navigate("/app/visitor-dashboard");
      } else {
        navigate("/app/dashboard");
      }

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-4">
             <span className="text-white text-3xl font-black">V</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Log in to manage your visitor appointments</p>
        </div>

        <div className="card bg-white p-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="name@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50/50"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50/50"
              />
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 disabled:opacity-70 transition-all flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : "Log in"}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <p className="text-red-600 text-xs font-bold leading-none">
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-center mt-8 text-slate-500">
          New visitor?{" "}
          <Link to="/public-visitor" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4">
            Register for access
          </Link>
        </p>

        <div className="mt-10 pt-6 border-t border-slate-200">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 text-center">Testing Credentials</p>
           <div className="grid grid-cols-1 gap-2 text-[11px]">
              <div className="bg-white border border-slate-100 p-2 rounded flex justify-between">
                 <span className="font-bold text-slate-500">ADMIN:</span>
                 <span className="text-slate-900">admin@test.com / 123456</span>
              </div>
              <div className="bg-white border border-slate-100 p-2 rounded flex justify-between">
                 <span className="font-bold text-slate-500">EMPLOYEE:</span>
                 <span className="text-slate-900">employe1@gmail.com / 123456</span>
              </div>
              <div className="bg-white border border-slate-100 p-2 rounded flex justify-between">
                 <span className="font-bold text-slate-500">SECURITY:</span>
                 <span className="text-slate-900">security@gmail.com / 123456</span>
              </div>
           </div>
        </div>
      </div>

      <div className="mt-10 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
        Visitor Management System (Created by Thanmay Gowda B J)
      </div>
    </div>
  );
}

export default Login;