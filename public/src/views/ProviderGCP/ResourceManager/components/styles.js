import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(2),
        color: theme.palette.text.secondary,
        backgroundColor: "white",
    },

    formStyle: {
        padding: "2vw",
        width: "40vw",
    },
    // content: {
    //     overflow: "none",
    //     // marginTop: 64,
    //     flexGrow: 1,
    //     marginLeft: 240,
    //     paddingLeft: 20,
    //     paddingRight: 20,
    //     // padding: theme.spacing(3),
    //     "@media (max-width: 600px)":{
    //         marginLeft: 0,
    //         paddingLeft: 20,
    //   }
    // },
    titleHeader: {
        // marginTop: 0,
        // flexGrow: 1,
        // marginLeft: 240,
        // paddingLeft: 20,
        paddingBottom: theme.spacing(4),
        "@media (max-width: 600px)":{
            marginLeft: 0,
            paddingLeft: 20,
      }
    },
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        // height: 224,
        "@media (max-height: 840px)":{
            height: "36em",
        },
        "@media (min-height: 841px)":{
            height: "50em",
        }
        // height: "1%",
      },
    actions: {
        margin: "1rem",
        display: "flex",
        justifyContent: "left",
        alignItems: "left",
        "& button:first-child": {
            marginLeft: "0rem",
        },
        "& button": {
            marginLeft: "1rem",
        }
    }
}));


export default useStyles;