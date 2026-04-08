import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa6";  // Importing the trash icon for delete button

const PendingRequestsTable = ({ paymentRequests, students, onDelete, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  const studentMap = {};
  students.forEach((student) => {
    studentMap[student._id] = student;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshFunction = onRefresh || onDelete;
      if (typeof refreshFunction === "function") {
        await refreshFunction();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // --- NEW DELETE HANDLER ---
  const handleDelete = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${backendUrl}/api/v1/deleteRequest/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success("Request deleted successfully");
        if (typeof onDelete === "function") onDelete();
      }
    } catch (err) {
      console.error("Delete failed", err.message);
      toast.error("Failed to delete the request.");
    }
  };
  const openModal = (id, firstname, lastname, amt, remark) => {
    setSelectedStudentId(id);
    setRemarks(remark);

    const today = new Date();
    const day = today.getDate(); // Returns the day of the month (1-31)
    const month = today.getMonth() + 1; // Returns the month (0-11), so add 1 for actual month number
    const current_year = today.getFullYear();

    setComments(
      `${day}/${month}/${current_year}-Pending Cash Collected for ${firstname} ${lastname}`
    );
    setAmount(amt);
    setError("");
    setShowModal(true);
  };

  const handleBypass = async (id) => {
    if (!comments.toLowerCase().includes("cash collected")) {
      setError('Comment must include "Cash Collected".');
      return;
    }

    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      const currentDate = new Date().toLocaleDateString();
      const response = await axios.post(
        `${backendUrl}/api/v1/updateDB`,
        {
          student_id: id,
          payment_id: comments,
          mode: "Cash",
          remark: remarks,
          amount: amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔐 Include JWT token
          },
        }
      );

      if (response.data.success) {
        toast.success("Payments collection updated");
        setShowModal(false);
      } else {
        toast.error("Payments collection not updated");
      }
    } catch (err) {
      console.error("Update failed", err.message);
      toast.error("Something went wrong.");
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(paymentRequests.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = paymentRequests.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  return (
    <div className="mt-6 relative max-w-full px-2 sm:px-4 md:px-6 lg:px-0 mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left">
          📋 Pending Payment Requests
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition text-sm flex items-center gap-1"
          title="Refresh Data"
        >
          {isRefreshing ? (
            <>
              <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
              Refreshing...
            </>
          ) : (
            <>
              🔄 Refresh
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {paymentRequests.length === 0 ? (
        <div className="p-4 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg text-center sm:text-left">
          No pending payment requests found.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
          <table className="min-w-full text-xs sm:text-sm bg-white">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-2 sm:px-4 py-2 border-b">Student Name</th>
                <th className="px-2 sm:px-4 py-2 border-b">Amount</th>
                <th className="px-2 sm:px-4 py-2 border-b">Remarks</th>
                <th className="px-2 sm:px-4 py-2 border-b">Requested On</th>
                <th className="px-2 sm:px-4 py-2 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.map((request, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-2 border-b whitespace-nowrap">
                    {request.student_id.firstname || "N/A"}{" "}
                    {request.student_id.lastname || ""}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border-b whitespace-nowrap">
                    ₹{request.amount}
                  </td>
                  <td
                    className="px-2 sm:px-4 py-2 border-b max-w-xs truncate"
                    title={request.remark}
                  >
                    {request.remark}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border-b whitespace-nowrap">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border-b whitespace-nowrap">
                    <button
                      className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br font-medium rounded-lg text-xs sm:text-sm px-3 sm:px-5 py-1.5 sm:py-2.5 transition"
                      onClick={() =>
                        openModal(
                          request.student_id._id,
                          request.student_id.firstname,
                          request.student_id.lastname,
                          request.amount,
                          request.remark
                        )
                      }
                    >
                      Bypass
                    </button>
                    {/* --- DELETE BUTTON --- */}
                      <button
                        onClick={() => handleDelete(request._id)}
                        className="text-red-600 hover:text-white border border-red-600 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-1.5 text-center transition"
                        title="Delete Request"
                      >
                        <FaTrash />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center my-4 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4 sm:px-6">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-blue-600 text-center sm:text-left">
              Enter Comments
            </h3>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full border p-2 rounded mb-4 resize-none text-sm sm:text-base"
              rows={3}
              placeholder="Enter remarks for bypassing... Include (Cash Collected)"
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-blue-600 text-center sm:text-left">
              Remark
            </h3>
            <textarea
              value={remarks}
              disabled={true}
              className="w-full border p-2 rounded mb-4 resize-none text-sm sm:text-base"
            />
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-blue-600">
              Amount
            </h3>
            <input
              type="number"
              value={amount}
              disabled={true}
              className="w-full border p-2 rounded mb-4 text-sm sm:text-base"
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBypass(selectedStudentId)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm sm:text-base"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequestsTable;
