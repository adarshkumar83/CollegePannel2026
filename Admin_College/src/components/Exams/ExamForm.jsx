
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";

const emptyForm = {
  name: "",
  type: "",
  physics: "0",
  chemistry: "0",
  mathematics: "0",
  aptitude: "0",
};

const FIELDS = {
  Technical: [
    { key: "physics", label: "No. of Physics Questions" },
    { key: "chemistry", label: "No. of Chemistry Questions" },
    { key: "mathematics", label: "No. of Mathematics Questions" },
  ],
  Aptitude: [
    { key: "aptitude", label: "No. of Aptitude Questions" },
  ],
};

function ExamForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({ ...emptyForm });
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const editing = Boolean(id);
  const fields = FIELDS[form.type] || [];

  // Load exam details when editing
  useEffect(() => {
    if (!id) return;

    async function loadExam() {
      try {
        setLoading(true);
        setServerError("");

        const response = await api.get(`/exams/${id}`);
        const exam = response.data;

        setForm({
          name: exam.name || "",
          type: exam.type || "",
          physics: String(exam.physics ?? 0),
          chemistry: String(exam.chemistry ?? 0),
          mathematics: String(exam.mathematics ?? 0),
          aptitude: String(exam.aptitude ?? 0),
        });
      } catch (error) {
        setServerError(
          error.response?.data?.message || "Unable to load exam details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadExam();
  }, [id]);

  function handleTypeChange(e) {
    setForm({
      ...emptyForm,
      name: form.name,
      type: e.target.value,
    });

    setMessage("");
    setServerError("");
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setServerError("");

    const examData = {
      name: form.name,
      type: form.type,
      physics: Number(form.physics),
      chemistry: Number(form.chemistry),
      mathematics: Number(form.mathematics),
      aptitude: Number(form.aptitude),
    };

    try {
      setSaving(true);

      if (editing) {
        await api.put(`/exams/${id}`, examData);
      } else {
        await api.post("/exams", examData);
      }

      navigate("/exams", {
        state: {
          message: editing
            ? "Exam updated successfully."
            : "Exam created successfully.",
        },
      });
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Unable to save exam."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (editing) {
      navigate("/exams");
    } else {
      setForm({ ...emptyForm });
      setMessage("");
      setServerError("");
    }
  }

  function goToExamList() {
    navigate("/exams");
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading exam details...</p>
      </div>
    );
  }

  return (
    <Card className="content-card border-0 shadow-sm mb-4">
      <Card.Header className="bg-white py-3">
        <h5 className="mb-1 fw-bold">
          <i className="bi bi-journal-text me-2 text-primary"></i>
          {editing ? "Edit Exam" : "Create Exam"}
        </h5>

        <small className="text-muted">
          Enter examination details and configure the number of questions.
        </small>
      </Card.Header>

      <Card.Body className="p-3 p-md-4">
        {message && <Alert variant="success">{message}</Alert>}

        {serverError && <Alert variant="danger">{serverError}</Alert>}

        <Form noValidate onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Group controlId="examName">
                <Form.Label>Exam Name</Form.Label>

                <Form.Control
                  type="text"
                  name="name"
                  placeholder="B.Tech Entrance Examination"
                  value={form.name}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group controlId="examType">
                <Form.Label>Exam Type</Form.Label>

                <Form.Select
                  name="type"
                  value={form.type}
                  onChange={handleTypeChange}
                >
                  <option value="">Select exam type</option>
                  <option value="Technical">Technical</option>
                  <option value="Aptitude">Aptitude</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {fields.map((field) => (
              <Col
                key={field.key}
                xs={12}
                sm={6}
                md={form.type === "Technical" ? 4 : 6}
              >
                <Form.Group controlId={field.key}>
                  <Form.Label>{field.label}</Form.Label>

                  <Form.Control
                    type="number"
                    name={field.key}
                    value={form[field.key]}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            ))}
          </Row>

          <hr className="my-4" />

          <div className="d-flex flex-wrap gap-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-save me-2"></i>
                  {editing ? "Update Exam" : "Save Exam"}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline-secondary"
              onClick={handleReset}
              disabled={saving}
            >
              <i className="bi bi-arrow-counterclockwise me-2"></i>
              {editing ? "Cancel" : "Reset"}
            </Button>

            <Button
              type="button"
              variant="success"
              onClick={goToExamList}
            >
              <i className="bi bi-arrow-bar-left me-2"></i>
              Go Back
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ExamForm;
