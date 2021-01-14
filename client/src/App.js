import React from 'react';
import './App.css';
import {Route,Switch,withRouter, Redirect} from 'react-router-dom';
import Header from "./components/Header/Header";
import Login from "./components/Login/Login";
import Footer from "./components/Footer/Footer";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import API from "../src/API";
import {AuthContext} from "../src/components/AuthContext/AuthContext";
//import WeekCalendar from "./components/Calendar/LectureCalendar";
//import LectureCalendar from './components/Calendar/LectureCalendar';
import LectureCalendarStudent from './components/Calendar/LectureCalendarStudent';
import LectureCalendarTeacher from './components/Calendar/LectureCalendarTeacher';
import CourseList from "./components/Courses/CourseList";
import StatisticManager from "./components/Statistics/StatisticManager";
import StatisticTeacher from "./components/Statistics/StatisticTeacher";
import ContactTracingList from "./components/ContactTracing/ContactTracingList";
import UpdateBooking from "./components/UpdateBooking/UpdateBooking";
import UploadFile from "./components/UploadFile/UploadFile";
import Attendance from "./components/Attendance/Attendance.js";
import AttendanceHistory from "./components/Attendance/AttendanceHistory.js";
import ScheduleCalendar from './components/Calendar/ScheduleCalendar';
import CourseListOfficer from './components/Courses/CourseListOfficer';
import Bookings from './components/Attendance/Bookings';

class App extends React.Component{

  constructor(props)  {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    //check if the user is authenticated
    API.isAuthenticated().then(
      (user) => {
        this.setState({authUser: user});
      }
    ).catch((err) => { 
      this.setState({authErr: err.errorObj});
      //this.props.history.push("/login");
    });
  }

  handleErrors(err) {
    if (err) {
        if (err.status && err.status === 401) {
          this.setState({authErr: err.errorObj});
          this.props.history.push("/error");
        }
    }
  }

  // Add a login method
  /*
  login = (username, password) => {
    API.userLogin(username, password).then(
      (user) => { 
        API.getTasks()
          .then((tasks) => {
          this.setState({authUser: user, authErr: null});
          this.props.history.push("/login");
        })
        .catch((errorObj) => {
            this.handleErrors(errorObj);
        });
      }
    ).catch(
      (errorObj) => {
        const err0 = errorObj.errors[0];
        this.setState({authErr: err0});
      }
    );
  }*/

  login = (username, password) => {
    API.userLogin(username, password).then(
      (user) => {
        this.setState({authUser: user, authErr: null});
        //this.props.history.push("/login");
      }
    ).catch(
      (errorObj) => {
        const err0 = errorObj.errors[0];
        this.setState({authErr: err0});
      }
    );
  }

    // Add a logout method
  logout = () => {
    API.userLogout().then(() => {
      this.setState({authUser: null,authErr: null});
      //API.getTasks().catch((errorObj)=>{this.handleErrors(errorObj)});
    });
  }

  render(){
    const value = {
      authUser: this.state.authUser,
      authErr: this.state.authErr,
      loginUser: this.login,
      logoutUser: this.logout
    }
    return (
        <AuthContext.Provider value={value}>
            <Header />
            <Switch>
                <Route path="/login"> 
                    <Login />
                </Route>
                <Route path="/lectures">
                    {!this.state.authUser && <Redirect to="/login" />}
                    {this.state.authUser && this.state.authUser.Type === "student" && <LectureCalendarStudent />}
                    {this.state.authUser && this.state.authUser.Type === "teacher" && <LectureCalendarTeacher/>}
                </Route>
                <Route path='/attendance/:lectureId' render={(props) => (<>
                    {!this.state.authUser && <Redirect to="/login" />}
                    {this.state.authUser && this.state.authUser.Type === "teacher" && <Attendance lectureId={props.match.params.lectureId} />}
                </>)}/>
                <Route path='/history/:lectureId' render={(props) => (<>
                    {!this.state.authUser && <Redirect to="/login" />}
                    {this.state.authUser && this.state.authUser.Type === "teacher" && <AttendanceHistory lectureId={props.match.params.lectureId} />}
                </>)}/>
                <Route path='/bookings/:lectureId' render={(props) => (<>
                    {!this.state.authUser && <Redirect to="/login" />}
                    {this.state.authUser && this.state.authUser.Type === "teacher" && <Bookings lectureId={props.match.params.lectureId} />}
                </>)}/>
                <Route path="/courses">
                    {!this.state.authUser && <Redirect to="/login" />}
                    {this.state.authUser && this.state.authUser.Type === "student" && <Redirect to="/courses" />}
                    {this.state.authUser && (this.state.authUser.Type === "teacher" || this.state.authUser.Type === "booking-manager") && <CourseList />}
                    {this.state.authUser && this.state.authUser.Type === "officer" && <CourseListOfficer />}
                </Route>
                <Route path='/statistics/:courseId' render={(props) => (<>
                    {!this.state.authUser && <Redirect to="/login" />}
                    {this.state.authUser && this.state.authUser.Type === "student" && <Redirect to="/courses" />}
                    {this.state.authUser && this.state.authUser.Type === "teacher" && <StatisticTeacher courseId={props.match.params.courseId}/>}
                    {this.state.authUser && this.state.authUser.Type === "booking-manager" && <StatisticManager courseId={props.match.params.courseId}/>}
                </>)}/>
                <Route path="/reports">
                    {!this.state.authUser && <Redirect to="/login" />}  
                    <ContactTracingList />
                </Route>
                <Route path="/restrictions">
                    {!this.state.authUser && <Redirect to="/login" />}
                    <UpdateBooking />
                </Route>
                <Route path="/upload">
                    {!this.state.authUser && <Redirect to="/login" />}
                    <UploadFile />
                </Route>
                <Route path='/schedule/:courseId' render={(props) => (<>
                    {!this.state.authUser && <Redirect to="/login" />}
                    {this.state.authUser && this.state.authUser.Type === "officer" && <ScheduleCalendar courseId={props.match.params.courseId} />}
                </>)}/>
                <Route path="/">
                    <Redirect to="/login" />
                </Route>
            </Switch>   
            <Footer />
        </AuthContext.Provider>
    );
  }
}

export default withRouter(App);