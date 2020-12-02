import React from 'react';
import API from '../../API';
import LectureCalendar from './LectureCalendar';
import LegendFilter from "../Legend/LegendFilter";
import {AuthContext} from '../AuthContext/AuthContext';
import {Redirect} from "react-router-dom";
import {colors, descriptions} from "./CalendarMisc";
import {getWeek} from '../../Functions';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import './Calendar.css';

const moment = require('moment');

class LectureCalendarTeacher extends React.Component {

    constructor(props){
        super(props);

        const filters = [
            {color: colors.bookable, name: "Presence", checked: true},
            {color: colors.remote, name: "Remote", checked: true}
        ];
        this.state = {day: moment(), lectures: [], students: [], selectedLectures: [], filters: filters};
    }

    componentDidMount() { 
        this.getLectures();
    }

    onDateChange = (value) => {
        const day = moment(value);
        this.setState({day: moment(value)});
        this.getLectures(day);
    }

    getLectures = (day) => {
        const week = getWeek(day);
        API.getTeacherLectures(week.first, week.last)
        .then((lectures) => {
            this.setState({lectures: lectures})
            this.applyFilters(this.state.filters);
        })
        .catch((err) => console.log(err));
    }

    cancelLecture = (lectureId) => {
        API.cancelLecture(lectureId)
        .then(() => this.getLectures(this.state.day))
        .catch((err) => console.log(err));
    }

    changeLecture = (lectureId) => {
        API.changeLecture(lectureId)
        .then(() => this.getLectures(this.state.day))
        .catch((err) => console.log(err));
    }

    getStudentList = (lectureId) => {
        API.getStudentList(lectureId)
        .then((students) => this.setState({students: students}))
        .catch((err) => console.log(err));
    }

    isPresence = (lecture) => { return lecture.State==0; }
    isRemote = (lecture) => { return lecture.State!=0; }

    getColorCode = (lecture) => {
        if(this.isPresence(lecture))
            return colors.bookable;
        else if(this.isRemote(lecture))
            return colors.remote;
        else
            return "";
    }

    getDescription = (lecture) => {
        if(this.isPresence(lecture))
            return descriptions.bookable;
        else if(this.isRemote(lecture))
            return descriptions.remote;
        else
            return "";
    }

    applyFilters = (filters) => {
        const selectedLectures = this.state.lectures.filter((lecture) => {
            return (filters[0].checked && this.isPresence(lecture)) ||
                (filters[1].checked && this.isRemote(lecture));
        });
        this.setState({filters: filters, selectedLectures: selectedLectures});
    }

    render() {
        const start = moment(this.state.day);
        start.subtract(start.weekday()-1, 'days');
        return <div>
            <div>
                <LegendFilter
                    filters={this.state.filters}
                    onFiltersChange={this.applyFilters}
                />
                <LectureCalendar
                    onDateChange={this.onDateChange}
                    lectures={this.state.selectedLectures}
                    lectureComponent={this.LectureComponent}
                    modalComponent={this.Modal}
                />
            </div>
            
        </div>;
    }

    LectureComponent = (props) => {
        const start = moment(props.start);
        const end = moment(props.end);
        const value = props.value;
        const lecture = JSON.parse(value);
    
        return <div className="lecture">
            <div className="lecture-tag" style={{backgroundColor:this.getColorCode(lecture)}}>
                <b>{lecture.CourseName}</b>
            </div>
            <div className="lecture-body">
                <p>
                    {start.format("HH:mm")+" - "+end.format("HH:mm")}<br/>
                    {!(this.isRemote(lecture)) && <>
                        {lecture.ClassroomName}<br/>
                        {lecture.BookingCount+"/"+lecture.Seats}<br/>
                    </>}
                </p>
            </div>
        </div>;
    }
    
    Modal = (props) => {
        const start = moment(props.start);
        const end = moment(props.end);
        const value = props.value;
        const lecture = JSON.parse(value);

        const closeModal = () => { props.onSave(props.value); }
    
        const cancelLecture = () => {
            this.cancelLecture(lecture.LectureId);
            closeModal();
        }

        const changeLecture = () => {
            this.changeLecture(lecture.LectureId);
            closeModal();
        }
        
        var minutesLeft = moment.duration(start.diff(moment())).as("minutes");

        return <Modal.Dialog scrollable={true}>
            <Modal.Header>
                <Modal.Title>Booking Options</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    <strong>Subject: </strong>{lecture.CourseName}<br/>
                    <strong>Time: </strong>{start.format("HH:mm")+" - "+end.format("HH:mm")}<br/>
                    {!this.isRemote(lecture) && <>
                        <strong>Classroom: </strong>{lecture.ClassroomName}<br/>
                        <strong>Seats: </strong>{lecture.BookingCount+"/"+lecture.Seats}<br/>
                    </>}
                    <i>{this.getDescription(lecture)}</i>
                    {!this.isRemote(lecture) && <StudentList onLoad={() => this.getStudentList(lecture.LectureId)} students={this.state.students}/>}
                </p>
            </Modal.Body>
            <Modal.Footer>
                {(this.isPresence(lecture) && minutesLeft>=30 ) && <Button variant="primary" onClick={changeLecture}>Change to remote lecture</Button>}
                {minutesLeft>=60 && <Button variant="info" onClick={cancelLecture}>Cancel lecture</Button>}
                <Button variant="secondary" onClick={() => closeModal()}>Close</Button>
            </Modal.Footer>
        </Modal.Dialog>
    }
}

class StudentList extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.onLoad();
    }

    /*render() {
        return <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Surname</th>
                    <th>Name</th>
                </tr>
            </thead>
            <tbody>
            {this.props.students.map((student) => {
                return <tr>
                    <td>{student.StudentId}</td>
                    <td>{student.Surname}</td>
                    <td>{student.Name}</td>
                </tr>;
            })}
            </tbody>
        </table>
        
    }*/
    render() {
        return (
            <div className="table-wrapper">
                <table className="table">
                    <thead className="thead-light">
                        <tr>
                            <th>ID</th>
                            <th>Surname</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                    {this.props.students.map((student) => {
                        return <tr>
                            <td>{student.StudentId}</td>
                            <td>{student.Surname}</td>
                            <td>{student.Name}</td>
                        </tr>;
                    })}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default LectureCalendarTeacher;