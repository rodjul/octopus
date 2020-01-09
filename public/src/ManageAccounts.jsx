import React, { Fragment } from 'react';
import { Button,Table, Dropdown} from "react-bootstrap";
import { Accordion, AccordionItem, AccordionItemHeading, AccordionItemButton, AccordionItemPanel } from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';

import "./ManageAccounts.css";

export default class ManageAccounts extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        accounts: [],
        accounts2: [
            {
              "Account": "069512972055",
              "DateAction": "09012020",
              "DataCompliance": "[{\"name\": \"accessmngt\", \"policy\": [\"policy-accessmngt\"], \"compliance\": false, \"status\": \"Não encontrado\"}, {\"name\": \"ateleia-systemmanager\", \"policy\": [\"policy-ateleiasystemmanager\"], \"compliance\": false, \"status\": \"Não encontrado\"}, {\"name\": \"businessops\", \"policy\": [\"policy-businessops\"], \"compliance\": false, \"status\": \"Não encontrado\"}, {\"name\": \"lionsplatform\", \"policy\": [\"policy-lionsplataform\"], \"compliance\": false, \"status\": \"Não encontrado\"}, {\"name\": \"siemaudit\", \"policy\": \"policy-siemaudit\", \"compliance\": false, \"status\": \"Policy com o nome informado não encontrado\"}, {\"name\": \"supportportal\", \"policy\": [\"policy-supportportal\"], \"compliance\": false, \"status\": \"Não encontrado\"}]",
              "Name": "C84A44.aws"
            },
            {
              "Account": "240932178171",
              "DateAction": "09012020",
              "DataCompliance": "[{\"name\": \"accessmngt\", \"policy\": [\"policy-accessmngt\"], \"compliance\": false, \"status\": \"Não encontrado\"}, {\"name\": \"ateleia-systemmanager\", \"policy\": [\"policy-ateleiasystemmanager\"], \"compliance\": false, \"status\": \"Não encontrado\"}, {\"name\": \"businessops\", \"policy\": [\"policy-businessops\"], \"compliance\": false, \"status\": \"Não encontrado\"}, {\"name\": \"cloudynRole\", \"policy\": [], \"compliance\": false, \"status\": \"Não encontrado\"}, {\"name\": \"lionsplatform\", \"policy\": [\"policy-lionsplataform\"], \"compliance\": false, \"status\": \"Não encontrado\"}, {\"name\": \"siemaudit\", \"policy\": [\"policy-siemaudit\"], \"compliance\": false, \"status\": \"Não encontrado\"}, {\"name\": \"supportportal\", \"policy\": [\"policy-supportportal\"], \"compliance\": false, \"status\": \"Não encontrado\"}]",
              "Name": "octopus.teste-8"
            },
            {
              "Account": "350819178402",
              "DateAction": "09012020",
              "DataCompliance": "[{\"name\": \"accessmngt\", \"policy\": \"policy-accessmngt\", \"compliance\": false, \"status\": \"Policy com o nome informado não encontrado\", \"policies_adicionais\": []}, {\"name\": \"ateleia-systemmanager\", \"policy\": \"policy-ateleiasystemmanager\", \"compliance\": false, \"status\": \"Policy com o nome informado não encontrado\", \"policies_adicionais\": []}, {\"name\": \"businessops\", \"policy\": \"policy-businessops\", \"compliance\": false, \"status\": \"Policy com o nome informado não encontrado\", \"policies_adicionais\": []}, {\"name\": \"lionsplatform\", \"policy\": \"policy-lionsplataform\", \"compliance\": false, \"status\": \"Policy com o nome informado não encontrado\", \"policies_adicionais\": []}, {\"name\": \"siemaudit\", \"policy\": \"policy-siemaudit\", \"compliance\": false, \"status\": \"Policy com o nome informado não encontrado\", \"policies_adicionais\": []}, {\"name\": \"supportportal\", \"policy\": \"policy-supportportal\", \"compliance\": false, \"status\": \"Policy com o nome informado não encontrado\", \"policies_adicionais\": []}]",
              "Name": "licenseserversm2plataforma.aws"
            },
            {
              "Account": "367386392375",
              "DateAction": "09012020",
              "DataCompliance": "[{\"name\": \"accessmngt\", \"policy\": \"policy-accessmngt\", \"compliance\": false, \"status\": \"Policy com o nome informado não encontrado\", \"policies_adicionais\": []}, {\"name\": \"ateleia-systemmanager\", \"policy\": \"policy-ateleiasystemmanager\", \"compliance\": false, \"status\": \"Policy com o nome informado não encontrado\", \"policies_adicionais\": []}, {\"name\": \"businessops\", \"policy\": \"policy-businessops\", \"compliance\": false, \"status\": \"Policy com o nome informado não encontrado\", \"policies_adicionais\": []}, {\"name\": \"lionsplatform\", \"policy\": \"policy-lionsplataform\", \"compliance\": false, \"status\": \"Policy com o nome informado não encontrado\", \"policies_adicionais\": []}, {\"name\": \"siemaudit\", \"policy\": \"policy-siemaudit\", \"compliance\": false, \"status\": \"Policy com o nome informado não encontrado\", \"policies_adicionais\": []}, {\"name\": \"supportportal\", \"policy\": \"policy-supportportal\", \"compliance\": false, \"status\": \"Policy com o nome informado não encontrado\", \"policies_adicionais\": []}]",
              "Name": "service.buckets16.aws"
            },
            {
              "Account": "961360804028",
              "DateAction": "09012020",
              "DataCompliance": "[{\"name\": \"accessmngt\", \"policy\": [\"policy-accessmngt\"], \"compliance\": false, \"status\": \"Não encontrado\"}, {\"name\": \"ateleia-systemmanager\", \"policy\": [\"policy-ateleiasystemmanager\"], \"compliance\": false, \"status\": \"Não encontrado\"}, {\"name\": \"businessops\", \"policy\": [\"policy-businessops\"], \"compliance\": false, \"status\": \"Não encontrado\"}, {\"name\": \"lionsplatform\", \"policy\": [\"policy-lionsplataform\"], \"compliance\": false, \"status\": \"Não encontrado\"}, {\"name\": \"siemaudit\", \"policy\": \"policy-siemaudit\", \"compliance\": false, \"status\": \"Policy com o nome informado não encontrado\"}, {\"name\": \"supportportal\", \"policy\": [\"policy-supportportal\"], \"compliance\": false, \"status\": \"Não encontrado\"}]",
              "Name": "service.buckets1.aws"
            }
          ],
        compliance_info: [],
        loading: true,
        filter_text: ""
        };
        
    }

 
    
    componentDidMount(){
        // "https://dq8yro2vbd.execute-api.us-east-2.amazonaws.com/dev/account/organizations"
        //fetch("https://ox1urpvt56.execute-api.us-east-2.amazonaws.com/prod/getaccounts", {
        // fetch("https://ox1urpvt56.execute-api.us-east-2.amazonaws.com/prod/getaccounts", {
        //     method:"POST", mode:"cors", 
        //     body: JSON.stringify({"payer_id":"210272193452", "role_name":"octopusmngt"}),
        // })

        fetch("https://dq8yro2vbd.execute-api.us-east-2.amazonaws.com/dev/policy/compliance/check/all", {
            method:"GET", mode:"cors"
        })
        .then(resp => resp.json())
        .then(data => {
            this.setState( {accounts:data['content'],
                            loading:false } );
            console.log(this.state.accounts);
        
        })
        
    }

    getCompliance(account_id){
        fetch("https://dq8yro2vbd.execute-api.us-east-2.amazonaws.com/dev/policy/compliance/check/"+account_id)
        .then(resp => resp.json())
        .then(content => {
            //console.log(account_id, content)
            let data_append = {...this.state.compliance_info, [account_id]: content } 
            //let data_append = { [account_id] : content } 
            this.setState( {compliance_info: [data_append] } )
            //console.log(this.state.compliance_info)
        })    
    }
    
    requestNewCompliance(){
        let date = new Date();
        let date_format = date.getDay() +"-"+ (date.getMonth()+1) +"-"+ date.getFullYear();
        // fazer um post para dps ficar controlando na tabela
    }

    // ao passar um account_id, validamos se existe o dado e montamos o html
    getComplianceValuesOfAccount(account_id){
        // condicao para nao quebrar a pagina por nao existir dados ao inicializar
        if(account_id !== "" && this.state.compliance_info.length !== 0){
            console.log(account_id, this.state.compliance_info);
            let data = this.state.compliance_info[0][account_id];
            
            if(data.hasOwnProperty("message") && data['message'] === "Not found"){
                return <tr><td>Not found</td></tr>
            }else{
                return data.map((elem, index) => {
                    return <tr key={`${account_id}-${index}`}>
                        <td>{elem['name']}</td>
                        <td>{elem['policy']}</td>
                        <td>{elem['compliance'].toString()}</td>
                        <td>{elem['status']}</td>
                        <td>{elem.hasOwnProperty("policies_adicionais") ? elem['policies_adicionais'].toString() : ""}</td>
                    </tr> 
                });
            }
        }
    }

    handleChange() {
        this.props.onUserInput(this.refs.filterTextInput.value);
    }
    handleUserInput(e) {
        this.setState({ [e.target.name]: e.target.value});
    };
    
    handleSelectAccount(e){
        console.log(e.target.text);
        if(e.target.text.toLowerCase() === "todos"){
            this.setState({ filter_text: ""});
        }else{
            this.setState({ filter_text: e.target.text});
        }
    }
    
    render(){
        const sample = [{"name": "accessmngt", "policy": "policy-accessmngt", "compliance": false, "status": "Policy com o nome informado n\xc3\xa3o encontrado", "policies_adicionais": ["Billing", "ReadOnlyAccess", "policy-accessmngt"]}, {"name": "ateleia-systemmanager", "policy": ["policy-ateleiasystemmanager"], "compliance": false, "status": "N\xc3\xa3o encontrado"}, {"name": "businessops", "policy": "policy-businessops", "compliance": false, "status": "Policy com o nome informado n\xc3\xa3o encontrado", "policies_adicionais": []}, {"name": "lionsplatform", "policy": ["policy-lionsplataform"], "compliance": false, "status": "N\xc3\xa3o encontrado"}, {"name": "siemaudit", "policy": "policy-siemaudit", "compliance": false, "status": "Policy com o nome informado n\xc3\xa3o encontrado"}, {"name": "supportportal", "policy": "policy-supportportal", "compliance": false, "status": "Policy com o nome informado n\xc3\xa3o encontrado"}];
        const {compliance_info, accounts, loading} = this.state;
        let img_loading = "";
        if(loading) img_loading = <img className="centralize-img" src="images/loading-spinning-bubbles.svg" /> ;
        //img_loading = <img src="images/loading-spinning-bubbles.svg" /> ;
        
        // let load_table = ""
        // if(!loading){
        //     console.log(accounts);
        //     load_table = 
        // }
        
        let roles = [];
        let policy= [];
        let compliance = [];
        let status = [];
        let policies_adicionais = [];
        
        if(accounts !== []){
            {accounts.map((elem,index) =>{
                JSON.parse(elem['DataCompliance']).map(elem => {
                    roles.push(elem['name']);
                    policy.push(elem['policy'].toString());
                    compliance.push(elem['compliance']);
                    status.push(elem['status']);
                    policies_adicionais.push(elem['policies_adicionais']);
                });
            })}
            
            roles = [... new Set(roles)]; // removing duplicates
            policy = [... new Set(policy)]; 
            compliance = [... new Set(compliance)]; 
            status = [... new Set(status)]; 
            policies_adicionais = [... new Set(policies_adicionais)]; 
            
        }

        return (
            <section  className="forms">
                {/* <Button onClick={() => this.handleClick()}></Button>
                <Accordion allowMultipleExpanded="true"> */}
                

                {/* {load_table} */}
                {/* <div>
                    <input type="text" placeholder="Search" name="filter_text" value={this.state.filter_text}  onChange={this.handleUserInput.bind(this)} />
                </div>    */}
                <Table responsive striped bordered  size="sm">
                    <thead>
                        <tr>
                            <th>AccountId
                                <div>
                                    <Dropdown>
                                        <Dropdown.Toggle size="sm" variant="info" id="dropdown-basic">{this.state.filter_text == "" ? "Search" : this.state.filter_text}</Dropdown.Toggle>

                                        <Dropdown.Menu onMouseUp={this.handleSelectAccount.bind(this)}>
                                            <Dropdown.Item value="todos">Todos</Dropdown.Item>
                                            {accounts.map((elem,index) =>{
                                                return (
                                            <Dropdown.Item value={elem['Account']}>{elem['Account']}</Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </th>
                            <th>Name Account
                                <div>
                                    <Dropdown>
                                        <Dropdown.Toggle size="sm" variant="info" id="dropdown-basic">{this.state.filter_text == "" ? "Search" : this.state.filter_text}</Dropdown.Toggle>

                                        <Dropdown.Menu onMouseUp={this.handleSelectAccount.bind(this)}>
                                            <Dropdown.Item value="todos">Todos</Dropdown.Item>
                                            {accounts.map((elem,index) =>{
                                                return (
                                            <Dropdown.Item value={elem['Name']}>{elem['Name']}</Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </th>
                            <th>Role name
                                <div>
                                    <Dropdown>
                                        <Dropdown.Toggle size="sm" variant="info" id="dropdown-basic">{this.state.filter_text == "" ? "Search" : this.state.filter_text}</Dropdown.Toggle>

                                        <Dropdown.Menu onMouseUp={this.handleSelectAccount.bind(this)}>
                                            <Dropdown.Item value="todos">Todos</Dropdown.Item>
                                        {roles.map((elem,index) =>{
                                                return (
                                            <Dropdown.Item value={elem}>{elem}</Dropdown.Item>
                                                );
                                        })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </th>
                            <th>Policy
                                <div>
                                    <Dropdown>
                                        <Dropdown.Toggle size="sm" variant="info" id="dropdown-basic">{this.state.filter_text == "" ? "Search" : this.state.filter_text}</Dropdown.Toggle>

                                        <Dropdown.Menu onMouseUp={this.handleSelectAccount.bind(this)}>
                                            <Dropdown.Item value="todos">Todos</Dropdown.Item>
                                            {policy.map((elem,index) =>{
                                                return (
                                            <Dropdown.Item value={elem}>{elem}</Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </th>
                            <th>Compliance
                                <div>
                                    <Dropdown>
                                        <Dropdown.Toggle size="sm" variant="info" id="dropdown-basic">{this.state.filter_text == "" ? "Search" : this.state.filter_text}</Dropdown.Toggle>

                                        <Dropdown.Menu onMouseUp={this.handleSelectAccount.bind(this)}>
                                            <Dropdown.Item value="todos">Todos</Dropdown.Item>
                                            {compliance.map((elem,index) =>{
                                                return (
                                            <Dropdown.Item value={elem}>{elem.toString()}</Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </th>
                            <th>Status
                                <div>
                                    <Dropdown>
                                        <Dropdown.Toggle size="sm" variant="info" id="dropdown-basic">{this.state.filter_text == "" ? "Search" : this.state.filter_text}</Dropdown.Toggle>

                                        <Dropdown.Menu onMouseUp={this.handleSelectAccount.bind(this)}>
                                            <Dropdown.Item value="todos">Todos</Dropdown.Item>
                                            {status.map((elem,index) =>{
                                                return (
                                            <Dropdown.Item value={elem}>{elem}</Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </th>
                            <th>Policies adicionais
                                <div>
                                    <Dropdown>
                                        <Dropdown.Toggle size="sm" variant="info" id="dropdown-basic">{this.state.filter_text == "" ? "Search" : this.state.filter_text}</Dropdown.Toggle>

                                        <Dropdown.Menu onMouseUp={this.handleSelectAccount.bind(this)}>
                                            <Dropdown.Item value="todos">Todos</Dropdown.Item>
                                            {policies_adicionais.map((elem,index) =>{
                                                return (
                                            <Dropdown.Item value={elem}>{elem}</Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {img_loading}
                        {accounts.map((elem,index) =>{
                            return (
                                JSON.parse(elem['DataCompliance']).map((elem2,index) => {
                                    if(this.state.filter_text.length !== 0 &&
                                        elem['Account'].indexOf(this.state.filter_text) === -1){
                                            return ;
                                        }
                                    return(
                                        <tr key={index}>
                                            <td>{elem['Account']}</td>
                                            <td>{elem['Name']}</td>
                                            <td>{elem2['name']}</td>
                                            <td>{elem2['policy']}</td>
                                            <td>{elem2['compliance'].toString()}</td>
                                            <td>{elem2['status']}</td>
                                            <td>{elem2.hasOwnProperty("policies_adicionais") ? elem2['policies_adicionais'].toString() : ""}</td>
                                        </tr>
                                    );
                                })
                            );
                        })}
                    </tbody>
                </Table>



            </section>
        );
    }

}
