import React from "react";
import "../Login/Login.css";
import { Redirect } from "react-router-dom";
import { AuthContext} from "../AuthContext/AuthContext";
import Form from 'react-bootstrap/Form';
import Alert from'react-bootstrap/Alert';

class Login extends React.Component{
  constructor(props) {
    super(props);
    this.state = {username: '', password: '', submitted: false};
  }
  onChangeUsername = (event) => {
    this.setState({username : event.target.value});
  }; 

  onChangePassword = (event) => {
    this.setState({password : event.target.value}); 
  };

  handleSubmit = (event, onLogin) => {
    event.preventDefault();
    onLogin(this.state.username,this.state.password);
    this.setState({submitted : true});
  };

  render (){
    if (this.state.submitted)
      return <Redirect to="/" />;
    return(
      <AuthContext.Consumer>
        {(context) => (
        <>
            {context.authUser && <Redirect to="/lectures" />}
            {!(context.authUser) &&
            <div className="container">
              <div className="row">
                <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
                  <div className="card card-signin my-5">
                    <div className="card-body">
                      <h5 className="card-title text-center">Login</h5>
                      <Form method="POST" className="form-signin" onSubmit={(event) => this.handleSubmit(event, context.loginUser)}>
                        <div className="form-label-group">
                          <input type="email" value = {this.state.username} id="inputEmail" className="form-control" placeholder="Email address" required autoFocus onChange={(ev) => this.onChangeUsername(ev)}/>
                          <label htmlFor="inputEmail">Email address</label>
                        </div>

                        <div className="form-label-group">
                          <input type="password" value = {this.state.password} id="inputPassword" className="form-control" placeholder="Password" required onChange={(ev) => this.onChangePassword(ev)}/>
                          <label htmlFor="inputPassword">Password</label>
                        </div>

                        <div className="custom-control custom-checkbox mb-3">
                          <input type="checkbox" className="custom-control-input" id="customCheck1" />
                          <label className="custom-control-label" htmlFor="customCheck1">Remember password</label>
                        </div>
                        <button className="btn btn-lg btn-primary btn-block text-uppercase custom-color" type="submit" variant="primary">Sign in</button>
                      </Form>
                      {context.authErr && 
                        <Alert variant= "danger">
                          {context.authErr.msg}
                        </Alert>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
            }
        </>)}
      </AuthContext.Consumer>
    );
  }
}
  
export default Login;