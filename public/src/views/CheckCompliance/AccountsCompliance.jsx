import React from 'react';

import AccountsTable from "./components/AccountsTable";

import "./AccountsCompliance.css";

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
        filter_text: {
                "account_id": "", //[], 
                "account_name": "", //[],
                "role_name": "", //[],
                "role_policy": "", //[],
                "compliance": "", //[],
                "status": "", //[],
                "policies_adicionais": "" //[]
            },
        };
    }
    
    /**
     * Request the type role available and dates from the checks
     */
    componentDidMount(){
        fetch(process.env.REACT_APP_ENDPOINT+"/role/available")
        // fetch(process.env.REACT_APP_ENDPOINT+"/policy/available")
        .then(resp => resp.json())
        .then(data => {
            if(data.message === "Internal server error"){
                console.error("Error in fetching data");
            }else{
                this.setState({ 
                    type_roles: data.type_roles,
                    type_role_selected: data.type_roles[0]
                });
            }

            fetch(process.env.REACT_APP_ENDPOINT+"/policy/compliance/iam/dates-available", {
                method:"GET", mode:"cors"
            })
            .then(resp => resp.json())
            .then(data => {
                this.setState( {dates_available: data['dates_available']} );
            })
            
            // fetch(process.env.REACT_APP_ENDPOINT+"/policy/compliance/check?date_action=", {
            //     method:"GET", mode:"cors"
            // })
            // .then(resp => resp.json())
            // .then(data => {
            //     console.log(data);
            //     this.setState( {accounts:data['content'],
            //                     dates_available: data['dates_available'],
            //                     loading:false } );
            //     //  console.log(this.state.accounts);
            // })

        })
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
    getCompliance(e){
        this.setState({accounts:[]});

        fetch(process.env.REACT_APP_ENDPOINT+"/policy/compliance/check?date_action="+this.state.date_check_selected+"&type_role="+this.state.type_role_selected, {
            method:"GET", mode:"cors"
        })
        .then(resp => resp.json())
        .then(data => {
            this.setState( {accounts:data['content'],
                            dates_available: data['dates_available'],
                            // loading:false 
                        } );
            // console.log(this.state.accounts);
        })   
    }

    /**
     * Request a new check from a specfic account/role type. Pass as parameters the date and account type
     */
    requestNewCompliance(){
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        let date_format = dd + mm + yyyy;

        fetch(process.env.REACT_APP_ENDPOINT+"/policy/compliance/iam/new",{
            method:"POST", mode:"cors",
            body: JSON.stringify( {"date_action":date_format, "type_role": this.state.type_role_selected} )
        })
        .then( resp => resp.json())
        .then( _ => {
            this.setState( {accounts: [], dates_available: [], loading: true } );
            this.componentDidMount(); // TODO: colocar refresh a cada 5 seg
        })
    }
    
     render(){
        const { showModal, filter_text, accounts, loading, dates_available, type_roles, type_role_selected} = this.state;
        let img_loading = "";
        if(loading) img_loading = <img className="centralize-img" src="images/loading-spinning-bubbles.svg" /> ;
        //img_loading = <img src="images/loading-spinning-bubbles.svg" /> ;
                
        let roles = [];
        let policy= [];
        let compliance = [];
        let status = [];
        let policies_adicionais = [];
        let total_rows = 0;
        
        //console.log();
        if(accounts && !(accounts.length === 0) ){
            {accounts.map((elem,index) =>{
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
            })}

            total_rows = policy.length;
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
