import { useState, useEffect } from "react";
import API from "../api";

function ManageVisitors() {
  const [visitors, setVisitors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const res = await API.get("/visitors");
      setVisitors(res.data);
    } catch (e) {
      console.error(e);
      setError("Failed to load visitors");
    } finally {
      setLoading(false);
    }
  };

  const approveVisitor = async (id) => {
    try {
      await API.patch(`/visitors/${id}`);
      fetchVisitors();
    } catch (e) {
      console.error(e);
      alert("Failed to approve visitor");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Visitors</h2>
      </div>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-gray-500">Loading visitors...</p>}

      {!loading && visitors.length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
          No visitors found
        </div>
      )}

      {visitors.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v._id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3 font-medium">{v.name}</td>
                  <td className="p-3 text-gray-600">{v.email}</td>
                  <td className="p-3 text-gray-600">{v.company || "N/A"}</td>
                  <td className="p-3">
                    {v.status === "approved" && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                        Approved
                      </span>
                    )}
                    {v.status === "pending" && (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {v.status === "pending" && (
                      <button
                        onClick={() => approveVisitor(v._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageVisitors;
