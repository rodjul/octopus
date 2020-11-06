import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';


const useStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(2),
        color: theme.palette.text.secondary,
        backgroundColor: "white",
        // borderColor: "black",
        // borderWidth: 1,
        // borderStyle: "solid",
    },
    table: {
        minWidth: 650,
        backgroundColor: "white",
        // marginTop: "2em",
        "& th":{
            fontWeight: "bold",
        },
    },
    formStyle: {
        padding: "2vw",
        width: "40vw",
    },
    titleHeader: {
        // marginTop: 0,
        // flexGrow: 1,
        // marginLeft: 240,
        // paddingLeft: 20,
        // padding: theme.spacing(3),
        paddingBottom: theme.spacing(4),
        "@media (max-width: 600px)":{
            marginLeft: 0,
            paddingLeft: 20,
      }
    },
    background:{
        backgroundColor: "white",
        padding: 1,
    },
    wrapper: {
        margin: theme.spacing(1),
        position: 'relative',
      },
    buttonSuccess: {
        backgroundColor: green[500],
            '&:hover': {
                backgroundColor: green[700],
        },
    },
    fabProgress: {
        color: green[500],
        position: 'absolute',
        top: -6,
        left: -6,
        zIndex: 1,
    },
    buttonProgress: {
        color: green[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}));

export default useStyles;