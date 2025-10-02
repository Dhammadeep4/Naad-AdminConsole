import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { saveAs } from "file-saver";
import { backendUrl } from "../App";
import PaymentChart from "./PaymentChart";
const Analytics = ({ paymentHistory, students, paymentRequests }) => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(false); // Loader state
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

    //console.log("Sorted Analytics:", sortedAnalytics);
    return sortedAnalytics;
  };

  const monthlyAnalytics = getMonthlyAnalytics();

  const getExcel = async () => {
    if (!selectedMonth) return;
    setLoading(true); // Start loader
    try {
      const [year, month] = selectedMonth.split("-");
      const selectedDate = new Date(year, parseInt(month) - 1);
      const today = new Date();
      today.setDate(1);

      if (selectedDate > today) {
        alert("❌ Cannot generate Excel for a future month.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${backendUrl}/api/v1/getMonthHistory/${month}/${year}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payments_${year}_${month}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating Excel report:", error);
    } finally {
      setLoading(false); // Stop loader
    }
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
                onClick={selectedMonth ? getExcel : undefined}
                disabled={!selectedMonth || loading}
                className={`px-5 py-2 rounded text-white font-medium transition ${
                  selectedMonth && !loading
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Please wait..." : "📥 Download Excel"}
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

        <PaymentChart></PaymentChart>
      </div>
    </>
  );
};

export default Analytics;
