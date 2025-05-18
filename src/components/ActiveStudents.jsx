import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import logo from "../assets/logo.jpeg";

const ActiveStudentsStatus = ({
  fetchProfile,
  paymentHistory,
  fetchPaymentHistory,
  students,
  fetchStudents,
}) => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  useEffect(() => {
    const init = async () => {
      await fetchStudents();
      await fetchPaymentHistory();
      setLoading(false);
    };
    init();
  }, []);

  const getPaymentStatus = (studentId) => {
    const entry = paymentHistory.find((e) => e.student_id === studentId);
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    if (entry) {
      const paymentDate = new Date(entry.createdAt);
      const isCurrent =
        paymentDate.getMonth() === thisMonth &&
        paymentDate.getFullYear() === thisYear;

      return {
        status: isCurrent ? "Paid" : "Unpaid",
        mode: entry.mode || "Unknown",
        payment_id:
          entry.payment_id === "N/A" ? entry.remark : entry.payment_id || "-",
        payment_date: paymentDate.toLocaleDateString(),
        showBypass: !isCurrent,
      };
    }
    return {
      status: "Unpaid",
      mode: "-",
      payment_id: "-",
      payment_date: "-",
      showBypass: true,
    };
  };

  const openModal = (id) => {
    setSelectedStudentId(id);
    setRemarks("");
    setAmount("");
    setShowModal(true);
  };

  const handleBypass = async (id) => {
    if (!remarks.toLowerCase().includes("monthly fee")) {
      setError('Remarks must include "Monthly Fee".');
      return;
    }
    setError(""); // Clear error if valid
    //console.log("Generating receipt");
    const profile = await fetchProfile(id);
    if (!profile) return;

    const doc = new jsPDF("p", "mm", [120, 160]);
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = { top: 20, left: 15, right: 15 };

    const imgWidth = 50;
    const imgX = (pageWidth - imgWidth) / 2;
    doc.addImage(logo, "JPEG", imgX, margin.top, imgWidth, 20);
    doc.setFont("helvetica", "bold").setFontSize(22);
    doc.text("Payment Receipt", margin.left, margin.top + 30);
    doc
      .setLineWidth(0.5)
      .line(
        margin.left,
        margin.top + 35,
        pageWidth - margin.right,
        margin.top + 35
      );

    const table = [
      {
        label: "Student Name:",
        value: `${profile.firstname} ${profile.lastname}`,
      },
      { label: "Student Year:", value: profile.year },
      { label: "Paid Amount:", value: amount },
      { label: "Reference Id:", value: remarks },
      { label: "Payment Mode:", value: "Cash" },
    ];

    let y = margin.top + 45;
    doc.setFontSize(10).setFont("helvetica", "normal");
    doc.text("Date:", pageWidth - 45, y);
    doc.text(new Date().toLocaleDateString(), pageWidth - 25, y);
    y += 10;

    table.forEach((row) => {
      doc.text(row.label, margin.left + 5, y);
      doc.text(row.value, margin.left + 30, y);
      y += 8;
    });

    doc.line(margin.left, y + 5, pageWidth - margin.right, y + 5);
    doc.setFont("helvetica", "bold");
    doc.text(
      "**For any queries email to naadnrutya@gmail.com",
      margin.left,
      y + 20
    );
    const pdfBase64 = doc.output("datauristring");

    try {
      //console.log("Entering here");
      const res = await axios.post(`${backendUrl}/api/v1/updateDB`, {
        student_id: id,
        payment_id: remarks + ` for ${profile.firstname}`,
        remark: remarks + ` for ${profile.firstname}`,
        amount,
        mode: "cash",
        receipt: pdfBase64,
      });
      if (res.data.success) {
        toast.success("Bypass successful!");
        setShowModal(false);
        await fetchStudents();
        await fetchPaymentHistory();
      } else toast.error("Bypass failed!");
    } catch {
      toast.error("Error while bypassing!");
    }
  };

  // Filter and sort before pagination
  const filteredStudents = students.filter(
    (s) =>
      selectedYear === "All" ||
      s.year.toLowerCase().trim() === selectedYear.toLowerCase().trim()
  );

  const sortedFilteredStudents = [...filteredStudents].sort((a, b) => {
    const aStatus = getPaymentStatus(a._id).status;
    const bStatus = getPaymentStatus(b._id).status;

    if (aStatus === "Unpaid" && bStatus === "Paid") return -1;
    if (aStatus === "Paid" && bStatus === "Unpaid") return 1;
    return 0;
  });

  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = sortedFilteredStudents.slice(
    indexOfFirst,
    indexOfLast
  );

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const paidCount = students.filter(
    (s) => getPaymentStatus(s._id).status === "Paid"
  ).length;
  const unpaidCount = students.length - paidCount;

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl sm:text-3xl font-bold text-center mb-6 text-blue-700">
          📋 Active Students Monthly Fee Status
        </h2>

        <div className="mb-4">
          <label className="mr-2 font-semibold text-gray-700">
            Filter by Year:
          </label>
          <select
            className="border border-gray-300 rounded px-3 py-1"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Chote nartak">Chote Nartak</option>
            <option value="Prarambhik">Prarambhik</option>
            <option value="Praveshika pratham">Praveshika pratham</option>
            <option value="Praveshika purna">Praveshika purna</option>
            <option value="Praveshika purna batch1">
              Praveshika purna Batch1
            </option>
            <option value="Madhyama pratham">Madhyama pratham</option>
            <option value="Madhyama purna">Madhyama purna</option>
            <option value="Madhyama purna batch1">Madhyama purna Batch1</option>
            <option value="Visharad pratham">Visharad pratham</option>
            <option value="Visharad purna">Visharad purna</option>
          </select>
        </div>

        {filteredStudents.length === 0 ? (
          <p className="text-center text-gray-600 mt-6">
            No students found for selected year.
          </p>
        ) : (
          <>
            <div className="flex justify-center items-center gap-6 mb-4 text-sm sm:text-lg font-semibold">
              <div className="text-green-600">✅ Paid: {paidCount}</div>
              <div className="text-red-600">❌ Pending: {unpaidCount}</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-blue-100">
                  <tr>
                    {[
                      "#",
                      "Name",
                      "Year",
                      "Status",
                      "Mode",
                      "Payment ID",
                      "Date",
                      "Actions",
                    ].map((title, i) => (
                      <th key={i} className="border px-2 sm:px-4 py-2">
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student, i) => {
                    const {
                      status,
                      mode,
                      payment_id,
                      payment_date,
                      showBypass,
                    } = getPaymentStatus(student._id);

                    return (
                      <tr key={student._id} className="text-center">
                        <td className="border px-2 py-2">{i + 1}</td>
                        <td className="border px-2 py-2">
                          {student.firstname} {student.lastname}
                        </td>
                        <td className="border px-2 py-2">{student.year}</td>
                        <td
                          className={`border px-2 py-2 font-semibold ${
                            status === "Paid"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {status}
                        </td>
                        <td className="border px-2 py-2">{mode}</td>
                        <td className="border px-2 py-2">{payment_id}</td>
                        <td className="border px-2 py-2">{payment_date}</td>
                        <td className="border px-2 py-2">
                          {showBypass && (
                            <button
                              onClick={() => openModal(student._id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                            >
                              Bypass
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-4 gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
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
    </div>
  );
};

export default ActiveStudentsStatus;
