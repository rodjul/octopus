import React, {useState} from 'react';
import { Route, Switch, Router } from 'react-router-dom';
import { Button, FormGroup, FormControl, FormLabel, Navbar, Nav, NavDropdown, Form } from "react-bootstrap";
import './App.css';
import CreateAccount from './CreateAccount/CreateAccount';
// import withAuth from './Login/withAuth';
import LoginForm from './Login/LoginForm';
import Policies from './ManagePolicies/Policies';
import AccountsCompliance from './CheckCompliance/AccountsCompliance';
import RolesAccounts from './ManageRolesAccount/RolesAccounts';

import LoginPage from './Login/LoginPage';
import NavbarApp from "../components/NavbarApp";
import TesteBar from "../components/NavbarApp/testebar";

import { createBrowserHistory } from "history";


var hist = createBrowserHistory();

class App  extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            logged: true
        }
    }

    changeLoginStatus = value => {
      console.log(value);
      this.setState({ logged: value })

    }

    render(){
        const {logged} = this.state;
        // console.log(logged);
        // console.log(<withAuth/>);
        // console.log( <withAuth./> );

        let html = "";
        if(logged){
            html = <>
              <NavbarApp history={hist} />
              {/* <TesteBar /> */}
              <Route path="/create-account" component={(CreateAccount)} />
              <Route path="/manage-roles-accounts" component={RolesAccounts} />
              <Route path="/manage-policies" component={Policies} />
              <Route path="/accounts-compliance" component={AccountsCompliance} />
              </>;
        }else{
            html = <Route path="/" exact component={() => <LoginPage setLogged={this.changeLoginStatus} logged={logged} history={hist} /> } />;
        }

        console.log(window.location.pathname);
        return (
            // <section className="container">
            <Router history={hist}>
                <Switch>
                   {html}
                </Switch>
            </Router>
            
            // </section>
        );
    }
}

export default App;
