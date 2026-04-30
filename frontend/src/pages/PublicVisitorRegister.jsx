import { useState } from "react";
import API from "../api";

import { useNavigate } from "react-router-dom";

function PublicVisitorRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      setError("");
      setMessage("");

      if (!name || !email || !password) {
        setError("Please fill required fields");
        return;
      }

      const res = await API.post("/auth/register-visitor", {
        name,
        email,
        password
      });

      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/app/visitor-dashboard");

      setMessage("Visitor registered successfully");

      // reset
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");

    } catch (err) {
      console.log(err)
      setError("registration failed")
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded">

      <h2 className="text-xl font-semibold mb-4 text-center">
        Visitor Registration
      </h2>

      <input
        className="border p-2 w-full mb-3 rounded"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-3 rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-3 rounded"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
      >
        Register
      </button>

      {message && (
        <p className="text-green-600 mt-3 text-center">{message}</p>
      )}

      {error && (
        <p className="text-red-500 mt-3 text-center">{error}</p>
      )}

    </div>
  );
}

export default PublicVisitorRegister;