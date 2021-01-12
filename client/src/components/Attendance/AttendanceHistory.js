import React from "react";
import API from '../../API';
import { Link } from "react-router-dom";
import "./Attendance.css";
import "bootstrap/dist/css/bootstrap.min.css";

class AttendanceHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {students: []};
    }

    componentDidMount() {
        this.getStudentList(this.props.lectureId);
    }

    getStudentList = (lectureId) => {
        API.getStudentList(lectureId)
        .then((students) => this.setState({students: students}))
        .catch((err) => console.log(err));
    }

    render() {
        return (
            <main class="container pt-5">        
            <h2>List of students</h2>    
                <table class="table table-bordered table-definition mb-5">
                    <thead class="">
                        <tr>
                            <th>Student ID</th>
                            <th>Surnames</th>
                            <th>Names</th>
                            <th>Present</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.students.map((student) => 
                                <tr key={student.BookingId}>
                                    <td>{student.StudentId}</td>
                                    <td>{student.Surname}</td>
                                    <td>{student.Name}</td>
                                    <td>
                                        <label class="custom-control custom-checkbox">
                                            <input type="checkbox" checked={student.Present} 
                                                 class="custom-control-input" disabled={true}/>
                                            <span class="custom-control-indicator"></span>
                                        </label>
                                    </td>
                                </tr>
                            )
                        }
                    </tbody>
                    <tfoot>
                        <tr>
                            <th></th>
                            <th colspan="4">
                                <Link to="/lectures"><button class="btn btn-primary float-right">Close</button></Link>
                            </th>
                        </tr>
                    </tfoot>
                </table>
            </main>
        );
    }
}

export default AttendanceHistory;