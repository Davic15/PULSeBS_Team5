import React from "react";
import "../Footer/Footer.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBitbucket, faFacebook, faGithub, faInstagram, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';

function Footer() {
    return(
        <div className="container-fluid pb-0 mb-0 justify-content-center text-light ">
            <footer>
                <div className="row my-5 justify-content-center py-5">
                    <div className="col-11">
                        <div className="row ">
                            <div className="col-xl-8 col-md-4 col-sm-4 col-12 my-auto mx-auto a">
                                <h3 className="mb-md-0 mb-5 bold-text">PULSeBS Team 5 (Software Engineering 2 - Polito)</h3>
                            </div>
                            <div className="col-xl-2 col-md-4 col-sm-4 col-12">
                                <h6 className="mb-3 mb-lg-4 bold-text"><b>Members (GitHub)</b></h6>
                                <ul className="list-unstyled">
                                    <li><FontAwesomeIcon icon={faGithub} /><a href="https://github.com/StefanoBergia" target="_blank" rel="noopener noreferrer"> Stefano Bergia</a></li>
                                    <li><FontAwesomeIcon icon={faGithub} /><a href="https://github.com/Phyretol" target="_blank" rel="noopener noreferrer"> Federico Rivoira</a></li>
                                    <li><FontAwesomeIcon icon={faGithub} /><a href="https://github.com/jackgorga" target="_blank" rel="noopener noreferrer"> Giacomo Gorga</a></li>
                                    <li><FontAwesomeIcon icon={faGithub} /><a href="https://github.com/Davic15" target="_blank" rel="noopener noreferrer"> Franklin Macias</a></li>
                                </ul>
                            </div>
                            <div className="col-xl-2 col-md-4 col-sm-4 col-12">
                                <h6 className="mb-3 mb-lg-4 bold-text"><b>Address</b></h6>
                                <p className="mb-1">Corso Duca degli Abruzzi, 24</p>
                                <p>10129 Torino</p>
                            </div>
                        </div>
                        <div className="row ">
                            <div className="col-xl-8 col-md-4 col-sm-4 col-auto my-md-0 mt-5 order-sm-1 order-3 align-self-end">
                                <p className="social mb-0 pb-0 bold-text"> <span className="mx-2"><FontAwesomeIcon icon={faFacebook} /></span> <span className="mx-2"><FontAwesomeIcon icon={faLinkedin} /></span> <span className="mx-2"><FontAwesomeIcon icon={faTwitter} /></span> <span className="mx-2"><FontAwesomeIcon icon={faInstagram} /></span> </p><small className="rights"><span>&#127279;</span> PULSeBS Team 5 All Rights not Reserved.</small>
                            </div>
                            <div className="col-xl-2 col-md-4 col-sm-4 col-auto order-1 align-self-end ">
                                <h6 className="mt-55 mt-2 bold-text"><b>Repository GitHub</b></h6><small> <span><FontAwesomeIcon icon={faGithub} /></span> <a href="https://github.com/StefanoBergia/PULSeBS_Team5" target="_blank" rel="noopener noreferrer"> Github</a></small>
                            </div>
                            <div className="col-xl-2 col-md-4 col-sm-4 col-auto order-2 align-self-end mt-3 ">
                                <h6 className="mt-55 mt-2 bold-text"><b>Repository BitBucket</b></h6><small><span><FontAwesomeIcon icon={faBitbucket} /></span><a href="https://stefano-bergia.atlassian.net/jira/software/c/projects/PT/code" target="_blank" rel="noopener noreferrer"> BitBucket</a></small>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Footer;