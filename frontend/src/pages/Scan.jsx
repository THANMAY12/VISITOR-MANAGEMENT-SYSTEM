import { useState } from "react";
import API from "../api";
import { Scanner } from "@yudiel/react-qr-scanner";

function Scan() {
  const [passId, setPassId] = useState("");
  const [passData, setPassData] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleProcess = async (id) => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.get("/passes/" + id);
      setPassData(res.data);

      const now = new Date();
      const from = new Date(res.data.validFrom);
      const to = new Date(res.data.validTo);

      let currentStatus = "Valid";
      if (now < from) currentStatus = "Not Started";
      if (now > to) currentStatus = "Expired";
      
      setStatus(currentStatus);

      if (currentStatus !== "Valid") {
        setError(`Access Denied: Pass is ${currentStatus}`);
        return;
      }

      const scanRes = await API.post("/check/scan", {
        passId: id,
      });

      setMessage(scanRes.data.message);

    } catch (err) {
      console.error(err);
      setError("Verification Failed: Invalid Pass ID");
      setPassData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (result) => {
    try {
      if (result && result.length > 0) {
        const data = JSON.parse(result[0].rawValue);
        const id = data.passId;
        setPassId(id);
        await handleProcess(id);
      }
    } catch (err) {
      console.error(err);
      setError("Scan Error: Could not read QR code");
    }
  };

  const handleManual = async () => {
    if (passId === "") {
      setError("Please enter a Pass ID");
      return;
    }
    await handleProcess(passId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Security Scanner</h2>
        <p className="text-slate-500 mt-1">Scan QR code or enter ID manually to verify visitor entry.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="card overflow-hidden !p-0 border-slate-200">
            <div className="bg-slate-900 p-4 flex items-center justify-between">
              <span className="text-white text-xs font-black uppercase tracking-widest">Live Camera Feed</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
              </div>
            </div>
            <div className="aspect-square bg-slate-900 flex items-center justify-center relative">
               <Scanner onScan={handleScan} />
               <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white/50 rounded-3xl border-dashed"></div>
               </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Manual Verification</h3>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium"
                value={passId}
                onChange={(e) => setPassId(e.target.value)}
                placeholder="Ex: 60f7..."
              />
              <button
                onClick={handleManual}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 transition-all"
              >
                {loading ? "..." : "Verify"}
              </button>
            </div>
            {error && <p className="text-rose-600 text-xs font-bold mt-3 bg-rose-50 p-2 rounded-lg border border-rose-100">{error}</p>}
            {message && <p className="text-emerald-600 text-xs font-bold mt-3 bg-emerald-50 p-2 rounded-lg border border-emerald-100">{message}</p>}
          </div>
        </div>

        <div>
          {passData ? (
            <div className="card h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-bold text-slate-900">Verification Result</h3>
                 <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${
                    status === 'Valid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                  {status}
                </span>
              </div>

              <div className="flex flex-col items-center text-center mb-8">
                {passData.visitorId?.photo ? (
                  <div className="relative mb-4">
                    <img
                      src={passData.visitorId.photo}
                      alt="visitor"
                      className="w-32 h-32 object-cover rounded-2xl border-4 border-white shadow-xl shadow-slate-200"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-lg shadow-md">
                       <svg className={`w-5 h-5 ${status === 'Valid' ? 'text-emerald-500' : 'text-rose-500'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    </div>
                  </div>
                ) : (
                   <div className="w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4 border-2 border-dashed border-slate-200">
                      No Photo
                   </div>
                )}
                <h4 className="text-2xl font-bold text-slate-900">{passData.visitorId?.name}</h4>
                <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">{passData.visitorId?.company || "Personal Visit"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Purpose</p>
                    <p className="text-sm font-bold text-slate-700">{passData.appointmentId?.purpose}</p>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Contact</p>
                    <p className="text-sm font-bold text-slate-700">{passData.visitorId?.phone}</p>
                 </div>
                 <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Validity Window</p>
                          <p className="text-xs font-bold text-slate-700">
                            {new Date(passData.validFrom).toLocaleTimeString()} - {new Date(passData.validTo).toLocaleTimeString()}
                          </p>
                       </div>
                       <svg className="w-8 h-8 text-slate-200" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="card h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 border-dashed border-2 border-slate-200">
               <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 6.247a1 1 0 00-.553.894l.553 7.384a11.95 11.95 0 005.482 9.491l3.05 1.83a1 1 0 001.096 0l3.05-1.83a11.95 11.95 0 005.482-9.491l.553-7.384a1 1 0 00-.553-.894l-1.429-.413z"></path></svg>
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Awaiting Scan</h3>
               <p className="text-slate-400 text-sm max-w-xs">Position the QR code within the frame or enter the ID manually to see visitor details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Scan;