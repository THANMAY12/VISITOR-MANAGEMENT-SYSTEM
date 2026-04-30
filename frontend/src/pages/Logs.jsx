import { useEffect, useState } from "react";
import API from "../api";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    getLogs();
  }, []);

  const getLogs = async () => {
    try {
      const res = await API.get("/check/logs");
      setLogs(res.data.logs);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const vName = log.passId?.visitorId?.name || ""
    const matchesSearch = vName.toLowerCase().includes(search.toLowerCase())

    if (filterType === "IN") {
      // return only if still inside 
      return matchesSearch && log.checkOutTime === null
    } else if (filterType === "OUT") {
      // return only if they left
      return matchesSearch && log.checkOutTime !== null
    }
    
    return matchesSearch
  })

  // calc people still inside
  const insideCount = logs.filter(l => l.checkOutTime === null).length

  const exportCSV = () => {
    const headers = ["Name", "CheckIn", "CheckOut"]
    
    const rows = logs.map((l) => {
      const name = l.passId?.visitorId?.name || "Unknown"
      const inTime = new Date(l.checkInTime).toLocaleString()
      const outTime = l.checkOutTime ? new Date(l.checkOutTime).toLocaleString() : "Inside"
      
      return [name, inTime, outTime].join(",")
    })
    
    const csvContent = headers.join(",") + "\n" + rows.join("\n")

    // trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "logs.csv")
    document.body.appendChild(link)
    link.click()
    
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl mx-auto p-6">

      <h2 className="text-2xl font-semibold mb-4">Check Logs</h2>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <button
          onClick={exportCSV}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>

        <div className="bg-green-100 text-green-700 px-3 py-2 rounded">
          Currently Inside: <b>{insideCount}</b>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          className="border p-2 rounded w-60"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All</option>
          <option value="IN">Checked IN</option>
          <option value="OUT">Checked OUT</option>
        </select>
      </div>

      {filteredLogs.length === 0 ? (
        <p className="text-gray-500">No logs found</p>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div
              key={log._id}
              className="bg-white shadow rounded p-4 border"
            >
              <p><b>Name:</b> {log.passId?.visitorId?.name || "N/A"}</p>
              <p><b>Pass ID:</b> {log.passId?._id}</p>
              <p><b>Scanned By:</b> {log.scannedBy?.email}</p>
              <p><b>Check-In:</b> {new Date(log.checkInTime).toLocaleString()}</p>
              <p>
                <b>Check-Out:</b>{" "}
                {log.checkOutTime
                  ? new Date(log.checkOutTime).toLocaleString()
                  : <span className="text-green-600">Still Inside</span>}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Logs;