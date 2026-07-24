import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Login from './pages/auth/Login';
import Dashboard from './pages/clinician/Dashboard';
import Patients from './pages/clinician/Patients';
import PatientDetail from './pages/clinician/PatientDetail';
import Appointments from './pages/clinician/Appointments';

import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';

const protectedPage = (element) => (
  <ProtectedRoute>
    <AppLayout>{element}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
      <Route path="/patients" element={protectedPage(<Patients />)} />
      <Route path="/patients/:id" element={protectedPage(<PatientDetail />)} />
      <Route path="/appointments" element={protectedPage(<Appointments />)} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>

    <ToastContainer position="bottom-right" autoClose={3000} />
  </>
);

export default App;
