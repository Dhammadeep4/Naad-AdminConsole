import React from "react";

const PaymentRequest = ({ students, isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const student_id = form.student.value;
    const remarks = form.remarks.value;
    const amount = form.amount.value;
    onSubmit({ student_id, remarks, amount });
    form.reset();
    onClose();
  };

  const getFullName = (student) => {
    return [student.firstname, student.middlename, student.lastname]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Student Remarks</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block font-medium">Student Name</label>
            <select
              name="student"
              required
              className="w-full border rounded p-2 mt-1"
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {getFullName(student)}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block font-medium">Remarks</label>
            <textarea
              name="remarks"
              required
              className="w-full border rounded p-2 mt-1"
            />
          </div>
          <div className="mb-3">
            <label className="block font-medium">Amount</label>
            <input
              type="number"
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

export default PaymentRequest;
