import { useState } from "react";
import API from "../api";

function CheckPass() {
  const [email, setEmail] = useState("");
  const [passes, setPasses] = useState([]);
  const [error, setError] = useState("");

  const searchPass = async () => {
    try {
      setError("");
      const res = await API.get(`/passes?email=${email}`);
      setPasses(res.data);
    } catch {
      setError("No pass found");
      setPasses([]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Check Your Pass
      </h2>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        
        <div className="flex gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={searchPass}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded"
          >
            Search
          </button>
        </div>

        {error && (
          <p className="text-red-500 mt-3">{error}</p>
        )}
      </div>

      <div className="space-y-4">
        {passes.map((p) => (
          <div
            key={p._id}
            className="bg-white p-5 rounded-xl shadow"
          >
            <p className="text-sm text-gray-500">
              Valid From:
            </p>
            <p className="mb-2 font-medium">
              {new Date(p.validFrom).toLocaleString()}
            </p>

            <p className="text-sm text-gray-500">
              Valid To:
            </p>
            <p className="mb-3 font-medium">
              {new Date(p.validTo).toLocaleString()}
            </p>

            <a
              href={p.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
            >
              View Pass
            </a>
          </div>
        ))}
      </div>

    </div>
  );
}

export default CheckPass;