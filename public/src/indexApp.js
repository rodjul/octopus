import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
//import LoginForm from './LoginForm';
// import logo from './logo.svg';
import { SnackbarProvider } from 'notistack';

//ReactDOM.render(<LoginForm />, document.getElementById('root'));
ReactDOM.render(
    <SnackbarProvider anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
    }}
    >
        <App />
    </SnackbarProvider>, 
document.getElementById('root'));
