import React, { useEffect, useState } from "react";
import L from "leaflet";
import { NavLink } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { assets } from "../assets/assets.js";

const NaadInstitute = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init();
  }, []);

  // After component mounts, set loading to false immediately
  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      const map = L.map("map").setView(
        [19.145720221974702, 72.99769619213578],
        15
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      L.marker([19.145720221974702, 72.99769619213578])
        .addTo(map)
        .bindPopup("📍 Naad Nrutya Kathak Institute!")
        .openPopup();

      return () => {
        map.remove();
      };
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pink-100">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-pink-600 h-20 w-20"></div>
        <style>{`
          .loader {
            border-top-color: #f43f5e;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      id="Welcome"
      className="min-h-screen bg-gradient-to-br from-pink-100 to-red-200 flex flex-col"
    >
      {/* Header */}
      {/* Header */}
      <header className="w-full py-3 px-4 bg-gradient-to-r from-pink-500/80 via-pink-600/80 to-pink-700/80 shadow-md text-white backdrop-blur-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src={assets.naad_logo}
              alt="Naad Nrutya Kathak Institute"
              className="w-12 h-12 object-contain"
            />
          </div>

          {/* Title */}
          <h5 className="font-bold text-base sm:text-lg text-center flex-1">
            Naad Nrutya Kathak Institute
          </h5>

          {/* Login Button */}
          <NavLink to="/login" className="transform hover:scale-105 transition">
            <button className="btn btn-outline-light text-sm border-white hover:bg-white hover:text-pink-600">
              LOGIN
            </button>
          </NavLink>
        </div>
      </header>

      {/* Carousel */}
      <div id="carouselExampleIndicators" className="carousel slide">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img
              className="w-full object-cover"
              src={assets.naad_img_home}
              alt="First slide"
            />
            <div className="carousel-caption">
              <h2>Welcome!</h2>
              <p>...</p>
            </div>
          </div>
        </div>
      </div>
      {/* About Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-semibold">~ About ~</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 bg-gray-100 p-4 rounded">
          <div>
            <h3 className="text-xl font-medium mb-2">Location</h3>
            <p className="mb-2">
              Thanks for stopping by. We are the last authentic Italian
              restaurant in Milan, serving delicious Italian cuisine cooked by
              the best chefs...
            </p>
            <h5 className="text-lg font-semibold">A Unique Experience</h5>
            <p>
              It only takes a few minutes to browse through our website and
              check out our menu...
            </p>
          </div>
          <div data-aos="fade-up">
            <img
              className="w-full h-auto rounded"
              src={assets.naad_img4}
              alt="About"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 bg-gray-100 p-4 rounded my-6">
          <div className="order-2 md:order-1" data-aos="fade-up">
            <img
              className="w-full h-auto rounded"
              src={assets.naad_img5}
              alt="Cuisine"
            />
          </div>
          <div className="order-1 md:order-2">
            <h3 className="text-xl font-medium mb-2">Cuisine</h3>
            <p className="mb-2">
              Thanks for stopping by. We are the last authentic Italian
              restaurant in Milan, serving delicious Italian cuisine cooked by
              the best chefs...
            </p>
            <h5 className="text-lg font-semibold">A Unique Experience</h5>
            <p>
              It only takes a few minutes to browse through our website and
              check out our menu...
            </p>
          </div>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-2xl font-semibold">~ Our Location ~</h2>
        </div>

        <div className="grid md:grid-cols-12 gap-4">
          <div
            id="map"
            className="md:col-span-9 h-[400px] w-full rounded"
          ></div>
          <div className="md:col-span-3 space-y-3">
            <div>
              <h3 className="font-bold">Address:</h3>
              <p>Shop No:1, Jupiter Building Sector 6, Airoli-400708</p>
            </div>
            <div>
              <h3 className="font-bold">Email:</h3>
              <p>naadnrutya@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-gray-100 p-4 rounded text-center space-y-2">
          <p>
            Follow us:
            <a
              className="mx-2 text-red-600 hover:underline"
              href="https://www.youtube.com/@naadnrutyaa"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-youtube"></i>
            </a>
            <a
              className="text-pink-500 hover:underline"
              href="https://www.instagram.com/vishakha_naadkathak/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </p>
          <p>
            Contact:
            <a
              className="ml-2 text-blue-600 hover:underline"
              href="tel:+918369927121"
            >
              📞8369927121
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NaadInstitute;
