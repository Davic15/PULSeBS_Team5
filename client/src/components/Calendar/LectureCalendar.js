import React from 'react';
import WeekCalendar from 'react-week-calendar';
import 'react-week-calendar/dist/style.css';
import DatePicker from 'react-date-picker'

import './Calendar.css';

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
                headerCellComponent={this.CustomHeaderCell}
                selectedIntervals={this.props.lectures.map((lecture) => ({start: moment(lecture.Start), end: moment(lecture.End), value: JSON.stringify(lecture)}))}
            />
        </div>
        </>;
    }

    CustomHeaderCell = (props) => {
        const date = moment(props.date);
        const displayDate = date.format(props.dayFormat);

        let style = {};
        if(date.format("DD/MM/YYYY") == moment(this.state.day).format("DD/MM/YYYY"))
            style = {backgroundColor: "#3f72af", width: "100%", height: "100%", display:"block", borderRadius: "1rem"};
        return <span style={style}>{displayDate}</span>
    }
}


export default LectureCalendar;