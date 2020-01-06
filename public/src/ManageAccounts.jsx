import React from 'react';
import { Button, FormGroup, FormControl, FormLabel, Table, Form, Row, horizontal } from "react-bootstrap";
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';
import "./ManageAccounts.css";

export default class ManageAccounts extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        accounts: []
    };
    }

    componentDidMount(){
        fetch("https://dq8yro2vbd.execute-api.us-east-2.amazonaws.com/dev/account/organizations")
        .then(resp => resp.json())
        .then(data => this.setState( {accounts:data['accounts']} ))
        
    }

    render(){
        const sample = [
            {'name': 'accessmngt', 'policy': 'policy-accessmngt', 'compliance': false, 'status': 'Policy com o nome informado não encontrado', 'policies_adicionais': ['Billing', 'ReadOnlyAccess', 'policy-accessmngt']},
            {'name': 'ateleia-systemmanager', 'policy': ['policy-ateleiasystemmanager'], 'compliance': false, 'status': 'não encontrado'},
            {'name': 'businessops', 'policy': 'policy-businessops', 'compliance': false, 'status': 'Policy com o nome informado não encontrado', 'policies_adicionais': []},
            {'name': 'lionsplatform', 'policy': ['policy-lionsplataform'], 'compliance': false, 'status': 'não encontrado'},
            {'name': 'siemaudit', 'policy': 'policy-siemaudit', 'compliance': false, 'status': 'Policy com o nome informado não encontrado'},
            {'name': 'supportportal', 'policy': 'policy-supportportal', 'compliance': false, 'status': 'Policy com o nome informado não encontrado'}];
        const {accounts} = this.state;
        return (
            <section  className="forms">
                <Table responsive striped bordered  size="sm">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Policy</th>
                            <th>Compliance</th>
                            <th>Status</th>
                            <th>Policies adicionais</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sample.map((elem,index) =>{
                            let policies_adicionais = "";
                            if(elem.hasOwnProperty("policies_adicionais")) policies_adicionais = elem['policies_adicionais'].toString();
                            
                            return(
                                <tr key={index}>
                                    <td>{elem['name']}</td>
                                    <td>{elem['policy']}</td>
                                    <td>{elem['compliance'].toString()}</td>
                                    <td>{elem['status']}</td>
                                    <td>{policies_adicionais}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>


            </section>
        );
    }

}
