import React from "react";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';


function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

/**
 * open => false, true
 * typeMessage => ["success", "error"]
 * message => "A string"
 */
const AlertMessage = ({open,typeMessage,message,openAlertCallback}) => {
    // const [open, setOpen] = useState(false);

    // React.useEffect(() => {
    //     setOpen(open);
    // }, [open]);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        //setOpen(!props.open);
        openAlertCallback(false);
    };

    return (
        <Snackbar open={open} autoHideDuration={5000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <Alert onClose={handleClose} severity={typeMessage}>
                {/* <Alert onClose={handleClose} severity="error">  */}
                {message}
            </Alert>
        </Snackbar>
    )
}

export default AlertMessage;