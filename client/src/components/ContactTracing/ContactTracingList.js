import React from "react";
import "./ContactTracing.css";

import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
    /*
    Modal to generate a new report
    <Modal.Dialog scrollable={true}>
        <Modal.Header>
            <Modal.Title>Report Creation Form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <form>
          <div class="form-group">
            <label>Student: </label>
            <input type="text" placeholder="Type student ID"/>
        </div>
        <div class="form-group md-form md-outline input-with-post-icon datepicker">
            <label>Date: </label>
            <input type="date" placeholder="Select Date"/>
        </div>

        </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary">Generate</Button>
          <Button variant="secondary">Close</Button>
        </Modal.Footer>
    </Modal.Dialog>
    */



class ContactTracingList extends React.Component{
    render(){
        return(
            <div>
                <h3 className="center-button">Contact Tracing Report List</h3>
                <div>
                    <div className="center-button">
                        <button  className="btn btn-lg btn-primary text-uppercase custom-color" variant="primary">New Report</button>
                        <table className="table table-bordered">
                            <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Report</th>
                                <th scope="col">Date</th>
                                <th scope="col">Open</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <th scope="row">1</th>
                                <td>Covid-19-student-1</td>
                                <td>01/12/2020</td>
                                <td><a href="localhost">View</a></td>
                            </tr>
                            <tr>
                                <th scope="row">2</th>
                                <td>Covid-19-student-2</td>
                                <td>01/12/2020</td>
                                <td><a href="Localhost">View</a></td>
                            </tr>
                            <tr>
                                <th scope="row">3</th>
                                <td>Covid-19-student-3</td>
                                <td>01/12/2020</td>
                                <td><a href="localhost">View</a></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        );
    }
}

export default ContactTracingList;
