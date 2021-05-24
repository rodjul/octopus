import React from "react";
// import BlockUi from 'react-block-ui';
// import LoadingCircularProgress from "../../components/LoadingCircularProgress";
import { getAuthorization } from "../../utils";
import SnackbarNotification from "../../components/SnackbarNotification";
import {
    Box, Typography
} from "@material-ui/core";
import {
    Button
} from 'reactstrap';

// import DialogGetReport from "./components/DialogGetReport";
import TableReport from "./components/TableReport";

// import data from "./data";
import "./styles.css";

export default class EventHistoryReport extends React.Component{
    constructor(){
        super()
        this.state = {
            blocking: false,
            eventLogs: [],

            requestSuccess: false,
            requestError: false,
            errorMessagePopup: "",
        }
    }

    async componentDidMount(){
        window.document.title = "Octopus - Event History";

        await this.refreshLogs();
    }

    async refreshLogs(){
        // e.preventDefault();

        this.setState({blocking: true});
        let stateValues = this;
        await fetch(`${process.env.REACT_APP_ENDPOINT}/logs/event`, {
            method: "GET", mode :"cors", headers: {"Authorization": getAuthorization()},
        })
        .then(response => this._handleFetchErrors(response, stateValues))
        .then(response => {
            this.setState({eventLogs: response.data});
        })
        .catch(e => {
            console.error(e);
            // this.setState({requestError: true, errorMessagePopup: "Server error. Contact administrator!"});
        })
        
        this.setState({blocking: false, requestError: false});

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

                // let hasJsonData = false;
                // await response.json().then(e => {
                //     hasJsonData = true;
                //     stateValues.setState({
                //         errorMessagePopup: message + " Message: " + e.message,
                //         requestError: true,
                //     });
                // });

                // if(!hasJsonData){
                stateValues.setState({
                    errorMessagePopup: message,
                    requestError: true,
                }, () => stateValues.setState({requestError: false}));
                // }
                
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
                    Event History
                </Typography>
                    <Box boxShadow={3}>
                        <div className="paper" >
                            <section className="actions">
                                <Button color="primary" onClick={this.refreshLogs.bind(this)}>Atualizar dados</Button>
                                {/* <DialogGetReport dateReports={this.state.dateReports} onSubmitGetReport={this.onSubmitGetReport.bind(this)} /> */}
                                {/* <DialogCreateProject dataSelected={this.state.dataSelected} onSubmitCreateProject={this.onSubmitCreateProject.bind(this)} />
                                <DialogAddUserProject dataSelected={this.state.dataSelected} onSubmitAddUserProject={this.onSubmitAddUserProject.bind(this)} /> */}
                            </section>
                            {this.state.blocking ? (
                                <TableReport
                                        eventLogs={[]}
                                        blocking={true}
                                    />
                            ): (
                                    <TableReport
                                        eventLogs={this.state.eventLogs}
                                        blocking={false}
                                    />
                             )}
                        </div>
                    </Box>
                {this.state.requestSuccess && <SnackbarNotification variant="success" message="Success!"/>}
                {this.state.requestError && <SnackbarNotification variant="error" message={this.state.errorMessagePopup}/>}


            </main>            
            
        )
    }
}