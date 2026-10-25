import { useEffect, useState } from 'react'
import api from './api'

function App() {
  const [exams, setExams] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  // Read-only list: students can only view the exams created by the admin
  useEffect(() => {
    api
      .get('/exams', { params: { search } })
      .then((res) => {
        setExams(res.data)
        setError('')
      })
      .catch(() => setError('Cannot connect to the server. Is the backend running?'))
  }, [search])

  // Show only the subjects that belong to the exam type
  function subjects(exam) {
    if (exam.type === 'Aptitude') return [['Aptitude', exam.aptitude]]
    return [
      ['Physics', exam.physics],
      ['Chemistry', exam.chemistry],
      ['Mathematics', exam.mathematics],
    ]
  }

  return (
    <>
      <nav className="navbar navbar-dark bg-primary mb-4">
        <div className="container">
          <span className="navbar-brand mb-0 h1">College Exams</span>
        </div>
      </nav>

      <div className="container pb-5">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h2 className="h4 mb-0">Available Examinations</h2>
          <input
            type="search"
            className="form-control w-auto"
            placeholder="Search by exam name"
            aria-label="Search exams"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {!error && exams.length === 0 && (
          <div className="text-center text-muted py-5">No exams available.</div>
        )}

        <div className="row g-3">
          {exams.map((exam) => (
            <div className="col-md-6 col-xl-4" key={exam._id}>
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h3 className="h5 mb-0">{exam.name}</h3>
                    <span className={`badge ${exam.type === 'Technical' ? 'text-bg-primary' : 'text-bg-success'}`}>
                      {exam.type}
                    </span>
                  </div>

                  <ul className="list-group list-group-flush mb-3">
                    {subjects(exam).map(([label, count]) => (
                      <li key={label} className="list-group-item d-flex justify-content-between px-0">
                        <span>{label} Questions</span>
                        <strong>{count}</strong>
                      </li>
                    ))}
                  </ul>

                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total Questions</span>
                    <span>{exam.totalQuestions}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default App
