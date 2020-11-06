import React from 'react';
import BlockUi from 'react-block-ui';
import { getAuthorization } from "../../../utils";
import RolesItem from "./components/RolesItem";
import SnackbarNotification from "../../../components/SnackbarNotification";
import LoadingCircularProgress from "../../../components/LoadingCircularProgress";
import "./styles.css";


export default class RolesAccount extends React.PureComponent {
    constructor() {
      super();
      this.state = {
          roles:[], // roles the account have
          rolesOptions: [],
          selectedOption: null,
          requestError: false,
          errorMessagePopup: "",
          requestSuccess: false,
          blocking: false,
          loading: false,
      };
    }
    
    async componentDidMount(){
        this.setState({blocking: true});
        let stateValues = this;
        fetch(process.env.REACT_APP_ENDPOINT+"/aws/roles", {
            headers: {"Authorization": getAuthorization()},
        })
        .then(response => this._handleFetchErrors(response, stateValues))
        .then(response => {
            if(response.message === "Internal server error"){
                console.error("Error in fetching data");
            }
            // console.log("data role available: ",data);
            if(response.data.roles.length){
                let formatData = [];
                response.data.roles.map(value => {
                    // database?
                    // formatData.push({ "name":value.role_type, "type":"database", "description": value.description, "roles":value.roles } )
                    formatData.push({ "role_type_name":value.role_type, "description": value.description, "roles":value.roles } )
                }) ;
                this.setState({ roles: formatData});

            }else{
                // data doesn't exists ..
                const type_roles = [] ;//[... this.state.rolesOptions];
                type_roles.push({"role_type_name":"New-type-1", "new":true, "description":"Description of this", "roles": []});
                this.setState({roles: type_roles});
            }
            
        }).catch(error => console.error(error))

        
        // get the roles available which were created at Manage IAM
        await fetch(`${process.env.REACT_APP_ENDPOINT}/aws/policies/${encodeURIComponent("role")}`, { 
            headers: {"Authorization": getAuthorization()} 
        })
        .then(response => this._handleFetchErrors(response, stateValues))
        .then(response => {
            if(response.error === true){
                console.error("Error in fetching data");
            }else{
                // console.log("Data policy available role: ",data);
                let roles_ar = [];
                response.data.policies.map( (elem,index) => {
                    roles_ar[index] = { "value":elem['PolicyName'], "label":elem['PolicyName'] } ;
                })
                this.setState({ rolesOptions: roles_ar });
            }
            // console.log("STATE: ",this.state);
        }).catch(error => console.error(error))

        this.setState({blocking: false});
    }
    

    /**
     * Handle the button delete, also set the states to initial value
     */
    async requestDeleteRoleType(index){
        if(index !== undefined){
            let stateValues = this;

            let roleName = this.state.roles[index]['role_type_name'];
            
            this.setState({blocking: true});

            await fetch(`${process.env.REACT_APP_ENDPOINT}/aws/roles/${encodeURIComponent(roleName)}`,{
                method:"DELETE", mode:"cors", headers: {"Authorization": getAuthorization()},
            })
            .then(response => this._handleFetchErrors(response, stateValues))
            .then( _ => {
                // let index = rolesOptions.indexOf(name);
                let newRoles = this.state.roles;
                newRoles.splice(index, 1);
        
                // if the available roles (created) is empty, add default form
                if(newRoles.length === 0){
                    newRoles.push({"role_type_name":"New-type-1", "new":true, "description":"Description of this", "roles": []});  
                } 

                this.setState({ roles: newRoles, requestSuccess: true});
                
            }).catch(error => console.error(error));
            this.setState({requestSuccess: false, blocking: false});
        }
    }
    

    async onSubmitForm(roles){
        if(roles.length){
            this.setState({requestError: false, requestSuccess: false});
            let stateValues = this;
            await fetch(process.env.REACT_APP_ENDPOINT+"/aws/roles",{ 
                method: "PUT", 
                mode:"cors", 
                body: JSON.stringify( {"rolestype": roles} ),
                headers: {
                    "Content-Type":"application/json",
                    "Authorization": getAuthorization()
                },
            })
            .then(response => this._handleFetchErrors(response, stateValues))
            .then(resp => {
                roles.map(role => role.hasOwnProperty("new") ? delete role.new : "");
                //https://github.com/Availity/react-block-ui/issues/40
                this.setState({roles, requestSuccess: true}, () => this.setState({requestSuccess: false}));
            })
            .catch(error => console.log(error) )
        }  
    }

    async _handleFetchErrors(response, stateValues = {}) {
        if (!response.ok) {
            if(response.status === 401){
                alert("Not authenticated. Login again");
                // window.location.reload();
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
                // console.log(hasJsonData);
                // if(!hasJsonData){
                    stateValues.setState({
                        errorMessagePopup: message,
                        requestError: true,
                    },()=>stateValues.setState({requestError: false}));
                // }

                // stateValues.setState({isLoading: false});
                // stateValues.setState({requestError: false});
                throw Error(response);
                //https://gist.github.com/odewahn/5a5eeb23279eed6a80d7798fdb47fe91
                // return Promise.resolve(response.json()).then((responseInJson) => { // This will end up in ERROR part
                //     return Promise.reject({"promise":responseInJson, "status":response.status}); //  responseInJson.message = "Some nasty error message!"
                // });
            }
        }
        return response.json();
    }

    // handleDataChanged(newData, index){
    //     let newRoles = this.state.roles;
    //     newRoles[index] = newData;
    //     this.setState({roles: newRoles});
    // }

    /**
     * Render the html page
     */
    render(){
        const { roles, rolesOptions } = this.state;
        
        return (
            <>
                <BlockUi tag="div" blocking={this.state.blocking} message="" loader={<LoadingCircularProgress/>}>
                    <RolesItem 
                        roles={roles}
                        // role_type={role_type}
                        rolesOptions={rolesOptions}
                        
                        // onChangeRoleTypeSelect={this.onChangeRoleTypeSelect.bind(this)}
                        // onSubmit={this.onSubmitForm.bind(this)}
                        callbackSaveData={this.onSubmitForm.bind(this)}
                        callbackDeleteIndex={this.requestDeleteRoleType.bind(this)}

                    />
                </BlockUi>

            {this.state.requestError && <SnackbarNotification variant="error" message={this.state.errorMessagePopup}/>}
            {this.state.requestSuccess && <SnackbarNotification variant="success" message="Success!"/>}
            </>
        );
    }

}