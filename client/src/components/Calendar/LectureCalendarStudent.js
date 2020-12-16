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
import ReactTooltip from 'react-tooltip';
import './Calendar.css';

const moment = require('moment');

class LectureCalendarStudent extends React.Component {

    constructor(props){
        super(props);
        const filters = [
            {color: colors.bookable, name: "Bookable", checked: true},
            {color: colors.booked, name: "Booked", checked: true},
            {color: colors.waiting, name: "Waiting", checked: true},
            {color: colors.remote, name: "Remote", checked: true}
        ];
        this.state = {day: moment(), filters: filters, lectures: [], selectedLectures: []};
    }

    componentDidMount() { 
        this.getLectures(moment());
    }

    onDateChange = (value) => {
        const day = moment(value);
        this.setState({day: day});
        this.getLectures(day);
    }

    getLectures = (day) => {
        const week = getWeek(day);
        console.log(week.first + " " + week.last);
        API.getStudentLectures(week.first, week.last)
        .then((lectures) => {
            this.setState({lectures: lectures});
            this.applyFilters(this.state.filters);
        }).catch((err) => console.log(err));
    }

    book = (lectureId) => {
        API.book(lectureId)
        .then(() => this.getLectures(this.state.day))
        .catch((err) => console.log(err));
    }

    cancelBooking = (bookingId) => {
        API.cancelBooking(bookingId)
        .then(() =>{ 
            console.log("OKKKKKK");
            this.getLectures(this.state.day)})
        .catch((err) => console.log("ERR"));
    }

    isBooked = (lecture) => { return (lecture.State==0 && lecture.BookingId != null && lecture.BookingState==0); }
    isBookable = (lecture) => { return (lecture.State==0 && lecture.BookingId == null); }
    isWaiting = (lecture) => { return (lecture.State==0 && lecture.BookingId != null && lecture.BookingState==1); }
    isRemote = (lecture) => { return lecture.State!=0; }

    getColorCode = (lecture) => {
        if(this.isBookable(lecture))
            return colors.bookable;
        else if(this.isBooked(lecture))
            return colors.booked;
        else if(this.isWaiting(lecture))
            return colors.waiting;
        else if(this.isRemote(lecture))
            return colors.remote;
        else
            return "";
    }

    getDescription = (lecture) => {
        if(this.isBookable(lecture))
            return descriptions.bookable;
        else if(this.isBooked(lecture))
            return descriptions.booked;
        else if(this.isWaiting(lecture))
            return descriptions.waiting;
        else if(this.isRemote(lecture))
            return descriptions.remote;
        else
            return "";
    }

    render() {
        const start = moment(this.state.day);
        start.subtract(start.weekday()-1, 'days');
        return <>

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
        </>;
    }

    applyFilters = (filters) => {
        const selectedLectures = this.state.lectures.filter((lecture) => {
            return (filters[0].checked && this.isBookable(lecture)) ||
                (filters[1].checked && this.isBooked(lecture)) ||
                (filters[2].checked && this.isWaiting(lecture)) ||
                (filters[3].checked && this.isRemote(lecture));
        });
        this.setState({filters: filters, selectedLectures: selectedLectures});
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
                    <p>{start.format("HH:mm")+" - "+end.format("HH:mm")}<br/>
                    {lecture.TeacherName+" "+lecture.TeacherSurname}<br/>
                    {!(this.isRemote(lecture)) && <>
                        {lecture.ClassroomName}<br/>
                        {lecture.BookingCount+"/"+lecture.Seats}<br/>
                    </>}</p>
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

        const closeModal = () => { props.onSave(this.props.value); }
    
        const book = () => {
            this.book(lecture.LectureId);
            closeModal();
        }

        const cancelBooking = () => {
            this.cancelBooking(lecture.BookingId);
            closeModal();
        }

        var minutesLeft = moment.duration(start.diff(moment())).as("minutes");

        return <Modal.Dialog>
            <Modal.Header>
                <Modal.Title>Booking Options</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    <strong>Subject: </strong>{lecture.CourseName}<br/>
                    <strong>Time: </strong>{start.format("HH:mm")+" - "+end.format("HH:mm")}<br/>
                    <strong>Professor: </strong>{lecture.TeacherName+" "+lecture.TeacherSurname}<br/>
                    {!this.isRemote(lecture) && <>
                        <strong>Classroom: </strong>{lecture.ClassroomName}<br/>
                        <strong>Seats: </strong>{lecture.BookingCount+"/"+lecture.Seats}<br/>
                    </>}
                    <i>{this.getDescription(lecture)}</i>
                </p>
            </Modal.Body>
            <Modal.Footer>
                {minutesLeft>=0 && <>
                    {this.isBookable(lecture) && <Button variant="primary" onClick={book}>Book</Button>}
                    {(this.isBooked(lecture) || this.isWaiting(lecture)) && <Button variant="info" onClick={cancelBooking}>Cancel booking</Button>}
                </>}
                <Button variant="secondary" onClick={closeModal}>Close</Button>
            </Modal.Footer>
        </Modal.Dialog>;
    }
}

export default LectureCalendarStudent;