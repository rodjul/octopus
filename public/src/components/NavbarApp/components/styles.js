// import React from "react"
import { makeStyles } from '@material-ui/core/styles';

const drawerWidth = 240;

const styles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    grow: {
        flexGrow: 1,
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        backgroundColor: "#0d0b2b",
        color: "white",
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        backgroundColor: "#0d0b2b",
        color: "white",
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    hide: {
        display: 'none',
    },
    //   drawerPaper: {
    //     width: drawerWidth,
    //   },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
        "& svg":{
            color: "white",
        }
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
        marginTop: "5rem",
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
        marginTop: "5rem",
    },

    drawerPaper: {
        width: drawerWidth,
        // backgroundColor: "#17192b",
        // backgroundColor: "#2A293E",
        // backgroundColor: "#252342",
        backgroundColor: "#0d0b2b",
    },
    fontStyle: {
        color: "#DCDCDC",
        "& svg": {
            color: "#DCDCDC",
        },
    },
    nested: {
        paddingLeft: theme.spacing(4),
        "&:hover":{
            textDecoration: "none",
            // backgroundColor: "#9F9C99",
            backgroundColor: "#323242",
            // color:"red",
        },
    },
    groupLink: {
        color: "#FFFFFF",
        "&:hover":{
            textDecoration: "none",
            // backgroundColor: "#9F9C99",
            backgroundColor: "#323242",
            // color:"red",
        },
    },
    links: {
        width: "11em",
        padding: "0.2em",
        textDecoration: "none",
        color: "#FFFFFF",
        "&:hover":{
            textDecoration: "none",
            // backgroundColor: "#9F9C99",
            color:"white",
            outline: "none",
        },
        ' &:visited, &:link, &:focus,&:active': {
            textDecoration: "none",
            outline: "none",
        }
    },
    buttonHover: {
        "&:hover":{
            textDecoration: "none",
            // backgroundColor: "#9F9C99",
            backgroundColor: "#323242",
            // color:"red",
        },
    },
    active: {
        backgroundColor: "#323242",
        "&:hover, a:hover":{
            backgroundColor: "#323242",
            color:"white",
        },
    },
}));

export default styles;