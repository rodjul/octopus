import React, {useState} from 'react';
import { Route, Switch, Router } from 'react-router-dom';
import { Button, FormGroup, FormControl, FormLabel, Navbar, Nav, NavDropdown, Form } from "react-bootstrap";
import './App.css';
import CreateAccount from './CreateAccount/CreateAccount';
// import withAuth from './Login/withAuth';
import LoginForm from './Login/LoginForm';
import ManageIAM from './ManagePolicies/ManageIAM';
import AccountsCompliance from './CheckCompliance/AccountsCompliance';
import CisCompliance from './CisCompliance/CisCompliance';
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

        console.log(window.location.pathname);
        return (
            // <section className="container">
            <Router history={hist}>
                <Switch>
                    {logged ? (
                        <>
                            <NavbarApp history={hist} appbarTitle={window.location.pathname}/>
                            {/* <TesteBar /> */}
                            <Route path="/create-account" component={(CreateAccount)} />
                            <Route path="/manage-roles-accounts" component={RolesAccounts} />
                            <Route path="/manage-iam" component={ManageIAM} />
                            <Route path="/accounts-compliance" component={AccountsCompliance} />
                            <Route path="/cis-compliance" component={CisCompliance} />
                        </>
                    ):(
                        <>
                            <Route path="/" exact component={() => <LoginPage setLogged={this.changeLoginStatus} logged={logged} history={hist} /> } />
                        </>
                    )
                }
                </Switch>
            </Router>
            
            // </section>
        );
    }
}

export default App;
