import React, { useEffect, useState } from "react";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";

const Delete = () => {
  const { studentId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e53e3e",
      cancelButtonColor: "#718096",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProfile();
      }
    });
  };

  const deleteProfile = async () => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/admin/delete/${studentId}`
      );
      if (response.data.success) {
        Swal.fire({
          title: "Deleted!",
          text: "Student has been deleted.",
          icon: "success",
        });
        navigate("/view");
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/admin/studentProfile/${studentId}`
      );
      setUser(response.data.profile);
    } catch (error) {
      toast.error("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-red-200">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">No user found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-200 flex flex-col items-center px-4 py-6">
      {/* Back Button */}
      <div className="w-full max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline text-sm flex items-center mb-4"
        >
          ← Back
        </button>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row gap-6">
        {/* Profile Section */}
        <div className="md:w-2/3 flex flex-col items-center md:items-start text-center md:text-left">
          <img
            src={user.image || "https://via.placeholder.com/150"}
            alt="User"
            className="w-28 h-28 md:w-32 md:h-32 rounded-full ring-4 ring-rose-300 object-cover mb-4 shadow-md"
          />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
            {user.firstname} {user.middlename} {user.lastname}
          </h2>
          <p className="text-sm text-gray-500">{user.contact}</p>

          <div className="mt-4 space-y-2 text-sm text-gray-700 w-full">
            <p>
              <span className="font-semibold">📍 Address:</span> {user.address}
            </p>
            <p>
              <span className="font-semibold">🎂 DOB:</span> {user.dob}
            </p>
            <p>
              <span className="font-semibold">🗓️ DOJ:</span> {user.doj}
            </p>
            <p>
              <span className="font-semibold">📚 Year:</span> {user.year}
            </p>
          </div>
        </div>

        {/* Delete Section */}
        <div className="md:w-1/3 flex flex-col justify-center">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 shadow-inner text-center">
            <h3 className="text-lg font-semibold text-rose-700">
              Delete Student
            </h3>
            <p className="text-sm text-rose-500 mt-2 mb-4">
              This action is permanent and cannot be undone.
            </p>
            <button
              onClick={handleDelete}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              🗑️ Delete Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delete;
