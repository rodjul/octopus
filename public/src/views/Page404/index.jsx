import React from "react";
// import BlockUi from 'react-block-ui';
// import LoadingCircularProgress from "../../components/LoadingCircularProgress";

// import "./styles.css";


import {
    // Box, 
    Typography
} from "@material-ui/core";


export default class ProviderGCP extends React.PureComponent {
    constructor(){
        super();
        this.state = {
            blocking: true,
            errorMessagePopup : "",
            requestError: false,
            
            // user data
        };
    }


    componentDidMount(){
        window.document.title = "404";
    }



    render(){
        return (
            <main className="content">
                <Typography className="titleHeader" variant="h4" noWrap >
                    <h1>404</h1>
                </Typography>

            </main>
        )
    }


}
