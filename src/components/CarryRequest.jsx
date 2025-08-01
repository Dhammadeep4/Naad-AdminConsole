import React, { useState, useEffect } from "react";

const CarryRequest = ({ student, amount, isOpen, onClose, onSubmit }) => {
  if (!isOpen || !student) return null;

  const today = new Date();
  const month = today.getMonth() + 1;
  const current_year = today.getFullYear();

  // Local state for input values
  const [studentName, setStudentName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [feeAmount, setFeeAmount] = useState("");

  // Prefill data when modal opens
  useEffect(() => {
    setStudentName(`${student.firstname} ${student.lastname}`);
    setRemarks(`Carried monthly Fee-${month}/${current_year}`);
    setFeeAmount(amount);
  }, [student, amount]);

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      student_id: student._id,
      remarks,
      amount: feeAmount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Student Remarks</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block font-medium">Student Name</label>
            <input
              type="text"
              value={studentName}
              readOnly
              className="w-full border rounded p-2 mt-1 bg-gray-100"
            />
          </div>
          <div className="mb-3">
            <label className="block font-medium">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              name="remarks"
              required
              className="w-full border rounded p-2 mt-1"
            />
          </div>
          <div className="mb-3">
            <label className="block font-medium">Amount</label>
            <input
              type="number"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              name="amount"
              required
              className="w-full border rounded p-2 mt-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarryRequest;
