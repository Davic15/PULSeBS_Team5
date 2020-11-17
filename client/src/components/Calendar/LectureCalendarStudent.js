import React from 'react';
import './Calendar.css';
import API from '../../API';
import LectureCalendar from './LectureCalendar';

const moment = require('moment');

const colorBookable = "white";
const colorBooked = "green";
const colorFull = "yellow";
const colorRemote = "orange";

class LectureCalendarStudent extends React.Component {

    constructor(props){
        super(props);
        const filters = {
            bookable: true,
            booked: true,
            full: true,
            remote: true
        }
        this.state = {day: moment(), filters: filters, lectures: [], selectedLectures: []};
    }

    componentDidMount() { 
        this.getLectures();
    }

    onDateChange = (value) => {
        this.setState({day: moment(value)});
        this.getLectures();
    }

    getLectures = () => {
        const start = moment(this.state.day);
        const end = moment(start).add(6, 'days');
        API.getStudentLectures(start, end)
        .then((lectures) => {
            this.setState({day: start, lectures: lectures});
            this.applyFilters(this.state.filters);
        }).catch((err) => console.log(err));
    }

    book = (lectureId) => {
        API.book(lectureId)
        .then(this.getLectures)
        .catch((err) => console.log(err));
    }

    cancelBooking = (bookingId) => {
        API.cancelBooking(bookingId)
        .then(this.getLectures)
        .catch((err) => console.log(err));
    }

    isBooked = (lecture) => { return (lecture.State==0 && lecture.BookingId != null); }
    isBookable = (lecture) => { return (lecture.State==0 && lecture.Seats > lecture.BookingCount && lecture.BookingId == null); }
    isFull = (lecture) => { return (lecture.State==0 && lecture.Seats <= lecture.BookingCount && lecture.BookingId == null); }
    isRemote = (lecture) => { return lecture.State!=0; }

    getColorCode = (lecture) => {
        if(this.isBookable(lecture))
            return colorBookable;
        else if(this.isBooked(lecture))
            return colorBooked;
        else if(this.isFull(lecture))
            return colorFull;
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
            return filters.booked && this.isBooked(lecture) ||
                filters.bookable && this.isBookable(lecture) ||
                filters.full && this.isFull(lecture) ||
                filters.remote && this.isRemote(lecture);
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
            <p>{start.format("HH:mm")+" - "+end.format("HH:mm")}</p>
            <p>{lecture.TeacherName+" "+lecture.TeacherSurname}</p>
            {!(this.isRemote(lecture)) && <>
                <p>{lecture.ClassroomName}</p>
                <p>{lecture.BookingCount+"/"+lecture.Seats}</p>
            </>}
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

        return <div>
            <b>{lecture.CourseName}</b>
            <p>{start.format("HH:mm")+" - "+end.format("HH:mm")}</p>
            <p>{lecture.TeacherName+" "+lecture.TeacherSurname}</p>
            <p>{lecture.ClassroomName}</p>
            <p>{lecture.Seats}</p>
            {this.isBookable(lecture) && <button onClick={book}>Book</button>}
            {this.isBooked(lecture) && <button onClick={cancelBooking}>Cancel booking</button>}
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
                <div className="legend-square" style={{backgroundColor: colorBookable}}></div>
                <input type="checkbox" id="bookable" checked={props.filters["bookable"]} onChange={(event) => onFiltersChange(event)} />
                <label htmlFor="bookable">Bookable</label>
            </div>
            <div>
                <div className="legend-square" style={{backgroundColor: colorFull}}></div>
                <input type="checkbox" id="full" checked={props.filters["full"]} onChange={(event) => onFiltersChange(event)} />
                <label htmlFor="full">Bookable (Full)</label>
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