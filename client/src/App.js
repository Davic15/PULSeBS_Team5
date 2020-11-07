import React from 'react';
import './App.css';
import Tickets from './Tickets.js'
import Display from './Display.js'
import {Route,Switch,Redirect,withRouter} from 'react-router-dom'

class App extends React.Component{

  constructor(){
    super();
  }


  render(){
       return (
       <>
        
        <Switch>
          <Route path='/path1' render={(props)=>{
             return <>page1</>
           }}/>

          <Route path='/' render={(props)=>{
             return <>root</>
           }}/>


          </Switch>
        </>
       ); 
  }
}

export default withRouter(App);
