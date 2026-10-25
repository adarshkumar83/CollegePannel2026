import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Spinner,
  Table,
  Pagination,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api";

// Add https:// so a website saved as "www.college.edu" opens correctly
function websiteLink(website) {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

function CollegeTable() {
  const navigate = useNavigate();
  const location = useLocation();

  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");
  const [deletingId, setDeletingId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const collegesPerPage = 4;

  const hasFilters = Boolean(search.trim() || status);

  // Calculate pagination values
  const totalPages = Math.ceil(colleges.length / collegesPerPage);
  const startIndex = (currentPage - 1) * collegesPerPage;
  const endIndex = startIndex + collegesPerPage;
  const currentColleges = colleges.slice(startIndex, endIndex);

  // Remove the saved message from the browser history so a refresh hides it
  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []);

  // Load colleges (waits a moment while the user is typing)
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};

        if (search.trim()) params.search = search.trim();
        if (status) params.status = status;

        const response = await api.get("/colleges", { params });

        if (!cancelled) {
          setColleges(Array.isArray(response.data) ? response.data : []);
          setCurrentPage(1);
        }
      } catch (err) {
        if (!cancelled) {
          setColleges([]);
          setCurrentPage(1);
          setError(
            err.response?.data?.message ||
              "Unable to load colleges. Is the backend running?"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, status, reloadKey]);

  async function handleDelete(college) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${college.name}"?`
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(college._id);
      setError("");
      setMessage("");

      await api.delete(`/colleges/${college._id}`);

      const updatedColleges = colleges.filter(
        (item) => item._id !== college._id
      );

      setColleges(updatedColleges);

      // Move to the previous page if the current page becomes empty
      const updatedTotalPages = Math.ceil(
        updatedColleges.length / collegesPerPage
      );

      if (currentPage > updatedTotalPages) {
        setCurrentPage(Math.max(1, updatedTotalPages));
      }

      setMessage("College deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete college.");
    } finally {
      setDeletingId("");
    }
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setCurrentPage(1);
  }

  function renderBody() {
    if (loading && colleges.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="text-center py-5">
            <Spinner animation="border" variant="primary" size="sm" />
            <span className="ms-2 text-muted">Loading colleges...</span>
          </td>
        </tr>
      );
    }

    if (colleges.length === 0) {
      if (error) {
        return (
          <tr>
            <td colSpan="7" className="text-center py-4 text-muted">
              No data to display.
            </td>
          </tr>
        );
      }

      return (
        <tr>
          <td colSpan="7" className="text-center py-5">
            <i className="bi bi-building text-muted fs-1"></i>

            {hasFilters ? (
              <>
                <p className="fw-semibold mt-2 mb-1">
                  No colleges match your search.
                </p>
                <p className="text-muted small mb-3">
                  Try a different keyword or clear the filters.
                </p>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={clearFilters}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <p className="fw-semibold mt-2 mb-1">
                  No colleges added yet.
                </p>
                <p className="text-muted small mb-3">
                  Add your first college to start managing students.
                </p>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => navigate("/colleges/add")}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Add College
                </Button>
              </>
            )}
          </td>
        </tr>
      );
    }

    return currentColleges.map((college, index) => {
      const place = [college.city, college.state]
        .filter(Boolean)
        .join(", ");

      return (
        <tr key={college._id}>
          <td>{startIndex + index + 1}</td>

          <td className="fw-semibold">{college.name}</td>

          <td>{college.code || "-"}</td>

          <td className="cell-wrap small">
            {college.address && <div>{college.address}</div>}

            {/* {college.addressLine1 && <div>{college.addressLine1}</div>}
            {college.addressLine2 && <div>{college.addressLine2}</div>} */}

            {(place || college.pinCode) && (
              <div>
                {[place, college.pinCode].filter(Boolean).join(" - ")}
              </div>
            )}

            {!college.address &&
              // !college.addressLine1 &&
              // !college.addressLine2 &&
              !place &&
              !college.pinCode && (
                <span className="text-muted">-</span>
              )}
          </td>

          <td className="small">
            {college.contactPerson && (
              <div className="fw-semibold">{college.contactPerson}</div>
            )}

            {college.contactNumber && (
              <div>
                <i className="bi bi-telephone me-1 text-muted"></i>
                {college.contactNumber}
              </div>
            )}

            {college.email && (
              <div>
                <i className="bi bi-envelope me-1 text-muted"></i>
                {college.email}
              </div>
            )}

            {college.website && (
              <div>
                <i className="bi bi-globe me-1 text-muted"></i>
                <a
                  href={websiteLink(college.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {college.website}
                </a>
              </div>
            )}

            {!college.contactPerson &&
              !college.contactNumber &&
              !college.email &&
              !college.website && (
                <span className="text-muted">-</span>
              )}
          </td>

          <td>
            <span
              className={`badge ${
                college.status === "Active" ? "bg-success" : "bg-secondary"
              }`}
            >
              {college.status}
            </span>
          </td>

          <td>
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              onClick={() => navigate(`/colleges/edit/${college._id}`)}
              disabled={deletingId === college._id}
            >
              <i className="bi bi-pencil-square"></i>
            </Button>

            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleDelete(college)}
              disabled={deletingId === college._id}
            >
              {deletingId === college._id ? (
                <Spinner size="sm" />
              ) : (
                <i className="bi bi-trash"></i>
              )}
            </Button>
          </td>
        </tr>
      );
    });
  }

  return (
    <Card className="exam-table-card border-0 shadow-sm rounded-3">
      <Card.Header className="bg-white border-bottom px-3 px-md-4 py-3">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-building text-primary fs-5"></i>
          <h5 className="mb-0 fw-bold text-dark">College List</h5>
        </div>
      </Card.Header>

      <Card.Body className="p-3 p-md-4">
        {message && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setMessage("")}
          >
            {message}
          </Alert>
        )}

        {error && (
          <Alert
            variant="danger"
            className="d-flex flex-wrap align-items-center justify-content-between gap-2"
          >
            <span>{error}</span>

            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setReloadKey(reloadKey + 1)}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Retry
            </Button>
          </Alert>
        )}

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div className="d-flex flex-column flex-md-row gap-2">
            <div className="exam-search">
              <Form.Control
                type="search"
                placeholder="Search name, code, city, state or contact..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <Form.Select
              className="filter-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>

            {hasFilters && (
              <Button variant="outline-secondary" onClick={clearFilters}>
                <i className="bi bi-x-circle me-2"></i>
                Clear
              </Button>
            )}
          </div>

          <Button
            variant="success"
            className="exam-add-btn"
            onClick={() => navigate("/colleges/add")}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add College
          </Button>
        </div>

        <div className="table-responsive">
          <Table
            className={`exam-table data-table-md align-middle mb-0${
              loading ? " table-loading" : ""
            }`}
          >
            <thead>
              <tr>
                <th>S.No.</th>
                <th>College Name</th>
                <th>Code</th>
                <th>Address</th>
                <th>Contact Details</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>{renderBody()}</tbody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
            <div className="text-muted small">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, colleges.length)} of {colleges.length} colleges
            </div>

            <Pagination className="mb-0">
              <Pagination.First
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              />

              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              />

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <Pagination.Item
                    key={page}
                    active={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Pagination.Item>
                )
              )}

              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              />

              <Pagination.Last
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              />
            </Pagination>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default CollegeTable;
