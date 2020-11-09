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
import TableUsers from "./components/TableUsers";

// import data from "./data";
import "./styles.css";

export default class EventHistoryReport extends React.Component{
    constructor(){
        super()
        this.state = {
            blocking: false,
            users: [],
            userGroups: [],
            usersChanged: [],

            requestSuccess: false,
            requestError: false,
            errorMessagePopup: "",
        }

        this.handleChangeUsers = this.handleChangeUsers.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }

    async componentDidMount(){
        window.document.title = "Octopus - Manage Users";

        this.setState({blocking: true});
        let stateValues = this;
        await fetch(`${process.env.REACT_APP_ENDPOINT}/users`, {
            method: "GET", mode :"cors", headers: {"Authorization": getAuthorization()},
        })
        .then(response => this._handleFetchErrors(response, stateValues))
        .then(response => {
            this.setState({users: response.data.users});
        })
        .catch(e => console.error(e));

        if(this.state.users.length){
            stateValues = this;
            await fetch(`${process.env.REACT_APP_ENDPOINT}/usergroups`, {
                method: "GET", mode :"cors", headers: {"Authorization": getAuthorization()},
            })
            .then(response => this._handleFetchErrors(response, stateValues))
            .then(response => {
                this.setState({userGroups: response.data.groups});
            })
            .catch(e => console.error(e));
        }
        
        this.setState({blocking: false});


    }


    async handleSave(e){
        if(this.state.usersChanged.length){
            this.setState({blocking: true});
            let stateValues = this;
            await fetch(`${process.env.REACT_APP_ENDPOINT}/users`, {
                method: "PUT", mode :"cors", headers: {"Authorization": getAuthorization()},
                body: JSON.stringify( {
                    "users": this.state.usersChanged
                } ),
            })
            .then(response => this._handleFetchErrors(response, stateValues))
            .then(response => {
                //this.setState({users: response.data.users});
                this.setState({users: this.state.usersChanged, requestSuccess: true})
            })
            .catch(e => console.error(e));
            
            this.setState({blocking: false, requestSuccess: false});
        }

    }

    handleChangeUsers(e){
        this.setState({usersChanged: e});
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
                });
                // }

                // stateValues.setState({isLoading: false});
                stateValues.setState({requestError: false});
                throw Error(response);
            }
        }
        return response.json();
    }

    render(){

        return (
            <main className="content">
                <Typography className="titleHeader" variant="h4" noWrap >
                    Manage Users
                </Typography>    
                <Box boxShadow={3}>
                    <div className="paper" >
                        <section className="actions">
                            <Button color="primary" onClick={this.handleSave}>Salvar alterações</Button>
                            {/* <DialogGetReport dateReports={this.state.dateReports} onSubmitGetReport={this.onSubmitGetReport.bind(this)} /> */}
                            {/* <DialogCreateProject dataSelected={this.state.dataSelected} onSubmitCreateProject={this.onSubmitCreateProject.bind(this)} />
                            <DialogAddUserProject dataSelected={this.state.dataSelected} onSubmitAddUserProject={this.onSubmitAddUserProject.bind(this)} /> */}
                        </section>
                        {this.state.blocking ? (
                            <TableUsers
                                users={[]}
                                userGroups={[]}
                                blocking={true}
                                handleChangeUsers={this.handleChangeUsers}
                            />
                        ): (
                            <TableUsers
                                users={this.state.users}
                                userGroups={this.state.userGroups}
                                blocking={false}
                                handleChangeUsers={this.handleChangeUsers}
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