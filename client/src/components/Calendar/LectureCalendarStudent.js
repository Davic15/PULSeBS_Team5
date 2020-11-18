import React from 'react';
import './Calendar.css';
import API from '../../API';
import LectureCalendar from './LectureCalendar';

const moment = require('moment');

const colorBookable = "white";
const colorBooked = "lightgreen";
const colorWaiting = "yellow";
const colorRemote = "orange";

class LectureCalendarStudent extends React.Component {

    constructor(props){
        super(props);
        const filters = {
            bookable: true,
            booked: true,
            waiting: true,
            remote: true
        }
        this.state = {day: moment(), filters: filters, lectures: [], selectedLectures: []};
    }

    componentDidMount() { 
        this.getLectures(moment());
    }

    onDateChange = (value) => {
        const day = moment(value);
        this.setState({day: moment(value)});
        this.getLectures(day);
    }

    getLectures = (day) => {
        const start = moment(day);
        start.subtract(start.weekday()-1, 'days');
        const end = moment(start).add(6, 'days');
        API.getStudentLectures(start, end)
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
        .then(() => this.getLectures(this.state.day))
        .catch((err) => console.log(err));
    }

    isBooked = (lecture) => { return (lecture.State==0 && lecture.BookingId != null && lecture.BookingState==0); }
    isBookable = (lecture) => { return (lecture.State==0 && lecture.BookingId == null); }
    isWaiting = (lecture) => { return (lecture.State==0 && lecture.BookingId != null && lecture.BookingState==1); }
    isRemote = (lecture) => { return lecture.State!=0; }

    getColorCode = (lecture) => {
        if(this.isBookable(lecture))
            return colorBookable;
        else if(this.isBooked(lecture))
            return colorBooked;
        else if(this.isWaiting(lecture))
            return colorWaiting;
        else if(this.isRemote(lecture))
            return colorRemote;
        else
            return "";
    }

    render() {
        const start = moment(this.state.day);
        start.subtract(start.weekday()-1, 'days');
        return <>
            <LectureCalendar
                onDateChange={this.onDateChange}
                lectures={this.state.selectedLectures}
                lectureComponent={this.LectureComponent}
                modalComponent={this.Modal}
            />
            <this.LegendFilters
                filters={this.state.filters}
                onFiltersChange={this.applyFilters}
            />
        </>;
    }

    applyFilters = (filters) => {
        const selectedLectures = this.state.lectures.filter((lecture) => {
            return (filters.booked && this.isBooked(lecture)) ||
                (filters.bookable && this.isBookable(lecture)) ||
                (filters.waiting && this.isWaiting(lecture)) ||
                (filters.remote && this.isRemote(lecture));
        });
        this.setState({filters: filters, selectedLectures: selectedLectures});
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
            <p>{start.format("HH:mm")+" - "+end.format("HH:mm")}<br/>
            {lecture.TeacherName+" "+lecture.TeacherSurname}<br/>
            {!(this.isRemote(lecture)) && <>
                {lecture.ClassroomName}<br/>
                {lecture.BookingCount+"/"+lecture.Seats}<br/>
            </>}</p>
        </div>;
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
            console.log("CANCEL "+JSON.stringify(lecture));
            this.cancelBooking(lecture.BookingId);
            closeModal();
        }

        var minutesLeft = moment.duration(start.diff(moment())).as("minutes");

        return <div>
            <b>{lecture.CourseName}</b>
            <p>{start.format("HH:mm")+" - "+end.format("HH:mm")}</p>
            <p>{lecture.TeacherName+" "+lecture.TeacherSurname}</p>
            <p>{lecture.ClassroomName}</p>
            <p>{lecture.Seats}</p>
            {minutesLeft>=0 && <>
                {this.isBookable(lecture) && <button onClick={book}>Book</button>}
                {(this.isBooked(lecture) || this.isWaiting(lecture)) && <button onClick={cancelBooking}>Cancel booking</button>}
            </>}
            <button onClick={closeModal}>Close</button>
        </div>;
    }

    LegendFilters = (props) => {
        const onFiltersChange = (event) => {
            const filters = props.filters;
            filters[event.target.id] = event.target.checked;
            props.onFiltersChange(filters);
        }

        return <div>
            <div>
                <div className="legend-square" style={{backgroundColor: colorBooked}}></div>
                <input type="checkbox" id="booked" checked={props.filters["booked"]} onChange={(event) => onFiltersChange(event)} />
                <label htmlFor="booked">Booked</label>
            </div>
            <div>
                <div className="legend-square" style={{backgroundColor: colorWaiting}}></div>
                <input type="checkbox" id="waiting" checked={props.filters["waiting"]} onChange={(event) => onFiltersChange(event)} />
                <label htmlFor="waiting">Bookable (Waiting)</label>
            </div>
            <div>
                <div className="legend-square" style={{backgroundColor: colorBookable}}></div>
                <input type="checkbox" id="bookable" checked={props.filters["bookable"]} onChange={(event) => onFiltersChange(event)} />
                <label htmlFor="bookable">Bookable</label>
            </div>
            <div>
                <div className="legend-square" style={{backgroundColor: colorRemote}}></div>
                <input type="checkbox" id="remote" checked={props.filters["remote"]} onChange={(event) => onFiltersChange(event)} />
                <label htmlFor="remote">Remote</label>
            </div>
        </div>
    }
}

export default LectureCalendarStudent;