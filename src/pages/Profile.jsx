import React, { useEffect, useState } from "react";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const Profile = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [user, setUser] = useState([]);
  const [credsFlag, setCredsFlag] = useState(false);
  const [activeFlag, setActiveFlag] = useState(false);
  const [userId, setUserId] = useState("");
  const [pwd, setPwd] = useState("");

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        backendUrl + `/api/admin/studentProfile/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add JWT token here
          },
        }
      );
      setUser(response.data.profile);
      if (response.data.profile.status == "active") {
        setActiveFlag("true");
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  // Check if credentials exist
  const checkCreds = async () => {
    try {
      const student_id = studentId;
      const data = { student_id };
      const response = await axios.post(
        backendUrl + "/api/user/getCreds",
        data
      );

      if (response.data.success) {
        setCredsFlag(true);
        setUserId(response.data.user.username);
        setPwd(response.data.user.password);
      } else {
        setCredsFlag(false);
      }
    } catch (error) {
      setCredsFlag(false);
      console.error("Error fetching credentials:", error);
    }
  };

  // Generate new credentials
  const generateCreds = async () => {
    try {
      const username = user.contact + "@" + user.firstname;
      const password = user.firstname + "@" + user.lastname;
      setUserId(username);
      setPwd(password);
      const student_id = user._id;

      const creds = { username, password, student_id };

      const response = await axios.post(backendUrl + "/api/user/create", creds);

      if (response.data.success) {
        setCredsFlag(true);
        toast.success(response.data.success);
        await fetchProfile();
        await checkCreds();
      } else {
        setCredsFlag(false);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Reset credentials (delete old + create new)
  const resetCreds = async () => {
    try {
      const username = user.contact + "@" + user.firstname;
      const password = user.firstname + "@" + user.lastname;
      const student_id = user._id;

      const creds = { username, password, student_id };

      const response = await axios.post(backendUrl + "/api/user/reset", creds);

      if (response.data.success) {
        toast.success("Credentials reset successfully!");
        setUserId(username);
        setPwd(password);
        await fetchProfile();
        await checkCreds();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  //setInactive status in db
  const setInactive = async () => {
    try {
      const response = await axios.put(
        backendUrl + `/api/admin/status/${studentId}`,
        { status: "inactive" }
      );

      if (response.data.success) {
        toast.success("Changes status to inactive");
        setActiveFlag("false");
        window.location.reload();
      } else {
        toast.error("Failed to change status");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //setActive status in db
  const setActive = async () => {
    try {
      const response = await axios.put(
        backendUrl + `/api/admin/status/${studentId}`,
        { status: "active" }
      );

      if (response.data.success) {
        toast.success("Changes status to active");
        setActiveFlag("true");
        await fetchProfile();
        await checkCreds();
      } else {
        console.log("failed to change status");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  useEffect(() => {
    const init = async () => {
      await fetchProfile();
      await checkCreds();
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-200 p-4 flex flex-col items-center">
      {/* Back Button */}
      <div className="w-full max-w-4xl mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back
        </button>
      </div>

      {/* User Card */}
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-6">
        {/* Left Panel - Avatar and Buttons */}
        <div className="md:w-1/3 flex flex-col items-center text-center gap-4">
          <img
            src={user.image}
            alt="User"
            className="w-32 h-32 rounded-full ring-4 ring-blue-300 object-cover shadow"
          />
          <h2 className="text-xl font-semibold text-gray-800">
            {user.firstname} {user.middlename} {user.lastname}
          </h2>

          {/* Status Button */}
          <div className="w-full">
            {activeFlag ? (
              <button
                onClick={setInactive}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg mt-2"
              >
                Set Inactive
              </button>
            ) : (
              <button
                onClick={setActive}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg mt-2"
              >
                Set Active
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-sm">
          <div>
            <strong>Address:</strong>
            <br />
            {user.address}
          </div>
          <div>
            <strong>Contact:</strong>
            <br />
            {user.contact}
          </div>
          <div>
            <strong>Date of Birth:</strong>
            <br />
            {user.dob}
          </div>
          <div>
            <strong>Date of Joining:</strong>
            <br />
            {user.doj}
          </div>
          <div>
            <strong>Academic Year:</strong>
            <br />
            {user.year}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
