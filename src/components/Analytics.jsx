import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Analytics = ({ paymentHistory, students, paymentRequests }) => {
  const [selectedMonth, setSelectedMonth] = useState("");

  const getMonthlyAnalytics = () => {
    const monthlyData = {};

    paymentHistory.forEach((payment) => {
      const date = new Date(payment.createdAt);
      const year = date.getFullYear();
      const month = date.toLocaleString("default", { month: "long" });
      const key = `${month} ${year}`;

      if (!monthlyData[key]) {
        monthlyData[key] = {
          totalAmount: 0,
          studentIds: new Set(),
        };
      }

      if (payment.amount || payment.amount === 0) {
        if (payment.request === "completed") {
          monthlyData[key].totalAmount += parseInt(payment.amount, 10);
        }
      }

      if (payment.student_id) {
        monthlyData[key].studentIds.add(payment.student_id);
      }
    });

    const sortedAnalytics = Object.entries(monthlyData)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .map(([monthYear, data]) => ({
        monthYear,
        totalAmount: data.totalAmount,
        studentCount: data.studentIds.size,
      }));

    return sortedAnalytics;
  };

  const monthlyAnalytics = getMonthlyAnalytics();

  const generateExcel = () => {
    if (!students || students.length === 0) {
      alert("Student data not loaded.");
      return;
    }
    if (!selectedMonth) return;

    const [year, month] = selectedMonth.split("-");
    const selectedDate = new Date(year, parseInt(month) - 1); // Month is 0-based
    const today = new Date();
    today.setDate(1); // Normalize to first of the month

    if (selectedDate > today) {
      alert("❌ Cannot generate Excel for a future month.");
      return;
    }
    const selectedMonthNum = parseInt(month);

    // Get paid entries for selected month
    const paidEntries = paymentHistory.filter((entry) => {
      const date = new Date(entry.createdAt);
      return (
        date.getFullYear() === parseInt(year) &&
        date.getMonth() + 1 === selectedMonthNum
      );
    });

    const paidStudentIds = new Set(
      paidEntries.map((entry) => entry.student_id)
    );

    // Prepare paid rows
    const paidData = paidEntries.map((entry) => {
      const student = students?.find(
        (s) => String(s._id) === String(entry.student_id)
      );

      return {
        Name: `${student?.firstname || "Unknown"} ${student?.lastname || ""}`,
        Year: student?.year || "-",
        Amount: entry.amount || 0,
        Mode: entry.mode || "Unknown",
        Payment_ID: entry.payment_id || "-",
        Date: new Date(entry.createdAt).toLocaleDateString(),
        Remark: entry.remark,
      };
    });

    // Prepare unpaid rows
    const unpaidData =
      students
        ?.filter((student) => !paidStudentIds.has(student._id))
        .map((student) => ({
          Name: `${student.firstname} ${student.lastname}`,
          Year: student.year || "-",
          Amount: 0,
          Mode: "Unpaid",
          Payment_ID: "-",
          Date: "-",
          Remark: "Unpaid",
        })) || [];

    const finalData = [...paidData, ...unpaidData];

    if (finalData.length === 0) {
      alert("No records found for selected month.");
      return;
    }

    // Generate Excel
    const worksheet = XLSX.utils.json_to_sheet(finalData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `Payments_${selectedMonth}.xlsx`);
  };

  return (
    <>
      {/* 📆 Monthly Fee Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-md max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h3 className="text-2xl font-semibold text-blue-700 text-center md:text-left">
            📆 Monthly Fee Analytics
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mx-auto md:mx-0 relative">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="flex-grow border border-gray-300 rounded px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="relative flex items-center gap-2">
              <button
                onClick={selectedMonth ? generateExcel : undefined}
                disabled={!selectedMonth}
                className={`px-5 py-2 rounded text-white font-medium transition ${
                  selectedMonth
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                📥 Download Excel
              </button>

              {!selectedMonth && (
                <div className="group relative flex items-center">
                  <span className="text-gray-400 cursor-default select-none">
                    ℹ️
                  </span>
                  <div
                    className="
                absolute 
                bottom-full 
                mb-2 
                left-1/2 
                -translate-x-1/2 
                bg-black 
                text-white 
                text-xs 
                rounded 
                px-3 
                py-1 
                opacity-0 
                group-hover:opacity-100 
                pointer-events-none 
                transition-opacity 
                whitespace-nowrap 
                z-50 
                shadow-lg
                max-w-xs
                break-words
              "
                    style={{ minWidth: "150px" }}
                  >
                    Select a month first
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {monthlyAnalytics.map(({ monthYear, totalAmount, studentCount }) => (
            <div
              key={monthYear}
              className="bg-blue-50 rounded-lg p-5 shadow hover:shadow-lg transition cursor-default"
            >
              <p className="text-lg font-semibold text-blue-900 mb-2">
                {monthYear}
              </p>
              <p className="text-green-700 font-bold text-xl mb-1">
                💰 ₹{totalAmount.toLocaleString()}
              </p>
              <p className="text-purple-700 font-medium text-md">
                👥 Students: {studentCount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Analytics;
