import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
const Home = ({ user, setUser }) => {
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    setRole(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-200 flex flex-col">
      {/* Top bar */}
      <header className="flex justify-between items-center p-4 md:px-12 bg-white bg-opacity-80 shadow">
        <h1 className="text-red-600 text-xl font-semibold">
          Welcome, Admin 👋
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition"
        >
          Logout
        </button>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col md:flex-row items-center md:items-start max-w-7xl mx-auto px-6 py-10 gap-10">
        {/* Left Column - Image + Hello */}
        <div className="md:w-1/3 flex flex-col items-center md:items-start text-red-700">
          <img
            src={assets.naad_logo}
            alt="Admin Avatar"
            className="rounded-full w-48 h-48 object-cover shadow-lg mb-6"
          />
          <h2 className="text-3xl font-bold mb-2">Hello, Admin!</h2>
          <p className="text-gray-700 max-w-xs text-center md:text-left">
            Manage your student data, fees, and notes efficiently through this
            portal.
          </p>
        </div>

        {/* Right Column - Buttons */}
        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
          <NavLink to="/add" className="transform hover:scale-105 transition">
            <div className="bg-red-400 hover:bg-red-500 rounded-3xl h-44 flex items-center justify-center shadow-lg cursor-pointer transition">
              <span className="text-white font-bold text-lg text-center px-4">
                Add New Student
              </span>
            </div>
          </NavLink>
          <NavLink to="/view" className="transform hover:scale-105 transition">
            <div className="bg-red-400 hover:bg-red-500 rounded-3xl h-44 flex items-center justify-center shadow-lg cursor-pointer transition">
              <span className="text-white font-bold text-lg text-center px-4">
                Edit Student Data
              </span>
            </div>
          </NavLink>
          <NavLink to="/" className="transform hover:scale-105 transition">
            <div className="bg-red-400 hover:bg-red-500 rounded-3xl h-44 flex items-center justify-center shadow-lg cursor-pointer transition">
              <span className="text-white font-bold text-lg text-center px-4">
                Upload Notes
              </span>
            </div>
          </NavLink>
          <NavLink
            to="/dashboard"
            className="transform hover:scale-105 transition"
          >
            <div className="bg-red-400 hover:bg-red-500 rounded-3xl h-44 flex items-center justify-center shadow-lg cursor-pointer transition">
              <span className="text-white font-bold text-lg text-center px-4">
                Fees Section
              </span>
            </div>
          </NavLink>
        </div>
      </main>
    </div>
  );
};

export default Home;
