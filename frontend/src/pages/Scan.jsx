import { useState } from "react";
import API from "../api";
import { Scanner } from "@yudiel/react-qr-scanner";

function Scan() {
  const [passId, setPassId] = useState("");
  const [passData, setPassData] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const handleProcess = async (id) => {
    try {
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
        setError(currentStatus);
        return;
      }

      const scanRes = await API.post("/check/scan", {
        passId: id,
      });

      setMessage(scanRes.data.message);

    } catch (err) {
      console.error(err);
      setError("Invalid or Failed");
      setPassData(null);
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
      setError("Invalid QR Code");
    }
  };

  const handleManual = async () => {
    if (passId === "") {
      setError("Enter Pass ID");
      return;
    }
    await handleProcess(passId);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Scan Visitor Pass</h2>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <Scanner onScan={handleScan} />
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h3 className="font-semibold mb-3">Enter Pass ID</h3>
        <div className="flex gap-2">
          <input
            className="border p-2 rounded w-full"
            value={passId}
            onChange={(e) => setPassId(e.target.value)}
            placeholder="Enter Pass ID"
          />
          <button
            onClick={handleManual}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded"
          >
            Submit
          </button>
        </div>
      </div>

      {message && <p className="text-green-600 mb-3">{message}</p>}
      {error && <p className="text-red-500 mb-3">{error}</p>}

      {passData && (
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold mb-4">Visitor Details</h3>
          <p className="mb-3">
            <b>Status: </b>
            <span>{status}</span>
          </p>
          <p><b>Name:</b> {passData.visitorId ? passData.visitorId.name : ""}</p>
          <p><b>Email:</b> {passData.visitorId ? passData.visitorId.email : ""}</p>
          <p><b>Phone:</b> {passData.visitorId ? passData.visitorId.phone : ""}</p>
          <p><b>Purpose:</b> {passData.appointmentId ? passData.appointmentId.purpose : ""}</p>
          <p><b>Valid From:</b> {new Date(passData.validFrom).toLocaleString()}</p>
          <p><b>Valid To:</b> {new Date(passData.validTo).toLocaleString()}</p>

          {passData.visitorId && passData.visitorId.photo && (
            <img
              src={passData.visitorId.photo}
              alt="visitor"
              className="mt-4 w-24 h-24 object-cover rounded border"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Scan;