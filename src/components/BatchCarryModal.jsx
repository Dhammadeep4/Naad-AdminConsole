// BatchCarryModal.jsx

import React, { useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
// --- 1. NEW ConfirmationDialog Component ---
const ConfirmationDialog = ({ data, defaultRemark, onConfirm, onCancel }) => {
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border-t-4 border-blue-600">
        <h3 className="text-xl font-bold mb-3 text-blue-700">
          Confirm Batch Carry
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          Review the list below before submitting the carry request.
        </p>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-lg font-bold text-blue-800">
            Total Students: {data.length}
          </p>
          <p className="text-lg font-bold text-blue-800">
            Total Amount: {totalAmount.toFixed(2)} Rs
          </p>
        </div>

        <div className="max-h-40 overflow-y-auto border p-2 rounded mb-4">
          <ul className="space-y-1 text-sm">
            {data.map((item, index) => (
              <li
                key={index}
                className="flex justify-between border-b last:border-b-0 py-1"
              >
                <span className="text-gray-800 font-medium truncate w-3/5">
                  {item.name}
                </span>
                <span className="text-gray-600">
                  {item.amount.toFixed(2)} Rs
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xs text-gray-500 italic mb-4 p-2 bg-gray-100 rounded">
          **Remark:** {defaultRemark}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 font-medium transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition text-sm"
          >
            Confirm & Submit
          </button>
        </div>
      </div>
    </div>
  );
};
// --- END ConfirmationDialog Component ---

const BatchCarryModal = ({ pendingStudents, getFeeAmt, isOpen, onClose }) => {
  if (!isOpen) return null;

  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // --- 2. State for Confirmation Dialog ---
  const [isConfirming, setIsConfirming] = useState(false);
  const [requestsData, setRequestsData] = useState([]);
  // ----------------------------------------

  const today = new Date();
  const month = today.getMonth() + 1;
  const current_year = today.getFullYear();
  const defaultRemark = `Carried monthly Fee-${month}/${current_year}`;

  // Memoized filter for the list inside the modal
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return pendingStudents;
    const query = searchQuery.toLowerCase();
    return pendingStudents.filter((s) =>
      `${s.firstname} ${s.lastname}`.toLowerCase().includes(query)
    );
  }, [pendingStudents, searchQuery]);

  // Handler for individual student checkbox
  const toggleStudent = (studentId) => {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Handler for select/deselect all in the current filtered list
  const toggleSelectAll = () => {
    const currentPendingIds = filteredStudents.map((s) => s._id);
    const allSelected = currentPendingIds.every((id) =>
      selectedIds.includes(id)
    );

    if (allSelected) {
      // Deselect all
      setSelectedIds((prev) =>
        prev.filter((id) => !currentPendingIds.includes(id))
      );
    } else {
      // Select all visible students, keeping previously selected IDs outside the current view
      setSelectedIds((prev) => {
        const uniqueIds = new Set([...prev, ...currentPendingIds]);
        return Array.from(uniqueIds);
      });
    }
  };

  // --- 3. Updated handleSubmit to show preview ---
  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedIds.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    // Map selected IDs back to full student objects to get fee amount and name
    const data = pendingStudents
      .filter((s) => selectedIds.includes(s._id))
      .map((student) => ({
        student_id: student._id,
        name: `${student.firstname} ${student.lastname}`, // Added for preview
        remark: defaultRemark,
        amount: getFeeAmt(student.year),
      }));

    setRequestsData(data);
    setIsConfirming(true); // Show the confirmation dialog
  };

  const handleConfirmSubmit = async () => {
    // This is the final submission step
    // console.log("Batch Carry Requests Data:", requestsData);

    //updating in db
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      const payload = {
        requests: requestsData,
      };
      const res = await axios.post(
        `${backendUrl}/api/v1/multiplePaymentRequest`,

        payload,

        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔐 Include JWT token
          },
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        //await fetchPending();
      } else {
        toast.error(res.data.message || "Failed to create request");
      }
    } catch {
      toast.error("Error while creating a payment request");
    }

    setIsConfirming(false); // Hide the confirmation dialog
    onClose(); // Close the main modal
  };
  // ---------------------------------------------

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">
          Batch Carry Request
        </h2>

        {/* ... (Existing Controls) ... */}
        <div className="mb-4 flex flex-col sm:flex-row gap-2 justify-between items-center">
          <p className="text-sm font-medium text-gray-600">
            Selected:{" "}
            <span className="font-bold text-blue-600">
              {selectedIds.length}
            </span>{" "}
            students
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search pending students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow border rounded p-2 text-sm"
            />
            <button
              type="button"
              onClick={toggleSelectAll}
              className="px-3 py-1.5 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition"
            >
              {filteredStudents.every((s) => selectedIds.includes(s._id))
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
        </div>
        {/* ... (Existing Student List) ... */}
        <div className="flex-grow overflow-y-auto border rounded-lg p-3 mb-4">
          <ul className="space-y-2">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <li
                  key={student._id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(student._id)}
                      onChange={() => toggleStudent(student._id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mr-3"
                    />
                    <span className="font-medium text-gray-800">
                      {`${student.firstname} ${student.lastname}`}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{student.year}</span>
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500 italic py-4">
                No pending students match the search query.
              </p>
            )}
          </ul>
        </div>
        {/* ... (Existing Buttons) ... */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 font-medium transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={selectedIds.length === 0}
            className={`px-4 py-2 text-white rounded font-medium transition ${
              selectedIds.length > 0
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            Review & Submit ({selectedIds.length})
          </button>
        </div>
      </div>

      {/* --- 4. Render Confirmation Dialog --- */}
      {isConfirming && (
        <ConfirmationDialog
          data={requestsData}
          defaultRemark={defaultRemark}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setIsConfirming(false)}
        />
      )}
    </div>
  );
};

export default BatchCarryModal;
