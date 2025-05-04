import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";
import { MdOutlineDelete } from "react-icons/md";
const StudentTable = ({ students, title, emptyMessage, itemsPerPage = 5 }) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Total number of pages
  const totalPages = Math.ceil(students.length / itemsPerPage);

  // Logic to get students for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = students.slice(startIndex, startIndex + itemsPerPage);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="mb-10">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">{title}</h3>
      {students.length > 0 ? (
        <>
          <table className="w-full border-collapse border border-gray-300 mb-6">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Image</th>
                <th className="border border-gray-300 p-2">First Name</th>
                <th className="border border-gray-300 p-2">Middle Name</th>
                <th className="border border-gray-300 p-2">Last Name</th>
                <th className="border border-gray-300 p-2">Address</th>
                <th className="border border-gray-300 p-2">Contact</th>
                <th className="border border-gray-300 p-2">DOB</th>
                <th className="border border-gray-300 p-2">DOJ</th>
                <th className="border border-gray-300 p-2">Year</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((user, index) => (
                <tr key={index} className="text-center">
                  <td className="border border-gray-300 p-2">
                    <img
                      src={user.image}
                      alt="User"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    {user.firstname}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {user.middlename}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {user.lastname}
                  </td>
                  <td className="border border-gray-300 p-2">{user.address}</td>
                  <td className="border border-gray-300 p-2">{user.contact}</td>
                  <td className="border border-gray-300 p-2">{user.dob}</td>
                  <td className="border border-gray-300 p-2">{user.doj}</td>
                  <td className="border border-gray-300 p-2">{user.year}</td>
                  <td className="border border-gray-300 p-2">
                    <div className="flex justify-center gap-x-4">
                      <NavLink to={`/profile/${user._id}`}>
                        <BsInfoCircle className="text-2xl text-green-800" />
                      </NavLink>
                      <NavLink to={`/edit/${user._id}`}>
                        <AiOutlineEdit className="text-2xl text-yellow-600" />
                      </NavLink>
                      <NavLink to={`/delete/${user._id}`}>
                        <MdOutlineDelete className="text-2xl text-red-600" />
                      </NavLink>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center space-x-2 mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Previous
            </button>
            <span className="text-lg">{`${currentPage} of ${totalPages}`}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">{emptyMessage}</p>
      )}
    </div>
  );
};

export default StudentTable;
