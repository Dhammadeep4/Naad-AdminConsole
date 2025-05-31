import React from "react";

const Navbar = () => (
  <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top shadow-sm">
    <div className="container">
      <a className="navbar-brand" href="#Welcome">
        <img
          src="/images/naad_logo.png"
          width="40"
          height="40"
          alt="Naad Nrutya Kathak Institute"
          className="me-2"
        />
        Naad Nrutya Kathak Institute
      </a>
      <button> LOGIN</button>
    </div>
  </nav>
);

export default Navbar;
