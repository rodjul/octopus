import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

// export default function CircularIndeterminate() {
export default function LoadingCircularProgress(props) {
  const classes = useStyles();
  const classname = props.className || "";

  return (
    <div className={`${classes.root} ${classname}`}>
      <CircularProgress size={props.size || 40}/>
    </div>
  );
}