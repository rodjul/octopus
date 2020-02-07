import React from "react";

import image from "../../assets/img/bg7.jpg";

import "./style.css"

import { withStyles } from "@material-ui/core/styles";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { Paper, Button, Typography, Grid, Card, CardHeader, CardContent, Avatar, List, ListItem, ListItemText, IconButton } from "@material-ui/core";

import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

// icone
import AccountCircle from '@material-ui/icons/AccountCircle';


const LoginForm = (props) => {
    const [spacing, setSpacing] = React.useState(2);
    const [hideForm, setHideForm] = React.useState("cardHidden");
    setTimeout(function() {
        setHideForm("");
    }, 700);
    const useStyles = makeStyles(theme => ({
        cardHidden: {
            opacity: "0", 
            transform: "translate3d(0, -60px, 0)"
        },
        pageHeader: {
            minHeight: "100vh",
            height: "auto",
            display: "inherit",
            position: "relative",
            margin: "0",
            padding: "0",
            border: "0",
            alignItems: "center",
            "&:before": {
              background: "rgba(0, 0, 0, 0.5)"
            },
            "&:before,&:after": {
            //   position: "absolute",
            //   zIndex: "1",
            //   width: "100%",
            //   height: "100%",
            //   display: "block",
            //   left: "0",
            //   top: "0",
            //   content: '""'
            },
            "& footer li a,& footer li a:hover,& footer li a:active": {
              color: "#FFFFFF"
            },
            "& footer": {
              position: "absolute",
              bottom: "0",
              width: "100%"
            }
        },
        root: {
            flexGrow: 1,
        },
        paper: {
            width: "30%",
            height: "15em",
            padding: "1em",
            marginTop: "12%",
            overflow: "hidden"
        },
        control: {
            padding: theme.spacing(1),
        }
    }));
  
  const classes = useStyles();


  
  return ( 
        <section className={classes.pageHeader}
        style={{
          backgroundImage: "url(" + image + ")",
          backgroundSize: "cover",
          backgroundPosition: "top center"
        }}>
            <Grid container className={classes[hideForm] } spacing={2} >
                <Grid item xs={12}>
                    <Grid container justify="center" spacing={spacing}>
                        <Paper className={classes.paper} >
                            <form className={classes.pageHeader} noValidate autoComplete="off" onSubmit={props.onSubmit}>

                                <TextField id="standard-basic" type="text" label="Username" style={{ margin: 0 }} placeholder="Email" 
                                // helperText="Full width!" 
                                fullWidth margin="normal" name="username"
                                />
                                
                                <TextField id="standard-basic" type="password" label="Password" style={{ marginTop: 12 }} placeholder="Your password" 
                                // helperText="Full width!" 
                                fullWidth margin="normal" name="password"
                                />

                                <Button type="submit" variant="contained" color="primary" style={{ marginTop: 40 }} fullWidth>
                                Login
                                </Button>

                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </section>

  );
}



export default class LoginPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            logged: this.props.logged,
            history: this.props.history
        }
    }

    handleSubmit = event => {
        event.preventDefault();
        console.log(event.target[0].name, event.target[0].value);
        console.log(event.target[1].name, event.target[1].value);

        if( event.target[0].value === "rod"){
            let setLogged = this.props.setLogged;
            setLogged(true);
            // console.log(this.state);
            this.state.history.push('/');
        }
    }

    render(){
        return (
            <section>
                <div
                
                // className="pageHeader"
                // style={{
                //   backgroundImage: "url(" + image + ")",
                //   backgroundSize: "cover",
                //   backgroundPosition: "top center"
                // }}
                >
                <LoginForm onSubmit={this.handleSubmit.bind(this)} />
                {/* <p>meu nome {nome}</p> */}
                </div>
            </section>
        );
    }
    
}
  
