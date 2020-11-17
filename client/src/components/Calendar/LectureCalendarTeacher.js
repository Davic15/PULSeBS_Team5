import React from 'react';
import './Calendar.css';
import API from '../../API';
import LectureCalendar from './LectureCalendar';

const moment = require('moment');

const colorPresence = "white";
const colorRemote = "orange";

class LectureCalendarTeacher extends React.Component {

    constructor(props){
        super(props);
        this.state = {day: moment(), lectures: [], students: []};
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
        API.getTeacherLectures(start, end)
        .then((lectures) => this.setState({day: start, lectures: lectures}))
        .catch((err) => console.log(err));
    }

    cancelLecture = (lectureId) => {
        API.cancelLecture(lectureId)
        .then(this.getLectures)
        .catch((err) => console.log(err));
    }

    changeLecture = (lectureId) => {
        API.changeLecture(lectureId)
        .then(this.getLectures)
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
            return colorPresence;
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
                lectures={this.state.lectures}
                lectureComponent={this.LectureComponent}
                modalComponent={this.Modal}
            />
        </>;
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

        const closeModal = () => { props.onSave(props.value); }
    
        const cancelLecture = () => {
            this.cancelLecture(lecture.LectureId);
            closeModal();
        }

        const changeLecture = () => {
            this.changeLecture(lecture.LectureId);
            closeModal();
        }

        /*if(this.isPresence(lecture))
            this.getStudentList(lecture);*/

        return <div>
            <b>{lecture.CourseName}</b>
            <p>{start.format("HH:mm")+" - "+end.format("HH:mm")}</p>
            <p>{lecture.ClassroomName}</p>
            {!(this.isRemote(lecture)) && <>
                <p>{lecture.ClassroomName}</p>
                <p>{lecture.BookingCount+"/"+lecture.Seats}</p>
            </>}
            
            {this.isPresence(lecture) && <button onClick={changeLecture}>Change to remote lecture</button>}
            <button onClick={cancelLecture}>Cancel lecture</button>
            <button onClick={() => closeModal()}>Close</button>
        </div>;
    }
}

export default LectureCalendarTeacher;