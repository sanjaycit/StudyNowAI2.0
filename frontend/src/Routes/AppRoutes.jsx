// File: /src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Subjects from "../pages/Subjects";
import Topics from "../pages/Topics";
import Settings from "../pages/Settings";
import ProtectedRoute from "../components/ProtectedRoute";
import ForgotPassword from "../pages/ForgotPassword";
import StudyPlan from "../pages/StudyPlan";
import StudySession from "../pages/StudySession";
import StudyResources from "../pages/StudyResources";
import QuizPage from "../pages/QuizPage";

// AppRoutes handles all the main routes for the app
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subjects"
        element={
          <ProtectedRoute>
            <Subjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/topics"
        element={
          <ProtectedRoute>
            <Topics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/study-plan"
        element={
          <ProtectedRoute>
            <StudyPlan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/study/:id"
        element={
          <ProtectedRoute>
            <StudySession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/study/:id/resources"
        element={
          <ProtectedRoute>
            <StudyResources />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:id/:stepIndex?"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
