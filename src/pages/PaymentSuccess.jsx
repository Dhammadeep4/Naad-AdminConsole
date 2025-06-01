import React, { useState, useEffect } from "react";
import "../styles/PaymentSuccess.css";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";

const PaymentSuccess = () => {
  const [paymentId, setPaymentId] = useState("");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const update = async () => {
      // const user = JSON.parse(localStorage.getItem("user")); // ✅ Parse JSON

      // console.log(user);
      // const { _id } = user;
      const query = new URLSearchParams(window.location.search);
      const payment_id = query.get("reference");
      const amountVal = query.get("amount");
      const remarkVal = query.get("remarks");
      const student_id = query.get("uid");
      const currentDate = new Date().toLocaleDateString();
      // Set values into state to use in JSX
      setPaymentId(payment_id);
      setAmount(amountVal);
      setRemark(remarkVal);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Session expired. Please log in again.");
          return;
        }
        // update DB
        //console.log("Student ID:", student_id);
        const response = await axios.post(
          `${backendUrl}/api/v1/updateDB`,
          {
            student_id,
            payment_id,
            mode: "online",
            remark: remarkVal,
            amount: amountVal,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // 🔐 Include JWT token
            },
          }
        );

        if (response.data.success) {
          toast.success("Payments collection updated");
        } else {
          toast.error("Payments collection not updated");
        }

        //console.log("remark:" + remarkVal);
      } catch (err) {
        console.error("Update failed", err.message);
        toast.error("Something went wrong.");
      }

      setTimeout(() => navigate("/studenthome"), 5000);
    };

    update();
  }, []);

  return (
    <div className="payment-container bg-gradient-to-br from-pink-100 to-red-200">
      <div className="payment-display-card">
        <h1 className="payment-success-title">Payment Successful</h1>
        <p className="payment-message">
          Thank you for your payment. Your transaction was successful. Kindly
          save the receipt generated. In case of any issues, contact the
          administrator or email at naadnrutya@gmail.com
        </p>
        {paymentId && (
          <p className="payment-reference">
            <strong>Reference ID:</strong> {paymentId}
          </p>
        )}
        <p className="text-sm text-gray-500 mt-4">
          Redirecting you to the homepage in 10 seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
