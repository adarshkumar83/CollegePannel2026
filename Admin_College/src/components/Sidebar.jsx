
import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/", icon: "bi-grid-1x2" },
  { name: "Manage Exams", path: "/exams", icon: "bi-clipboard-check" },
  { name: "Manage Colleges", path: "/colleges", icon: "bi-building" },
  { name: "Manage Students", path: "/students", icon: "bi-people" },
];

function Sidebar({ isOpen, closeSidebar }) {
  return (
   <>
    {/* Sidebar Overlay */}
    <div
        className={`position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 ${
            isOpen ? "d-block" : "d-none"
        }`}
        style={{ zIndex: 1040 }}
        onClick={closeSidebar}
    />

    {/* Sidebar */}
    <aside
        className={`position-fixed top-0 start-0 vh-100 bg-white border-end d-flex flex-column shadow-sm ${
            isOpen ? "d-flex" : "d-none d-lg-flex"
        }`}
        style={{
            width: "260px",
            zIndex: 1050
        }}
    >
        {/* Brand */}
        <div className="d-flex align-items-center gap-3 p-4 border-bottom">
            <div className="bg-primary text-white rounded-3 p-3">
                <i className="bi bi-mortarboard-fill fs-4"></i>
            </div>

            <div>
                <h5 className="fw-bold text-dark mb-0">RDEC</h5>
                <small className="text-muted">Administration</small>
            </div>
        </div>

        {/* Menu Label */}
        <div className="px-4 pt-4 pb-2">
            <small className="text-secondary fw-bold">
                MAIN MENU
            </small>
        </div>

        {/* Navigation */}
        <nav className="nav flex-column px-3 gap-2 flex-grow-1">
            {menuItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                        `nav-link d-flex align-items-center gap-3 rounded-3 px-3 py-3 ${
                            isActive
                                ? "active bg-primary text-white shadow-sm"
                                : "text-secondary"
                        }`
                    }
                >
                    <i className={`bi ${item.icon} fs-5`}></i>
                    <span className="fw-semibold">{item.name}</span>
                </NavLink>
            ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-top">
            <div className="bg-light rounded-3 p-3 text-secondary small">
                <i className="bi bi-shield-check text-primary me-2"></i>
                College Admin Portal
            </div>
        </div>
    </aside>
</>
  );
}

export default Sidebar;
