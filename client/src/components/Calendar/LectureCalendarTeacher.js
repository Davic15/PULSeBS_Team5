import React from 'react';
import './Calendar.css';
import API from '../../API';
import LectureCalendar from './LectureCalendar';
import {AuthContext} from '../AuthContext/AuthContext';
import {Redirect} from "react-router-dom";

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
        const day = moment(value);
        this.setState({day: moment(value)});
        this.getLectures(day);
    }

    getLectures = (day) => {
        const start = moment(day);
        start.subtract(start.weekday()-1, 'days');
        const end = moment(start).add(6, 'days');
        API.getTeacherLectures(start, end)
        .then((lectures) => this.setState({lectures: lectures}))
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
            <div>
                <div>
                    <LectureCalendar
                        onDateChange={this.onDateChange}
                        lectures={this.state.lectures}
                        lectureComponent={this.LectureComponent}
                        modalComponent={this.Modal}
                    />
                </div>
                <AuthContext.Consumer>
                    {(context)=>(
                    <div className="div-center">
                        {context.authUser && 
                            <>
                                <button className="btn btn-lg btn-primary text-uppercase custom-color btn-size-teacher btn-default" type="submit" variant="primary" onClick = {() => {context.logoutUser()}} >Log out</button>
                            </>
                        }
                        {!context.authUser && <Redirect to = "/login"/>} 
                    </div>
                )}
                </AuthContext.Consumer>
            </div>
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
            <p>{start.format("HH:mm")+" - "+end.format("HH:mm")}<br/>
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

        return <div>
            <b>{lecture.CourseName}</b>
            <p>{start.format("HH:mm")+" - "+end.format("HH:mm")}</p>
            {this.isPresence(lecture) && <>
                <p>{lecture.ClassroomName}</p>
                <p>{lecture.BookingCount+"/"+lecture.Seats}</p>
                <StudentList onLoad={() => this.getStudentList(lecture.LectureId)} students={this.state.students}/>
            </>}
            
            {(this.isPresence(lecture) && minutesLeft>=30 ) && <button onClick={changeLecture}>Change to remote lecture</button>}
            {minutesLeft>=60 && <button onClick={cancelLecture}>Cancel lecture</button>}
            <button onClick={() => closeModal()}>Close</button>
        </div>;
    }
}

class StudentList extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.onLoad();
    }

    render() {
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
        
    }
}

export default LectureCalendarTeacher;