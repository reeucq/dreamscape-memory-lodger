// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/users", formData);
      // Store success message in localStorage to persist through navigation
      window.localStorage.setItem(
        "registrationSuccess",
        "Registration successful! Please login with your credentials."
      );
      navigate("/login");
    } catch (err) {
      let errorMsg = "Registration failed";
      if (err.response) {
        if (err.response.status === 409) {
          errorMsg = "Username already exists";
        } else if (err.response.data?.error) {
          errorMsg = err.response.data.error;
        }
      }
      setError(errorMsg);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 border-2 border-omori-black shadow-omori animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-center">
          <span className="inline-block animate-bounce-slow">
            Join the DREAMSCAPE
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
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9]+"
              title="Username must contain only letters and numbers"
              required
            />
          </div>
          <div>
            <label className="block  font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border-2 border-omori-black shadow-omori focus:border-omori-blue transition-colors"
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z\s'-]+"
              title="Name must contain only letters, spaces, hyphens, and apostrophes"
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
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
              title="Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character"
              required
            />
          </div>
          <div>
            <label className="block  font-medium mb-1">Bio (Optional)</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-2 border-2 border-omori-black shadow-omori focus:border-omori-blue transition-colors"
              maxLength={200}
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-omori-blue hover:bg-omori-red text-white px-4 py-2 border-2 border-omori-black shadow-omori transition-all hover:scale-105"
          >
            Register
          </button>
          <div className="text-center mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-omori-blue hover:text-omori-red transition-colors"
            >
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
