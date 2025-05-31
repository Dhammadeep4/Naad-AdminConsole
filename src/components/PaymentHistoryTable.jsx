import React, { useState } from "react";
import moment from "moment";
import jsPDF from "jspdf";
import logo from "../assets/naad_logo.png";

const PaymentHistoryTable = ({ user, paymentHistory }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null); // track downloading state
  const entriesPerPage = 6;

  if (!paymentHistory || paymentHistory.length === 0) {
    return <p>No payment history available.</p>;
  }

  const totalPages = Math.ceil(paymentHistory.length / entriesPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const paginatedData = paymentHistory.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const downloadReceipt = async (payment) => {
    setDownloadingId(payment._id); // disable button for this payment

    try {
      const name = user.firstname + " " + user.middlename + " " + user.lastname;
      const year = user.year;
      const doc = new jsPDF("p", "mm", [120, 160]);

      const marginTop = 20;
      const marginLeft = 15;
      const marginRight = 15;
      const pageWidth = doc.internal.pageSize.getWidth();

      const imgProps = doc.getImageProperties(logo);
      const imgWidth = 50;
      const imgX = (pageWidth - imgWidth) / 2;
      doc.addImage(logo, "JPEG", imgX, marginTop, imgWidth, 20);

      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Receipt", marginLeft, marginTop + 30);

      const dateX = pageWidth - marginRight - 20;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setLineWidth(0.5);
      doc.line(
        marginLeft,
        marginTop + 35,
        pageWidth - marginRight,
        marginTop + 35
      );

      const tableData = [
        { label: "Student Name:", value: name },
        { label: "Student Year:", value: year },
        { label: "Paid Amount:", value: payment.amount.toString() },
        { label: "Reference Id:", value: payment.payment_id },
        { label: "Remark:", value: payment.remark },
        { label: "Payment Mode:", value: payment.mode },
      ];

      let y = marginTop + 45;

      doc.text("Date:", dateX - 10, y);
      doc.text(moment(payment.date).format("YYYY-MM-DD"), dateX, y);

      y += 10;
      tableData.forEach((row) => {
        doc.text(row.label, marginLeft + 5, y);
        doc.text(row.value, marginLeft + 30, y);
        y += 8;
      });

      doc.setLineWidth(0.5);
      doc.line(marginLeft, y + 5, pageWidth - marginRight, y + 5);

      y += 20;
      doc.setFont("helvetica", "bold");
      doc.text(
        "**For any queries email to naadnrutya@gmail.com",
        marginLeft,
        y
      );

      doc.save(`Receipt_${name}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloadingId(null); // re-enable button
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Payment History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border bg-white shadow rounded">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Mode</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Remark</th>
              <th className="p-2 border">Download Receipt</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((payment) => (
              <tr key={payment._id} className="border-t hover:bg-gray-100">
                <td className="p-2 border">
                  {moment(payment.updatedAt).format("YYYY-MM-DD")}
                </td>
                <td className="p-2 border">{payment.mode}</td>
                <td className="p-2 border">{payment.amount}</td>
                <td className="p-2 border">{payment.remark}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => downloadReceipt(payment)}
                    disabled={downloadingId === payment._id}
                    className={`bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center
                      ${
                        downloadingId === payment._id
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-400"
                      }
                    `}
                  >
                    {downloadingId === payment._id
                      ? "Downloading..."
                      : "Download"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryTable;
