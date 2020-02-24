import React from 'react';

import AccountsTable from "./components/Table";

import "./CisCompliance.css";

export default class CisCompliance extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        accounts: [],
        dates_available: [],
        type_roles: [],
        type_role_selected: "",
        date_check_selected: "None",
        loading: true,
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

            fetch(process.env.REACT_APP_ENDPOINT+"/policy/compliance/cis/dates-available", {
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

        fetch(process.env.REACT_APP_ENDPOINT+"/policy/compliance/cis/check?date_action="+this.state.date_check_selected, {
            method:"GET", mode:"cors"
        })
        .then(resp => resp.json())
        .then(data => {
            console.log("Data: ",data);
            let accounts = [];
            if(!Array.isArray( data['content'] ) ){
                accounts.push(data['content']);
            }else accounts = data['content']; 

  
            this.setState( {accounts,
                            // dates_available: data['dates_available'],
                            // loading:false 
                        } );
            console.log(this.state.accounts);
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

        fetch(process.env.REACT_APP_ENDPOINT+"/policy/compliance/cis/new",{
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
        const { accounts, dates_available, dynamicModalTable } = this.state;

                        
        return (
            <AccountsTable 
                accounts={accounts}
                dates_available={dates_available}
                dynamicModalTable={dynamicModalTable}
                requestNewCompliance={this.requestNewCompliance.bind(this)}
                getCompliance={this.getCompliance.bind(this)}
                onChangeTypeRole={this.onChangeTypeRole.bind(this)}
                onChangeDataCheck={this.onChangeDataCheck.bind(this)}

            />
            
        );
    }

}
