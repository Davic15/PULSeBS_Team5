import React from "react";
import "./UploadFile.css";

import API from '../../API';

import 'bootstrap/dist/css/bootstrap.min.css';
import ReactLoading from 'react-loading';
import DatePicker from 'react-date-picker';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const moment = require("moment");

class UploadFile extends React.Component {
    constructor(props) {
        super(props);
        const tomorrow = moment().add(1,'days').hour(0).minute(0).second(0).millisecond(0);
        this.state = {loading: false, startDate: tomorrow, endDate: moment(tomorrow).add(1,'days'), showModal: false, results: {added: 0, errors: 0}};
    }

    uploadTeachers = (file) => {
        this.setState({loading: true});
        this.openModal();
        API.uploadTeachers(file)
        .then((obj) => {
            this.setResults(obj);
            this.setState({loading: false});
        }).catch((err) => console.log(err));
    }

    uploadStudents = (file) => {
        this.setState({loading: true});
        this.openModal();
        API.uploadStudents(file)
        .then((obj) => {
            this.setResults(obj);
            this.setState({loading: false});
        }).catch((err) => console.log(err));
    }

    uploadCourses = (file) => {
        this.setState({loading: true});
        this.openModal();
        API.uploadCourses(file)
        .then((obj) => {
            this.setResults(obj);
            this.setState({loading: false});
        }).catch((err) => console.log(err));
    }

    uploadEnrollments = (file) => {
        this.setState({loading: true});
        this.openModal();
        API.uploadEnrollments(file)
        .then((obj) => {
            this.setResults(obj);
            this.setState({loading: false});
        }).catch((err) => console.log(err));
    }

    uploadLectures = (file) => {
        this.setState({loading: true});
        this.openModal();
        API.uploadLectures(file, this.state.startDate, this.state.endDate)
        .then((obj) => {
            this.setResults(obj);
            this.setState({loading: false});
        }).catch((err) => console.log(err));
    }

    setResults = (obj) => {
        let added = 0;
        let errors = 0;

        for(let row of obj) {
            if(row.error === undefined)
                added++;
            else
                errors++;
        }
        this.setState({results: {added: added, errors: errors}});
    }

    onStartDateChange = (value) => {
        this.setState({startDate: moment(value)});
    }

    onEndDateChange = (value) => {
        this.setState({endDate: moment(value)});
    }

    /*{this.state.loading && <div className="whitescreen">
    <div style={{margin: "auto", height: 667, width:375}}>
        <ReactLoading type={"spinningBubbles"} color={"gray"} height={667} width={375}/>
        <h4>Loading</h4>
    </div>
    
    </div>}*/

    closeModal = () => this.setState({ showModal: false});
    openModal = () => this.setState({ showModal: true});

    render() {
        return <>
            <div>
                <Modal show={this.state.showModal} onHide={() => {}}>
                    <Modal.Dialog scrollable={true} style={{width:"500px", height: "500px"}}>
                        <Modal.Header>
                            <Modal.Title>Data upload</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {this.state.loading && <>
                                <ReactLoading type={"spinningBubbles"} color={"gray"} height={222} width={125}/>
                                <h4>Loading...</h4> 
                            </>}
                            {!(this.state.loading) && <>
                                <h4>Upload complete</h4>
                                <p>{this.state.results.added +" records added"}</p>
                                <p>{this.state.results.errors +" errors"}</p>
                            </>}
                        </Modal.Body>
                        <Modal.Footer>
                            {!this.state.loading && <Button variant="secondary" onClick={this.closeModal}>Close</Button>}
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal>
                <h2>Data upload</h2>
                <div class="row">
                    <div className="col-11 mpad"><div className="border-box"><UploadBar onSubmit={this.uploadTeachers} title="Teachers"/></div></div>
                    <div className="col-11 mpad"><div className="border-box"><UploadBar onSubmit={this.uploadCourses} title="Courses"/></div></div>
                    <div className="col-11 mpad"><div className="border-box"><UploadBar onSubmit={this.uploadStudents} title="Students"/></div></div>
                    <div className="col-11 mpad"><div className="border-box"><UploadBar onSubmit={this.uploadEnrollments} title="Enrollments"/></div></div>
                    <div className="col-11 mpad"><div className="border-box">
                        <UploadBar onSubmit={this.uploadLectures} title="Lectures"/>
                        <div className="center-box">
                            <label className="move-label">Start </label>
                            <DatePicker
                                minDate={moment().hour(0).minute(0).second(0).millisecond(0).toDate()}
                                onChange={this.onStartDateChange}
                                value={this.state.startDate.toDate()}
                            /><br/>
                            <label className="move-label">End</label>
                            <DatePicker
                                minDate={moment().add(1,'days').hour(0).minute(0).second(0).millisecond(0).toDate()}
                                onChange={this.onEndDateChange}
                                value={this.state.endDate.toDate()}
                            />
                        </div>
                    </div></div>
  
                </div>
            </div>
        </>;
    }
}

class UploadBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {selectedFile: null, error: null}
    }

    onChange = (event) => {
        const file = event.target.files[0];
        this.setState({selectedFile: file});
    }

    handleSubmit = (event) => {
        event.preventDefault();
        if(!this.state.selectedFile) {
            this.setState({error: "Select a file to upload."});
            return;
        }
        this.props.onSubmit(this.state.selectedFile);
        this.setState({error: null});
    }

    render() {
        return(
            <div className="container">
                <div className="">
                    <div className="form-group text-center">
                        <h4>{this.props.title}</h4>
                        {this.state.error && <p style={{color: "red"}}>{this.state.error}</p>}
                        <div className="input-group input-file move-input">
                            <input type="file" 
                                className="file-style"
                                lang="en"
                                accept=".csv"
                                onChange={this.onChange}></input>
                            <span className="input-group-btn">
                                <button className="btn btn-primary btn-reset" type="button" onClick={this.handleSubmit}>Submit</button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

/*<div className="container">
            <div className="col-md-8 col-md-offset-2">
                <div className="form-group text-center">
                    <h3>Upload File(s)</h3>
                    <div className="input-group input-file">
                        <span className="input-group-btn">
                            <button className="btn btn-info btn-choose" type="button">Choose</button>
                        </span>
                        <input type="file"
                            id="teacher" name="teacher"
                            accept=".csv"></input>
                        <input type="text" className="form-control" placeholder='Choose a file...' />
                        <span className="input-group-btn">
                            <button className="btn btn-primary btn-reset" type="button" onClcik={props.onSubmit}>Submit</button>
                        </span>
                    </div>
                </div>
            </div>
        </div>*/

export default UploadFile;
