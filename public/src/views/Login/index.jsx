import React from "react";
import SnackbarNotification from "../../components/SnackbarNotification";
import LoadingCircularProgress from "../../components/LoadingCircularProgress";
import { authContext } from '../../adalConfig';
import { Paper, Button, Grid } from "@material-ui/core";
import TextField from '@material-ui/core/TextField';
import BlockUi from 'react-block-ui';

import 'react-block-ui/style.css';

import "./styles.css";


// https://stackoverflow.com/a/1050782
Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h*60*60*1000));
  return this;
}

export default class Login extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            logged: this.props.logged,
            history: this.props.history,
            requestSuccess: false,
            username: "",
            password: "",
            blocking: false,

        }
    }

    componentDidMount(){
        document.title = "Octopus - Login";

        // https://github.com/salvoravida/react-adal/issues/47
        // hack to handle failed redirect to /null
        // in chrome this doesn't happen, but in firefox does
		if(window.location.hash && window.location.hash==="#retry"){
			authContext.handleWindowCallback();
			authContext.login();
		}
    }
    

    handleSubmitSSO = (e) => {
        e.preventDefault();

        // let adalInstance = AuthenticationContext(adalConfig);
        authContext.handleWindowCallback();
        authContext.login();
    }

    handleInput(e){
        this.setState({[e.target.name] : e.target.value});
    }
      

    async handleSubmit(e){
        e.preventDefault();

        let username = this.state.username;
        let password = this.state.password;
        
        this.setState({blocking: true});
        // console.log(username, password);
        await fetch(process.env.REACT_APP_ENDPOINT+"/login", {
            method:"POST", mode:"cors", 
            headers: {
                "Content-Type":"application/json",
                // "Authorization": getAuthorization()
            },
            body: JSON.stringify({
                "username": username,
                "password": password,
            }),
        })
        .then(resp => resp.json())
        .then(response => {
            if(!response.error){
                // https://stackoverflow.com/a/28683720
                let timestamp = parseInt(( new Date().addHours(1).getTime() / 1000).toFixed(0));

                localStorage.setItem( 'currentUser', JSON.stringify({
                    "username": this.state.username,
                    // "rolePermission":this.state.rolePermission, "resourcesAccess": this.state.resourcesAccess,
                    "token": response.authorization, 
                    "expiration": timestamp
                }) );
                
                this.setState({requestSuccess: true}, () => this.setState({requestSuccess: false}));
                window.location = "/";
            }else{
                alert("ERROR");
            }
            // this.setState( {accounts:data['content'],
            //                 dates_available: data['dates_available'],
            //                 // loading:false 
            //             } );
            // return {"error":false, "message":"Executado com sucesso"};
        }).catch(e => console.error(e));
        
        this.setState({blocking: false});
    }




    render(){

        return (
            <>
                <section className="root pageHeader background">
                    <Grid container>
                        <Grid item xs={12}>
                            {/* <Grid container justify="center" spacing={2}> */}
                            <Grid container justify="center">
                                <Paper className="paperForm" elevation={2}>

                                    <BlockUi tag="div" blocking={this.state.blocking} message="" loader={<LoadingCircularProgress/>}>
                                        <h3 className="title">OCTOPUS</h3>
                                        <form id="login" autoComplete="off" onSubmit={this.handleSubmit.bind(this)}>

                                            <TextField id="standard-basic" type="text" label="Username" style={{ margin: 0 }} placeholder="Email" 
                                            fullWidth margin="normal" name="username"
                                            // helperText="Full width!" 
                                            onBlur={this.handleInput.bind(this)}
                                            />
                                            
                                            <TextField id="standard-basic" type="password" label="Password" style={{ marginTop: 12 }} placeholder="Your password" 
                                            fullWidth margin="normal" name="password"
                                            // helperText="Full width!" 
                                            onBlur={this.handleInput.bind(this)}
                                            />

                                            <Button type="submit" variant="contained" color="primary" style={{ marginTop: 40 }} fullWidth>
                                            Login
                                            </Button>
                                        </form>

                                    {process.env.REACT_APP_ENABLE_SSO==="true"  ? 
                                        <form id="loginAzureSSO" onSubmit={this.handleSubmitSSO.bind(this)} className="formLoginSSO" style={{margin: "1em 1em 0em 2em"}} >
                                            <Button type="submit">
                                                <img alt="logo" src="images/ms-symbollockup_signin_dark.svg" />
                                            </Button>
                                        </form>
                                    : null}

                                    </BlockUi>

                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                    
                </section>
                {this.state.requestSuccess && <SnackbarNotification variant="success" message="Request Success!"/>}
                {/* <AlertMessage open={true} typeMessage={"success"} message={"TESTE"} openAlertCallback={handleOpenAlert}/> */}
                {/* <AlertMessage open={openAlert} typeMessage={typeMessage} message={messageAlert} openAlertCallback={handleOpenAlert}/> */}
           </>

        );
    }
    
}
