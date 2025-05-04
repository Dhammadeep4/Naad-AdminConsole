import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import logo from "../assets/logo.jpeg";
const ActiveStudentsStatus = ({ paymentHistory, fetchPaymentHistory }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [amount, setAmount] = useState("");
  const [fee, setFees] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5; // Number of students per page

  //function to fetch fees
  const fetchFees = async (year) => {
    try {
      const formattedYear = year.toLowerCase().replace(/ /g, "_");
      const res = await axios.get(
        `${backendUrl}/api/fee/amount/${formattedYear}`
      );
      console.log("Fees: " + res.data.fee);
      if (res.data.success) return res.data.fee;
      else toast.error(res.data.message || "Could not fetch fees.");
    } catch (error) {
      toast.error("Error fetching fees.");
      console.error(error.message);
    }
  };

  //function to fetch profile
  const fetchProfile = async (student_id) => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/admin/studentProfile/${student_id}`
      );
      if (res.data.success == true) {
        const profile = res.data.profile;

        if (profile) return { profile };
      } // ✅ return the profile
    } catch (error) {
      toast.error("Failed to fetch profile.");
      console.error(error.message);
      return null;
    }
  };
  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/students`);
      if (response.data.success) {
        const activeStudents = response.data.students.filter(
          (student) => student.status === "active"
        );
        setStudents(activeStudents);
      } else {
        toast.error("Failed to fetch students");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching students");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchStudents();
      await fetchPaymentHistory();
      setLoading(false);
    };
    fetchData();
  }, []);

  const getPaymentStatus = (studentId) => {
    const payment = paymentHistory.find(
      (entry) => entry.student_id === studentId
    );

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    if (payment) {
      const paymentDate = new Date(payment.createdAt);
      const isCurrentMonth =
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear;

      return {
        status: isCurrentMonth ? "Paid" : "Unpaid",
        mode: payment.mode || "Unknown",
        payment_id: payment.payment_id || "-",
        payment_date: paymentDate.toLocaleDateString() || "-",
        showBypass: !isCurrentMonth,
      };
    } else {
      return {
        status: "Unpaid",
        mode: "-",
        payment_id: "-",
        payment_date: "-",
        showBypass: true,
      };
    }
  };

  const openModal = (studentId) => {
    setSelectedStudentId(studentId);
    setRemarks("");
    setShowModal(true);
  };

  // function to handle filtering
  const filteredStudents = students.filter(
    (student) =>
      selectedYear === "All" ||
      student.year.toLowerCase().trim() === selectedYear.toLowerCase().trim()
  );

  const handleBypass = async (selectedStudentId) => {
    try {
      const student_id = selectedStudentId;

      const { profile } = await fetchProfile(student_id);
      console.log("Profile:" + profile.firstname + " " + profile.lastname);
      console.log("Amount:" + fee);
      console.log("remarks:" + remarks);

      //generating receipt
      const name = profile.firstname + " " + profile.lastname;
      const year = profile.year;
      const currentDate = new Date().toLocaleDateString();
      const doc = new jsPDF("p", "mm", [120, 160]); // Set page size to A5 (portrait, in mm)

      // Define margins
      const marginTop = 20;
      const marginLeft = 15;
      const marginRight = 15;
      const pageWidth = doc.internal.pageSize.getWidth();

      // Add logo (centered)
      const imgProps = doc.getImageProperties(logo);
      const imgWidth = 50;
      const imgX = (pageWidth - imgWidth) / 2;
      doc.addImage(logo, "JPEG", imgX, marginTop, imgWidth, 20); // y = 10, height = 20

      // Add centered title "Payment Receipt" aligned to the left
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Receipt", marginLeft, marginTop + 30);

      // Add Date aligned to the right
      const dateX = pageWidth - marginRight - 20; // 40px left margin from the right side
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      // Draw a horizontal line below the title
      doc.setLineWidth(0.5);
      doc.line(
        marginLeft,
        marginTop + 35,
        pageWidth - marginRight,
        marginTop + 35
      );

      // Add payment details in a tabular format, centered
      const tableData = [
        { label: "Student Name:", value: name },
        { label: "Student Year:", value: year },
        { label: "Paid Amount:", value: `${amount}` },
        { label: "Reference Id:", value: `${remarks}` },
        { label: "Payment Mode:", value: "Cash" },
      ];

      let y = marginTop + 45; // Starting position for the table

      // Create table content
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text("Date:", dateX - 10, y); // Label "Date" aligned to the right
      doc.text(currentDate, dateX, y); // Date aligned to the right

      y += 10; // Adjust y for the data rows
      tableData.forEach((row) => {
        doc.text(row.label, marginLeft + 5, y); // Description column
        doc.text(row.value, marginLeft + 30, y); // Details column
        y += 8; // Space between rows
      });

      // Draw a line at the bottom of the table
      doc.setLineWidth(0.5);
      doc.line(marginLeft, y + 5, pageWidth - marginRight, y + 5);

      y += 20;
      doc.setFont("helvetica", "bold");
      doc.text(
        "**For any queries email to naadnrutya@gmail.com",
        marginLeft,
        y
      );

      const pdfBase64 = doc.output("datauristring"); // ✅ use 'doc' here
      //generating receipt ends here

      const response = await axios.post(backendUrl + "/api/v1/updateDB", {
        student_id,
        payment_id: remarks,
        amount: amount,
        mode: "cash",
        receipt: pdfBase64,
      });
      if (response.data.success) {
        toast.success("Bypass successful!");
        setShowModal(false);

        // 🔁 RELOAD DATA AFTER UPDATE
        await fetchStudents();
        await fetchPaymentHistory();
      } else {
        toast.error("Bypass failed!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error while bypassing!");
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  // Pagination Logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Count of paid and unpaid students
  const paidCount = students.filter(
    (student) => getPaymentStatus(student._id).status === "Paid"
  ).length;
  const unpaidCount = students.filter(
    (student) => getPaymentStatus(student._id).status === "Unpaid"
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">
          📋 Active Students Payment Status
        </h2>
        {/* Filter Dropdown */}
        <div>
          <label className="mr-2 font-semibold text-gray-700">
            Filter by Year:
          </label>
          <select
            className="border border-gray-300 rounded px-3 py-1"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Chote Nartak">Chote Nartak</option>
            <option value="Prarambhik">Prarambhik</option>
            <option value="Praveshika Pratham">Praveshika Pratham</option>
            <option value="Praveshika Purna">Praveshika Purna</option>
            <option value="Madhyama Pratham">Madhyama Pratham</option>
            <option value="Madhyama Purna">Madhyama Purna</option>
            <option value="Visharad Pratham">Visharad Pratham</option>
            <option value="Visharad Purna">Visharad Purna</option>
          </select>
        </div>

        {filteredStudents.length === 0 ? (
          <p className="text-center text-gray-600 mt-6">
            No students found for selected year.
          </p>
        ) : (
          <>
            {/* ✅ Pending to Paid Ratio */}
            <div className="flex justify-center items-center mb-6 text-lg font-semibold space-x-8">
              <div className="text-green-600">✅ Paid: {paidCount}</div>
              <div className="text-red-600">❌ Pending: {unpaidCount}</div>
            </div>

            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border px-4 py-2">#</th>
                    <th className="border px-4 py-2">Name</th>
                    <th className="border px-4 py-2">Year</th>
                    <th className="border px-4 py-2">Payment Status</th>
                    <th className="border px-4 py-2">Payment Mode</th>
                    <th className="border px-4 py-2">Payment ID</th>
                    <th className="border px-4 py-2">Payment Date</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentStudents.map((student, index) => {
                    const {
                      status,
                      mode,
                      payment_id,
                      payment_date,
                      showBypass,
                    } = getPaymentStatus(student._id);
                    return (
                      <tr key={student._id} className="text-center">
                        <td className="border px-4 py-2">{index + 1}</td>
                        <td className="border px-4 py-2">
                          {student.firstname} {student.lastname}
                        </td>
                        <td className="border px-4 py-2">{student.year}</td>
                        <td
                          className={`border px-4 py-2 font-semibold ${
                            status === "Paid"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {status}
                        </td>
                        <td className="border px-4 py-2">{mode}</td>
                        <td className="border px-4 py-2">{payment_id}</td>
                        <td className="border px-4 py-2">{payment_date}</td>
                        <td className="border px-4 py-2">
                          {showBypass && (
                            <button
                              onClick={() => openModal(student._id)}
                              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-md"
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

            {/* Pagination Controls */}
            <div className="flex justify-center mt-4 space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-blue-600">
              Enter Remarks
            </h3>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md mb-4 resize-none"
              rows="4"
              placeholder="Enter remarks for bypassing..."
            />
            <h3 className="text-xl font-bold mb-4 text-blue-600">
              Enter Amount
            </h3>
            <textarea
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md mb-4 resize-none"
              rows="1"
              placeholder="Enter amount "
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBypass(selectedStudentId)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
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
