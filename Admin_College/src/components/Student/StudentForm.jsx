import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api";

const emptyForm = {
  name: "",
  rollNumber: "",
  enrollmentNumber: "",
  email: "",
  mobile: "",
  college: "",
  course: "",
  branch: "",
  semester: "",
  gender: "",
  dateOfBirth: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  admissionDate: "",
  status: "Active",
};

const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

// Today as yyyy-mm-dd (used to stop future birth dates)
function today() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${d.getFullYear()}-${month}-${day}`;
}

// Same rules as the backend model
function validate(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = "Student name is required.";
  }

  if (!form.rollNumber.trim()) {
    errors.rollNumber = "Roll number is required.";
  }

  if (!form.college) {
    errors.college = "Please select a college.";
  }

  if (
    form.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
  ) {
    errors.email = "Enter a valid email address.";
  }

  if (form.mobile.trim() && !/^\d{10}$/.test(form.mobile.trim())) {
    errors.mobile = "Mobile number must be exactly 10 digits.";
  }

  if (form.pinCode.trim() && !/^\d{6}$/.test(form.pinCode.trim())) {
    errors.pinCode = "PIN code must be exactly 6 digits.";
  }

  if (form.dateOfBirth && form.dateOfBirth > today()) {
    errors.dateOfBirth = "Date of birth cannot be in the future.";
  }

  return errors;
}

function StudentForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({ ...emptyForm });
  const [initialForm, setInitialForm] = useState({ ...emptyForm });
  const [colleges, setColleges] = useState([]);
  const [suggestions, setSuggestions] = useState({ courses: [], branches: [] });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const editing = Boolean(id);
  const dirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const noColleges = colleges.length === 0;

  // Load the college dropdown, and the student details when editing
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setLoadFailed(false);
        setServerError("");

        const requests = [api.get("/colleges")];

        if (id) {
          requests.push(api.get(`/students/${id}`));
        }

        const [collegeResponse, studentResponse] = await Promise.all(requests);

        if (cancelled) return;

        setColleges(
          Array.isArray(collegeResponse.data) ? collegeResponse.data : []
        );

        if (studentResponse) {
          const student = studentResponse.data;

          const loaded = {
            name: student.name || "",
            rollNumber: student.rollNumber || "",
            enrollmentNumber: student.enrollmentNumber || "",
            email: student.email || "",
            mobile: student.mobile || "",
            // The API sends the college as an object (id, name, code)
            college: student.college?._id || student.college || "",
            course: student.course || "",
            branch: student.branch || "",
            semester: student.semester || "",
            gender: student.gender || "",
            dateOfBirth: student.dateOfBirth
              ? student.dateOfBirth.slice(0, 10)
              : "",
            address: student.address || "",
            city: student.city || "",
            state: student.state || "",
            pinCode: student.pinCode || "",
            admissionDate: student.admissionDate
              ? student.admissionDate.slice(0, 10)
              : "",
            status: student.status || "Active",
          };

          setForm(loaded);
          setInitialForm(loaded);
        }
      } catch (error) {
        if (cancelled) return;

        setLoadFailed(true);
        setServerError(
          error.response?.data?.message ||
            "Unable to load the form data. Is the backend running?"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  // Course and branch suggestions (optional, errors are ignored)
  useEffect(() => {
    api
      .get("/students/options")
      .then((res) => {
        setSuggestions({
          courses: res.data.courses || [],
          branches: res.data.branches || [],
        });
      })
      .catch(() => {});
  }, []);

  // Warn before the browser tab is closed or refreshed with unsaved changes
  useEffect(() => {
    if (!dirty || saving) return;

    function warn(e) {
      e.preventDefault();
      e.returnValue = "";
    }

    window.addEventListener("beforeunload", warn);

    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, saving]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setServerError("");

    const foundErrors = validate(form);

    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) return;

    const studentData = {};

    Object.keys(emptyForm).forEach((key) => {
      studentData[key] = form[key].trim();
    });

    try {
      setSaving(true);

      if (editing) {
        await api.put(`/students/${id}`, studentData);
      } else {
        await api.post("/students", studentData);
      }

      navigate("/students", {
        state: {
          message: editing
            ? "Student updated successfully."
            : "Student created successfully.",
        },
      });
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Unable to save student."
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDiscard() {
    return (
      !dirty ||
      window.confirm("You have unsaved changes. Do you want to discard them?")
    );
  }

  function handleReset() {
    if (!confirmDiscard()) return;

    if (editing) {
      navigate("/students");
    } else {
      setForm({ ...emptyForm });
      setErrors({});
      setServerError("");
    }
  }

  function goToStudentList() {
    if (!confirmDiscard()) return;

    navigate("/students");
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">
          {editing ? "Loading student details..." : "Loading colleges..."}
        </p>
      </div>
    );
  }

  // Nothing was loaded, so do not show a form that could save wrong data
  if (loadFailed) {
    return (
      <Card className="content-card border-0 shadow-sm mb-4">
        <Card.Body className="p-3 p-md-4">
          <Alert variant="danger">{serverError}</Alert>

          <div className="d-flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={() => setReloadKey(reloadKey + 1)}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </Button>

            <Button
              type="button"
              variant="success"
              onClick={() => navigate("/students")}
            >
              <i className="bi bi-arrow-bar-left me-2"></i>
              Go Back
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="content-card border-0 shadow-sm mb-4">
      <Card.Header className="bg-white py-3">
        <h5 className="mb-1 fw-bold">
          <i className="bi bi-people me-2 text-primary"></i>
          {editing ? "Edit Student" : "Add Student"}
        </h5>

        <small className="text-muted">
          Enter student details and select the college.
        </small>
      </Card.Header>

      <Card.Body className="p-3 p-md-4">
        {noColleges && (
          <Alert variant="warning">
            No colleges found. Please{" "}
            <Link to="/colleges/add" className="alert-link">
              add a college
            </Link>{" "}
            before adding students.
          </Alert>
        )}

        {serverError && <Alert variant="danger">{serverError}</Alert>}

        <Form noValidate onSubmit={handleSubmit}>
          <h6 className="form-section-title">Student Details</h6>

          <Row className="g-3 mb-4">
            <Col xs={12} md={6}>
              <Form.Group controlId="studentName">
                <Form.Label>
                  Student Name <span className="text-danger">*</span>
                </Form.Label>

                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                  isInvalid={Boolean(errors.name)}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={3}>
              <Form.Group controlId="studentRollNumber">
                <Form.Label>
                  Roll Number <span className="text-danger">*</span>
                </Form.Label>

                <Form.Control
                  type="text"
                  name="rollNumber"
                  placeholder="CS2024001"
                  value={form.rollNumber}
                  onChange={handleChange}
                  isInvalid={Boolean(errors.rollNumber)}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.rollNumber}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={3}>
              <Form.Group controlId="studentEnrollmentNumber">
                <Form.Label>Enrollment Number</Form.Label>

                <Form.Control
                  type="text"
                  name="enrollmentNumber"
                  placeholder="EN2024001"
                  value={form.enrollmentNumber}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group controlId="studentCollege">
                <Form.Label>
                  College <span className="text-danger">*</span>
                </Form.Label>

                <Form.Select
                  name="college"
                  value={form.college}
                  onChange={handleChange}
                  isInvalid={Boolean(errors.college)}
                  disabled={noColleges}
                >
                  <option value="">Select college</option>

                  {colleges.map((college) => (
                    <option key={college._id} value={college._id}>
                      {college.name}
                      {college.code ? ` (${college.code})` : ""}
                      {college.status === "Inactive" ? " - Inactive" : ""}
                    </option>
                  ))}
                </Form.Select>

                <Form.Control.Feedback type="invalid">
                  {errors.college}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={3}>
              <Form.Group controlId="studentStatus">
                <Form.Label>Status</Form.Label>

                <Form.Select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <h6 className="form-section-title">Contact Details</h6>

          <Row className="g-3 mb-4">
            <Col xs={12} md={6}>
              <Form.Group controlId="studentEmail">
                <Form.Label>Email Address</Form.Label>

                <Form.Control
                  type="email"
                  name="email"
                  placeholder="student@example.com"
                  value={form.email}
                  onChange={handleChange}
                  isInvalid={Boolean(errors.email)}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group controlId="studentMobile">
                <Form.Label>Mobile Number</Form.Label>

                <Form.Control
                  type="text"
                  name="mobile"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  value={form.mobile}
                  onChange={handleChange}
                  isInvalid={Boolean(errors.mobile)}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.mobile}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <h6 className="form-section-title">Academic Details</h6>

          <Row className="g-3 mb-4">
            <Col xs={12} sm={6} md={3}>
              <Form.Group controlId="studentCourse">
                <Form.Label>Course</Form.Label>

                <Form.Control
                  type="text"
                  name="course"
                  list="courseSuggestions"
                  placeholder="B.Tech"
                  value={form.course}
                  onChange={handleChange}
                />

                <datalist id="courseSuggestions">
                  {suggestions.courses.map((course) => (
                    <option key={course} value={course} />
                  ))}
                </datalist>
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={3}>
              <Form.Group controlId="studentBranch">
                <Form.Label>Branch</Form.Label>

                <Form.Control
                  type="text"
                  name="branch"
                  list="branchSuggestions"
                  placeholder="Computer Science"
                  value={form.branch}
                  onChange={handleChange}
                />

                <datalist id="branchSuggestions">
                  {suggestions.branches.map((branch) => (
                    <option key={branch} value={branch} />
                  ))}
                </datalist>
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={3}>
              <Form.Group controlId="studentSemester">
                <Form.Label>Semester</Form.Label>

                <Form.Select
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                >
                  <option value="">Select semester</option>

                  {SEMESTERS.map((semester) => (
                    <option key={semester} value={semester}>
                      Semester {semester}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={3}>
              <Form.Group controlId="studentAdmissionDate">
                <Form.Label>Admission Date</Form.Label>

                <Form.Control
                  type="date"
                  name="admissionDate"
                  value={form.admissionDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <h6 className="form-section-title">Personal Details</h6>

          <Row className="g-3">
            <Col xs={12} sm={6} md={3}>
              <Form.Group controlId="studentGender">
                <Form.Label>Gender</Form.Label>

                <Form.Select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={3}>
              <Form.Group controlId="studentDateOfBirth">
                <Form.Label>Date of Birth</Form.Label>

                <Form.Control
                  type="date"
                  name="dateOfBirth"
                  max={today()}
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  isInvalid={Boolean(errors.dateOfBirth)}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.dateOfBirth}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group controlId="studentAddress">
                <Form.Label>Address</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={3}
                  name="address"
                  placeholder="House no., street, area"
                  value={form.address}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Form.Group controlId="studentCity">
                <Form.Label>City</Form.Label>

                <Form.Control
                  type="text"
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Form.Group controlId="studentState">
                <Form.Label>State</Form.Label>

                <Form.Control
                  type="text"
                  name="state"
                  placeholder="State"
                  value={form.state}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Form.Group controlId="studentPinCode">
                <Form.Label>PIN Code</Form.Label>

                <Form.Control
                  type="text"
                  name="pinCode"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="110001"
                  value={form.pinCode}
                  onChange={handleChange}
                  isInvalid={Boolean(errors.pinCode)}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.pinCode}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <hr className="my-4" />

          <div className="d-flex flex-wrap gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={saving || noColleges}
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-save me-2"></i>
                  {editing ? "Update Student" : "Save Student"}
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
              onClick={goToStudentList}
              disabled={saving}
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

export default StudentForm;
