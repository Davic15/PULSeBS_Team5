import React from 'react';
import API from '../../API';
import {Link, Redirect} from "react-router-dom";
import {AuthContext} from '../AuthContext/AuthContext';
import "../Courses/CourseList.css";

import "./CourseList.css";

class CourseList extends React.Component {
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
        /*
        return <AuthContext.Consumer>
            {(context) => (
                <div className="col-5" style={{margin:"auto"}}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.courses.map((course) => <tr>
                                <td>{course.CourseName}</td>
                                <td><Link to={"/statistics/"+course.CourseId}>Statistics</Link></td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            )
        }
        </AuthContext.Consumer>;*/
        return <AuthContext.Consumer>
            {(context) => (
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
                                <td><Link to={"/statistics/"+course.CourseId}>Statistics</Link></td>
                            </tr>)}
                        </tbody>
                    </table>
                    <br></br>
                </div>
            )
        }
        </AuthContext.Consumer>;
    }
}

export default CourseList;