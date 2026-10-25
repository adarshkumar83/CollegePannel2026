import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
// import ManageExam from "./pages/ManageExam";

import ExamForm from "./components/Exams/ExamForm"
import ExamTable from "./components/Exams/ExamTable"
import EditExam from './components/Exams/EditExam'

import CollegeForm from "./components/College/CollegeForm";
import CollegeTable from "./components/College/CollegeTable";
import EditCollege from "./components/College/EditCollege";

import StudentForm from "./components/Student/StudentForm";
import StudentTable from "./components/Student/StudentTable";
import EditStudent from "./components/Student/EditStudent";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>

        <Route path="/" element={<Dashboard />} />
        <Route path='/exams' element={<ExamTable/>}></Route>
        <Route path='/exams/add' element={<ExamForm/>}></Route>
        <Route path='/exams/edit/:id' element={<EditExam/>}></Route>

        <Route path="/colleges" element={<CollegeTable />} />
        <Route path="/colleges/add" element={<CollegeForm />} />
        <Route path="/colleges/edit/:id" element={<EditCollege />} />

        <Route path="/students" element={<StudentTable />} />
        <Route path="/students/add" element={<StudentForm />} />
        <Route path="/students/edit/:id" element={<EditStudent />} />
        
      </Route>
    </Routes>
  );
}

export default App;
