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
      console.log("studentID:" + studentId);
      const response = await axios.get(
        backendUrl + `/api/admin/studentProfile/${studentId}`
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
      console.log(response);
      if (response.data.success) {
        toast.success("Changes status to inactive");
        setActiveFlag("false");
      } else {
        console.log("failed to change status");
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
      console.log(response);
      if (response.data.success) {
        toast.success("Changes status to active");
        setActiveFlag("true");
      } else {
        console.log("failed to change status");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  useEffect(() => {
    fetchProfile();
    checkCreds();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-500 hover:underline mb-4"
      >
        ← Back
      </button>
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">User Details</h2>
        <img
          src={user.image}
          alt="User"
          className="w-32 h-32 mx-auto rounded-full mb-4"
        />
        <p className="text-lg font-semibold">
          {user.firstname} {user.middlename} {user.lastname}
        </p>
        <p className="text-gray-600">Address: {user.address}</p>
        <p className="text-gray-600">Contact: {user.contact}</p>
        <p className="text-gray-600">DOB: {user.dob}</p>
        <p className="text-gray-600">DOJ: {user.doj}</p>
        <p className="text-gray-600">Year: {user.year}</p>

        {/* Credentials Section */}
        {credsFlag ? (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
            <p>
              <strong>Username:</strong> {userId}
            </p>
            <p>
              <strong>Password:</strong> {pwd}
            </p>
            <button
              onClick={resetCreds}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Reset Credentials
            </button>
          </div>
        ) : (
          <button
            onClick={generateCreds}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Generate Credentials
          </button>
        )}
        {activeFlag ? (
          <button
            onClick={setInactive}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Set Inactive
          </button>
        ) : (
          <button
            onClick={setActive}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Set Active
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
