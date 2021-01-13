import React from 'react';
import API from '../../API';
import {Link} from "react-router-dom";
//import {AuthContext} from '../AuthContext/AuthContext';
import "../Courses/CourseList.css";

import "./CourseList.css";

class CourseListOfficer extends React.Component {
    constructor(props) {
        super(props);
        this.state = ({courses: []});
    }

    componentDidMount() {
        API.getCourseList()
        .then((courses) => this.setState({courses: courses}))
        .catch((err) => console.log(err));
    }

    render() {
        return (
            <div className="table-responsive col-5 table-container" style={{margin:"auto"}}>
                <table className="table table-striped table-bordered new-line">
                    <thead className="thead-light">
                        <tr>
                            <th><strong>Courses</strong></th>
                            <th><strong>Option</strong></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.courses.map((course) => <tr>
                            <td>{course.CourseName}</td>
                            <td><Link to={"/schedule/"+course.CourseId}>Schedule</Link></td>
                        </tr>)}
                    </tbody>
                </table>
                <br></br>
            </div>
        );

    }
}

export default CourseListOfficer;