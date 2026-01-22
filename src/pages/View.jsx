import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import { useNavigate } from "react-router-dom";
import StudentTable from "../components/StudentTable.jsx";

const View = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All Year");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  //State to hold dynamic classes
  const [classList, setClassList] = useState([]);

  // Fetch Classes from Backend
  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      // Use the endpoint we discussed (e.g., /api/fee/getFee or /api/fee/classes)
      const response = await axios.get(backendUrl + "/api/fee/getFee", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // If your API returns the fees object, extract the keys
        const feeData = response.data.fees[0];
        const internalKeys = ["_id", "__v", "createdAt", "updatedAt", "registration"];
        
        const dynamicClasses = Object.keys(feeData).filter(
          (key) => !internalKeys.includes(key)
        );
        
        setClassList(dynamicClasses);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes");
    }
  };

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/admin/students");

      if (response.data.success) {
        setList(response.data.students);
        setFilteredList(response.data.students);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch student list.");
    }
  };

  useEffect(() => {
    const loadStudents = async () => {
      await fetchList();
      await fetchClasses();
      setLoading(false);
    };
    loadStudents();
  }, []);
  const handleFilterChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    filterStudents(year, searchQuery);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterStudents(selectedYear, query);
  };

  const filterStudents = (year, query) => {
    let filtered = list;

    if (year !== "All Year") {
      filtered = filtered.filter(
        (student) => student.year.toLowerCase() === year.toLowerCase()
      );
    }

    if (query.trim() !== "") {
      filtered = filtered.filter((student) =>
        `${student.firstname} ${student.middlename || ""} ${student.lastname}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    }

    setFilteredList(filtered);
  };

  const activeStudents = filteredList.filter(
    (student) => student.status === "active"
  );
  const inactiveStudents = filteredList.filter(
    (student) => student.status === "inactive"
  );
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-pink-100 to-red-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-600 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center mb-6">
          <div className="text-left">
            <button
              onClick={() => navigate("/home")}
              className="text-blue-600 hover:underline text-sm md:text-base"
            >
              ← Back to Home
            </button>
          </div>
          <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-800">
            📋 Student Records
          </h2>
          <div></div> {/* Right spacer to balance layout */}
        </div>

        {/* Filter + Search */}
        <div className="mb-8 flex flex-col sm:flex-row justify-end gap-3">
          {/* Search Bar */}
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="🔍 Search student..."
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white text-sm w-full sm:w-60"
          />

          {/* Year Filter */}
            <select
              name="year"
              value={selectedYear}
              onChange={handleFilterChange}
              required
              className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white text-sm w-full sm:w-60"
            >
              <option value="" disabled>
                -- Choose Class --
              </option>
              <option value="All Year">All Year</option>
              
              {/* 3. Map over the dynamic classList */}
              {classList.map((className) => (
                <option key={className} value={className}>
                  {className.replace(/_/g, " ")}
                </option>
              ))}
            </select>

        </div>

        {/* Active Students Table */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-green-600 mb-3">
            ✅ Active Students
          </h3>
          <StudentTable
            students={activeStudents}
            title=""
            emptyMessage={`No active students for ${selectedYear}.`}
          />
        </div>

        {/* Inactive Students Table */}
        <div>
          <h3 className="text-xl font-semibold text-red-600 mb-3">
            ❌ Inactive Students
          </h3>
          <StudentTable
            students={inactiveStudents}
            title=""
            emptyMessage="No inactive students."
          />
        </div>
      </div>
    </div>
  );
};

export default View;
