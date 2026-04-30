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
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    
    <div className="bg-white p-8 rounded-xl shadow-md w-80">

      <h2 className="text-2xl font-bold text-center mb-6">
        Login
      </h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
      />

      <button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">
          {error}
        </p>
      )}

      <p className="text-sm text-center mt-4">
        New visitor?{" "}
        <Link to="/public-visitor" className="text-blue-500 hover:underline">
          Register here
        </Link>
      </p>

    </div>
  </div>
);
}

export default Login;