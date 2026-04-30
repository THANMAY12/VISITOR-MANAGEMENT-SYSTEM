import { useState, useEffect } from "react";
import API from "../api";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data);
    } catch (e) {
      console.error(e);
      setError("Failed to load appointments");
    }
  };

  // Employee/Admin approve a pending appointment
  const approveAppointment = async (id) => {
    try {
      setError("");
      setMessage("");
      await API.patch("/appointments/" + id, { status: "approved" });
      setMessage("Appointment approved");
      fetchAppointments();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || "Failed to approve");
    }
  };

  // Security clicks Issue Pass on an approved appointment
  const issuePass = async (id) => {
    try {
      setError("");
      setMessage("");
      await API.post("/appointments/" + id + "/issue-pass");
      setMessage("Pass issued and email sent to visitor");
      fetchAppointments();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || "Failed to issue pass");
    }
  };

  // Security only sees approved appointments
  let visibleAppointments = appointments;
  if (user && user.role === "security") {
    visibleAppointments = appointments.filter((a) => a.status === "approved");
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Appointments</h2>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-600 mb-4">{message}</p>}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Visitor</th>
              <th className="p-3 text-left">Purpose</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>

              {user.role!=="visitor" && <th className="p-3 text-left">Action</th>}
            </tr>
          </thead>

          <tbody>
            {visibleAppointments.map((a) => {
              let visitorName = "N/A";
              if (a.visitorId && a.visitorId.name) {
                visitorName = a.visitorId.name;
              }

              return (
                <tr key={a._id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3 font-medium">{visitorName}</td>
                  <td className="p-3 text-gray-600">{a.purpose}</td>
                  <td className="p-3 text-gray-600">
                    {new Date(a.date).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <span className={
                      a.status === "approved"
                        ? "bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                        : a.status === "pending"
                        ? "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs"
                        : "bg-red-100 text-red-700 px-2 py-1 rounded text-xs"
                    }>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {/* Employee/Admin — approve pending requests */}
                    {(user?.role === "employee" || user?.role === "admin") && a.status === "pending" && (
                      <button
                        onClick={() => approveAppointment(a._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Approve
                      </button>
                    )}

                    {/* Security — issue pass for approved appointments */}
                    {user?.role === "security" && a.status === "approved" && (
                      <button
                        onClick={() => issuePass(a._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Issue Pass
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {visibleAppointments.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Appointments;