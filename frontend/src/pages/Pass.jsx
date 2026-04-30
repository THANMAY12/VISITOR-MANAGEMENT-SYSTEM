import { useEffect, useState } from "react";
import API from "../api";

const getStatus = (pass) => {
  const now = new Date();
  if (new Date(pass.validTo) < now) {
    return "Expired";
  }
  return "Active";
};

function Pass() {
  const [passes, setPasses] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    try {
      const res = await API.get("/passes");
      setPasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPasses = passes.filter((pass) => {
    if (filter === "All") return true;
    return getStatus(pass) === filter;
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Visitor Passes</h2>
        <select
          className="border p-2 rounded shadow-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Passes</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      {filteredPasses.length === 0 ? (
        <p className="text-gray-500">No passes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPasses.map((pass) => (
            <div key={pass._id} className="bg-white p-5 rounded-xl shadow-md border relative">
              <span className={`absolute top-4 right-4 px-2 py-1 text-xs font-semibold rounded ${getStatus(pass) === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {getStatus(pass)}
              </span>
              
              <h3 className="text-xl font-semibold mb-2">{pass.visitorId?.name}</h3>
              <p className="text-gray-600 mb-1"><strong>Company:</strong> {pass.visitorId?.company}</p>
              <p className="text-gray-600 mb-3"><strong>Email:</strong> {pass.visitorId?.email}</p>
              
              <div className="text-sm bg-gray-50 p-3 rounded mb-4">
                <p><strong>Valid From:</strong> <br/> {new Date(pass.validFrom).toLocaleString()}</p>
                <p className="mt-2"><strong>Valid To:</strong> <br/> {new Date(pass.validTo).toLocaleString()}</p>
              </div>
              
              <a 
                href={pass.pdfUrl} 
                target="_blank" 
                rel="noreferrer" 
                download
                className="block text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
              >
                Download PDF Pass
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Pass;