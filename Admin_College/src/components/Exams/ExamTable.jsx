import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Table,
  Pagination,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api";

function ExamTable() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Display 4 exams on each page
  const examsPerPage = 4;

  useEffect(() => {
    api
      .get("/exams", { params: { search } })
      .then((res) => {
        setExams(res.data);
        setCurrentPage(1);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [search]);

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this exam?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/exams/${id}`);

      setExams((prevExams) => {
        const updatedExams = prevExams.filter(
          (exam) => exam._id !== id
        );

        const updatedTotalPages = Math.ceil(
          updatedExams.length / examsPerPage
        );

        if (currentPage > updatedTotalPages) {
          setCurrentPage(Math.max(1, updatedTotalPages));
        }

        return updatedExams;
      });
    } catch (error) {
      console.log(error);
    }
  }

  // Calculate pagination values
  const totalPages = Math.ceil(exams.length / examsPerPage);
  const startIndex = (currentPage - 1) * examsPerPage;
  const endIndex = startIndex + examsPerPage;

  // Get exams for the current page
  const currentExams = exams.slice(startIndex, endIndex);

  return (
    <Card className="exam-table-card border-0 shadow-sm rounded-3">
      <Card.Header className="bg-white border-bottom px-3 px-md-4 py-3">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-journal-text text-primary fs-5"></i>
          <h5 className="mb-0 fw-bold text-dark">Exam List</h5>
        </div>
      </Card.Header>

      <Card.Body className="p-3 p-md-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div className="exam-search">
            <Form.Control
              type="search"
              placeholder="Search exam name or type..."
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
            onClick={() => navigate("/exams/add")}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Exam
          </Button>
        </div>

        <div className="table-responsive">
          <Table className="exam-table align-middle mb-0">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Exam Name</th>
                <th>Exam Type</th>
                <th>Question Details</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentExams.length > 0 ? (
                currentExams.map((exam, index) => (
                  <tr key={exam._id}>
                    <td>{startIndex + index + 1}</td>

                    <td className="fw-semibold">{exam.name}</td>

                    <td>
                      <span
                        className={`badge ${
                          exam.type === "Technical"
                            ? "bg-primary"
                            : "bg-info text-dark"
                        }`}
                      >
                        {exam.type}
                      </span>
                    </td>

                    <td>
                      {exam.type === "Technical" ? (
                        <div className="small">
                          <div>
                            Physics: <strong>{exam.physics ?? 0}</strong>
                          </div>
                          <div>
                            Chemistry: <strong>{exam.chemistry ?? 0}</strong>
                          </div>
                          <div>
                            Mathematics:{" "}
                            <strong>{exam.mathematics ?? 0}</strong>
                          </div>
                        </div>
                      ) : (
                        <div className="small">
                          Aptitude: <strong>{exam.aptitude ?? 0}</strong>
                        </div>
                      )}
                    </td>

                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() =>
                          navigate(`/exams/edit/${exam._id}`)
                        }
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(exam._id)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No exams found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-4">
            <div className="text-muted small">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, exams.length)} of {exams.length} exams
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

export default ExamTable;
