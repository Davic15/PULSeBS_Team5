import React from "react";
import "./ContactTracing.css";
import API from '../../API';

import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import DatePicker from 'react-date-picker';

const moment = require("moment");

class ContactTracingList extends React.Component{
    constructor(props) {
        super(props);
        this.state = {reports: [], showModal: false, studentId: "", date: moment()};
    }

    componentDidMount() {
        this.getReports();
    }

    getReports = () => {
        API.getReportList()
        .then((reports) => this.setState({reports: reports}))
        .catch((err) => console.log(err));
    }

    createReport = () => {
        API.generateContactTracingReport(this.state.studentId, this.state.date)
        .then(() => {
            this.setState({showModal: false}); 
            this.getReports();
        }).catch((err) => console.log(err));
    }

    onDateChange = (value) => {
        this.setState({date: moment(value)});
    }

    onStudentChange = (event) => {
        const studentId = event.target.value;
        this.setState({studentId: studentId});
    }

    closeModal = () => this.setState({ showModal: false});
    openModal = () => this.setState({ showModal: true});

    render() {
        return(
            <div>
                <Modal show={this.state.showModal}>
                    <Modal.Dialog scrollable={true} style={{width:"500px", height: "500px"}}>
                        <Modal.Header>
                            <Modal.Title>Report Creation Form</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form>
                                <div class="form-group">
                                    <DatePicker
                                        maxDate={moment().toDate()}
                                        onChange={this.onDateChange}
                                        value={this.state.date.toDate()}
                                    />
                                </div>
                                <div class="form-group">
                                    <label>Student ID: </label>
                                    <input type="text" placeholder="Type student ID" onChange={(event) => this.onStudentChange(event)} value={this.state.studentId}/>
                                </div>
                            </form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary" onClick={this.createReport}>Generate</Button>
                            <Button variant="secondary" onClick={this.closeModal}>Close</Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal>
                <h3 className="center-button">Contact Tracing Report List</h3>
                <div>
                    <div className="center-button">
                        <button  className="btn btn-lg btn-primary text-uppercase custom-color" variant="primary" onClick={this.openModal}>New Report</button>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th scope="col">Student ID</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">Files</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.reports.map((report) => <tr>
                                    <td>{report.StudentId}</td>
                                    <td>{report.Date}</td>
                                    <td>
                                        <a href={report.PathPDF}>PDF </a>
                                        <a href={report.pathCSV}>CSV</a>
                                    </td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        );
    }
}

export default ContactTracingList;
