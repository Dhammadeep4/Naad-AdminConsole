import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  Line,
} from "recharts";
import axios from "axios";
import { backendUrl } from "../App";

const PaymentChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/v1/getAnalytics`, {
          headers: {
            Authorization: `Bearer ${token}`, // 🔐 Include JWT token
          },
        });
        const formatted = Object.entries(res.data).map(([month, value]) => ({
          month,
          amount: value.amount,
          uniqueStudents: value.uniqueStudents,
        }));
        console.log("Chart data:", formatted);
        setData(formatted);
      } catch (err) {
        console.error("Error fetching analytics", err);
      }
    };

    fetchStats();
  }, []);

  // Responsive container styles for different screen widths
  const containerStyle = {
    width: "95%", // default width (almost full width)
    maxWidth: 900, // max width for large screens
    height: 400,
    margin: "auto",
  };

  return (
    <div style={containerStyle}>
      <h2 className="text-xl font-bold mb-4" style={{ textAlign: "center" }}>
        📊 Monthly Payment Collection
      </h2>
      <ResponsiveContainer width="100%" height="80%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="amount"
            fill="#4caf50"
            name="Total Amount ₹"
            barSize={20}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="uniqueStudents"
            stroke="#ff9800"
            name="Unique Students"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentChart;
