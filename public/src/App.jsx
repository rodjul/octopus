import React, {Suspense, lazy} from 'react';
import {
    BrowserRouter as Router, 
    // Router, 
    Route,
    Redirect,
    Switch,
  } from 'react-router-dom'
  
import './App.css';

import NavbarApp from "./components/NavbarApp";
import { createBrowserHistory } from "history";
import {authContext, refreshToken} from "./adalConfig"
import {getAuthorization} from "./utils";

// import withAuth from './Login/withAuth';
// import LoginForm from './Login/LoginForm';
// const Login = lazy(() => import('./views/Login'));
// const ManageIAM = lazy(() => import('./views/ManageIAM/ManageIAM'));
// const IamCompliance = lazy(() => import('./views/IamCompliance/IamCompliance'));
// const CisCompliance = lazy(() => import('./views/CisCompliance/CisCompliance'));
// const RolesAccounts = lazy(() => import('./views/ManageRolesAccount/RolesAccounts'));
const DefaultView = lazy(() => import( './views/DefaultView'));
const ManageUsers = lazy(() => import( './views/ManageUsers'));
const Page404 = lazy(() => import( './views/Page404'));
const Login = lazy(() => import( './views/Login'));
const NullPage = lazy(() => import( './views/NullPage')); // handle SSO flow
const Logout = lazy(() => import( './views/Logout'));
const EventHistoryReport = lazy(() => import( './views/EventHistoryReport'));
const CreateAccount = lazy(() => import( './views/ProviderAWS/CreateAccount'));
const ManageIAM = lazy(() => import( './views/ProviderAWS/ManageIAM'));
const IamCompliance = lazy(() => import( './views/ProviderAWS/IamCompliance'));
const CisCompliance = lazy(() => import( './views/ProviderAWS/CisCompliance'));
const RolesAccounts = lazy(() => import( './views/ProviderAWS/ManageRolesAccount'));
const NetworkReport = lazy(() => import( './views/ProviderAWS/NetworkReport'));
const ResourceManager = lazy(() => import( './views/ProviderGCP/ResourceManager'));
const ConfigureAccountApi = lazy(() => import( './views/ProviderGCP/ConfigureAccountApi'));



const isAuthenticated = () => {
    // return true;
    // TODO: implement a better check
    // console.log(localStorage.getItem( 'currentUser') && JSON.parse(localStorage.getItem("currentUser"))['username']);
    let timestamp = parseInt(( new Date().getTime() / 1000).toFixed(0));
    let storage = localStorage.getItem('currentUser');
    storage = storage ? JSON.parse(storage) : undefined;
    
    //react-adal handle
    if(process.env.REACT_APP_ENABLE_SSO==="true"){
        let token = localStorage.getItem("adal.token.keys");
        if(token)
            token = token.replace("|","");
        let expiration = localStorage.getItem(`adal.expiration.key${token}`);
        let accessToken = localStorage.getItem(`adal.access.token.key${token}`);
    
        if(accessToken && !localStorage.getItem("adal.error") && authContext && authContext._user){
            if(expiration && authContext._user.profile.exp > timestamp)
                return true
        }
        return false;
    }

    // cognito
    if(JSON.stringify(storage) && storage['token'] && storage['expiration'] > timestamp)
        return true
    // return localStorage.getItem( 'currentUser') && JSON.parse(localStorage.getItem("currentUser"))['username']
    localStorage.removeItem("currentUser");
    return false
}

const hist = createBrowserHistory();
// https://stackoverflow.com/a/41733396
const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => (
        isAuthenticated()
        ?(
            <>
                {/* <NavbarApp history={hist} /> */}
                <NavbarApp history={hist} >
                    <Component {...props} />
                </NavbarApp>
            </>
        )
        : <Redirect to={{
            pathname: '/login',
            state: { from: props.location }
            }} />
    )} />
)  



class App extends React.Component {
    constructor(){
        super();
        this.state = {
            loading: false,
        }
        this._refreshTimer = undefined;
        this._maybeRefresh();
    }

    async componentDidMount(){
        document.title = "Octopus";
        
        if(isAuthenticated() && window.location.pathname === "/login"){
            this.setState({loading: true});
            await this.getPermissions();
            window.location = "/";
        }
    }

    async getPermissions(){
        let stateValues = this;
        // this.setState({blocking: true});
        await fetch(`${process.env.REACT_APP_ENDPOINT}/permissions`,{
            method: "get", mode:"cors", headers: {"Authorization": getAuthorization()},
        })
        .then((response => this._handleFetchErrors(response, stateValues)))
        .then(response => {
            if(response.data){
                localStorage.setItem( 'currentUser', JSON.stringify({
                    "acl": response.data.acl
                }) );
            }else{
                alert("Error in logging");
            }
            // console.log(response);
        })
        .catch(e => console.error(e));
    }

    // This method checks if token refresh is needed, performs refresh 
    // and calls itself again in a second
    // https://stackoverflow.com/a/62707174
    async _maybeRefresh() {
        clearTimeout(this._refreshTimer);
        // console.log("Refresh token True setimeout");

        try {
            if(process.env.REACT_APP_ENABLE_SSO==="true"){
                let timestamp = parseInt(( new Date().getTime() / 1000).toFixed(0));
                // if(isAuthenticated() && ( timestamp > authContext._user.profile.exp)){
                if(authContext && authContext._user && ( timestamp > authContext._user.profile.exp)){
                    try{
                        await refreshToken();
                    }catch(e){
                        console.error(e);
                    }
                }

            }

        } catch (e) {
            console.log("Something is wrong when trying to refresh token", e);
        } finally {
            //Finally block is executed even if try block has return statements
            //That's why I use it to schedule next refresh try
            this._refreshTimer = setTimeout(this._maybeRefresh.bind(this), 60000);
        }
    }

    async _handleFetchErrors(response, stateValues = {}) {
        if (!response.ok) {
            if(response.status === 401){
                alert("Not authenticated. Login again");
                window.location.reload();
            }else{
                let message = "";
                if(response.status === 400){
                    message = "Invalid request";
                }else if(response.status === 403){
                    message = "You don't have permissions to do this action";
                }else if(response.status === 404){
                    message = "Not found";
                }else if(response.status === 500 || response.status === 502){
                    message = "Server error. Contact administrator!";
                }

                let hasJsonData = false;
                await response.json().then(e => {
                    hasJsonData = true;
                    stateValues.setState({
                        errorMessagePopup: message + " Message: " + e.message,
                        requestError: true,
                    });
                });

                if(!hasJsonData){
                    stateValues.setState({
                        errorMessagePopup: message,
                        requestError: true,
                    });
                }

                // stateValues.setState({isLoading: false});
                stateValues.setState({requestError: false});
                throw Error(response);
                //https://gist.github.com/odewahn/5a5eeb23279eed6a80d7798fdb47fe91
            }
        }
        return response.json();
    }

    render(){

        // console.log(window.location.pathname);
        return (
            <>
                {this.state.loading ? (
                    <h1>Loading...</h1>
                ):(
                    <Router>
                        <Suspense  fallback={ <h1>Loading...</h1> } >
                            <Switch>
                                <Route exact path="/login" component={Login} />
                                <Route exact path="/login/null" name="Redirect" component={NullPage} />
                                <PrivateRoute exact path="/" component={DefaultView} />
                                <PrivateRoute exact path="/logout" component={Logout} />
                                <PrivateRoute exact path="/event-history" component={EventHistoryReport} />
                                <PrivateRoute exact path="/manage-users" component={ManageUsers} />
                                <PrivateRoute exact path="/aws-create-account" component={(CreateAccount)} />
                                <PrivateRoute exact path="/aws-manage-roles-accounts" component={RolesAccounts} />
                                <PrivateRoute exact path="/aws-manage-iam" component={ManageIAM} />
                                <PrivateRoute exact path="/aws-iam-compliance" component={IamCompliance} />
                                <PrivateRoute exact path="/aws-cis-compliance" component={CisCompliance} />
                                <PrivateRoute exact path="/aws-network-report" component={NetworkReport} />
                                <PrivateRoute exact path="/gcp-organization-resource-manager" component={(ResourceManager)} />
                                <PrivateRoute exact path="/gcp-configure-account-api" component={(ConfigureAccountApi)} />
                                
                                <Route component={Page404} />
                            </Switch>
                        </Suspense>
                    </Router>
                )}
            </>
        )
    }
}

export default App;
