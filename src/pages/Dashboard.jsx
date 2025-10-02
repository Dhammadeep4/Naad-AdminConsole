import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import ActiveStudentsStatus from "../components/ActiveStudents";
import Analytics from "../components/Analytics";
import PaymentRequest from "../components/PaymentRequest";
import PendingRequestsTable from "../components/PendingRequestTable";
import HistoryTable from "../components/HistoryTable";
import FeeBreakdown from "../components/FeeBreakdown";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [students, setStudents] = useState([]);
  const [feeCard, setFeeCard] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [predictedCollection, setPredictedCollection] = useState(null);
  const [monthCollection, setMonthCollection] = useState(null);
  const [totalActiveStudents, setTotalActiveStudents] = useState(0);
  const [feeData, setFeeData] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const handleModalSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      const res = await axios.post(
        `${backendUrl}/api/v1/paymentRequest`,
        {
          student_id: data.student_id,
          remark: data.remarks,
          amount: data.amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        await fetchPending();
        await fetchStudents();
        await fetchFees();
      } else {
        toast.error(res.data.message || "Failed to create request");
      }
    } catch {
      toast.error("Error while creating a payment request");
    }
  };

  const fetchProfile = async (id) => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/admin/studentProfile/${id}`
      );
      if (res.data.success) return res.data.profile;
    } catch {
      toast.error("Error fetching profile");
      return null;
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${backendUrl}/api/admin/studentsLastHistory`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        setStudents(res.data.students);
      } else {
        toast.error("Failed to fetch students");
      }
    } catch (error) {
      toast.error("Error fetching students");
      console.error(error);
    }
  };

  const fetchPredictedCollection = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${backendUrl}/api/v1/getPredictedCollection`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        setFeeData(res.data);
        setPredictedCollection(res.data.predictedCollection);
        setTotalActiveStudents(res.data.totalActiveStudents);
        setMonthCollection(res.data.stats);
      } else {
        toast.error("Failed to fetch predicted collection");
      }
    } catch (error) {
      toast.error("Error fetching predicted collection");
      console.error(error);
    }
  };

  const fetchPending = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${backendUrl}/api/v1/getPending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        setPaymentRequests(res.data.history);
      } else {
        toast.error("Failed to fetch payment history");
      }
    } catch {
      toast.error("Error fetching pending requests");
    }
  };

  const fetchFees = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      const response = await axios.get(backendUrl + `/api/fee/getFee`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setFeeCard(response.data.fees);
      } else {
        toast.error("Failed to fetch fees data cannot perform bypass");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchStudents();
      await fetchPending();
      await fetchFees();
      await fetchPredictedCollection();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-pink-100 to-red-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-600 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-200 px-4 sm:px-6 py-4 overflow-x-hidden">
      {/* Top Section */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <button
          onClick={() => navigate("/home")}
          className="text-blue-500 hover:underline text-sm sm:text-base self-start"
        >
          ← Back
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center md:text-left">
          🧾 Payment History
        </h2>
        <div className="flex items-center justify-center gap-4">
          <NavLink to="/feeform">
            <div className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg shadow text-white font-semibold transition text-sm sm:text-base text-center">
              Set Fees
            </div>
          </NavLink>
        </div>
      </div>

      {/* Student Portal Section */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
            Student Portal
          </h1>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center sm:justify-end gap-3 mt-3 sm:mt-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm sm:text-base"
            >
              Request Payment
            </button>
            <button
              onClick={() => setShowBreakdown(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base"
            >
              Show Breakdown
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Predicted Collection */}
          <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-lg shadow text-center">
            <h3 className="text-sm font-medium text-gray-700">
              Predicted Collection
            </h3>
            <p className="text-2xl font-bold text-green-800">
              ₹{predictedCollection?.toLocaleString() || 0}
            </p>
          </div>

          {/* Active Students */}
          <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-lg shadow text-center">
            <h3 className="text-sm font-medium text-gray-700">
              Total Active Students
            </h3>
            <p className="text-2xl font-bold text-blue-800">
              {totalActiveStudents}
            </p>
          </div>

          {/* Monthly Collection */}
          <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-lg shadow text-center">
            <h3 className="text-sm font-medium text-gray-700">
              This Month’s Collection
            </h3>
            <p className="text-2xl font-bold text-purple-800">
              ₹{monthCollection?.totalAmount?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {monthCollection?.studentCount || 0} new students paid
            </p>
          </div>
        </div>

        {/* Request Payment Modal */}
        <PaymentRequest
          students={students}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />

        {/* Breakdown Modal */}
        {showBreakdown && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={() => setShowBreakdown(false)} // click outside closes modal
          >
            <div
              className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[80vh] p-6 relative overflow-y-auto"
              onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
            >
              {/* Close Button */}
              <button
                onClick={() => setShowBreakdown(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
              >
                ✕
              </button>

              <h2 className="text-lg font-semibold mb-4">Fee Breakdown</h2>
              <FeeBreakdown data={feeData} />
            </div>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="overflow-x-auto rounded-xl bg-white p-4 shadow">
          <HistoryTable students={students} feeCard={feeCard} />
        </div>

        <div className="overflow-x-auto rounded-xl bg-white p-4 shadow">
          <PendingRequestsTable
            paymentRequests={paymentRequests}
            students={students}
          />
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <Analytics
            paymentHistory={history}
            students={students}
            paymentRequests={paymentRequests}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
