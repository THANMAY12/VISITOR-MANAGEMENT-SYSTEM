import { useState } from "react";
import API from "../api";

function VisitorRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [purpose, setPurpose] = useState("");
  const [date, setDate] = useState("");
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const uploadPhoto = async () => {
    const formData = new FormData();
    formData.append("file", photo);
    const res = await API.post("/upload", formData);
    return res.data.url;
  };

  const registerVisitor = async () => {
    try {
      setError("");
      setMessage("");

      if (!name || !email || !phone || !company || !purpose || !date) {
        setError("fill all fields");
        return;
      }

      if (!photo) {
        setError("please upload a photo");
        return;
      }

      const photoUrl = await uploadPhoto();

      const res = await API.post("/visitors", {
        name: name,
        email: email,
        phone: "+91" + phone,
        company: company,
        photo: photoUrl,
      });

      const visitorId = res.data.visitor._id;

      await API.post("/appointments", {
        visitorId: visitorId,
        purpose: purpose,
        date: new Date(date),
      });

      setMessage("visitor registered!");

      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setPurpose("");
      setDate("");
      setPhoto(null);

    } catch (err) {
      console.log(err);
      setError("something went wrong");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">

      <h2 className="text-2xl font-semibold mb-6 text-center">
        Visitor Registration
      </h2>

      <div className="mb-3">
        <label className="block text-sm mb-1">Name</label>
        <input
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm mb-1">Email</label>
        <input
        type="email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm mb-1">Phone</label>
        <input
        type="tel"
          className="w-full border p-2 rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm mb-1">Company</label>
        <input
          className="w-full border p-2 rounded"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm mb-1">Purpose</label>
        <input
          className="w-full border p-2 rounded"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm mb-1">Appointment Date</label>
        <input
          type="datetime-local"
          className="w-full border p-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-1">Upload Photo</label>
        <input
          type="file"
          accept="image/*"
          className="w-full"
          onChange={(e) => setPhoto(e.target.files[0])}
        />
      </div>

      <button
        onClick={registerVisitor}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
      >
        Register Visitor
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

export default VisitorRegister;