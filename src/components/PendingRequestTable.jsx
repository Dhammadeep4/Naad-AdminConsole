import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import logo from "../assets/logo.jpeg";

const PendingRequestsTable = ({
  fetchProfile,
  paymentRequests,
  students,
  onBypassSuccess,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [requestRemark, setRequestRemark] = useState("");
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const studentMap = {};
  students.forEach((student) => {
    studentMap[student._id] = student;
  });

  const enrichedRequests = paymentRequests.map((request) => ({
    ...request,
    student: studentMap[request.student_id] || {},
  }));

  const openModal = (id, reqRemark, amt) => {
    setSelectedStudentId(id);
    setRequestRemark(reqRemark);
    setRemarks("");
    setAmount(amt);
    setError("");
    setShowModal(true);
  };

  const handleBypass = async (id) => {
    if (!remarks.toLowerCase().includes("cash collected")) {
      setError('Remarks must include "Cash Collected".');
      return;
    }

    setError("");
    setLoading(true);
    try {
      const profile = await fetchProfile(id);
      if (!profile) {
        setLoading(false);
        return;
      }

      const doc = new jsPDF("p", "mm", [120, 160]);
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = { top: 20, left: 15, right: 15 };

      const imgWidth = 50;
      const imgX = (pageWidth - imgWidth) / 2;
      doc.addImage(logo, "JPEG", imgX, margin.top, imgWidth, 20);
      doc.setFont("helvetica", "bold").setFontSize(22);
      doc.text("Payment Receipt", margin.left, margin.top + 30);
      doc
        .setLineWidth(0.5)
        .line(
          margin.left,
          margin.top + 35,
          pageWidth - margin.right,
          margin.top + 35
        );

      const table = [
        {
          label: "Student Name:",
          value: `${profile.firstname} ${profile.lastname}`,
        },
        { label: "Student Year:", value: profile.year },
        { label: "Paid Amount:", value: amount },
        { label: "Remark:", value: requestRemark },
        { label: "Payment Mode:", value: "Cash" },
      ];

      let y = margin.top + 45;
      doc.setFontSize(10).setFont("helvetica", "normal");
      doc.text("Date:", pageWidth - 45, y);
      doc.text(new Date().toLocaleDateString(), pageWidth - 25, y);
      y += 10;

      table.forEach((row) => {
        doc.text(row.label, margin.left + 5, y);
        doc.text(row.value, margin.left + 30, y);
        y += 8;
      });

      doc.line(margin.left, y + 5, pageWidth - margin.right, y + 5);
      doc.setFont("helvetica", "bold");
      doc.text(
        "**For any queries email to naadnrutya@gmail.com",
        margin.left,
        y + 20
      );
      const pdfBase64 = doc.output("datauristring");

      const res = await axios.post(`${backendUrl}/api/v1/updateDB`, {
        student_id: id,
        payment_id: remarks + ` for ${profile.firstname}`,
        remark: remarks,
        amount,
        mode: "cash",
        receipt: pdfBase64,
      });

      if (res.data.success) {
        toast.success("Bypass successful!");
        setShowModal(false);
        onBypassSuccess(); // Refresh the data
      } else {
        toast.error("Bypass failed!");
      }
    } catch (err) {
      toast.error("Error while bypassing!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 relative max-w-full px-2 sm:px-4 md:px-6 lg:px-0 mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 text-center sm:text-left">
        📋 Pending Payment Requests
      </h2>

      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {enrichedRequests.length === 0 ? (
        <div className="p-4 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg text-center sm:text-left">
          No pending payment requests found.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
          <table className="min-w-full text-xs sm:text-sm bg-white">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-2 sm:px-4 py-2 border-b">Student Name</th>
                <th className="px-2 sm:px-4 py-2 border-b">Contact</th>
                <th className="px-2 sm:px-4 py-2 border-b">Amount</th>
                <th className="px-2 sm:px-4 py-2 border-b">Remarks</th>
                <th className="px-2 sm:px-4 py-2 border-b">Payment ID</th>
                <th className="px-2 sm:px-4 py-2 border-b">Requested On</th>
              </tr>
            </thead>
            <tbody>
              {enrichedRequests.map((request, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-2 border-b whitespace-nowrap">
                    {request.student.firstname || "N/A"}{" "}
                    {request.student.lastname || ""}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border-b whitespace-nowrap">
                    {request.student.contact || "N/A"}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border-b whitespace-nowrap">
                    ₹{request.amount}
                  </td>
                  <td
                    className="px-2 sm:px-4 py-2 border-b max-w-xs truncate"
                    title={request.remark}
                  >
                    {request.remark}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border-b whitespace-nowrap">
                    {request.payment_id.includes(request.student_id) ? (
                      <button
                        className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br font-medium rounded-lg text-xs sm:text-sm px-3 sm:px-5 py-1.5 sm:py-2.5 transition"
                        onClick={() =>
                          openModal(
                            request.student_id,
                            request.remark,
                            request.amount
                          )
                        }
                      >
                        Bypass
                      </button>
                    ) : (
                      request.payment_id
                    )}
                  </td>
                  <td className="px-2 sm:px-4 py-2 border-b whitespace-nowrap">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4 sm:px-6">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-blue-600 text-center sm:text-left">
              Enter Remarks
            </h3>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border p-2 rounded mb-4 resize-none text-sm sm:text-base"
              rows={3}
              placeholder="Enter remarks for bypassing... Include (Cash Collected)"
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-blue-600">
              Amount
            </h3>
            <input
              type="number"
              value={amount}
              disabled={true}
              className="w-full border p-2 rounded mb-4 text-sm sm:text-base"
              placeholder="Enter amount"
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBypass(selectedStudentId)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm sm:text-base"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequestsTable;
