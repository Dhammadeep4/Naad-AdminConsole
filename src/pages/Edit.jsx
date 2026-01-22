import React, { useEffect, useState } from "react";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const Edit = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [dob, setDOB] = useState("");
  const [doj, setDOJ] = useState("");
  const [year, setYear] = useState("");
 //State to hold dynamic classes
  const [classList, setClassList] = useState([]);

// Fetch Classes from Backend
  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      // Use the endpoint we discussed (e.g., /api/fee/getFee or /api/fee/classes)
      const response = await axios.get(backendUrl + "/api/fee/getFee", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // If your API returns the fees object, extract the keys
        const feeData = response.data.fees[0];
        const internalKeys = ["_id", "__v", "createdAt", "updatedAt", "registration"];
        
        const dynamicClasses = Object.keys(feeData).filter(
          (key) => !internalKeys.includes(key)
        );
        
        setClassList(dynamicClasses);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes");
    }
  };




  const handleSubmit = async (e) => {
    const form = new FormData();
    if (image instanceof File) {
      form.append("image", image);
    }
    form.append("firstname", firstName);
    form.append("middlename", middleName);
    form.append("lastname", lastName);
    form.append("address", address);
    form.append("contact", contact);
    form.append("dob", dob);
    form.append("doj", doj);
    form.append("year", year);

    e.preventDefault();
    // console.log("Form Data Submitted:", {
    //   firstName,
    //   middleName,
    //   lastName,
    //   address,
    //   contact,
    //   dob,
    //   doj,
    //   year,
    // });
    const response = await axios.post(
      backendUrl + `/api/admin/edit/${studentId}`,
      form
    );
    if (response.data.success === true) {
      toast.success(response.data.message);
      navigate("/view");
    } else {
      toast.error(response.data.message);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        backendUrl + `/api/admin/studentProfile/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔐 Include JWT token
          },
        }
      );

      const user = response.data.profile;
      setPreviewImage(user.image);
      setImage(user.image);
      setFirstName(user.firstname);
      setMiddleName(user.middlename);
      setLastName(user.lastname);
      setAddress(user.address);
      setContact(user.contact);
      setDOB(user.dob);
      setDOJ(user.doj);
      setYear(user.year);
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchClasses();
    fetchProfile();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-red-200">
      <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-xl">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-500 hover:underline mb-4"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Edit Details Form {year}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          encType="multipart/form-data"
        >
          {previewImage && (
            <img
              src={
                typeof previewImage === "string"
                  ? previewImage
                  : URL.createObjectURL(previewImage)
              }
              alt="Profile Preview"
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setImage(e.target.files[0]);
              setPreviewImage(e.target.files[0]); // update preview
            }}
            name="profileImage"
            className="p-3 border border-gray-300 rounded-lg w-full"
          />

          <input
            name="firstName"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg w-full"
          />
          <input
            name="middleName"
            placeholder="Middle Name"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-full"
          />
          <input
            name="lastName"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg w-full"
          />
          <input
            name="address"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg w-full"
          />
          <input
            name="contact"
            type="tel"
            placeholder="Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg w-full"
          />
          <input
            name="dob"
            type="date"
            value={dob}
            onChange={(e) => setDOB(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg w-full"
          />
          <input
            name="doj"
            type="date"
            value={doj}
            onChange={(e) => setDOJ(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg w-full"
          />
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Class (Year)
            </label>
            <select
              name="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              className="p-3 border border-gray-300 rounded-lg w-full capitalize"
            >
              <option value="" disabled>
                -- Choose Class --
              </option>
              
              {/* 3. Map over the dynamic classList */}
              {classList.map((className) => (
                <option key={className} value={className}>
                  {className.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold p-3 rounded-lg"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Edit;
