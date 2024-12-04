// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import setupAxiosInterceptors from "./axiosConfig";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import EmotionForm from "./pages/EmotionForm";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedInUser");
    if (loggedUserJSON) {
      try {
        const user = JSON.parse(loggedUserJSON);
        if (user && user.token) {
          setUser(user);
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${user.token}`;
        } else {
          // Invalid user data stored
          handleLogout();
        }
      } catch (error) {
        // Invalid JSON in localStorage
        handleLogout();
        console.error(error);
      }
    }

    // Set up the interceptor only once
    const interceptor = setupAxiosInterceptors(handleLogout);

    // Cleanup function to remove interceptor
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []); // Empty dependency array since handleLogout is stable

  const handleLogout = () => {
    window.localStorage.removeItem("loggedInUser");
    const errorMessage = window.localStorage.getItem("authError");
    if (errorMessage) {
      setAuthError(errorMessage);
      window.localStorage.removeItem("authError");
    }
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <Router>
      {user ? (
        <Layout handleLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log" element={<EmotionForm />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route
            path="/login"
            element={
              <Login
                setUser={setUser}
                authError={authError}
                setAuthError={setAuthError}
              />
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
