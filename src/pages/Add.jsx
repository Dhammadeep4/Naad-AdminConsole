import React, { useState ,useEffect} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import { useNavigate } from "react-router-dom";

const Add = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  //State to hold dynamic classes
  const [classList, setClassList] = useState([]);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    contact: "",
    dob: "",
    doj: "",
    year: "",
  });

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Disable button

    const form = new FormData();
    if (image) form.append("image", image);
    form.append("firstname", formData.firstName);
    form.append("middlename", formData.middleName);
    form.append("lastname", formData.lastName);
    form.append("address", formData.address);
    form.append("contact", formData.contact);
    form.append("dob", formData.dob);
    form.append("doj", formData.doj);
    form.append("year", formData.year);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(backendUrl + "/api/admin/add", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success === true) {
        toast.success(response.data.message);
        navigate("/home");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Something went wrong!");
      console.error(error);
    } finally {
      setLoading(false); // Re-enable button
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-red-200">
      <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-xl">
        <button
          onClick={() => navigate("/home")}
          className="text-blue-500 hover:underline mb-4"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Add Student Details
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          encType="multipart/form-data"
        >
          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              name="profileImage"
              required
              className="p-3 border border-gray-300 rounded-lg w-full"
            />
          </div>

          {/* Personal Info */}
          <h3 className="text-lg font-semibold text-gray-800 mt-4">
            Personal Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Enter first name"
              className="p-3 border border-gray-300 rounded-lg w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Middle Name
            </label>
            <input
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              placeholder="Enter middle name"
              className="p-3 border border-gray-300 rounded-lg w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Enter last name"
              className="p-3 border border-gray-300 rounded-lg w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter address"
              className="p-3 border border-gray-300 rounded-lg w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              name="contact"
              type="tel"
              value={formData.contact}
              onChange={handleChange}
              required
              placeholder="Enter contact number"
              className="p-3 border border-gray-300 rounded-lg w-full"
            />
          </div>

          {/* Admission Info */}
          <h3 className="text-lg font-semibold text-gray-800 mt-4">
            Admission Details
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
              className="p-3 border border-gray-300 rounded-lg w-full"
            />
            {formData.dob && (
              <p className="text-sm text-gray-600 mt-1">
                Selected DOB: <strong>{formData.dob}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Joining
            </label>
            <input
              name="doj"
              type="date"
              value={formData.doj}
              onChange={handleChange}
              required
              className="p-3 border border-gray-300 rounded-lg w-full"
            />
            {formData.doj && (
              <p className="text-sm text-gray-600 mt-1">
                Selected DOJ: <strong>{formData.doj}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Class (Year)
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
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
            disabled={loading}
            className={`w-full text-white font-semibold p-3 rounded-lg ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;
