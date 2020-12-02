import React from "react";
import { Link } from "react-router-dom";
import { AuthContext} from "../AuthContext/AuthContext";
import API from '../../API';
import "../Header/Header.css";
import mainLogo from "../../images/favicon.ico";

function Header() {
    return(
        <AuthContext.Consumer>
            {(context) => <> 
                <nav className="navbar">
                    <a className="navbar-brand fustify-content-center text-white" href={''}>
                        <img src={mainLogo} width="30" height="30" className="d-inline-block align-top" alt="logo-image"/>PULSeBS Team 5
                    </a>
                    {context.authUser && (context.authUser.Type === "student" || context.authUser.Type === "teacher") && <Link to="/lectures">Lectures</Link>}
                    {context.authUser && (context.authUser.Type === "manager" || context.authUser.Type === "teacher") && <Link to="/courses">Courses</Link>}
                    {!context.authUser && <Link to="/login">Login</Link>}
                    {context.authUser && <Link to="/login" onClick={context.logoutUser}>Logout</Link>}
                </nav>
            </>}
        </AuthContext.Consumer>
    )

}

export default Header;