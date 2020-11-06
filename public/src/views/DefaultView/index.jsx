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


    async componentDidMount(){
        window.document.title = "Octopus - /";
    }


    async _handleFetchErrors(response, stateValues = {}) {
        if (!response.ok) {
            if(response.status === 401){
                alert("Not authenticated. Login again");
                window.location.reload();
            }else{
                let message = "";
                if(response.status === 400){
                    message = "Invalid request";
                }else if(response.status === 403){
                    message = "You don't have permissions to do this action";
                }else if(response.status === 404){
                    message = "Not found";
                }else if(response.status === 500 || response.status === 502){
                    message = "Server error. Contact administrator!";
                }

                let hasJsonData = false;
                await response.json().then(e => {
                    hasJsonData = true;
                    stateValues.setState({
                        errorMessagePopup: message + " Message: " + e.message,
                        requestError: true,
                    });
                });

                if(!hasJsonData){
                    stateValues.setState({
                        errorMessagePopup: message,
                        requestError: true,
                    });
                }

                // stateValues.setState({isLoading: false});
                stateValues.setState({requestError: false});
                throw Error(response);
                //https://gist.github.com/odewahn/5a5eeb23279eed6a80d7798fdb47fe91
                // return Promise.resolve(response.json()).then((responseInJson) => { // This will end up in ERROR part
                //     return Promise.reject({"promise":responseInJson, "status":response.status}); //  responseInJson.message = "Some nasty error message!"
                // });
            }
        }
        return response.json();
    }


    render(){
        return (
            <main className="content">
                <Typography className="titleHeader" variant="h4" noWrap >
                    Logged~
                </Typography>

            </main>
        )
    }


}
