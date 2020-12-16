import React from "react";
import "./UploadFile.css";

import API from '../../API';

import 'bootstrap/dist/css/bootstrap.min.css';
import ReactLoading from 'react-loading';
import DatePicker from 'react-date-picker';

const moment = require("moment");

class UploadFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {loading: false, startDate: moment().add(1,'days'), endDate: moment().add(1,'days')};
    }

    uploadTeachers = (file) => {
        this.setState({loading: true});
        API.uploadTeachers(file)
        .then(() => {
            console.log("OK");
            this.setState({loading: false});
        }).catch((err) => console.log(err));
    }

    uploadStudents = (file) => {
        this.setState({loading: true});
        API.uploadStudents(file)
        .then(() => {
            console.log("OK");
            this.setState({loading: false});
        }).catch((err) => console.log(err));
    }

    uploadCourses = (file) => {
        this.setState({loading: true});
        API.uploadCourses(file)
        .then(() => {
            console.log("OK");
            this.setState({loading: false});
        }).catch((err) => console.log(err));
    }

    uploadEnrollments = (file) => {
        this.setState({loading: true});
        API.uploadEnrollments(file)
        .then(() => {
            console.log("OK");
            this.setState({loading: false});
        }).catch((err) => console.log(err));
    }

    uploadLectures = (file) => {
        this.setState({loading: true});
        API.uploadLectures(file)
        .then(() => {
            console.log("OK");
            this.setState({loading: false});
        }).catch((err) => console.log(err));
    }

    onStartDateChange = (value) => {
        this.setState({startDate: moment(value)});
    }

    onEndDateChange = (value) => {
        this.setState({endDate: moment(value)});
    }

    render() {
        return <>
            {this.state.loading && <div className="whitescreen">
                <div style={{margin: "auto", height: 667, width:375}}>
                    <ReactLoading type={"spinningBubbles"} color={"gray"} height={667} width={375}/>
                    <h4>Loading</h4>
                </div>
                
            </div>}
            <div>
                <h2>Data upload</h2>
                <div class="row">
                    <div className="col-4"><UploadBar onSubmit={this.uploadTeachers} title="Teachers"/></div>
                    <div className="col-4"><UploadBar onSubmit={this.uploadCourses} title="Courses"/></div>
                    <div className="col-4"><UploadBar onSubmit={this.uploadStudents} title="Students"/></div>
                    <div className="col-4"><UploadBar onSubmit={this.uploadEnrollments} title="Enrollments"/></div>
                    <div className="col-4">
                        <UploadBar onSubmit={this.uploadLectures} title="Lectures"/>
                        <label>Start </label>
                        <DatePicker
                            minDate={moment().add(1,'days').toDate()}
                            onChange={this.onStartDateChange}
                            value={this.state.startDate.toDate()}
                        /><br/>
                        <label>End </label>
                        <DatePicker
                            minDate={moment().add(1,'days').toDate()}
                            onChange={this.onEndDateChange}
                            value={this.state.endDate.toDate()}
                        />
                    </div>
                </div>
            </div>
        </>;
    }
}

class UploadBar extends React.Component {
    constructor(props) {
        super(props);
        this.setState({selectedFile: null});
    }

    onChange = (event) => {
        const file = event.target.files[0];
        this.setState({selectedFile: file});
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.props.onSubmit(this.state.selectedFile);
    }

    render() {
        return(
            <div className="container">
                <div className="">
                    <div className="form-group text-center">
                        <h4>{this.props.title}</h4>
                        <div className="input-group input-file">
                            <input type="file"
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
