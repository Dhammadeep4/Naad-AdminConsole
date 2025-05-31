import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../App";
const LoginPage = ({ setUser, setRole }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const credentials = { username, password };

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/login`,
        credentials
      );

      if (response.data.success) {
        toast.success("Login successful! 🎉");

        // Save token and user info in localStorage
        localStorage.setItem("token", response.data.token); // 🔐 Save token
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role", response.data.user.role);

        setUser(response.data.user);
        setRole(response.data.user.role);

        // Navigate based on user role
        if (response.data.user.role === "admin") {
          navigate("/home");
        } else {
          navigate("/studenthome");
        }
      } else {
        toast.error(response.data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        toast.error(
          error.response.data.message ||
            "Login failed. Please check your credentials."
        );
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-red-200">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-2 border rounded mb-2"
          />
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border rounded pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-sm text-blue-500 hover:underline"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-semibold p-3 rounded-lg ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>

        {/* Visit Site Homepage Link */}
        <div className="mt-4 text-center">
          <a
            href="/"
            className="text-pink-600 hover:text-pink-800 font-semibold"
          >
            Visit Site Homepage
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
