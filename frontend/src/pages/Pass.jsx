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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Visitor Passes</h2>
          <p className="text-slate-500 mt-1">Manage and track all issued security passes.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Filter:</span>
           <select
            className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 shadow-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Expired">Expired Only</option>
          </select>
        </div>
      </div>

      {filteredPasses.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-slate-400 font-medium italic">No passes found matching the current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPasses.map((pass) => {
            const status = getStatus(pass);
            const isActive = status === 'Active';
            
            return (
              <div key={pass._id} className="card group relative flex flex-col hover:border-indigo-200 transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                   </div>
                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${
                      isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                    {status}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-1">{pass.visitorId?.name || "Visitor"}</h3>
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">{pass.visitorId?.company || "Personal Visit"}</p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-slate-500">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                     <span className="text-xs font-medium truncate">{pass.visitorId?.email}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100">
                    <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-400">
                      <span>Valid From</span>
                      <span>Valid To</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{new Date(pass.validFrom).toLocaleDateString()}</span>
                      <span>{new Date(pass.validTo).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <a 
                  href={pass.pdfUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="mt-auto block text-center bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-slate-100 hover:shadow-slate-200 transition-all"
                >
                  Download Pass PDF
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Pass;