import React from 'react';
import WeekCalendar from 'react-week-calendar';
//import HeaderCell from 'react-week-calendar';
//import 'react-week-calendar/dist/style.less';
// or import css file
import 'react-week-calendar/dist/style.css';
import DatePicker from 'react-date-picker'

import './Calendar.css';
//import API from '../../API';

const moment = require('moment');

class LectureCalendar extends React.Component {

    constructor(props){
        super(props);
        this.state = {day: moment(), lectures: [], students: []};
    }

    componentDidMount() { 

    }

    onDateChange = (value) => {
        this.setState({day: moment(value)});
        this.props.onDateChange(value);
    }

    render() {
        const start = moment(this.state.day);
        start.subtract(start.weekday()-1, 'days');
        return <>
        <div className="calendar-container">
            <div className="daypick-row">
                <DatePicker
                    minDate={moment().toDate()}
                    onChange={this.onDateChange}
                    value={this.state.day.toDate()}
                />
            </div>
            <WeekCalendar 
                firstDay={start} 
                numberOfDays={5} 
                startTime={moment({h: 8, m: 0})} 
                endTime={moment({h: 20, m: 0})} 
                scaleUnit={30} 
                cellHeight={60} 
                dayFormat={"dddd DD/MM"} 
                useModal={true}
                showModalCase={["edit"]}
                eventComponent={this.props.lectureComponent}
                modalComponent={this.props.modalComponent}
                selectedIntervals={this.props.lectures.map((lecture) => ({start: moment(lecture.Start), end: moment(lecture.End), value: JSON.stringify(lecture)}))}
            />
        </div>
        </>;
    }
}
/*const DayComponent = (props) => {
    return <HeaderCell className="day" date={props.date} dayFormat={props.dayFormat}/>;
}*/

export default LectureCalendar;