import React from 'react';

import AccountsTable from "./components/Table";

import "./CisCompliance.css";

export default class CisCompliance extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        accounts: [],
        dates_available: [],
        date_check_selected: "None",
        loading: true,
        };
    }
    
    /**
     * Request the type role available and dates from the checks
     */
    componentDidMount(){

        fetch(process.env.REACT_APP_ENDPOINT+"/policy/compliance/cis/dates-available", {
            method:"GET", mode:"cors", headers: {"X-Api-Key": process.env.X_API_KEY_AWS},
        })
        .then(resp => resp.json())
        .then(data => {
            this.setState( {dates_available: data['dates_available']} );
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
    async getCompliance(e){
        this.setState({accounts:[]});

        await fetch(process.env.REACT_APP_ENDPOINT+"/policy/compliance/cis/check?date_action="+this.state.date_check_selected, {
            method:"GET", mode:"cors", headers: {"X-Api-Key": process.env.X_API_KEY_AWS},
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
            return "ok";
        })   
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

        return await fetch(process.env.REACT_APP_ENDPOINT+"/policy/compliance/cis/new",{
            method:"POST", mode:"cors", headers: {"X-Api-Key": process.env.X_API_KEY_AWS},
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

                fetch(process.env.REACT_APP_ENDPOINT+"/policy/compliance/cis/dates-available", {
                    method:"GET", mode:"cors", headers: {"X-Api-Key": process.env.X_API_KEY_AWS},
                }).then(resp => resp.json()).then(data => {
                    this.setState( {dates_available: data['dates_available']} );
                })

                return {"error":false, "message":"Executado com sucesso"};
            }            
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
