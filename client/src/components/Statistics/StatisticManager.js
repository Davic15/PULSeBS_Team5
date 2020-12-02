import React from 'react';
import API from '../../API';
import LectureCalendar from "../Calendar/LectureCalendar";
import LegendFilter from "../Legend/LegendFilter";
import { Chart } from 'react-charts';
import {getWeek, getMonth, weekSQLtoMoment, monthSQLtoMoment} from '../../Functions';
import { statistics, statisticMap, normalizeWeek, normalizeMonth } from './StatisticMisc';
import {colors } from "../Calendar/CalendarMisc";

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import "./Statistic.css";

const moment = require('moment');

class ChartManager extends React.Component {

    constructor(props) {
        super(props);
        const filters = [
            {name:statistics.bookings.label, color: statistics.bookings.color, checked:true},
            {name:statistics.attendance.label, color: statistics.attendance.color, checked: true},
            {name:statistics.cancellations.label, color: statistics.cancellations.color, checked: true}
        ]
        this.state = {filters: filters}
    }

    applyFilters = (filters, chartData) => {
        const filteredData = [];
        for(let data of chartData) {
            for(let filter of filters) {
                if(data.label === filter.name && filter.checked){
                    filteredData.push(data);
                    break;
                }
            }
        }

        return filteredData;
    }

    getDatumStyle = (datum) => {
        return {
            opacity: datum.index == 2 ? 1 : 0.3,
        };
    }
    
    getSeriesStyle = (series) => {
        return {
            fill: statisticMap[series.label].color
        };
    }

    render() {
        let zeros = [];
        for(let i=0; i<5; i++)
            zeros.push(0);
        const bookingData = (this.props.statistics && this.props.statistics.bookingData) || zeros;
        const attendanceData = (this.props.statistics && this.props.statistics.attendanceData) || zeros;
        const cancellationData = (this.props.statistics && this.props.statistics.cancellationData) || zeros;
        const timeLabels = (this.props.statistics && this.props.statistics.timeLabels) || ["A", "B", "C", "D", "E"];

        let chartData = [{
                label: statistics.bookings.label,
                data: bookingData.map((bookings, i) => [timeLabels[i], bookings])
            },
            {
                label: statistics.attendance.label,
                data: attendanceData.map((attendance, i) => [timeLabels[i], attendance])
            },
            {
                label: statistics.cancellations.label,
                data: cancellationData.map((cancellations, i) => [timeLabels[i], cancellations])
            }
        ];

        chartData = this.applyFilters(this.state.filters, chartData);
        
        let max = 0;
        for(let i=0; i<chartData.length; i++) {
            for(let j=0; j<chartData[i].data.length; j++) {
                const value = chartData[i].data[j][1];
                if(value > max)
                    max = value;
            }
        }
        max += max*0.1;

        const axes =  [
            { primary: true, type: 'ordinal', position: 'bottom' },
            { type: 'linear', position: 'left', stacked: false, hardMin: 0, hardMax: max }
        ];
        
        const series = {
            type: 'bar'
        };

        return <div className="chart-container">
            <Chart 
                data={chartData} series={series} axes={axes}           
                getSeriesStyle={this.getSeriesStyle}
                getDatumStyle={this.getDatumStyle}
                tooltip
            />
            <LegendFilter filters={this.state.filters} onFiltersChange={(filters) => this.setState({filters: filters})}/>
        </div>;
    }
}

class StatisticManager extends React.Component {
    
    constructor(props){
        super(props);
        const filters = [
            {color: colors.bookable, name: "Presence", checked: true},
            {color: colors.remote, name: "Remote", checked: true}
        ];
        this.state = {day: moment(), filters: filters, lectures: [], selectedLectures: []};
    }

    getLectures = (day) => {
        const week = getWeek(day);
        API.getCourseLectures(this.props.courseId, week.first, week.last)
        .then((lectures) => {
            this.setState({lectures: lectures});
            this.applyFilters(this.state.filters);
        })
        .catch((err) => console.log(err));
    }

    getLectureStatistics = (lectureId, start) => {
        API.getLectureStatistics(lectureId, 2)
        .then((rows) => this.setLectureStatistics(rows, lectureId, start))
        .catch((err) => console.log(err));
    }

    getWeeklyStatistics = (day) => {
        const week = getWeek(day);
        const first = moment(week.first).subtract(2, 'weeks');
        const last = moment(week.last).add(2, 'weeks');
        API.getWeeklyStatistics(this.props.courseId, first, last)
        .then((rows) => this.setWeeklyStatistics(rows, first))
        .catch((err) => console.log(err));
    }

    getMonthlyStatistics = (day) => {
        const month = getMonth(day);
        const first = moment(month.first).subtract(2, 'months');
        const last = moment(month.last).add(2, 'months');
        API.getMonthlyStatistics(this.props.courseId, first, last)
        .then((rows) => this.setMonthlyStatistics(rows, first))
        .catch((err) => console.log(err));
    }

    onDateChange = (value) => {
        const day = moment(value);
        this.setState({day: moment(value)});
        this.getLectures(day);
        this.getWeeklyStatistics(day);
        this.getMonthlyStatistics(day);
    }

    setWeeklyStatistics = (rows, first) => {
        const startWeek = moment(first).week();
        const startYear = moment(first).year();
        let timeLabels = [];
        let bookingData = [];
        let attendanceData = [];
        let cancellationData = [];

        for(let i=0; i<5; i++) {
            bookingData[i] = attendanceData[i] = cancellationData[i] = 0;
            const weekFirst = moment(first).add(i, 'weeks');
            const weekLast = getWeek(weekFirst).last;
            const label = weekFirst.format("DD/MM") + " - " + weekLast.format("DD/MM");
            timeLabels.push(label);
        }
        rows.forEach((row) => {
            const i = normalizeWeek(startWeek, startYear, weekSQLtoMoment(row.Week), row.Year) - startWeek;
            bookingData[i] = row.AvgBooked + row.AvgQueue;
            attendanceData[i] = row.AvgPresent;
            cancellationData[i] = row.AvgCancelled;
        });
        this.setState({weeklyStatistics: {bookingData: bookingData, attendanceData: attendanceData, cancellationData: cancellationData, timeLabels: timeLabels}});
    }
    
    setMonthlyStatistics = (rows, first) => {
        const startMonth = moment(first).month();
        const startYear = moment(first).year();
        let timeLabels = [];
        let bookingData = [];
        let attendanceData = [];
        let cancellationData = [];

        for(let i=0; i<5; i++) {
            bookingData[i] = attendanceData[i] = cancellationData[i] = 0;
            const monthFirst = moment(first).add(i, 'months');
            const label = monthFirst.format("MMMM 'YY");
            timeLabels.push(label);
        }
        rows.forEach((row) => {
            const i = normalizeMonth(startMonth, startYear, monthSQLtoMoment(row.Month), row.Year) - startMonth;
            bookingData[i] = row.AvgBooked + row.AvgQueue;
            attendanceData[i] = row.AvgPresent;
            cancellationData[i] = row.AvgCancelled;
        });
        this.setState({monthlyStatistics: {bookingData: bookingData, attendanceData: attendanceData, cancellationData: cancellationData, timeLabels: timeLabels}});
    }

    setLectureStatistics = (rows, lectureId, start) => {
        let timeLabels = [];
        let bookingData = [];
        let attendanceData = [];
        let cancellationData = [];
        
        for(let i=0; i<5; i++) {
            bookingData[i] = attendanceData[i] = cancellationData[i] = 0;
            timeLabels.push("");
        }
        let index = 0;
        let found = false;
        do {
            rows.sort((l1, l2) => moment(l1.Start).format("YYYY-MM-DD HH:mm").localeCompare(moment(l2.Start).format("YYYY-MM-DD HH:mm")));
            rows.forEach((row, i) => {
                if(row.LectureId === lectureId) {
                    index = i;
                    found = true;
                }
            });
            if(!found) {
                const fakeRow = {
                    LectureId: lectureId,
                    Start: start,
                    TotBooked: 0,
                    TotQueue: 0,
                    TotCancelled: 0,
                    TotPresent: 0
                };
                rows.push(fakeRow);
            }
        } while(!found);
        const offset = 2 - index;
        rows.forEach((row, i) => {
            bookingData[i + offset] = row.TotBooked + row.TotQueue;
            attendanceData[i + offset] = row.TotPresent;
            cancellationData[i + offset] = row.TotCancelled;
            timeLabels[i + offset] = moment(row.Start).format("DD/MM HH:mm");
        });
        this.setState({lectureStatistics: {bookingData: bookingData, attendanceData: attendanceData, cancellationData: cancellationData, timeLabels: timeLabels}});
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

    applyFilters = (filters) => {
        const selectedLectures = this.state.lectures.filter((lecture) => {
            return (filters[0].checked && this.isPresence(lecture)) ||
                (filters[1].checked && this.isRemote(lecture));
        });
        this.setState({filters: filters, selectedLectures: selectedLectures});
    }

    componentDidMount() {
        this.getLectures(this.state.day);
        this.getWeeklyStatistics(this.state.day);
        this.getMonthlyStatistics(this.state.day);
    }
    
    componentDidMount() {
        this.getLectures(this.state.day);
        this.getWeeklyStatistics(this.state.day);
        this.getMonthlyStatistics(this.state.day);
    }

    render() {        
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
            <div className="row">
                <div className="col-4 statistic">
                    <h1>Weekly statistics</h1>
                    <ChartManager statistics={this.state.weeklyStatistics} />
                </div>
                <div className="col-4 statistic">
                    <h1>Monthly statistics</h1>
                    <ChartManager statistics={this.state.monthlyStatistics} />
                </div>
            </div>
        </div>;
    }

    Modal = (props) => {
        const lecture = JSON.parse(props.value);
        const closeModal = () => { props.onSave(props.value); }

        return <Modal.Dialog>
            <Modal.Header>
                <Modal.Title>Lecture Statistics</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <LectureStatistics onLoad={() => this.getLectureStatistics(lecture.LectureId, lecture.Start)} statistics={this.state.lectureStatistics}/>  
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => closeModal()}>Close</Button>
            </Modal.Footer>
        </Modal.Dialog>;
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
                <p>{start.format("HH:mm")+" - "+end.format("HH:mm")}<br/>
                {!(this.isRemote(lecture)) && <>
                    {lecture.ClassroomName}<br/>
                </>}</p>
            </div>
        </div>;
    }
}

class LectureStatistics extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.onLoad();
    }

    render() {
        return <div className="statistic">
            <ChartManager statistics={this.props.statistics} />
        </div>;
    }
}

export default StatisticManager;