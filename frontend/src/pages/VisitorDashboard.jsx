import { useEffect, useState } from "react";
import API from "../api";

function VisitorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [photo, setPhoto] = useState(null);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const fetchMyAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!phone || !date || !purpose) {
      setFormError("All fields except photo are required.");
      return false;
    }
    if (!photo) {
      setFormError("A profile photo is required for security verification.");
      return false;
    }
    return true;
  };

  const submitRequest = async () => {
    try {
      setFormError("");
      setFormMessage("");

      const isValid = validateForm();
      if (!isValid) return;

      setSubmitting(true);

      const formData = new FormData();
      formData.append("file", photo);
      
      const uploadResponse = await API.post("/upload", formData);
      const photoUrl = uploadResponse.data.url;

      const phoneV="+91"+phone;
      await API.post("/appointments/my-request", {
        phone:phoneV,
        date: new Date(date),
        purpose: purpose,
        photo: photoUrl
      });

      setFormMessage("Your visit request has been submitted successfully.");
      setPhone("");
      setDate("");
      setPurpose("");
      setPhoto(null);
      fetchMyAppointments();

    } catch (err) {
      console.error("Submission error:", err);
      setFormError(err.response?.data?.error || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPass = async (passId) => {
    try {
      const res = await API.get("/passes/download/" + passId, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const tempLink = document.createElement("a");
      tempLink.href = blobUrl;
      tempLink.setAttribute("download", "visitor_pass.pdf");
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download error:", err);
      alert("Could not download pass. Contact security.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Visitor Portal</h2>
        <p className="text-slate-500 mt-1">Request visits and manage your active security passes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Request Form */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
               <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
               Request New Visit
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Phone Number</label>
                <div className="flex">
                  <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 py-2 rounded-l-lg text-slate-500 text-sm font-bold flex items-center">+91</span>
                  <input
                    className="flex-1 border border-slate-200 p-2 rounded-r-lg text-sm font-medium"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Visit Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full border border-slate-200 p-2 rounded-lg text-sm font-medium"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Purpose of Visit</label>
                <textarea
                  className="w-full border border-slate-200 p-2 rounded-lg text-sm font-medium h-24 resize-none"
                  placeholder="Ex: Client Meeting, Interview..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Identity Photo</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:border-indigo-300 transition-colors cursor-pointer relative">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-10 w-10 text-slate-300" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-slate-600">
                      <span className="relative cursor-pointer bg-white rounded-md font-bold text-indigo-600 hover:text-indigo-500">
                        {photo ? photo.name : "Upload a photo"}
                      </span>
                    </div>
                  </div>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
                </div>
              </div>

              <button
                onClick={submitRequest}
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-indigo-100 transition-all flex justify-center items-center gap-2"
              >
                {submitting ? "Submitting Request..." : "Submit Request"}
              </button>

              {formMessage && <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-lg text-center">{formMessage}</div>}
              {formError && <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-lg text-center">{formError}</div>}
            </div>
          </div>
        </div>

        {/* My Appointments */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
             <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
             My Appointments
          </h3>

          {loading ? (
            <div className="flex justify-center py-20">
               <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center bg-slate-50 border-dashed border-2 border-slate-200">
              <p className="text-slate-400 font-medium italic">No visit requests found. Submit one on the left.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {appointments.map((appt) => (
                <div key={appt._id} className="card group hover:border-indigo-100 transition-all">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{appt.purpose}</h4>
                        <div className="flex items-center gap-2 text-slate-400 text-xs mt-1 font-bold uppercase tracking-wider">
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           {new Date(appt.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                     </div>
                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        appt.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        appt.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                      {appt.status}
                    </span>
                  </div>

                  {appt.passId && (
                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">Your pass is ready!</p>
                            <p className="text-xs text-slate-500">Download and show it at the security gate.</p>
                         </div>
                      </div>
                      <button
                        onClick={() => downloadPass(appt.passId._id)}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-slate-100 transition-all flex items-center gap-2"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VisitorDashboard;
