import React, { useState, useMemo } from "react";
import moment from "moment";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import CarryRequest from "./CarryRequest";
const HistoryTable = ({ students, feeCard }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [paid, setPaid] = useState(0);
  const [pending, setPending] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(0);

  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  const today = moment();
  const fifthOfMonth = moment().startOf("month").add(1, "days"); // 2nd of every month
  console.log("students:", students.length);
  const shouldShowBypass = (student) => {
    const lastPaymentDate = student?.lastPayment?.createdAt;
    if (!lastPaymentDate) return true;
    return moment(lastPaymentDate).isBefore(fifthOfMonth);
  };

  const getFeeAmt = (year) => {
    var y = year.toLowerCase();
    y = y.replace(" ", "_");
    const amount = feeCard[0][y];
    return amount;
  };

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
  };

  //show modal
  const openModal = (id, firstname, lastname, year) => {
    const amount = getFeeAmt(year);
    console.log(amount);

    setSelectedStudentId(id);
    const today = new Date();
    const day = today.getDate(); // Returns the day of the month (1-31)
    const month = today.getMonth() + 1; // Returns the month (0-11), so add 1 for actual month number
    const current_year = today.getFullYear();

    setRemarks(
      `${day}/${month}/${current_year}-Monthly Fee collected for ${firstname} ${lastname}`
    );
    setAmount(amount);
    setShowModal(true);
  };

  //handle bypass
  const handleBypass = async (id) => {
    if (!remarks.toLowerCase().includes("monthly fee")) {
      setError('Remarks must include "Monthly Fee".');
      return;
    }
    setError(""); // Clear error if valid
    //console.log("Generating receipt");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      // update DB
      const currentDate = new Date().toLocaleDateString();
      const response = await axios.post(
        `${backendUrl}/api/v1/updateDB`,
        {
          student_id: id,
          payment_id: remarks,
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

  // Unique years for dropdown
  const years = useMemo(() => {
    const allYears = students.map((s) => s.year);
    return ["All", ...new Set(allYears)];
  }, [students]);

  // Filter students by year and sort unpaid followed by paid
  const filteredStudents = useMemo(() => {
    const filtered =
      selectedYear === "All"
        ? students
        : students.filter((s) => s.year === selectedYear);

    console.log("Filtered", filtered);
    let paid = 0;
    let unpaid = 0;

    filtered.forEach((s) => {
      shouldShowBypass(s) ? unpaid++ : paid++;
    });
    setPaid(paid);
    setPending(unpaid);
    return filtered.sort((a, b) => {
      const aNeedsBypass = shouldShowBypass(a);

      const bNeedsBypass = shouldShowBypass(b);

      // Sort unpaid students (true) before paid students (false)
      if (aNeedsBypass === bNeedsBypass) return 0;
      return aNeedsBypass ? -1 : 1;
    });
  }, [students, selectedYear]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Students Table</h2>
        <select
          className="border px-3 py-1 rounded"
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            setCurrentPage(1); // reset to page 1 on filter
          }}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-center items-center gap-6 mb-4 text-sm sm:text-lg font-semibold">
        <div className="text-green-600">✅ Paid: {paid}</div>
        <div className="text-red-600">❌ Pending: {pending}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border bg-white shadow rounded">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-2">Photo</th>
              <th className="p-2">Name</th>
              <th className="p-2">Year</th>
              <th className="p-2">Last Payment</th>
              <th className="p-2">Mode</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((student) => {
              const fullName = `${student.firstname} ${student.middlename} ${student.lastname}`;
              const showBypass = shouldShowBypass(student);
              const paymentDate = showBypass
                ? "—"
                : moment(student.lastPayment?.createdAt).format("YYYY-MM-DD");
              const paymentMode = showBypass
                ? "—"
                : student.lastPayment?.mode || "—";

              return (
                <tr key={student._id} className="border-t hover:bg-gray-100">
                  <td className="p-2">
                    <img
                      src={student.image}
                      alt={fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </td>
                  <td className="p-2">{fullName}</td>
                  <td className="p-2">{student.year}</td>
                  <td className="p-2">{paymentDate}</td>
                  <td className="p-2">{paymentMode}</td>
                  <td className="p-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      {showBypass && (
                        <button
                          onClick={() =>
                            openModal(
                              student._id,
                              student.firstname,
                              student.lastname,
                              student.year
                            )
                          }
                          className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br font-medium rounded-lg text-xs sm:text-sm px-3 sm:px-5 py-1.5 sm:py-2.5 transition"
                        >
                          Bypass
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedAmount(getFeeAmt(student.year));
                          setSelectedStudent(student);
                          setIsModalOpen(true);
                        }}
                        className="text-white bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:bg-gradient-to-br font-medium rounded-lg text-xs sm:text-sm px-3 sm:px-5 py-1.5 sm:py-2.5 transition"
                      >
                        Carry
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1">{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-blue-600">
              Enter Remarks
            </h3>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border p-2 rounded mb-4 resize-none"
              rows={3}
              placeholder="Enter remarks for bypassing... Include (Monthly Fee)"
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            <h3 className="text-lg font-bold mb-2 text-blue-600">
              Enter Amount
            </h3>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="Enter amount"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBypass(selectedStudentId)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <CarryRequest
          student={selectedStudent}
          amount={selectedAmount}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

export default HistoryTable;
