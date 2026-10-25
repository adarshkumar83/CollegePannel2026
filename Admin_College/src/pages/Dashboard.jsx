
import { Card } from "react-bootstrap";

function Dashboard() {
  return (
    <div className="d-flex justify-content-center align-items-center w-100 pt-6 ">
      <Card className="border-0 shadow-sm text-center w-100">
        <Card.Body className="p-4 p-md-5">
          <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center p-4 mb-3">
            <i className="bi bi-mortarboard-fill fs-1 text-primary"></i>
          </div>

          <h4 className="fw-bold text-dark mb-2">
            College Administration
          </h4>

          <p
            className="text-muted mx-auto mb-0"
            style={{ maxWidth: "550px" }}
          >
            Get started by creating examinations, students, Colleges etc with Admin Pannel.
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Dashboard;