// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = ({ setUser, authError, setAuthError }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check for registration success message
    const registrationSuccess = window.localStorage.getItem(
      "registrationSuccess"
    );
    if (registrationSuccess) {
      setSuccessMessage(registrationSuccess);
      window.localStorage.removeItem("registrationSuccess"); // Clear the message
    }

    return () => {
      if (setAuthError) setAuthError(null);
    };
  }, [setAuthError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/login", formData);
      if (response.data && response.data.token) {
        window.localStorage.setItem(
          "loggedInUser",
          JSON.stringify(response.data)
        );
        // Clear any existing auth errors
        if (setAuthError) setAuthError(null);
        setUser(response.data);
        await new Promise((resolve) => setTimeout(resolve, 100));
        navigate("/");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Login failed";
      setError(errorMsg);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-8">
      {(error || authError) && (
        <div className="mb-4 text-red-500 animate-shake">
          {error || authError}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 text-green-500 animate-fade-in">
          {successMessage}
        </div>
      )}
      <div className="text-center mb-8 animate-fade-in-down">
        <h1 className="text-4xl font-bold text-omori-black mb-2 animate-pulse">
          DREAMSCAPE MEMORY LODGER
        </h1>
        <p className="text-lg text-omori-black/70 italic animate-fade-in">
          &quot;Waiting for something to happen?&quot;
        </p>
      </div>

      <div className="max-w-md w-full bg-white p-8 border-2 border-omori-black shadow-omori animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-center">
          <span className="inline-block animate-bounce-slow">
            Welcome back, STRANGER
          </span>
        </h2>
        {error && (
          <div className="mb-4 text-red-500 animate-shake">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block  font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border-2 border-omori-black shadow-omori focus:border-omori-blue transition-colors"
              required
            />
          </div>
          <div>
            <label className="block  font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border-2 border-omori-black shadow-omori focus:border-omori-blue transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-omori-blue hover:bg-omori-red text-white px-4 py-2 border-2 border-omori-black shadow-omori transition-all hover:scale-105"
          >
            Login
          </button>
          <div className="text-center mt-4">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-omori-blue hover:text-omori-red transition-colors"
            >
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
