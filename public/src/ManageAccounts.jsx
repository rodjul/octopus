import React from 'react';
import { Button,Table} from "react-bootstrap";
import { Accordion, AccordionItem, AccordionItemHeading, AccordionItemButton, AccordionItemPanel } from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';

import "./ManageAccounts.css";

export default class ManageAccounts extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        accounts: [],
        compliance_info: [],
        loading: true,
    };
    }

    componentDidMount(){
        //"https://dq8yro2vbd.execute-api.us-east-2.amazonaws.com/dev/account/organizations"
        fetch("https://ox1urpvt56.execute-api.us-east-2.amazonaws.com/prod/getaccounts", {
            method:"POST", mode:"cors", 
            body: JSON.stringify({"payer_id":"210272193452", "role_name":"octopusmngt"}),
        })
        .then(resp => resp.json())
        .then(data => {
            this.setState( {accounts:data['accounts'],
                            loading:false } );
            //console.log(this.state.accounts);
        })
    }

    getCompliance(account_id){
        fetch("https://dq8yro2vbd.execute-api.us-east-2.amazonaws.com/dev/policy/compliance/check/"+account_id)
        .then(resp => resp.json())
        .then(data => {
            console.log(account_id)
            let content = JSON.parse(data.message);
            let data_append = {...this.state.compliance_info, [account_id]: content } 
            //let data_append = { [account_id] : content } 
            this.setState( {compliance_info: [data_append] } )
            console.log(this.state.compliance_info)
        })
        
    }

    render(){
        const sample2 = [
            {'name': 'accessmngt', 'policy': 'policy-accessmngt', 'compliance': false, 'status': 'Policy com o nome informado não encontrado', 'policies_adicionais': ['Billing', 'ReadOnlyAccess', 'policy-accessmngt']},
            {'name': 'ateleia-systemmanager', 'policy': ['policy-ateleiasystemmanager'], 'compliance': false, 'status': 'não encontrado'},
            {'name': 'businessops', 'policy': 'policy-businessops', 'compliance': false, 'status': 'Policy com o nome informado não encontrado', 'policies_adicionais': []},
            {'name': 'lionsplatform', 'policy': ['policy-lionsplataform'], 'compliance': false, 'status': 'não encontrado'},
            {'name': 'siemaudit', 'policy': 'policy-siemaudit', 'compliance': false, 'status': 'Policy com o nome informado não encontrado'},
            {'name': 'supportportal', 'policy': 'policy-supportportal', 'compliance': false, 'status': 'Policy com o nome informado não encontrado'}];
        const sample = [{"name": "accessmngt", "policy": "policy-accessmngt", "compliance": false, "status": "Policy com o nome informado n\xc3\xa3o encontrado", "policies_adicionais": ["Billing", "ReadOnlyAccess", "policy-accessmngt"]}, {"name": "ateleia-systemmanager", "policy": ["policy-ateleiasystemmanager"], "compliance": false, "status": "N\xc3\xa3o encontrado"}, {"name": "businessops", "policy": "policy-businessops", "compliance": false, "status": "Policy com o nome informado n\xc3\xa3o encontrado", "policies_adicionais": []}, {"name": "lionsplatform", "policy": ["policy-lionsplataform"], "compliance": false, "status": "N\xc3\xa3o encontrado"}, {"name": "siemaudit", "policy": "policy-siemaudit", "compliance": false, "status": "Policy com o nome informado n\xc3\xa3o encontrado"}, {"name": "supportportal", "policy": "policy-supportportal", "compliance": false, "status": "Policy com o nome informado n\xc3\xa3o encontrado"}];
        const {compliance_info, accounts, loading} = this.state;
        let img_loading = "";
        if(loading) img_loading = <img className="centralize-img" src="images/loading-spinning-bubbles.svg" /> ;
        //img_loading = <img src="images/loading-spinning-bubbles.svg" /> ;
        
        return (
            <section  className="forms">
              
                <Accordion allowMultipleExpanded="true">
                    {img_loading}
                    <AccordionItem onClick={() => this.getCompliance("826839167791")}>
                            <AccordionItemHeading>
                                <AccordionItemButton>
                                    826839167791-d00009.aws@cloudtotvs.com.br
                                </AccordionItemButton>
                            </AccordionItemHeading>
                            <AccordionItemPanel>
                                <Button>abc</Button>
                                <Table responsive striped bordered  size="sm">
                                    <thead>
                                        <tr>
                                            <th>Role name</th>
                                            <th>Policy</th>
                                            <th>Compliance</th>
                                            <th>Status</th>
                                            <th>Policies adicionais</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {compliance_info.map((elem,index) =>{
                                            console.log(elem);
                                            let elem2 = elem['826839167791'][0]
                                            
                                            let policies_adicionais = "";
                                            if(elem2.hasOwnProperty("policies_adicionais")) policies_adicionais = elem2['policies_adicionais'].toString();
                                            
                                            return(
                                                <tr key={index}>
                                                    <td>{elem2['name']}</td>
                                                    <td>{elem2['policy']}</td>
                                                    <td>{elem2['compliance'].toString()}</td>
                                                    <td>{elem2['status']}</td>
                                                    <td>{policies_adicionais}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </AccordionItemPanel>
                        </AccordionItem>  

                    {/* {accounts.map((elem, index) => {
                        return (
                        <AccordionItem key={index}>
                            <AccordionItemHeading>
                                <AccordionItemButton>
                                    {elem['Id']}-{elem['Name']}
                                </AccordionItemButton>
                            </AccordionItemHeading>
                            <AccordionItemPanel>
                                <Button>abc</Button>
                                <Table responsive striped bordered  size="sm">
                                    <thead>
                                        <tr>
                                            <th>Role name</th>
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
                            </AccordionItemPanel>
                        </AccordionItem>  
                        );
                    })} */}
                </Accordion>

            </section>
        );
    }

}
