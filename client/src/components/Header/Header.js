import React from "react";
import "../Header/Header.css";
import mainLogo from "../../images/favicon.ico";

function Header() {
    return(
        <nav className="navbar">
          <a className="navbar-brand fustify-content-center text-white" href={''}>
            <img src={mainLogo} width="30" height="30" className="d-inline-block align-top" alt="f"/>PULSeBS Team 5
          </a>
        </nav>
    )

}

export default Header;