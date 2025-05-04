import React, { useEffect, useState } from "react";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
const Delete = () => {
  const { studentId } = useParams();
  const [user, setUser] = useState([]);
  const navigate = useNavigate();
  //function to handle delete
  const handleDelete = () => {
    const a = "23456789";
    //console.log(id);
    Swal.fire({
      title: `Are you sure ?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
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
        backendUrl + `/api/admin/delete/${studentId}`
      );
      if (response.data.success == true) {
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
        backendUrl + `/api/admin/studentProfile/${studentId}`
      );

      setUser(response.data.profile);
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            User Details
          </h2>
          {/* <img
            src={user.image}
            alt="User"
            className="w-32 h-32 mx-auto rounded-full mb-4"
          /> */}
          <p className="text-lg font-semibold">
            {user.firstname} {user.middlename} {user.lastname}
          </p>
          <p className="text-gray-600">Address: {user.address}</p>
          <p className="text-gray-600">Contact: {user.contact}</p>
          <p className="text-gray-600">DOB: {user.dob}</p>
          <p className="text-gray-600">DOJ: {user.doj}</p>
          <p className="text-gray-600">Year: {user.year}</p>
        </div>

        <div className="flex justify-center items-center">
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-blue-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

export default Delete;
