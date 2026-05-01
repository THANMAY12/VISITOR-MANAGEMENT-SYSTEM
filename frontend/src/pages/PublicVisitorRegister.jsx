import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

function PublicVisitorRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      setError("");
      setMessage("");

      if (!name || !email || !password) {
        setError("All required fields must be filled");
        return;
      }

      setLoading(true);
      const res = await API.post("/auth/register-visitor", {
        name,
        email,
        password
      });

      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/app/visitor-dashboard");

      setMessage("Visitor registered successfully");

    } catch (err) {
      console.log(err)
      setError(err.response?.data?.error || "Registration failed. Please try again.")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 text-slate-500 hover:text-slate-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span className="text-sm font-bold uppercase tracking-wider">Back to Login</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Visitor Registration</h1>
          <p className="text-slate-500 mt-2">Create an account to request access and manage your visits.</p>
        </div>

        <div className="card bg-white p-8">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50/50"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50/50"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Create Password</label>
              <input
                className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50/50"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Password should be secure and at least 8 characters long.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 disabled:opacity-70 transition-all flex justify-center items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : "Create Account"}
              </button>
            </div>

            {message && (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-emerald-700 text-sm font-medium text-center">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-red-600 text-xs font-bold text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            By registering, you agree to our <a href="#" className="font-bold text-slate-900 hover:underline">Terms of Service</a> and <a href="#" className="font-bold text-slate-900 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PublicVisitorRegister;