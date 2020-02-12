import React, {useState} from "react";
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
const AlertMessage = (props) =>{
    const [open, setOpen] = useState(false);
    
    React.useEffect(() => {
        setOpen(props.open);
    }, [props.open]);

    const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setOpen(false);
    };

    return (
        <Snackbar open={open} autoHideDuration={5000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <Alert onClose={handleClose} severity={props.typeMessage}>
            {/* <Alert onClose={handleClose} severity="error">  */}
            {props.message}
            </Alert>
        </Snackbar>
    )
}

export default AlertMessage;