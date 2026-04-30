import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      
      <Sidebar />

      <div className="p-6">
        <Outlet />
      </div>

    </div>
  );
}

export default Layout;