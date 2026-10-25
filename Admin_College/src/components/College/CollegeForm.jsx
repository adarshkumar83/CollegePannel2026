import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";

const emptyForm = {
  name: "",
  code: "",
  address: "",
  addressLine1: "",
  addressLine2: "",
  state: "",
  city: "",
  pinCode: "",
  contactPerson: "",
  contactNumber: "",
  email: "",
  website: "",
  status: "Active",
};

// Same rules as the backend model
function validate(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = "College name is required.";
  }

  if (form.pinCode.trim() && !/^\d{6}$/.test(form.pinCode.trim())) {
    errors.pinCode = "PIN code must be exactly 6 digits.";
  }

  if (
    form.contactNumber.trim() &&
    !/^\+?[0-9][0-9\s-]{6,14}$/.test(form.contactNumber.trim())
  ) {
    errors.contactNumber = "Contact number must have 7 to 15 digits.";
  }

  if (
    form.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
  ) {
    errors.email = "Enter a valid email address.";
  }

  if (
    form.website.trim() &&
    !/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(
      form.website.trim()
    )
  ) {
    errors.website = "Enter a valid website address.";
  }

  return errors;
}

function CollegeForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({ ...emptyForm });
  const [initialForm, setInitialForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const editing = Boolean(id);
  const dirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  // Load college details when editing
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadCollege() {
      try {
        setLoading(true);
        setLoadFailed(false);
        setServerError("");

        const response = await api.get(`/colleges/${id}`);
        const college = response.data;

        const loaded = {
          name: college.name || "",
          code: college.code || "",
          address: college.address || "",
          addressLine1: college.addressLine1 || "",
          addressLine2: college.addressLine2 || "",
          state: college.state || "",
          city: college.city || "",
          pinCode: college.pinCode || "",
          contactPerson: college.contactPerson || "",
          contactNumber: college.contactNumber || "",
          email: college.email || "",
          website: college.website || "",
          status: college.status || "Active",
        };

        if (cancelled) return;

        setForm(loaded);
        setInitialForm(loaded);
      } catch (error) {
        if (cancelled) return;

        setLoadFailed(true);
        setServerError(
          error.response?.data?.message || "Unable to load college details."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCollege();

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

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

    const collegeData = {};

    Object.keys(emptyForm).forEach((key) => {
      collegeData[key] = form[key].trim();
    });

    try {
      setSaving(true);

      if (editing) {
        await api.put(`/colleges/${id}`, collegeData);
      } else {
        await api.post("/colleges", collegeData);
      }

      navigate("/colleges", {
        state: {
          message: editing
            ? "College updated successfully."
            : "College created successfully.",
        },
      });
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Unable to save college."
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
      navigate("/colleges");
    } else {
      setForm({ ...emptyForm });
      setErrors({});
      setServerError("");
    }
  }

  function goToCollegeList() {
    if (!confirmDiscard()) return;

    navigate("/colleges");
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading college details...</p>
      </div>
    );
  }

  // The record could not be loaded, so do not show an empty form to save
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
              onClick={() => navigate("/colleges")}
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
          <i className="bi bi-building me-2 text-primary"></i>
          {editing ? "Edit College" : "Add College"}
        </h5>

        <small className="text-muted">
          Enter college details, address and contact information.
        </small>
      </Card.Header>

      <Card.Body className="p-3 p-md-4">
        {serverError && <Alert variant="danger">{serverError}</Alert>}

        <Form noValidate onSubmit={handleSubmit}>
          <h6 className="form-section-title">College Details</h6>

          <Row className="g-3 mb-4">
            <Col xs={12} md={6}>
              <Form.Group controlId="collegeName">
                <Form.Label>
                  College Name <span className="text-danger">*</span>
                </Form.Label>

                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter College Name "
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
              <Form.Group controlId="collegeCode">
                <Form.Label>College Code</Form.Label>

                <Form.Control
                  type="text"
                  name="code"
                  placeholder="ABC001"
                  value={form.code}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={3}>
              <Form.Group controlId="collegeStatus">
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

          <h6 className="form-section-title">College Address</h6>

          <Row className="g-3 mb-4">
            <Col xs={12}>
              <Form.Group controlId="collegeAddress">
                <Form.Label>College Address</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={3}
                  name="address"
                  placeholder="Full address of the college"
                  value={form.address}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <h6 className="form-section-title">Contact</h6>

          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Group controlId="collegeAddressLine1">
                <Form.Label>Address Line 1</Form.Label>

                <Form.Control
                  type="text"
                  name="addressLine1"
                  placeholder="Building, street"
                  value={form.addressLine1}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group controlId="collegeAddressLine2">
                <Form.Label>Address Line 2</Form.Label>

                <Form.Control
                  type="text"
                  name="addressLine2"
                  placeholder="Area, landmark"
                  value={form.addressLine2}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Form.Group controlId="collegeState">
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
              <Form.Group controlId="collegeCity">
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
              <Form.Group controlId="collegePinCode">
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

            <Col xs={12} sm={6} md={4}>
              <Form.Group controlId="collegeContactPerson">
                <Form.Label>Contact Person</Form.Label>

                <Form.Control
                  type="text"
                  name="contactPerson"
                  placeholder="Full name"
                  value={form.contactPerson}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Form.Group controlId="collegeContactNumber">
                <Form.Label>Contact Number</Form.Label>

                <Form.Control
                  type="text"
                  name="contactNumber"
                  inputMode="tel"
                  placeholder="+91 000000000"
                  value={form.contactNumber}
                  onChange={handleChange}
                  isInvalid={Boolean(errors.contactNumber)}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.contactNumber}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Form.Group controlId="collegeEmail">
                <Form.Label>Email Address</Form.Label>

                <Form.Control
                  type="email"
                  name="email"
                  placeholder="office@college.edu"
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
              <Form.Group controlId="collegeWebsite">
                <Form.Label>Website</Form.Label>

                <Form.Control
                  type="text"
                  name="website"
                  placeholder="www.college.edu"
                  value={form.website}
                  onChange={handleChange}
                  isInvalid={Boolean(errors.website)}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.website}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
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
                  {editing ? "Update College" : "Save College"}
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
              onClick={goToCollegeList}
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

export default CollegeForm;
