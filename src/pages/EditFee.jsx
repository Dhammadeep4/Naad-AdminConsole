import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../App";
import { useNavigate } from "react-router-dom";

const EditFee = () => {
  const navigate = useNavigate();
  const [fees, setFees] = useState({});
  const [loading, setLoading] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  const fetchFees = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Session expired.");
      
      const response = await axios.get(`${backendUrl}/api/fee/getFee`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const feeData = response.data.fees[0];
        const { _id, __v, createdAt, updatedAt, ...cleanFees } = feeData;
        setFees(cleanFees);
      }
    } catch (error) {
      toast.error("Failed to fetch fees data");
    }
  };

  useEffect(() => { fetchFees(); }, []);

  const handleInputChange = (key, value) => {
    setFees((prev) => ({ ...prev, [key]: value }));
  };

  const addNewField = () => {
    if (!newClassName) return;
    // Format to lowercase underscore to match your DB logic
    const formattedName = newClassName.trim().toLowerCase().replace(/ /g, "_");
    
    if (fees[formattedName] !== undefined) {
      return toast.warn("Class already exists!");
    }

    setFees({ ...fees, [formattedName]: 0 });
    setNewClassName("");
    toast.info(`Added ${formattedName}. Click update to save.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(`${backendUrl}/api/fee/update`, fees, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) toast.success("Fees updated successfully!");
    } catch (error) {
      toast.error("Error updating fees");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-red-200">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-blue-600 transition">
            <span className="text-xl mr-1">←</span> Back
          </button>
          <h2 className="text-3xl font-extrabold text-gray-800">Fee Management</h2>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Fees Grid (Left 2 Columns) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-6 border-b pb-2">Active Classes</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(fees).map((className) => (
                  <div key={className} className="flex flex-col space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                      {className.replace(/_/g, " ")}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400">₹</span>
                      <input
                        type="number"
                        value={fees[className]}
                        onChange={(e) => handleInputChange(className, e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-10 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:bg-blue-300"
              >
                {loading ? "Processing..." : "Save All Changes"}
              </button>
            </form>
          </div>

          {/* Sidebar Tools (Right Column) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 italic text-blue-800">Add New Class</h3>
              {/* <p className="text-sm text-gray-500 mb-4">Add a missing year or special batch here.</p> */}
              <input
                placeholder="ClassName_BatchNo"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:border-green-400"
              />
              <button
                type="button"
                onClick={addNewField}
                className="w-full bg-green-50 text-green-600 border border-green-200 font-bold py-3 rounded-xl hover:bg-green-600 hover:text-white transition-all"
              >
                + Add to List
              </button>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h4 className="text-blue-800 font-bold mb-2">Pro Tip</h4>
              <p className="text-blue-700 text-sm leading-relaxed">
                Dont add space use "_" instead.Changes made to fees will reflect immediately on the student registration and collection pages.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditFee;