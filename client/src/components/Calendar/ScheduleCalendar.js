import React from 'react';
import API from '../../API';
import LectureCalendar from './LectureCalendar';
import LegendFilter from "../Legend/LegendFilter";
//import {AuthContext} from '../AuthContext/AuthContext';
//import {Redirect} from "react-router-dom";
import {colors, descriptions} from "./CalendarMisc";
import {getWeek} from '../../Functions';
import Modal from 'react-bootstrap/Modal';
import Link from "react-router-dom";
import Button from 'react-bootstrap/Button';
import ReactTooltip from 'react-tooltip';
import TimePicker from 'react-time-picker';
import "bootstrap/dist/css/bootstrap.min.css";

const moment = require('moment');

class ScheduleCalendar extends React.Component {
    constructor(props) {
        super(props);
        const filters = [
            {color: colors.bookable, name: "Presence", checked: true},
            {color: colors.remote, name: "Remote", checked: true}
        ];
        const monday = moment().subtract(1, "days").add(1, "weeks").day(1).hour(0).minute(0).second(0);
        this.state = {day: monday, lectures: [], filters: filters, selectedLectures: [],
            classrooms: [], weekDay: "Mon", startTime: "08:30", endTime: "11:30", remote: false, classroomId: 0};
    }

    render() {
        return (
            <div>
                <LegendFilter
                    filters={this.state.filters}
                    onFiltersChange={this.applyFilters}
                />
                <LectureCalendar
                    onDateChange={this.onDateChange}
                    lectures={this.state.selectedLectures}
                    lectureComponent={this.LectureComponent}
                    modalComponent={this.CalendarModal}
                    minDate={moment().subtract(1, "days").add(1, "weeks").day(1).hour(0).minute(0).second(0)}
                />
            </div>
        );
    }

    componentDidMount() {
        this.onDateChange(this.state.day);
    }

    onDateChange = (value) => {
        const day = moment(value);
        this.setState({day: moment(value)});
        this.getLectures(day);
    }

    getLectures = (day) => {
        if(!day)
            day = this.state.day;
        const week = getWeek(day);
        API.getCourseLectures(this.props.courseId, week.first, week.last)
        .then((lectures) => {
            lectures.forEach((lecture) => lecture.getLectures = this.getLectures);
            this.setState({lectures: lectures});
            this.applyFilters(this.state.filters);
        })
        .catch((err) => console.log(err));
    }

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

    isPresence = (lecture) => { return lecture.State==0; }
    isRemote = (lecture) => { return lecture.State!=0; }

    applyFilters = (filters) => {
        const selectedLectures = this.state.lectures.filter((lecture) => {
            return (filters[0].checked && this.isPresence(lecture)) ||
                (filters[1].checked && this.isRemote(lecture));
        });
        this.setState({filters: filters, selectedLectures: selectedLectures});
    }

    LectureComponent = (props) => {
        const start = moment(props.start);
        const end = moment(props.end);
        const value = props.value;
        const lecture = JSON.parse(value);
    
        return  <>
            <div className="lecture" data-tip={this.getDescription(lecture)}>
                <div className="lecture-tag" style={{backgroundColor:this.getColorCode(lecture)}}>
                    <b>{lecture.CourseName}</b>
                </div>
                <div className="lecture-body">
                    <p>
                        {start.format("HH:mm")+" - "+end.format("HH:mm")}<br/>
                        {!(this.isRemote(lecture)) && <>
                            {lecture.ClassroomName}<br/>
                        </>}
                    </p>
                </div>
            </div>
            <ReactTooltip place="top" type="dark" effect="solid"/>
        </>;
    }

    getClassrooms = (minSeats) => {
        API.getClassrooms(minSeats)
        .then((classrooms) => 
            this.setState({classrooms: classrooms})
        )
        .catch((err) => console.log(err));
    }

    onWeekDayChange = (event) => {
        const day = event.target.value;
        this.setState({weekDay: day});
    }

    onStartTimeChange = (value) => {
        this.setState({startTime: value});
    }

    onEndTimeChange = (value) => {
        this.setState({endTime: value});
    }

    

    CalendarModal = (props) => {
        const start = moment(props.start);
        const end = moment(props.end);
        const lecture = JSON.parse(props.value);
        this.getClassrooms(lecture.Seats);

        const closeModal = () => { 
            props.onSave(this.props.value);
        }

        const loadState = () => {
            this.setState({
                lecture: lecture,
                getLectures: lecture.getLectures,
                lectureId: lecture.LectureId,
                weekDay: start.format("ddd"),
                startTime: start.format("HH:mm"),
                endTime: end.format("HH:mm"),
                remote: this.isRemote(lecture),
                classroomId: lecture.ClassroomId
            });
        }

        const updateSchedule = () => {
            API.updateSchedule(
                this.state.lectureId,
                this.state.weekDay,
                this.state.startTime,
                this.state.endTime,
                this.state.remote,
                this.state.classroomId
            ).then(() => {
                this.getLectures();
                closeModal();
            }).catch((err) => console.log(err));
        }

        return (<>
            <Loader loadState={loadState} />
            <Modal.Dialog>
                <Modal.Header>
                    <Modal.Title>Lecture Schedule</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label>Day</label>
                                <select class="form-control" value={this.state.weekDay} onChange={(event) => this.onWeekDayChange(event)}>
                                    <option value="Mon">Monday</option>
                                    <option value="Tue">Tuesday</option>
                                    <option value="Wed">Wednesday</option>
                                    <option value="Thu">Thursday</option>
                                    <option value="Fri">Friday</option>
                                    <option value="Sat">Saturday</option>
                                </select>
                            </div>
                            <div class="form-group col-md-6">
                                <label>Start time</label>
                                <TimePicker
                                    onChange={this.onStartTimeChange}
                                    value={this.state.startTime}
                                    format="HH:mm"
                                    minTime="08:00"
                                    maxTime="20:00"
                                />
                            </div>
                        </div>
                        <div class="form-group">
                            <label>End Time</label>
                            <TimePicker
                                onChange={this.onEndTimeChange}
                                value={this.state.endTime}
                                format="HH:mm"
                                minTime="08:00"
                                maxTime="20:00"
                            />
                        </div>
                            <div class="form-group">
                                <label>Remote</label>
                                <br />
                                <input type="checkbox" checked={this.state.remote} onChange={(event) => this.setState({remote: event.target.checked})}/>
                                <label>Yes/No</label>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label for="class-room">Classroom</label>
                                <select class="form-control" value={this.state.classroomId} onChange={(event) => this.setState({classroomId: event.target.value})}>
                                    {
                                        this.state.classrooms.map((classroom) => 
                                            <option value={classroom.ClassroomId}>{classroom.Name}</option>
                                        )
                                    }
                                </select>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <button type="submit" onClick={updateSchedule} class="btn btn-primary">Apply</button>
                </Modal.Footer>
            </Modal.Dialog>
        </>);
    }
}

class Loader extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.loadState();
    }

    render() {
        return <></>;
    }
}

/*class CalendarModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {classrooms: [], weekDay: "Mon", startTime: "08:30", endTime: "11:30", remote: false, classroomId: 0};
    }

    isRemote = (lecture) => { return lecture.State!=0; }

    componentDidMount() {
        const start = moment(this.props.start);
        const end = moment(this.props.end);
        const lecture = JSON.parse(this.props.value);
        this.getClassrooms(lecture.Seats);
        this.setState({
            lecture: lecture,
            getLectures: lecture.getLectures,
            lectureId: lecture.LectureId,
            weekDay: start.format("ddd"),
            startTime: start.format("HH:mm"),
            endTime: end.format("HH:mm"),
            remote: this.isRemote(lecture),
            classroomId: lecture.ClassroomId
        });
    }

    getClassrooms = (minSeats) => {
        API.getClassrooms(minSeats)
        .then((classrooms) => 
            this.setState({classrooms: classrooms})
        )
        .catch((err) => console.log(err));
    }

    closeModal = () => { 
        this.props.onSave(this.props.value);
        console.log("Close!");
    }

    onWeekDayChange = (event) => {
        const day = event.target.value;
        this.setState({weekDay: day});
    }

    onStartTimeChange = (value) => {
        this.setState({startTime: value});
    }

    onEndTimeChange = (value) => {
        this.setState({endTime: value});
    }

    updateSchedule = () => {
        API.updateSchedule(
            this.state.lectureId,
            this.state.weekDay,
            this.state.startTime,
            this.state.endTime,
            this.state.remote,
            this.state.classroomId
        ).then(() => {
            this.state.getLectures();
            this.closeModal();
        }).catch((err) => console.log(err));
    }

    render() {
        const start = moment(this.props.start);
        const end = moment(this.props.end);
        const lecture = JSON.parse(this.props.value);

        return (
            <Modal.Dialog>
                <Modal.Header>
                    <Modal.Title>Lecture Schedule</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label>Day</label>
                                <select class="form-control" value={this.state.weekDay} onChange={(event) => this.onWeekDayChange(event)}>
                                    <option value="Mon">Monday</option>
                                    <option value="Tue">Tuesday</option>
                                    <option value="Wed">Wednesday</option>
                                    <option value="Thu">Thursday</option>
                                    <option value="Fri">Friday</option>
                                    <option value="Sat">Saturday</option>
                                </select>
                            </div>
                            <div class="form-group col-md-6">
                                <label>Start time</label>
                                <TimePicker
                                    time={this.state.startTime}
                                    theme="Bourbon"
                                    className="timepicker form-control"
                                    placeholder="Start Time"
                                    onSet={(val) => {
                                        this.onStartTimeChange(val);
                                    }}
                                />
                            </div>
                        </div>
                        <div class="form-group">
                            <label>End Time</label>
                            <TimePicker
                                time={this.state.endTime}
                                theme="Bourbon"
                                className="timepicker form-control"
                                placeholder="Start Time"
                                onSet={(val) => {
                                    this.onEndTimeChange(val);
                                }}
                            />
                        </div>
                            <div class="form-group">
                                <label>Remote</label>
                                <br />
                                <input type="checkbox" checked={this.state.remote} onChange={(event) => this.setState({remote: event.target.checked})}/>
                                <label>Yes/No</label>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label for="class-room">Classroom</label>
                                <select class="form-control" value={this.state.classroomId} onChange={(event) => this.setState({classroomId: event.target.value})}>
                                    {
                                        this.state.classrooms.map((classroom) => 
                                            <option value={classroom.ClassroomId}>{classroom.Name}</option>
                                        )
                                    }
                                </select>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <button type="submit" onClick={this.updateSchedule} class="btn btn-primary">Apply</button>
                </Modal.Footer>
            </Modal.Dialog>
        );
    }
}*/

export default ScheduleCalendar;