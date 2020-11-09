import React from 'react';
import { getAuthorization } from "../../../utils";

import AccountsTable from "./components/AccountsTable";

import "./style.css";

export default class AccountsCompliance extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        accounts: [],
        dates_available: [],
        type_roles: [],
        type_role_selected: "",
        date_check_selected: "",
        loading: true,
        showModal: false,
      }
    }
    
    
    async componentDidMount(){
        window.document.title = "Octopus - AWS IAM Compliance";

        let stateValues = this;
        await fetch(process.env.REACT_APP_ENDPOINT+"/aws/roles",{
            headers: {"Authorization": getAuthorization()},
        })
        .then(resp => this._handleFetchErrors(resp, stateValues))
        .then(response => {
            if(response.data.roles && response.data.roles.length){
                this.setState({ 
                    type_roles: response.data.roles,
                    type_role_selected: response.data.roles[0]
                });
            }

            fetch(process.env.REACT_APP_ENDPOINT+"/aws/policiescompliance/iam/dates-available", {
                method:"GET", mode:"cors", headers: {"Authorization": getAuthorization()},
            })
            .then(resp => this._handleFetchErrors(resp, stateValues))
            .then(response => {
                this.setState( {dates_available: response.data['dates_available']} );
            })
            .catch(error => console.error(error));
            
        }).catch(error => console.error(error));
    }

    /**
     * When select the type role in the select, set the new value on the state
     */
    onChangeTypeRole = event => this.setState({ type_role_selected: event.target.value })
    onChangeDataCheck = event => this.setState({ date_check_selected: event.target.value })

    /**
     * When change the date of check compliance, request the data from this specfic date and account type.
     * @param {Object} e 
     */
    async getCompliance(e){
        this.setState({accounts:[]});

        return await fetch(process.env.REACT_APP_ENDPOINT+"/aws/policiescompliance/iam/check?date_action="+this.state.date_check_selected+"&type_role="+this.state.type_role_selected, {
            method:"GET", mode:"cors", headers: {"Authorization": getAuthorization()},
        })
        .then(resp => resp.json())
        .then(data => {
            this.setState( {accounts:data['content'],
                            dates_available: data['dates_available'],
                            // loading:false 
                        } );
            return {"error":false, "message":"Executado com sucesso"};
        })   
        .catch(e => console.error(e));
    }

    /**
     * Request a new check from a specfic account/role type. Pass as parameters the date and account type
     */
    async requestNewCompliance(){
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        let date_format = dd + mm + yyyy;

        return await fetch(process.env.REACT_APP_ENDPOINT+"/aws/policiescompliance/iam",{
            method:"POST", mode:"cors", headers: {"Authorization": getAuthorization()},
            body: JSON.stringify( {"date_action":date_format, "type_role": this.state.type_role_selected} )
        })
        .then( resp => {
            if( resp.status === 502 ){
                return {"error":true, "message":"Ocorreu um erro ao executar a ação"};
            }else if( resp.status === 400 ){
                return {"error":true, "message":"Todos os campos precisam ser preenchidos"};
            }else if( resp.status === 200 ){
                //this.setState( {accounts: [], dates_available: [], loading: true } );
                //this.componentDidMount(); // TODO: colocar refresh a cada 5 seg

                fetch(process.env.REACT_APP_ENDPOINT+"/aws/policiescompliance/iam/dates-available", {
                    method:"GET", mode:"cors", headers: {"Authorization": getAuthorization()},
                }).then(resp => resp.json()).then(data => {
                    this.setState( {dates_available: data['dates_available']} );
                })

                return {"error":false, "message":"Executado com sucesso"};
            }            
        })
        .catch(e => console.error(e));
    }

    async _handleFetchErrors(response, stateValues = {}) {
        if (!response.ok) {
            if (response.status === 401) {
                alert("Not authenticated. Login again");
                window.location.reload();
            } else {
                let message = "";
                if (response.status === 400) {
                    message = "Invalid request";
                } else if (response.status === 403) {
                    message = "You don't have permissions to do this action";
                } else if (response.status === 404) {
                    message = "Not found";
                } else if (response.status === 500 || response.status === 502) {
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
                    },()=>stateValues.setState({requestError: false}));
                // }

                // stateValues.setState({isLoading: false});
                // stateValues.setState({ requestError: false });
                throw Error(response.statusText);
                //https://gist.github.com/odewahn/5a5eeb23279eed6a80d7798fdb47fe91
                // return Promise.resolve(response.json()).then((responseInJson) => { // This will end up in ERROR part
                //     return Promise.reject({"promise":responseInJson, "status":response.status}); //  responseInJson.message = "Some nasty error message!"
                // });
            }
        }
        return response.json();
    }
    
    render(){
        const { accounts, dates_available, type_roles} = this.state;
                
        let roles = [];
        let policy= [];
        let compliance = [];
        let status = [];
        let policies_adicionais = [];
        // let total_rows = 0;
        
        //console.log();
        if(accounts && !(accounts.length === 0) ){
            accounts.map((elem,index) =>{
                // console.log(elem);
                JSON.parse(elem['DataCompliance']).map(elem => {
                    roles.push(elem['name']);
                    
                    if(elem['policy'].length === 0) policy.push("(empty)");
                    else policy.push(elem['policy'].toString());
                    
                    compliance.push(elem['compliance']);

                    if(elem['status'].length === 0 || elem['status'] === "") status.push("(empty)");
                    else status.push(elem['policy'].toString());

                    if(elem['policies_adicionais'] !== undefined){
                        // console.log(elem['policies_adicionais'] );
                        policies_adicionais.push( elem['policies_adicionais'].length === 0 ? "(empty)" : elem['policies_adicionais'].toString());
                    
                    }else policies_adicionais.push("(empty)");
                });
            });

            // total_rows = policy.length;
            roles = [... new Set(roles)]; // removing duplicates
            policy = [... new Set(policy)];
            compliance = [... new Set(compliance)];
            status = [... new Set(status)];
            policies_adicionais = [... new Set(policies_adicionais)];
            // moving to the lastest position
            policies_adicionais.shift(); policies_adicionais.push("(empty)");
        }
        
        return (
            <AccountsTable 
                accounts={accounts}
                type_roles={type_roles}
                dates_available={dates_available}

                requestNewCompliance={this.requestNewCompliance.bind(this)}
                getCompliance={this.getCompliance.bind(this)}
                onChangeTypeRole={this.onChangeTypeRole.bind(this)}
                onChangeDataCheck={this.onChangeDataCheck.bind(this)}

            />
            
        );
    }

}
