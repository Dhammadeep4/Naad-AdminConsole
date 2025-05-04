import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import ActiveStudentsStatus from "../components/ActiveStudents";
import Analytics from "../components/Analytics";
import { useNavigate } from "react-router-dom";
const Dashboard = () => {
  const navigate = useNavigate();
  //props required for Analytics
  const [paymentHistory, setPaymentHistory] = useState([]);
  const fetchPaymentHistory = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/v1/getAllHistory`);
      if (response.data.success) {
        const sortedHistory = response.data.history.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt); // 🔥 latest first
        });
        setPaymentHistory(sortedHistory);
      } else {
        toast.error("Failed to fetch payment history");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching payment history");
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Top Section: Title + Set Fees + Filter */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <button
          onClick={() => navigate("/home")}
          className="text-blue-500 hover:underline mb-4"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold text-blue-700 text-center md:text-left">
          🧾 Payment History
        </h2>

        <div className="flex items-center justify-center gap-4">
          {/* Set Fees Button */}
          <NavLink to="/feeform">
            <div className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg shadow text-white font-semibold transition">
              Set Fees
            </div>
          </NavLink>
        </div>
      </div>

      {/* Active Students Table */}
      <ActiveStudentsStatus
        paymentHistory={paymentHistory}
        fetchPaymentHistory={fetchPaymentHistory}
      />
      {/*Fee collection Analytics*/}
      <Analytics paymentHistory={paymentHistory} />
    </div>
  );
};

export default Dashboard;
