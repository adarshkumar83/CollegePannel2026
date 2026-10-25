
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";


function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={isOpen}
        closeSidebar={() => setIsOpen(false)}
      />

      <main className="main-content">

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
