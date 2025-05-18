import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";
import { MdOutlineDelete } from "react-icons/md";

const StudentTable = ({ students, title, emptyMessage, itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(students.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = students.slice(startIndex, startIndex + itemsPerPage);

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
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="border p-2 whitespace-nowrap">Image</th>
                  <th className="border p-2 whitespace-nowrap">First Name</th>
                  <th className="border p-2 whitespace-nowrap">Middle Name</th>
                  <th className="border p-2 whitespace-nowrap">Last Name</th>
                  <th className="border p-2 whitespace-nowrap">Address</th>
                  <th className="border p-2 whitespace-nowrap">Contact</th>
                  <th className="border p-2 whitespace-nowrap">DOB</th>
                  <th className="border p-2 whitespace-nowrap">DOJ</th>
                  <th className="border p-2 whitespace-nowrap">Year</th>
                  <th className="border p-2 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((user, index) => (
                  <tr
                    key={index}
                    className="text-center hover:bg-gray-50 transition"
                  >
                    <td className="border p-2">
                      <img
                        src={user.image}
                        alt="User"
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg mx-auto"
                      />
                    </td>
                    <td className="border p-2 break-words">{user.firstname}</td>
                    <td className="border p-2 break-words">
                      {user.middlename}
                    </td>
                    <td className="border p-2 break-words">{user.lastname}</td>
                    <td className="border p-2 break-words">{user.address}</td>
                    <td className="border p-2 break-words">{user.contact}</td>
                    <td className="border p-2">{user.dob}</td>
                    <td className="border p-2">{user.doj}</td>
                    <td className="border p-2">{user.year}</td>
                    <td className="border p-2">
                      <div className="flex justify-center gap-3 text-xl">
                        <NavLink to={`/profile/${user._id}`}>
                          <BsInfoCircle className="text-green-800" />
                        </NavLink>
                        <NavLink to={`/edit/${user._id}`}>
                          <AiOutlineEdit className="text-yellow-600" />
                        </NavLink>
                        <NavLink to={`/delete/${user._id}`}>
                          <MdOutlineDelete className="text-red-600" />
                        </NavLink>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-lg">{`${currentPage} of ${totalPages}`}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
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
