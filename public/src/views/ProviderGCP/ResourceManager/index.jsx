import React from "react";
import BlockUi from 'react-block-ui';
import { getAuthorization } from "../../../utils";
import LoadingCircularProgress from "../../../components/LoadingCircularProgress";
import Oganizations from "./components/organizations";
import SnackbarNotification from "../../../components/SnackbarNotification";
import "./styles.css";
import cloneDeep from 'lodash/cloneDeep';


// import {
//     Input, Table as TableStrap, Button, Pagination, PaginationItem, PaginationLink, FormGroup, Label
// } from 'reactstrap';
import {
    // TextField, Grid, Select, InputLabel, MenuItem, FormControl,
    // DialogTitle, DialogContentText, DialogContent, DialogActions, Dialog,
    // TableBody, TableCell, TableContainer, CircularProgress, 
    Box, Typography
} from "@material-ui/core";
import { Add as AddIcon, Save as SaveIcon, Delete as DeleteIcon, Info as InfoIcon, TramOutlined } from '@material-ui/icons';

import DialogAddUserProject from "./components/DialogAddUserProject";
import DialogCreateFolder from "./components/DialogCreateFolder";
import DialogCreateProject from "./components/DialogCreateProject";


export default class ProviderGCP extends React.PureComponent {
    constructor(){
        super();
        this.state = {
            blocking: true,
            requestSuccess: false,
            errorMessagePopup : "",
            requestError: false,
            
            // user data
            organizations: [],
            originalOrganizations: [],
            projectsIamPolicy: [],
            dataSelected: [],
        };
    }


    async componentDidMount(){
        window.document.title = "Octopus - GCP Resource Manager";
        
        
        this.setState({blocking: true });
        // let organizations = makeData();
        // let policy = iamPolicy();
        // this.setState({projectsIamPolicy : policy}, ()=>{
        //     organizations = this._renameKeyChild(organizations);
        //     organizations = this._addIamUsersInProject(organizations);
        //     // let originalBkp = JSON.parse(JSON.stringify(organizations));
        //     let originalBkp = cloneDeep(organizations);
        
        //     this.setState({organizations: organizations, originalOrganizations: originalBkp}, () => console.log(this.state.organizations));
            
        // });

        let stateValues = this;
        await fetch(`${process.env.REACT_APP_ENDPOINT}/gcp/iam/projects `, {
            method: "GET", mode :"cors", headers: {"Authorization": getAuthorization()},
        })
        .then(response => this._handleFetchErrors(response, stateValues))
        .then(response => {
            
            this.setState({projectsIamPolicy: response.data});
        })
        .catch(e => console.error(e));
        
        await fetch(`${process.env.REACT_APP_ENDPOINT}/gcp/organizations`, {
            method: "GET", mode :"cors", headers: {"Authorization": getAuthorization()},
        })
        .then(response => this._handleFetchErrors(response, stateValues))
        .then(response => {
            let organizations = []
            if(response.data.length){
                organizations = this._renameKeyChild(response.data);

                organizations = this._addIamUsersInProject(organizations);
            }
            let originalBkp = cloneDeep(organizations);
            this.setState({organizations, originalOrganizations: originalBkp});

            // console.log(this.state.organizations);
        })
        .catch(e => console.error(e));
        
        this.setState({blocking: false});

    }

    _renameKeyChild(organizations){
        for(var row in organizations){
            let subRows = this._renameKeyChild(organizations[row]['childs']);
            organizations[row]['subRows'] = subRows;
            delete organizations[row]['childs'];
        }
        return organizations;
    }
    
    /**
     * Given the value of organization data, it will search by project_id and insert iam policies in the index
     * @param {Object} organizationIndex 
     */
    _addIamUsersInProject(organizationIndex){
        for(var index in organizationIndex){
            if(organizationIndex[index].subRows && organizationIndex[index].subRows.length){
                let subRows = this._addIamUsersInProject(organizationIndex[index].subRows);
                organizationIndex[index].subRows = subRows;
            }

            if(organizationIndex[index].number){
                let policyIam = this.state.projectsIamPolicy;

                for(var pi in policyIam){
                    if(policyIam[pi].project_id === organizationIndex[index].project_id){
                        let users = "";
                        if(policyIam[pi].iam_policy.bindings && policyIam[pi].iam_policy.bindings.length){
                            users = policyIam[pi].iam_policy.bindings.map(binding => binding.members.map(user => user)[0]);
                            users = Array.from(new Set(users)).join(", ");
                        }
                        organizationIndex[index].users = users;
                        organizationIndex[index].policies = policyIam[pi].iam_policy.bindings;
                    }
                }
            }
        }
    
        return organizationIndex;
    }


    async onSubmitCreateFolder(e){
        if(!this.state.dataSelected.length) return;

        let folder = e.folder;
        // let motive = e.motive;
        if(!folder){
            alert("Invalid data");
            return
        }

        // let folderFormat = {
        //     "name": "folders/0123456789",
        //     "parent": "folders/0987654321",
        //     "displayName": folder,
        //     "lifecycleState": "ACTIVE",
        //     "createTime": new Date().toISOString(),
        //     "subRows":[]
        // }
        // console.log(this.state.dataSelected[0]);
        // this.updateOrganizationIndex(folderFormat);

        let stateValues = this;
        this.setState({blocking: true});
        await fetch(`${process.env.REACT_APP_ENDPOINT}/gcp/organizations/folders`,{
            method: "POST", mode:"cors", headers: {"Content-Type":"application/json", "Authorization": getAuthorization()},
            body: JSON.stringify( {
                "parent": this.state.dataSelected[0].name, // check if it is folder
                "folder_name": folder,
            } ),
        }).then((response => this._handleFetchErrors(response, stateValues)))
        .then(response => {
            if(response.data.status){
                let folderData = response.data['folder_info']
                this.setState({requestSuccess: true});
                this.updateOrganizationIndex(folderData);
            }else{
                alert("Error in creating folder");
            }
            // console.log(response);
        })
        .catch(e => console.error(e));

        this.setState({blocking: false, requestSuccess: false, requestError: false});

    }
    

    async onSubmitCreateProject(e){
        if(!this.state.dataSelected.length) return;

        // let fakeProject = {
        //     "project_id": "aaaaaaaaa-teste-cli-1234",
        //     "name":  this.state.formNewProject,
        //     "number": "222559999206",
        //     "labels": {},
        //     "status": "ACTIVE",
        //     "parent": {
        //       "type": "folder",
        //       "id": "1433344393960"
        //     }
        // }

        let projectName = e.project;
        let motive = e.motive;
        if(!projectName || !motive){
            alert("Project name and motive must have data");
            return
        }

        // this.updateOrganizationIndex(fakeProject);

        let stateValues = this;
        this.setState({blocking: true});
        await fetch(`${process.env.REACT_APP_ENDPOINT}/gcp/organizations/projects`,{
            method: "POST", mode:"cors", headers: {"Authorization": getAuthorization()},
            body: JSON.stringify( {
                "parent": this.state.dataSelected[0].name,
                "project_name": projectName,
                "motive": motive,
            } ),
            headers: {
                "Content-Type":"application/json",
                "Authorization": getAuthorization()
            },
        })
        .then((response => this._handleFetchErrors(response, stateValues)))
        .then(response => {
            if(response.data.status){
                let projectData = response.data['project_info']
                this.setState({requestSuccess: true});
                this.updateOrganizationIndex(projectData);
            }else{
                alert("Error in creating project");
            }
            // console.log(response)
        })
        .catch(e => console.error(e));

        this.setState({blocking: false, requestSuccess: false, requestError: false});
        
    }


    async onSubmitAddUserProject(e){
        if(!this.state.dataSelected.length) return;
        
        let resourceName = this.state.dataSelected[0].project_id;
        if(!resourceName || !resourceName.length){
            alert("Nenhum projeto selecionado");
            return
        }
        let stateValues = this;
        this.setState({blocking: true});

        let users = e.users;
        let roleId = e.role_id;
        let motive = e.motive;

        if(!users || !roleId || !motive){
            alert("Invalid data");
            return
        }

        await fetch(`${process.env.REACT_APP_ENDPOINT}/gcp/iam/projects/${encodeURIComponent(resourceName)}`,{
            method: "POST", mode:"cors", headers: {"Authorization": getAuthorization()},
            body: JSON.stringify( {
                "users": users, 
                "role_id": roleId,
                "motive": motive,
            } ),
            headers: {
                "Content-Type":"application/json",
                "Authorization": getAuthorization()
            },
        })
        .then((response => this._handleFetchErrors(response, stateValues)))
        .then(response => {
            console.log(response);
            // updateOrganizationIndex(this.state.dataSelected);
            this.setState({requestSuccess: true})
        })
        .catch(e => console.error(e));

        this.setState({blocking: false, requestSuccess: false, requestError: false});
    }


    callbackSetDataSelected(e){
        // console.log(e);
        this.setState({dataSelected: e});
    }


    updateOrganizationIndex(newData){
        // Object { "1.1.0.0": true, "1.1.1": true }
        // let keys = Object.keys(this.state.dataSelected[0].index);
        
        // let folder_format = {
        //     "name": "folders/0123456987",
        //     "parent": "folders/123654567",
        //     "displayName": "InfoSec",
        //     "lifecycleState": "ACTIVE",
        //     "createTime": "2020-06-11T13:52:32.360Z",
        //     "subRows":[]
        // }

        // let project_format = {
        //     "project_id": "aaaaaaaaa-teste-cli-1234",
        //     "name": "aaaaaa teste cli 1234",
        //     "number": "222559999206",
        //     "labels": {},
        //     "status": "ACTIVE",
        //     "parent": {
        //       "type": "folder",
        //       "id": "1433333393960"
        //     }
        // }

        // let rowsSelected = [];
        // colocar o valor na nova arvore
        if (this.state.dataSelected.length){ //&& keys.length) {
            // https://stackoverflow.com/a/49502115
            let dataToUpdate = [...this.state.organizations];

            let indexes = this.state.dataSelected[0].index.split(".");
            let editIndex = {... dataToUpdate[indexes[0]] };
            
            let editedIndex = this._updateOrganizationIndex(editIndex, newData, indexes, 1);
            editIndex = editedIndex;

            dataToUpdate[indexes[0]] = editIndex;

            this.setState({organizations: dataToUpdate});
        }
    }


    _updateOrganizationIndex(indexData, newData, indexes, i){
        if(i < indexes.length){
            indexData.subRows[parseInt(indexes[i])] = this._updateOrganizationIndex(indexData.subRows[parseInt(indexes[i])], newData, indexes, ++i);
            return indexData;
        }
        indexData.subRows.push(newData);
        return indexData;
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

                // stateValues.setState({isLoading: false});
                
                throw Error(response);
                //https://gist.github.com/odewahn/5a5eeb23279eed6a80d7798fdb47fe91
                // return Promise.resolve(response.json()).then((responseInJson) => { // This will end up in ERROR part
                //     return Promise.reject({"promise":responseInJson, "status":response.status}); //  responseInJson.message = "Some nasty error message!"
                // });
            }
        }
        return response.json();
    }


    handleTableFilter(e){
        if(e){
            const filterOrganizations = cloneDeep(this.state.originalOrganizations);
            let organizations = this._customGlobalFilter(filterOrganizations, e);
            this.setState({organizations: organizations});
        }else{
            let bkp = this.state.originalOrganizations;
            this.setState({organizations: bkp})
        }
    }
    

    _customGlobalFilter(originalData, searchInput){
        let filtered = [];
        for(var i=0; i<originalData.length; i++){
            // search recursively childs of subRows
            if(originalData[i].subRows && originalData[i].subRows.length){
                let subRows = this._customGlobalFilter(originalData[i].subRows, searchInput);
                originalData[i].subRows = subRows;
            }

            // key values to search, if match put in the list to return
            if(
                (originalData[i].hasOwnProperty('displayName') && originalData[i].displayName.toLowerCase().includes(searchInput.toLowerCase()) ) 
                || (originalData[i].hasOwnProperty('users') && originalData[i].users.toString().toLowerCase().includes(searchInput.toLowerCase())) 
                || originalData[i].name.toLowerCase().includes(searchInput.toLowerCase()) 
                || (originalData[i].subRows && originalData[i].subRows.length)
            ){
                originalData[i].expanded = true; // putting this property for react-table expand programmatically
                filtered.push(originalData[i]);
            }
            
        }

        return filtered;
    }


    render(){
        return (
            <main className="content">
                <Typography className="titleHeader" variant="h4" noWrap >
                    Organization Resource Manager
                </Typography>
                <Box boxShadow={3}>
                    <div className="paper" >
                        <section className="actions">
                            <DialogCreateFolder dataSelected={this.state.dataSelected} onSubmitCreateFolder={this.onSubmitCreateFolder.bind(this)} />
                            <DialogCreateProject dataSelected={this.state.dataSelected} onSubmitCreateProject={this.onSubmitCreateProject.bind(this)} />
                            <DialogAddUserProject dataSelected={this.state.dataSelected} onSubmitAddUserProject={this.onSubmitAddUserProject.bind(this)} />
                        </section>

                        {this.state.blocking ? (
                            <Oganizations 
                                data={[]}
                                blocking={true}
                                callbackSetDataSelected={this.callbackSetDataSelected.bind(this)}
                                callbackFilter={this.handleTableFilter.bind(this)}
                            />
                        ):(
                            <Oganizations 
                                data={this.state.organizations}
                                blocking={false}
                                callbackSetDataSelected={this.callbackSetDataSelected.bind(this)}
                                callbackFilter={this.handleTableFilter.bind(this)}
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
