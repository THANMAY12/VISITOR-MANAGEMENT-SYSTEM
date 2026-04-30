import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VisitorRegister from "./pages/VisitorRegister";
import Appointments from "./pages/Appointments";
import Pass from "./pages/Pass";
import Scan from "./pages/Scan";
import CheckPass from "./pages/CheckPass";
import Logs from "./pages/Logs";
import CreateUser from "./pages/CreateUser";
import PublicVisitorRegister from "./pages/PublicVisitorRegister";
import ManageVisitors from "./pages/ManageVisitors";
import VisitorDashboard from "./pages/VisitorDashboard";
//Protected Route
const ProtectedRoute = ({ children }) => {
  return localStorage.getItem("user")
    ? children
    : <Navigate to="/" />;
};

function App() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />
    <Route path="public-visitor" element={<PublicVisitorRegister />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="visitor-register" element={<VisitorRegister />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="scan" element={<Scan />} />
        <Route path="logs" element={<Logs />} />
        <Route path="create-user" element={<CreateUser />} />
        <Route path="check-pass" element={<CheckPass />} />
        <Route path="passes" element={<Pass />} />
        <Route path="manage-visitors" element={<ManageVisitors />} />
        <Route path="visitor-dashboard" element={<VisitorDashboard />} />
        
      </Route>

      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default App;