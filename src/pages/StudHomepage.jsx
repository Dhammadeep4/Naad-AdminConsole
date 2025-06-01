import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import PaymentHistoryTable from "../components/PaymentHistoryTable.jsx";
const StudHomepage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState({});
  const [amount, setAmount] = useState(0);
  const [payment_History, setPayment_History] = useState([]);
  const [feesFlag, setFeesFlag] = useState(false);
  const [registrationFlag, setRegistrationFlag] = useState(false);
  const [arrearsFlag, setArrearsflag] = useState(false);
  const [lastPaymentDate, setLastPaymentDate] = useState(false);
  const [feeAmt, setFeeAmt] = useState(0);
  const [regAmt, setRegAmt] = useState(0);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [lastPayment, setLastPayment] = useState();
  const [day, setDay] = useState();
  const remark = "Monthly Fee";
  const getProfile = async () => {
    try {
      const {
        _id,
        firstname,
        middlename,
        lastname,
        address,
        contact,
        dob,
        doj,
        year,
        image,
        status,
      } = user;
      // console.log("user", user);
      if (status === "inactive") {
        toast.error(
          "Your account is inactive. Please contact the administrator."
        );
        localStorage.removeItem("user"); // clear stored user
        setUser(null); // reset state if needed
        navigate("/login"); // redirect to login
        return; // stop further execution
      } else {
        const profile = {
          firstname,
          lastname,
          middlename,
          address,
          contact,
          image,
          dob,
          doj,
          year,
          _id,
        };
        setStudent(profile);
        //console.log("-id", user._id);
        await fetchHistory(user._id);
        await fetchPending(user._id);
        let lastDate = await fetchlastPayment(user._id);

        //console.log("lastDate", moment(lastDate));
        let registration = 0;
        let diffInMonths = 0;
        if (lastDate === undefined) {
          registration = await fetchFees("registration");
          setRegAmt(registration);
          setFeesFlag(true);
          setRegistrationFlag(true);
        }
        // console.log(lastDate);

        let fee = await fetchFees(profile.year);
        setFeeAmt(fee);
        //console.log("Registration", registration);
        let feedate = moment().startOf("month"); //1st of every month
        // console.log("Date", feedate);
        //check fee logic with manipulated dates
        // lastDate = moment("2025-05-31 09:38:09");
        // feedate = moment("2025-06-1 17:19:00");
        if (moment(lastDate).isBefore(feedate)) {
          setFeesFlag(true);
          diffInMonths = feedate.diff(lastDate, "months");
          if (diffInMonths > 0) {
            setArrearsflag(true);
          }
        } //ends here
        if (lastDate != null && moment(lastDate.date).isSame(feedate)) {
          setFeesFlag(false);
        }
        if (lastDate != null && moment(lastDate.date).isBefore(feedate)) {
          setFeesFlag(true);
          diffInMonths = feedate.diff(lastDate, "months");
          if (diffInMonths > 0) {
            setArrearsflag(true);
          }
        }
        //console.log("Difference", diffInMonths);
        const amt = Number(fee + diffInMonths * fee + registration);
        setAmount(amt);
      }
    } catch (error) {
      console.error(error);
      navigate("/login");
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expired or unauthorized. Please log in again.");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
      }
    }
  };
  const fetchHistory = async (id) => {
    //console.log("id", id);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      const response = await axios.get(
        `${backendUrl}/api/v1/getCompletedStudentHistory/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔐 Include JWT token
          },
        }
      );

      if (response.data.success) {
        //console.log(response.data.history);
        setPayment_History(response.data.history);
      } else {
        console.log("error fetching history");
        toast.error("Error");
      }
    } catch (error) {
      console.log("No Payment History");
    }
  };
  const fetchPending = async (id) => {
    try {
      //console.log("PendingId", id);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      const response = await axios.get(
        `${backendUrl}/api/v1/getPendingStudentHistory/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔐 Include JWT token
          },
        }
      );

      if (response.data.success) {
        console.log(response.data.history);
        setPendingPayments(response.data.history);
      } else {
        console.log("error fetching history");
        toast.error("Error");
      }
    } catch (error) {
      console.log("No Pending reuests");
    }
  };
  const fetchlastPayment = async (_id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      console.log("last", _id);
      const response = await axios.get(
        `${backendUrl}/api/admin/lastPayment/${_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔐 Include JWT token
          },
        }
      );

      if (response.data.success) {
        const date = response.data.data.lastPayment.createdAt;

        console.log("date", date);
        setLastPayment(date);
        return date;
      }
    } catch (error) {
      console.log("Error while fetching payment History::", error);
    }
  };
  const fetchFees = async (year) => {
    try {
      const formattedYear = year.toLowerCase().replace(/ /g, "_");
      // console.log("Fetching fees for year:" + formattedYear);
      const res = await axios.get(
        `${backendUrl}/api/fee/amount/${formattedYear}`
      );
      if (!res.data.success) {
        return toast.error(res.data.message || "Could not fetch fees.");
      }

      if (formattedYear === "registration") {
        // console.log("For registration setting amount:" + res.data.fee);

        return res.data.fee;
      } else {
        return res.data.fee;
      }
    } catch (error) {
      toast.error("Error fetching fees.");
      console.error(error.message);
    }
  };

  const handlePayment = async (amount, remarks) => {
    try {
      const { data: keyData } = await axios.get(`${backendUrl}/api/v1/getKey`);
      const { data: orderData } = await axios.post(
        `${backendUrl}/api/v1/payment/process`,
        { amount }
      );
      const options = {
        key: keyData.key,
        amount,
        currency: "INR",
        name: "Naad",
        description: "Fees Payment",
        order_id: orderData.order.id,
        callback_url: `${backendUrl}/api/v1/paymentVerification`,
        prefill: {
          name: student.firstname,
          email: student.email || "naadnrutya@gmail.com",
          contact: student.contact || "9999999999",
        },
        notes: {
          amount: amount,
          remark: remarks,
          uid: student._id, // optional tracking info
        },
        theme: { color: "#F37254" },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Payment process failed.");
      console.error(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    setRole(null);
    navigate("/login");
  };

  useEffect(() => {
    const init = async () => {
      await getProfile();
      setLoading(false);
    };
    init();
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-pink-100 to-red-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-600 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-200 p-4 sm:p-6 flex flex-col items-center overflow-x-hidden">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-4 sm:p-6">
        {/* Top bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Student Dashboard
            </h2>
          </div>
          <div className="flex justify-end mt-2 sm:mt-0">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-medium text-xs px-3 py-1 rounded-md sm:text-sm sm:px-4 sm:py-2"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile */}
        <div className="text-center mb-6">
          <img
            src={student.image}
            alt="Student"
            className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full object-cover border-4 border-blue-400"
          />
          <h3 className="text-lg sm:text-xl font-semibold mt-2">
            {student.firstname} {student.middlename} {student.lastname}
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">{student.year}</p>
        </div>

        {/* Student Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base text-gray-700 mb-6">
          <p>
            <strong>Address:</strong> {student.address}
          </p>
          <p>
            <strong>Contact:</strong> {student.contact}
          </p>
          <p>
            <strong>DOB:</strong> {student.dob}
          </p>
          <p>
            <strong>DOJ:</strong> {student.doj}
          </p>
        </div>

        {/* Payment Button */}
        {feesFlag && (
          <div className="text-center mb-6">
            <button
              onClick={() => handlePayment(amount, remark)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl w-full sm:w-auto"
            >
              <div className="flex justify-center items-center gap-2">
                <span>Pay Fees: ₹{amount}</span>
                {registrationFlag && (
                  <span
                    className="text-xs sm:text-sm text-white bg-gray-600 rounded-full px-2 py-1"
                    title="Registration Fee included"
                  >
                    ℹ️
                  </span>
                )}
              </div>
            </button>

            {arrearsFlag && (
              <div className="mt-4 bg-green-100 border border-green-300 text-green-700 p-3 rounded-xl text-sm">
                Fees of previous months have been added to the pending amount
              </div>
            )}
          </div>
        )}

        {/* Pending Requests */}
        {pendingPayments && pendingPayments.length > 0 && (
          <div className="mt-4 bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl text-sm sm:text-base">
            <div className="mb-2 font-semibold">
              A payment request is pending for the following:
            </div>

            <ul className="space-y-3 mb-3">
              {pendingPayments.map((p, index) => (
                <li
                  key={index}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                >
                  <div>
                    <p>
                      <span className="font-medium">Request For:</span>{" "}
                      {p.remark || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Amount:</span> ₹{p.amount}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePayment(p.amount, p.remark)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm w-full sm:w-auto"
                  >
                    Pay ₹{p.amount}
                  </button>
                </li>
              ))}
            </ul>

            <div className="font-semibold">
              Total Pending Amount: ₹
              {pendingPayments.reduce(
                (sum, p) => sum + Number(p.amount || 0),
                0
              )}
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="mt-6 overflow-x-auto">
          {/* <PaymentsTable paymentHistory={paymentHistory} student={student} /> */}
          <PaymentHistoryTable user={user} paymentHistory={payment_History} />
        </div>
      </div>
    </div>
  );
};

export default StudHomepage;
