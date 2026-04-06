import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import Attendance from './pages/Attendance';
import Assessments from './pages/Assessments';
import CodingLabs from './pages/CodingLabs';
import Meets from './pages/Meets';
import Marks from './pages/Marks';
import Communication from './pages/Communication';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import CoursePlayer from './pages/CoursePlayer';
import AssessmentPlayer from './pages/AssessmentPlayer';
import TutorCourseManager from './pages/TutorCourseManager';
import LeaveManagement from './pages/LeaveManagement';
import AssessmentBuilder from './pages/AssessmentBuilder';
import LabReview from './pages/LabReview';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <SocketProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/courses" element={user ? <CourseList /> : <Navigate to="/login" />} />
        <Route path="/attendance" element={user ? <Attendance /> : <Navigate to="/login" />} />
        <Route path="/leaves" element={user ? <LeaveManagement /> : <Navigate to="/login" />} />
        <Route path="/assessments" element={user ? <Assessments /> : <Navigate to="/login" />} />
        <Route path="/assessment-builder" element={user ? <AssessmentBuilder /> : <Navigate to="/login" />} />
        <Route path="/assessment-builder/:id" element={user ? <AssessmentBuilder /> : <Navigate to="/login" />} />
        <Route path="/labs" element={user ? <CodingLabs /> : <Navigate to="/login" />} />
        <Route path="/labs/:id/review" element={user?.role !== 'student' ? <LabReview /> : <Navigate to="/" />} />
        <Route path="/meets" element={user ? <Meets /> : <Navigate to="/login" />} />
        <Route path="/marks" element={user ? <Marks /> : <Navigate to="/login" />} />
        <Route path="/chat" element={user ? <Communication /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={user ? <Analytics /> : <Navigate to="/login" />} />
        <Route path="/users" element={user ? <UserManagement /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/course/:id" element={user ? <CoursePlayer /> : <Navigate to="/login" />} />
        <Route path="/assessment/:id" element={user ? <AssessmentPlayer /> : <Navigate to="/login" />} />
        <Route path="/management" element={user ? <TutorCourseManager /> : <Navigate to="/login" />} />

        {/* Wildcard to handle 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
