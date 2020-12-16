import React from "react";
import API from '../../API';
import "./UpdateBooking.css";

import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import DatePicker from 'react-date-picker';

const moment = require('moment');

class UpdateBooking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {suspended: [], active: [], date: moment().add(1,'days')};
    }

    componentDidMount() {
       this.getYears();
    }

    getYears = () => {
        API.getRestrictedYears()
        .then((years) => {
            let suspended = [];
            let active = [];
            for(let year of years) {
                year.checked = false;
                if(year.Restricted)
                    suspended.push(year);
                else
                    active.push(year);
            }
            this.setState({suspended: suspended, active: active});
        }).catch((err) => console.log(err));
    }

    putRestrictions = () => {
        let selectedYears = this.state.active.filter((year) => year.checked);
        
        let promises = selectedYears.map((year) => {
            return API.putRestrictions(year.Year, this.state.date);
        });
        Promise.all(promises).then(() => this.getYears())
        .catch((err) => console.log(err));
    }

    liftRestrictions = () => {
        let selectedYears = this.state.suspended.filter((year) => year.checked);
        let promises = selectedYears.map((year) => {
            return API.liftRestrictions(year.Year, this.state.date);
        });
        Promise.all(promises).then(() => this.getYears())
        .catch((err) => console.log(err));
    }

    selectYear = (year) => {
        year.checked = !(year.checked);
        this.setState({active: this.state.active, suspended: this.state.suspended});
    }

    onDateChange = (value) => {
        this.setState({date: moment(value)});
    }

    render() {
        return(<>
            <DatePicker
                minDate={moment().add(1,'days').toDate()}
                onChange={this.onDateChange}
                value={this.state.date.toDate()}
            />
            <div class="container center-button">
                <h3>Active Courses</h3>
                <div class="row">
                    <div class="col-12">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th scope="col"></th>
                                    <th scope="col">Year</th>
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.active.map((year) => <tr>
                                    <td>
                                        <input type="checkbox" id="customCheck1" checked={year.checked} onChange={() => this.selectYear(year)}/>
                                    </td>
                                    <td>{year.Year}</td>
                                    <td>Active</td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Button variant="primary" onClick={this.putRestrictions}>Suspend</Button>
            </div>
            <div class="container center-button">
                <h3>Suspended Courses</h3>
                <div class="row">
                    <div class="col-12">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th scope="col"></th>
                                    <th scope="col">Year</th>
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.suspended.map((year) => <tr>
                                    <td>
                                        <input type="checkbox" id="customCheck1" checked={year.checked} onChange={() => this.selectYear(year)}/>
                                    </td>
                                    <td>{year.Year}</td>
                                    <td>Active</td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Button variant="primary" onClick={this.liftRestrictions}>Activate</Button>
            </div></>
        );
    }
}

export default UpdateBooking;