import React from "react";

const Analytics = ({ paymentHistory }) => {
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
        monthlyData[key].totalAmount += parseInt(payment.amount, 10);
      }

      if (payment.student_id) {
        monthlyData[key].studentIds.add(payment.student_id); // Adjust key if needed
      }
    });

    // Sort by newest month
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

  return (
    <>
      {/* 📆 Monthly Fee Analytics */}
      <div className="bg-blue-50 p-4 rounded-lg shadow mb-6">
        <h3 className="text-2xl font-semibold text-blue-700 mb-4">
          📆 Monthly Fee Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlyAnalytics.map(({ monthYear, totalAmount, studentCount }) => (
            <div
              key={monthYear}
              className="bg-white p-4 rounded-lg shadow text-center"
            >
              <p className="text-xl font-bold text-gray-800">{monthYear}</p>
              <p className="text-green-600 font-semibold text-lg">
                💰 ₹{totalAmount.toLocaleString()}
              </p>
              <p className="text-purple-600 font-medium text-md">
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
