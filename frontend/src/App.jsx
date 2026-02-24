import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import StudentProfilePage from './pages/StudentProfilePage';
import StudentProfileViewPage from './pages/StudentProfileViewPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import StudentListPage from './pages/StudentListPage';
import JobListPage from './pages/JobListPage';
import JobDetailPage from './pages/JobDetailPage';
import JobCreatePage from './pages/JobCreatePage';
import EmployerDashboardPage from './pages/EmployerDashboardPage';

function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/student/profile/new" element={<StudentProfilePage />} />
              <Route path="/student/profile/:id" element={<StudentProfilePage />} />
              <Route path="/student/profile/:id/view" element={<StudentProfileViewPage />} />
              <Route path="/student/dashboard/:id" element={<StudentDashboardPage />} />
              <Route path="/students" element={<StudentListPage />} />
              <Route path="/jobs" element={<JobListPage />} />
              <Route path="/jobs/new" element={<JobCreatePage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route path="/jobs/:id/edit" element={<JobCreatePage />} />
              <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
              <Route path="/employer/dashboard/:id" element={<EmployerDashboardPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </RoleProvider>
  );
}

export default App;
