
import { useLocation } from "react-router-dom";

const pageNames = {
  "/": "Dashboard",
  "/exams": "Manage Exams",
  "/colleges": "Manage Colleges",
  "/colleges/add": "Add College",
  "/students": "Manage Students",
  "/students/add": "Add Student",
};

// Edit pages have the record ID at the end, so match the start of the path
const editPageNames = {
  "/colleges/edit/": "Edit College",
  "/students/edit/": "Edit Student",
};

function getPageName(pathname) {
  // Ignore a trailing slash, e.g. "/colleges/"
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  if (pageNames[path]) return pageNames[path];

  const editPath = Object.keys(editPageNames).find((prefix) =>
    path.startsWith(prefix)
  );

  return editPath ? editPageNames[editPath] : "Admin Panel";
}

function Header({ onMenuClick }) {
  const location = useLocation();
  const pageName = getPageName(location.pathname);

  return (
   <header className="bg-white border-bottom shadow-sm px-3 px-md-4 py-3">
    <div className="d-flex align-items-center justify-content-between gap-3">

        {/* Page Title and Menu Button */}
        <div className="d-flex align-items-center gap-3">
            <button
                type="button"
                className="btn btn-light border d-lg-none"
                onClick={onMenuClick}
                aria-label="Open navigation"
            >
                <i className="bi bi-list fs-4"></i>
            </button>

            <div>
                <h5 className="fw-bold text-dark mb-1">
                    {pageName}
                </h5>

                <div className="small text-muted">
                    <span>Home</span>
                    <i className="bi bi-chevron-right mx-2"></i>
                    <span className="text-primary">{pageName}</span>
                </div>
            </div>
        </div>

        {/* Admin Profile */}
        <div className="d-flex align-items-center gap-2 gap-md-3">
            <div
                className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "42px", height: "42px", flexShrink: 0 }}
            >
                <i className="bi bi-person-fill fs-4"></i>
            </div>

            <div className="d-none d-sm-block">
                <div className="fw-semibold small text-dark">
                    Administrator
                </div>
                <div className="text-muted small">
                    College Admin
                </div>
            </div>
        </div>

    </div>
</header>
  );
}

export default Header;
