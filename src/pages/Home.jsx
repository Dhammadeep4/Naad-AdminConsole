import React from "react";
import { NavLink } from "react-router-dom";
const Home = ({ user, setUser }) => {
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="bg-gradient-to-br from-yellow-400 via-red-400 via-fafafa to-black min-h-screen flex flex-col items-center justify-center">
      <div className="w-full text-center ">
        <h1 className="absolute inset-x-0 top-20 text-lg text-white font-semibold">
          Welcome to the Admin Portal
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-xl"
        >
          Logout
        </button>
      </div>
      <div className="flex flex-wrap gap-10 mt-10 justify-center">
        <NavLink to="/add">
          <div className="bg-yellow-500 w-48 h-48 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition">
            <span className="text-white font-bold">Add New Student</span>
          </div>
        </NavLink>
        <NavLink to="/view">
          <div className="bg-yellow-500 w-48 h-48 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition">
            <span className="text-white font-bold">Edit Student Data</span>
          </div>
        </NavLink>
        <NavLink>
          <div className="bg-yellow-500 w-48 h-48 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition">
            <span className="text-white font-bold">Upload Notes</span>
          </div>
        </NavLink>
        <NavLink to="/dashboard">
          <div className="bg-yellow-500 w-48 h-48 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition">
            <span className="text-white font-bold">Fees Section</span>
          </div>
        </NavLink>
      </div>
    </div>
  );
};

export default Home;
