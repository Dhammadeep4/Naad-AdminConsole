import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  LabelList,
} from "recharts";
import axios from "axios";
import { backendUrl } from "../App";

const PaymentChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${backendUrl}/api/v1/getAnalyticsRevised`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Format response for recharts
        const formatted = res.data.map((item) => ({
          month: `${item.year}-${item.month}`, // e.g. 2025-5
          totalCollection: item.totalCollection,
          studentCount: item.studentCount,
        }));

        setData(formatted);
      } catch (err) {
        console.error("Error fetching analytics", err);
      }
    };

    fetchStats();
  }, []);

  const containerStyle = {
    width: "95%",
    maxWidth: 900,
    height: 400,
    margin: "auto",
  };

  return (
    <div style={containerStyle}>
      <h2 className="text-xl font-bold mb-4" style={{ textAlign: "center" }}>
        📊 Monthly Total Collection
      </h2>
      <ResponsiveContainer width="100%" height="80%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="totalCollection"
            fill="#4caf50"
            name="Total Collection ₹"
            barSize={40}
          >
            {/* 👇 Show student count on top of each bar */}
            <LabelList
              dataKey="studentCount"
              position="top"
              formatter={(value) => `${value} students`}
              style={{ fontSize: 12, fill: "#333" }}
            />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentChart;
