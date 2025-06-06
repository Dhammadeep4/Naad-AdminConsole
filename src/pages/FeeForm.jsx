import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../App";
import { useNavigate } from "react-router-dom";
const FeeForm = () => {
  const navigate = useNavigate();
  const [registration, setRegistration] = useState("");
  const [chote_nartak, setChote_Nartak] = useState("");
  const [prarambhik, setPrarambhik] = useState("");
  const [praveshika_pratham, setPraveshika_pratham] = useState("");
  const [praveshika_purna, setPraveshika_purna] = useState("");
  const [praveshika_purna_batch1, setPraveshika_purna_batch1] = useState("");
  const [madhyama_pratham, setMadhyama_pratham] = useState("");
  const [madhyama_purna, setMadhyama_purna] = useState("");
  const [madhyama_purna_batch1, setMadhyama_purna_batch1] = useState("");
  const [visharad_pratham, setVisharad_pratham] = useState("");
  const [visharad_purna, setVisharad_purna] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true); // Disable button
      const fees = {
        registration,
        chote_nartak,
        prarambhik,
        praveshika_pratham,
        praveshika_purna,
        praveshika_purna_batch1,
        madhyama_pratham,
        madhyama_purna,
        madhyama_purna_batch1,
        visharad_pratham,
        visharad_purna,
      };
      // console.log("Logging Fees Structure", fees);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      const response = await axios.post(backendUrl + "/api/fee/update", fees, {
        headers: {
          Authorization: `Bearer ${token}`, // 🔐 Include JWT token
        },
      });
      if (response.data.success === true) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log("Error::", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFees = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      const response = await axios.get(backendUrl + `/api/fee/getFee`, {
        headers: {
          Authorization: `Bearer ${token}`, // 🔐 Include JWT token
        },
      });

      // console.log(response.data.fees);
      if (response.data.success) {
        const feeCard = response.data.fees;

        setRegistration(feeCard[0].registration);
        setChote_Nartak(feeCard[0].chote_nartak);
        setPrarambhik(feeCard[0].prarambhik);
        setPraveshika_pratham(feeCard[0].praveshika_pratham);
        setPraveshika_purna(feeCard[0].praveshika_purna);
        setPraveshika_purna_batch1(feeCard[0].praveshika_purna_batch1);
        setMadhyama_pratham(feeCard[0].madhyama_pratham);
        setMadhyama_purna(feeCard[0].madhyama_purna);
        setMadhyama_purna_batch1(feeCard[0].madhyama_purna_batch1);
        setVisharad_pratham(feeCard[0].visharad_pratham);
        setVisharad_purna(feeCard[0].visharad_purna);
      } else {
        toast.error("Failed to fetch fees data");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchFees();
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-red-200">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-500 hover:underline mb-4"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-center mb-4">
          Set Fees Structure
        </h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Registration Fees
            <input
              type="number"
              name="registration"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              required
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          <label className="block mb-2">
            Chote Nartak
            <input
              type="number"
              name="chote_nartak"
              value={chote_nartak}
              onChange={(e) => setChote_Nartak(e.target.value)}
              required
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          <label className="block mb-2">
            Prarambhik
            <input
              type="number"
              name="prarambhik"
              value={prarambhik}
              onChange={(e) => setPrarambhik(e.target.value)}
              required
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          <label className="block mb-2">
            Praveshika_pratham
            <input
              type="number"
              name="praveshika_pratham"
              value={praveshika_pratham}
              onChange={(e) => setPraveshika_pratham(e.target.value)}
              required
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          <label className="block mb-4">
            Praveshika_purna
            <input
              type="number"
              name="praveshika_purna"
              value={praveshika_purna}
              onChange={(e) => setPraveshika_purna(e.target.value)}
              required
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          <label className="block mb-4">
            Praveshika_purna_Batch1
            <input
              type="number"
              name="praveshika_purna_batch1"
              value={praveshika_purna_batch1}
              onChange={(e) => setPraveshika_purna_batch1(e.target.value)}
              required
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          <label className="block mb-2">
            Madhyama_pratham
            <input
              type="number"
              name="madhyama_pratham"
              value={madhyama_pratham}
              onChange={(e) => setMadhyama_pratham(e.target.value)}
              required
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          <label className="block mb-2">
            Madhyama_purna
            <input
              type="number"
              name="madhyama_purna"
              value={madhyama_purna}
              onChange={(e) => setMadhyama_purna(e.target.value)}
              required
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          <label className="block mb-2">
            Madhyama_purna_Batch1
            <input
              type="number"
              name="madhyama_purna_batch1"
              value={madhyama_purna_batch1}
              onChange={(e) => setMadhyama_purna_batch1(e.target.value)}
              required
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          <label className="block mb-4">
            Visharad_pratham
            <input
              type="number"
              name="visharad_pratham"
              value={visharad_pratham}
              onChange={(e) => setVisharad_pratham(e.target.value)}
              required
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          <label className="block mb-4">
            Visharad_purna
            <input
              type="number"
              name="visharad_purna"
              value={visharad_purna}
              onChange={(e) => setVisharad_purna(e.target.value)}
              required
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-semibold p-3 rounded-lg ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeeForm;
