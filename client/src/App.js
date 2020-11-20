import React from 'react';
import './App.css';
import {Route,Switch,withRouter, Redirect} from 'react-router-dom';
import Header from "./components/Header/Header";
import Login from "./components/Login/Login";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import API from "../src/API";
import {AuthContext} from "../src/components/AuthContext/AuthContext";
//import WeekCalendar from "./components/Calendar/LectureCalendar";
//import LectureCalendar from './components/Calendar/LectureCalendar';
import LectureCalendarStudent from './components/Calendar/LectureCalendarStudent';
import LectureCalendarTeacher from './components/Calendar/LectureCalendarTeacher';

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
              <LectureCalendarStudent />
          </Route>
          <Route path="/teacher">
              <LectureCalendarTeacher />
          </Route>
          <Route path="/">
              <Redirect to="/login" />
          </Route>
        </Switch>   
      </AuthContext.Provider>
    );
  }
}

export default withRouter(App);
