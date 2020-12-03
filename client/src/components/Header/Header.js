import React from "react";
import { Link } from "react-router-dom";
import { AuthContext} from "../AuthContext/AuthContext";
import API from '../../API';
import "../Header/Header.css";
import mainLogo from "../../images/favicon.ico";
import Button from "react-bootstrap/Button";

function Header() {
    return(
        <AuthContext.Consumer>
            {(context) => <> 
                <nav className="navbar">
                    <a className="navbar-brand fustify-content-center text-white" href={''}>
                        <img src={mainLogo} width="30" height="30" className="d-inline-block align-top" alt="logo-image"/>PULSeBS Team 5
                    </a>
                    {context.authUser && (/*context.authUser.Type === "student" ||*/ context.authUser.Type === "teacher") && <Link to="/lectures"><Button variant="primary">Lectures</Button> </Link>}
                    {context.authUser && (context.authUser.Type === "manager" || context.authUser.Type === "teacher") && <Link to="/courses"><Button variant="primary">Courses</Button></Link>}
                    {context.authUser && <Link to="/login" onClick={context.logoutUser}><Button variant="danger">Logout</Button></Link>}
                </nav>
                {context.authUser && <div><br/><h1>Welcome {context.authUser.Name} {context.authUser.Surname}</h1><br/></div>}
            </>}
        </AuthContext.Consumer>
    )

}

export default Header;