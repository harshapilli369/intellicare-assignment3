import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import AppLayout from './components/layout/AppLayout';
import Spinner from './components/common/Spinner';
import ProtectedRoute from './routes/ProtectedRoute';

// Loaded on demand. Signing in does not require the patient table, the date
// picker or the summary panel, so those arrive with the screen that uses them
// rather than in the initial download.
const Login = lazy(() => import('./pages/auth/Login'));
const Dashboard = lazy(() => import('./pages/clinician/Dashboard'));
const Patients = lazy(() => import('./pages/clinician/Patients'));
const PatientDetail = lazy(() => import('./pages/clinician/PatientDetail'));
const Appointments = lazy(() => import('./pages/clinician/Appointments'));

const protectedPage = (element) => (
  <ProtectedRoute>
    <AppLayout>{element}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <>
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
        <Route path="/patients" element={protectedPage(<Patients />)} />
        <Route path="/patients/:id" element={protectedPage(<PatientDetail />)} />
        <Route path="/appointments" element={protectedPage(<Appointments />)} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>

    <ToastContainer position="bottom-right" autoClose={3000} />
  </>
);

export default App;
