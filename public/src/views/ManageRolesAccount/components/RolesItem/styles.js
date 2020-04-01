import { makeStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';


const styles = makeStyles(theme => ({
    formStyle: {
        padding: "2vw",
        width: "40vw",
    },
    content: {
        overflow: "none",
        // marginTop: 64,
        flexGrow: 1,
        marginLeft: 240,
        paddingLeft: 20,
        paddingRight: 20,
        // padding: theme.spacing(3),
        "@media (max-width: 600px)":{
            marginLeft: 0,
            paddingLeft: 20,
      }
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
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        // height: 224,
        "@media (max-height: 840px)":{
            height: "38em",
        },
        "@media (min-height: 841px)":{
            height: "60em",
        }
        // height: "1%",
      },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
    },
    tabsMain: {
        // color: "#DCDCDC",
        // backgroundColor: "#17192b",
        fontWeight: "bolder",
    },
    tabContent: {
        width: "100%",
        overflowY: "scroll",
    },
    fabAdd: {
        position: 'absolute',
        bottom: theme.spacing(5),
        right: theme.spacing(5),
    },
    fabSave: {
        position: 'absolute',
        bottom: theme.spacing(5),
        right: theme.spacing(13),
    },
    fabProgress: {
        color: green[500],
        position: 'absolute',
        top: -6,
        left: -6,
        zIndex: 1,
    }
}));

export default styles;