// src/App.jsx
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landingpage";
import Showcase from "./pages/Showcase";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import WorkerLogin from "./pages/WorkerLogin";
import WorkerRegister from "./pages/WorkerRegister";
import Cuts from "./pages/Cuts";
import Appointments from "./pages/Appointments";
import Workers from "./pages/Workers";
import Profile from "./pages/Profile";
import CutsGallery from "./pages/CutsGallery";
import PrivateRoute from "./components/PrivateRoute";
import Colleagues from "./pages/Colleagues";
import Sales from "./pages/Sales";
import Bench from "./pages/Bench";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/showcase" element={<Showcase />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-register" element={<AdminRegister />} />
      <Route path="/worker-login" element={<WorkerLogin />} />
      <Route path="/worker-register" element={<WorkerRegister />} />
      <Route path="/cuts" element={<CutsGallery />} />

      {/* Protected Routes (Admin & Worker) */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/colleagues"
        element={
          <PrivateRoute>
            <Colleagues />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/workers"
        element={
          <PrivateRoute>
            <Workers />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/cuts"
        element={
          <PrivateRoute>
            <Cuts />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/appointments"
        element={
          <PrivateRoute>
            <Appointments />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      {/* Sales Route */}
      <Route
        path="/dashboard/sales"
        element={
          <PrivateRoute>
            <Sales />
          </PrivateRoute>
        }
      />

      {/* Bench Route ✅ */}
      <Route
        path="/dashboard/bench"
        element={
          <PrivateRoute>
            <Bench />
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;
