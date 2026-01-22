import React, { useState } from "react";

const FeeBreakdown = ({ data }) => {
  const [showTable, setShowTable] = useState(false);

 // console.log("Fee Breakdown Data:", data);
  if (!data) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-100 p-6 rounded-2xl shadow text-center">
          <p className="text-lg font-semibold text-gray-700">
            Total Active Students
          </p>
          <p className="text-3xl font-bold text-blue-600">
            {data.totalActiveStudents}
          </p>
        </div>
        <div className="bg-green-100 p-6 rounded-2xl shadow text-center">
          <p className="text-lg font-semibold text-gray-700">
            Predicted Collection
          </p>
          <p className="text-3xl font-bold text-green-600">
            ₹{data.predictedCollection}
          </p>
        </div>
      </div>

      {/* Toggle Button */}
      <div className="text-center">
        <button
          onClick={() => setShowTable(!showTable)}
          className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow hover:bg-indigo-700 transition"
        >
          {showTable ? "Hide Breakdown" : "Show Breakdown"}
        </button>
      </div>

      {/* Breakdown Table (toggle) */}
      {showTable && (
        <div className="bg-white shadow rounded-2xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-center">Students</th>
                <th className="p-3 text-center">Fee Amount</th>
                <th className="p-3 text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.breakdown.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3">{item.year}</td>
                  <td className="p-3 text-center">{item.count}</td>
                  <td className="p-3 text-center">₹{item.feeAmount}</td>
                  <td className="p-3 text-center font-semibold text-gray-800">
                    ₹{item.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeeBreakdown;
