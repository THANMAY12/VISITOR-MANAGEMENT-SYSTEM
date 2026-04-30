import { useState } from "react";
import API from "../api";

function CreateUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createUser = async () => {
    try {
      // No trim, simple validation
      if (!name || !email || !password) {
        setError("All fields are required");
        return;
      }

      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.post("/auth/register", {
        name,
        email,
        password,
        role
      });

      setMessage(res.data.message);


      // Reset
      setName("");
      setEmail("");
      setPassword("");
      setRole("employee");
      alert("user Sucessfully created");

    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Create User
      </h2>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="employee">Employee</option>
          <option value="security">Security</option>
          <option value="admin">Admin</option>
        </select>

        <button
          onClick={createUser}
          disabled={loading}
          className={`w-full text-white p-2 rounded transition 
            ${loading 
              ? "bg-blue-300 cursor-not-allowed" 
              : "bg-blue-500 hover:bg-blue-600"}`}
        >
          {loading ? "Creating..." : "Create User"}
        </button>

        {message && (
          <p className="text-green-600 text-sm text-center">
            {message}
          </p>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

      </div>
    </div>
  );
}
export default CreateUser;