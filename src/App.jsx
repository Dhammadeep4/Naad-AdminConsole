import { useState, useEffect } from "react";
import Add from "./pages/Add";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import View from "./pages/View";
import Profile from "./pages/Profile";
import Edit from "./pages/Edit";
import Delete from "./pages/Delete";
import Dashboard from "./pages/Dashboard";
import FeeForm from "./pages/FeeForm";
import Login from "./pages/Login";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Invalid user data in localStorage:", err);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  return (
    <>
      <div>
        <ToastContainer />
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/home" /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route
            path="/home"
            element={
              user ? (
                <Home user={user} setUser={setUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/add"
            element={
              user ? (
                <Add user={user} setUser={setUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/view"
            element={
              user ? (
                <View user={user} setUser={setUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} setUser={setUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/feeform"
            element={
              user ? (
                <FeeForm user={user} setUser={setUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/profile/:studentId"
            element={
              user ? (
                <Profile user={user} setUser={setUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/edit/:studentId"
            element={
              user ? (
                <Edit user={user} setUser={setUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/delete/:studentId"
            element={
              user ? (
                <Delete user={user} setUser={setUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
