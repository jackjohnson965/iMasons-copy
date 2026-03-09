import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentProfilePage from './pages/StudentProfilePage';
import StudentProfileViewPage from './pages/StudentProfileViewPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import StudentListPage from './pages/StudentListPage';
import JobListPage from './pages/JobListPage';
import MentorListPage from './pages/MentorListPage';
import JobDetailPage from './pages/JobDetailPage';
import JobCreatePage from './pages/JobCreatePage';
import MentorCreatePage from './pages/MentorCreatePage';
import EmployerDashboardPage from './pages/EmployerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-brand-dark text-white">
          <Navbar />
          <main className="w-full pt-16">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes — require authentication */}
              <Route path="/student/profile/new" element={<ProtectedRoute><StudentProfilePage /></ProtectedRoute>} />
              <Route path="/student/profile/:id" element={<ProtectedRoute><StudentProfilePage /></ProtectedRoute>} />
              <Route path="/student/profile/:id/view" element={<ProtectedRoute><StudentProfileViewPage /></ProtectedRoute>} />
              <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboardPage /></ProtectedRoute>} />
              <Route path="/student/dashboard/:id" element={<ProtectedRoute><StudentDashboardPage /></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute><StudentListPage /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute><JobListPage /></ProtectedRoute>} />
              <Route path="/mentors" element={<ProtectedRoute><MentorListPage /></ProtectedRoute>} />
              <Route path="/mentors/new" element={<ProtectedRoute><MentorCreatePage /></ProtectedRoute>} />
              <Route path="/jobs/new" element={<ProtectedRoute><JobCreatePage /></ProtectedRoute>} />
              <Route path="/jobs/:id" element={<ProtectedRoute><JobDetailPage /></ProtectedRoute>} />
              <Route path="/jobs/:id/edit" element={<ProtectedRoute><JobCreatePage /></ProtectedRoute>} />
              <Route path="/employer/dashboard" element={<ProtectedRoute><EmployerDashboardPage /></ProtectedRoute>} />
              <Route path="/employer/dashboard/:id" element={<ProtectedRoute><EmployerDashboardPage /></ProtectedRoute>} />

              {/* Admin-only route */}
              <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </RoleProvider>
  );
}

export default App;
