import React from "react";
import { useSnackbar } from 'notistack';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';



const useStyles = makeStyles(theme => ({
    expand: {
        padding: '8px 8px',
        transform: 'rotate(0deg)',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
}));


const SnackbarNotification = (props) => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const classes = useStyles();

    const actionButtons = key => (
        <IconButton className={classes.expand} onClick={() => { closeSnackbar(key.id) }}>
            <CloseIcon />
        </IconButton>
    );

    const handleClick = () => {
        let options = {};
        if(props.variant === "error"){
            options = {
                persist: true,
                variant: "error",
                action: key => actionButtons(key)
            };
        }else{
            options = {
                persist: false,
                autoHideDuration: 5000,
                variant: props.variant || "info",
                action: key => actionButtons(key)
            };
        }
        enqueueSnackbar(props.message, options);
    };

    return (
        // <Button onClick={handleClick}>Show snackbar</Button>
        <div onLoad={handleClick()}></div>
    );
}

export default SnackbarNotification;