import { useEffect, useState } from "react";
import API from "../api";

function VisitorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state for creating a new visit request
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

  // Simplified manual validation function
  const validateForm = () => {
    if (!phone || !date || !purpose) {
      setFormError("You must fill out phone, date, and purpose.");
      return false;
    }
    if (!photo) {
      setFormError("A photo is required.");
      return false;
    }
    // basic check for image
    if (photo.type !== "image/jpeg" && photo.type !== "image/png") {
      setFormError("Please upload a JPG or PNG file.");
      return false;
    }
    return true;
  };

  const submitRequest = async () => {
    try {
      setFormError("");
      setFormMessage("");

      // Check if form is valid using our helper
      const isValid = validateForm();
      if (!isValid) return;

      setSubmitting(true);

      // Upload the photo to our backend first
      // We use FormData because we are sending a file, not JSON
      const formData = new FormData();
      formData.append("file", photo);
      
      console.log("Uploading photo to server...");
      const uploadResponse = await API.post("/upload", formData);
      const photoUrl = uploadResponse.data.url;

      // Now create the appointment using the returned photo URL
      console.log("Creating appointment request...");
      const phoneV="+91"+phone;
      await API.post("/appointments/my-request", {
        phone:phoneV,
        date: new Date(date),
        purpose: purpose,
        photo: photoUrl
      });

      setFormMessage("Visit request submitted! Wait for approval.");

      // Reset the form inputs
      setPhone("");
      setDate("");
      setPurpose("");
      setPhoto(null);

      // Refresh appointments list
      fetchMyAppointments();

    } catch (err) {
      console.error("Submission error:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setFormError(err.response.data.error);
      } else {
        setFormError("Failed to submit request.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Download pass function using standard browser download
  const downloadPass = async (passId) => {
    try {
      // Use the API to download the PDF blob
      const res = await API.get("/passes/download/" + passId, {
        responseType: "blob",
      });
      // Create a temporary object URL for the blob
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      
      // Create a hidden link and click it to trigger download
      const tempLink = document.createElement("a");
      tempLink.href = blobUrl;
      tempLink.setAttribute("download", "visitor_pass.pdf");
      document.body.appendChild(tempLink);
      tempLink.click();
      
      // Cleanup
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download the pass. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">

      {/* Request a Visit Form */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Request a Visit</h2>

        <div className="mb-3">
          <label className="block text-sm mb-1">Phone Number</label>
          <input
            className="w-full border p-2 rounded"
            placeholder="Your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Visit Date</label>
          <input
            type="datetime-local"
            className="w-full border p-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Purpose of Visit</label>
          <input
            className="w-full border p-2 rounded"
            placeholder="Why are you visiting?"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Upload Photo (required)</label>
          <input
            type="file"
            className="w-full"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
          />
        </div>

        <button
          onClick={submitRequest}
          disabled={submitting}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>

        {formMessage && <p className="text-green-600 mt-3 text-center">{formMessage}</p>}
        {formError && <p className="text-red-500 mt-3 text-center">{formError}</p>}
      </div>

      {/* My Appointments & Passes */}
      <h2 className="text-xl font-semibold mb-4">My Appointments</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : appointments.length === 0 ? (
        <p className="text-gray-500">No appointments yet. Submit a request above.</p>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appt) => (
            <div key={appt._id} className="bg-white border p-4 rounded-xl shadow">
              <p><strong>Purpose:</strong> {appt.purpose}</p>
              <p><strong>Date:</strong> {new Date(appt.date).toLocaleString()}</p>
              <p>
                <strong>Status: </strong>
                <span className={
                  appt.status === "approved" ? "text-green-600" :
                  appt.status === "pending" ? "text-yellow-600" : "text-red-600"
                }>
                  {appt.status}
                </span>
              </p>

              {/* If a pass exists for this appointment, show download */}
              {appt.passId && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-1">Your pass is ready!</p>
                  <button
                    onClick={() => downloadPass(appt.passId._id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded text-sm"
                  >
                    Download Pass PDF
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VisitorDashboard;
