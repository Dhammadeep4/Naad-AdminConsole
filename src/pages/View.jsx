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

  // Fetch students
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
      console.log(error.message);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Handle Year Filter
  const handleFilterChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);

    if (year === "All Year") {
      setFilteredList(list);
    } else {
      setFilteredList(
        list.filter(
          (student) => student.year.toLowerCase() === year.toLowerCase()
        )
      );
    }
  };

  // Separate Active and Inactive Students
  const activeStudents = filteredList.filter(
    (student) => student.status === "active"
  );
  const inactiveStudents = filteredList.filter(
    (student) => student.status === "inactive"
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-6xl bg-white p-6 rounded-2xl shadow-xl">
        <button
          onClick={() => navigate("/home")}
          className="text-blue-500 hover:underline mb-4"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Student Details
        </h2>

        {/* Dropdown Filter */}
        <div className="mb-6 flex justify-end">
          <select
            value={selectedYear}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All Year">All Year</option>
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

        {/* Active Students */}
        <StudentTable
          students={activeStudents}
          title="Active Students"
          emptyMessage={`No active students for ${selectedYear}.`}
        />

        {/* Inactive Students */}
        <StudentTable
          students={inactiveStudents}
          title="Inactive Students"
          emptyMessage="No inactive students."
        />
      </div>
    </div>
  );
};

export default View;
