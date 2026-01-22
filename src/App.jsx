import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Add from "./pages/Add";
import Home from "./pages/Home";
import View from "./pages/View";
import Profile from "./pages/Profile";
import Edit from "./pages/Edit";
import Delete from "./pages/Delete";
import Dashboard from "./pages/Dashboard";
import FeeForm from "./pages/FeeForm";
import Login from "./pages/Login";
import StudHomepage from "./pages/StudHomepage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import ProtectedRoute from "./components/ProtectedRoutes"; // ✅ Import this
import NaadInstitute from "./pages/NaadInstitute";
import EditFee from "./pages/EditFee";
export const backendUrl = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedRole = localStorage.getItem("role");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        if (savedRole) setRole(savedRole);
      } catch (err) {
        console.error("Invalid user data in localStorage:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("role");
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
      <ToastContainer />
      <Routes>
        <Route path="/" element={<NaadInstitute />}></Route>
        {/* <Route
          path="/"
          element={user ? <Navigate to="/home" /> : <Navigate to="/login" />}
        /> */}

        <Route
          path="/login"
          element={<Login setUser={setUser} setRole={setRole} />}
        />

        {/* ✅ ADMIN-ONLY ROUTES */}
        <Route
          path="/home"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={["admin"]}>
              <Home user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={["admin"]}>
              <Add user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={["admin"]}>
              <View user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={["admin"]}>
              <Dashboard user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/feeform"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={["admin"]}>
              <FeeForm user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        /> */}
         <Route
          path="/feeform"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={["admin"]}>
              <EditFee user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:studentId"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={["admin"]}>
              <Profile user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:studentId"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={["admin"]}>
              <Edit user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delete/:studentId"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={["admin"]}>
              <Delete user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        {/* ✅ STUDENT-ONLY ROUTES (optional) */}
        <Route
          path="/studenthome"
          element={
            <ProtectedRoute user={user} role={role} allowedRoles={["student"]}>
              <StudHomepage user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        <Route path="/paymentSuccess" element={<PaymentSuccess />} />
        <Route path="/paymentFailure" element={<PaymentFailure />} />
      </Routes>
    </>
  );
}

export default App;
