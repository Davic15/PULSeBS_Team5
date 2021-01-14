import React from 'react';
import API from '../../API';
import LectureCalendar from './LectureCalendar';
import LegendFilter from "../Legend/LegendFilter";
//import {AuthContext} from '../AuthContext/AuthContext';
//import {Redirect} from "react-router-dom";
import {colors, descriptions} from "./CalendarMisc";
import {getWeek} from '../../Functions';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom";
import ReactTooltip from 'react-tooltip';

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
    
        return <>
            <div className="lecture" data-tip={this.getDescription(lecture)}>
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
            </div>
            <ReactTooltip place="top" type="dark" effect="solid"/>
        </>;
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
        
        let minutesLeft = moment.duration(start.diff(moment())).as("minutes");
        let currentLecture = false;
        let now = moment().format("YYYY-MM-DD HH:mm")
        if(now >= start.format("YYYY-MM-DD HH:mm") &&
            end.format("YYYY-MM-DD HH:mm") >= now)
            currentLecture= true;

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
                    <i>{this.getDescription(lecture)}</i><br />
                    {!this.isRemote(lecture) && currentLecture && <Link to={"/attendance/"+lecture.LectureId}>Record attendance</Link>}
                    {!this.isRemote(lecture) && !currentLecture && minutesLeft <= 0 && <Link to={"/history/"+lecture.LectureId}>Attendance history</Link>}
                    {!this.isRemote(lecture) && ((minutesLeft > 0) && !currentLecture) && <Link to={"/bookings/"+lecture.LectureId}>Bookings</Link>}
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

export default LectureCalendarTeacher;