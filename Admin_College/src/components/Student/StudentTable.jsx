import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Pagination,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api";

const noFilters = {
  college: "",
  course: "",
  branch: "",
  semester: "",
  status: "",
};

function StudentTable() {
  const navigate = useNavigate();
  const location = useLocation();

  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [options, setOptions] = useState({
    courses: [],
    branches: [],
    semesters: [],
  });

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ ...noFilters });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");
  const [deletingId, setDeletingId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 4;

  const hasFilters =
    Boolean(search.trim()) || Object.values(filters).some(Boolean);

  // Remove the saved message from browser history
  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, []);

  // Load college, course, branch and semester filter options
  function loadFilterData() {
    api
      .get("/colleges")
      .then((res) =>
        setColleges(Array.isArray(res.data) ? res.data : [])
      )
      .catch(() => {});

    api
      .get("/students/options")
      .then((res) =>
        setOptions({
          courses: res.data.courses || [],
          branches: res.data.branches || [],
          semesters: res.data.semesters || [],
        })
      )
      .catch(() => {});
  }

  useEffect(() => {
    loadFilterData();
  }, []);

  // Load students
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};

        if (search.trim()) {
          params.search = search.trim();
        }

        Object.keys(filters).forEach((key) => {
          if (filters[key]) {
            params[key] = filters[key];
          }
        });

        const response = await api.get("/students", { params });

        if (!cancelled) {
          setStudents(
            Array.isArray(response.data) ? response.data : []
          );
          setCurrentPage(1);
        }
      } catch (err) {
        if (!cancelled) {
          setStudents([]);
          setError(
            err.response?.data?.message ||
              "Unable to load students. Is the backend running?"
          );
          setCurrentPage(1);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, filters, reloadKey]);

  // Change filter values
  function handleFilterChange(e) {
    const { name, value } = e.target;

    setFilters({
      ...filters,
      [name]: value,
    });

    setCurrentPage(1);
  }

  // Clear search and all filters
  function clearFilters() {
    setSearch("");
    setFilters({ ...noFilters });
    setCurrentPage(1);
  }

  // Delete student
  async function handleDelete(student) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${student.name}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(student._id);
      setError("");
      setMessage("");

      await api.delete(`/students/${student._id}`);

      const updatedStudents = students.filter(
        (item) => item._id !== student._id
      );

      setStudents(updatedStudents);

      // Move to the previous page if the current page becomes empty
      const updatedTotalPages = Math.ceil(
        updatedStudents.length / studentsPerPage
      );

      if (currentPage > Math.max(1, updatedTotalPages)) {
        setCurrentPage(Math.max(1, updatedTotalPages));
      }

      setMessage("Student deleted successfully.");

      // Refresh filter dropdown options
      loadFilterData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete student."
      );
    } finally {
      setDeletingId("");
    }
  }

  // Pagination calculations
  const totalPages = Math.ceil(students.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;

  const currentStudents = students.slice(startIndex, endIndex);

  // Display table rows
  function renderBody() {
    if (loading && students.length === 0) {
      return (
        <tr>
          <td colSpan="8" className="text-center py-5">
            <Spinner animation="border" variant="primary" size="sm" />
            <span className="ms-2 text-muted">
              Loading students...
            </span>
          </td>
        </tr>
      );
    }

    if (students.length === 0) {
      if (error) {
        return (
          <tr>
            <td colSpan="8" className="text-center py-4 text-muted">
              No data to display.
            </td>
          </tr>
        );
      }

      return (
        <tr>
          <td colSpan="8" className="text-center py-5">
            <i className="bi bi-people text-muted fs-1"></i>

            {hasFilters ? (
              <>
                <p className="fw-semibold mt-2 mb-1">
                  No students match your search.
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
                  No students added yet.
                </p>
                <p className="text-muted small mb-3">
                  Add your first student to get started.
                </p>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => navigate("/students/add")}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Add Student
                </Button>
              </>
            )}
          </td>
        </tr>
      );
    }

    return currentStudents.map((student, index) => (
      <tr key={student._id}>
        <td>{startIndex + index + 1}</td>

        <td>
          <div className="fw-semibold">{student.name}</div>
          {student.email && (
            <div className="small text-muted">{student.email}</div>
          )}
        </td>

        <td className="small">
          <div>
            Roll: <strong>{student.rollNumber}</strong>
          </div>
          {student.enrollmentNumber && (
            <div>
              Enrollment: <strong>{student.enrollmentNumber}</strong>
            </div>
          )}
        </td>

        <td>
          {student.college ? (
            <>
              <div className="fw-semibold">{student.college.name}</div>
              {student.college.code && (
                <div className="small text-muted">
                  {student.college.code}
                </div>
              )}
            </>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>

        <td className="small">
          {student.course && <div>{student.course}</div>}
          {student.branch && <div>{student.branch}</div>}
          {student.semester && (
            <div className="text-muted">
              Semester {student.semester}
            </div>
          )}
          {!student.course &&
            !student.branch &&
            !student.semester && (
              <span className="text-muted">-</span>
            )}
        </td>

        <td>{student.mobile || "-"}</td>

        <td>
          <span
            className={`badge ${
              student.status === "Active"
                ? "bg-success"
                : "bg-secondary"
            }`}
          >
            {student.status}
          </span>
        </td>

        <td>
          <Button
            variant="outline-primary"
            size="sm"
            className="me-2"
            onClick={() =>
              navigate(`/students/edit/${student._id}`)
            }
            disabled={deletingId === student._id}
          >
            <i className="bi bi-pencil-square"></i>
          </Button>

          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleDelete(student)}
            disabled={deletingId === student._id}
          >
            {deletingId === student._id ? (
              <Spinner size="sm" />
            ) : (
              <i className="bi bi-trash"></i>
            )}
          </Button>
        </td>
      </tr>
    ));
  }

  return (
    <Card className="exam-table-card border-0 shadow-sm rounded-3">
      <Card.Header className="bg-white border-bottom px-3 px-md-4 py-3">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-people text-primary fs-5"></i>
          <h5 className="mb-0 fw-bold text-dark">Student List</h5>
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

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
          <div className="exam-search">
            <Form.Control
              type="search"
              placeholder="Search name, roll no., enrollment or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <Button
            variant="success"
            className="exam-add-btn"
            onClick={() => navigate("/students/add")}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Student
          </Button>
        </div>

        <Row className="g-2 mb-4">
          <Col xs={12} sm={6} lg={3}>
            <Form.Select
              name="college"
              value={filters.college}
              onChange={handleFilterChange}
              aria-label="Filter by college"
            >
              <option value="">All Colleges</option>
              {colleges.map((college) => (
                <option key={college._id} value={college._id}>
                  {college.name}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={6} lg={2}>
            <Form.Select
              name="course"
              value={filters.course}
              onChange={handleFilterChange}
              aria-label="Filter by course"
            >
              <option value="">All Courses</option>
              {options.courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={6} lg={2}>
            <Form.Select
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
              aria-label="Filter by branch"
            >
              <option value="">All Branches</option>
              {options.branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={6} lg={2}>
            <Form.Select
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              aria-label="Filter by semester"
            >
              <option value="">All Semesters</option>
              {options.semesters.map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={6} lg={2}>
            <Form.Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </Col>

          {hasFilters && (
            <Col xs={12} lg="auto">
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={clearFilters}
              >
                <i className="bi bi-x-circle me-2"></i>
                Clear
              </Button>
            </Col>
          )}
        </Row>

        <div className="table-responsive">
          <Table
            className={`exam-table data-table-lg align-middle mb-0${
              loading ? " table-loading" : ""
            }`}
          >
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Student</th>
                <th>Roll / Enrollment</th>
                <th>College</th>
                <th>Course Details</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>{renderBody()}</tbody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
            <div className="text-muted small">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, students.length)} of{" "}
              {students.length} students
            </div>

            <Pagination className="mb-0">
              <Pagination.First
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              />

              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(currentPage - 1)
                }
              />

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <Pagination.Item
                  key={page}
                  active={currentPage === page}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Pagination.Item>
              ))}

              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage(currentPage + 1)
                }
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

export default StudentTable;
