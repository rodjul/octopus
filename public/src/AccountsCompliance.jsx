import React from 'react';
import { Table, Dropdown, Button, Form, Modal } from "react-bootstrap";
//import { Accordion, AccordionItem, AccordionItemHeading, AccordionItemButton, AccordionItemPanel } from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';

import "./AccountsCompliance.css";

export default class AccountsCompliance extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        accounts: [],
        dates_available: [],
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
  
    componentDidMount(){
        // after finishing mounting the elements (by react), the first thing to do is a GET
        fetch("https://dq8yro2vbd.execute-api.us-east-2.amazonaws.com/dev/policy/compliance/check?date_action=", {
            method:"GET", mode:"cors"
        })
        .then(resp => resp.json())
        .then(data => {
            this.setState( {accounts:data['content'],
                            dates_available: data['dates_available'],
                            loading:false } );
             console.log(this.state.accounts);
        })
    }

    getCompliance(e){
        fetch("https://dq8yro2vbd.execute-api.us-east-2.amazonaws.com/dev/policy/compliance/check?date_action="+e.target.value, {
            method:"GET", mode:"cors"
        })
        .then(resp => resp.json())
        .then(data => {
            this.setState( {accounts:data['content'],
                            dates_available: data['dates_available'],
                            loading:false } );
            // console.log(this.state.accounts);
        })   
    }
    
    requestNewCompliance(){
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        let date_format = dd + mm + yyyy;

        fetch("https://dq8yro2vbd.execute-api.us-east-2.amazonaws.com/dev//policy/compliance/new",{
            method:"POST", mode:"cors",
            body: JSON.stringify( {"date_action":date_format} )
        })
        .then( resp => resp.json())
        .then( _ => {
            this.setState( {accounts: [], dates_available: [], loading: true } );
            
        })

        // fazer um post para dps ficar controlando na tabela
    }
    
    handleFilterSelection(e){
        // console.log(e);
        if(e !== undefined){
            let copy = this.state.filter_text;
            //console.log(copy, e.target.name, e.target.value);
            if(e.target.value !== undefined && e.target.value.toLocaleLowerCase() === "clear"){
                // Array.from( document.querySelectorAll("td[data_filter='"+e.target.name+"']") ).map((elem, index) => { 
                Array.from( document.querySelectorAll("td") ).map((elem, index) => { 
                    elem.parentElement.style.display = ""; 
                })
                // removing the filter color from menus
                Array.from( document.querySelectorAll("a[class~='filter_selected']") ).map( elem => { elem.classList.remove("filter_selected") } );

                copy[e.target.name] = "" ; //[] ;
                this.setState({ filter_text: copy});

            }else{
                if(copy[e.target.name].length > 0){
                    // console.log(copy[e.target.name], "td[data_filter='"+e.target.name+"']");
                    Array.from( document.querySelectorAll("td[data_filter='"+e.target.name+"']") ).map((elem, index) => { 
                        elem.parentElement.style.display = ""; 
                    })
                }
                copy[e.target.name] = e.target.text; //.push(e.target.text) ;
                this.setState({ filter_text: copy});

                Array.from( document.querySelectorAll("td[data_filter='"+e.target.name+"']") ).map((elem, index) => { 
                    
                    // if target is (empty), test if values have elements
                    if(e.target.text === "(empty)" && elem.innerText.length !== 0 ){
                        elem.parentElement.style.display = "none"; 
                    } 
                    else if( e.target.text !== "(empty)" && elem.innerText !== e.target.text  ){
                        elem.parentElement.style.display = "none"; 
                    }
                })
            }

        }
    }
    
    /* MODAL */
    handleClose(e){ 
        console.log(e, e.target);
        if(e.target.value === "new_check"){
            this.requestNewCompliance();
        }
        this.setState({showModal:false}) ;
    }
    handleShow(){ 
        this.setState({showModal:true}); 
    }
    /* -- */

    handleUserInputSearchColumn(e){
        console.log(e.target.value,e.target.value.length);
        let target = e.target.name.split("filter_")[1]
        let elements_th = document.querySelectorAll("a[name='"+target+"']");

        if(e.target.value.length === 0){
            Array.from( elements_th ).map( elem => { 
                elem.style.display = "";  
            } ); 
        }else{
            // console.log(elements_th);
            // reseting filter
            Array.from( elements_th ).map( elem => { elem.style.display = "";  } ); 
            
            Array.from( elements_th ).map( elem => { 
                if(elem.innerText.toLocaleLowerCase().indexOf(e.target.value) === -1){
                    elem.style.display = 'none';
                } 
            } ); 
            
        }
        
    }

    render(){
        const { showModal, filter_text, accounts, loading, dates_available} = this.state;
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
                JSON.parse(elem['DataCompliance']).map(elem => {
                    roles.push(elem['name']);
                    
                    if(elem['policy'].length === 0) policy.push("(empty)");
                    else policy.push(elem['policy'].toString());
                    
                    compliance.push(elem['compliance']);

                    if(elem['status'].length === 0) status.push("(empty)");
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
            <section className="forms">
                
                <Button className="space_y" value="clear" onClick={this.handleFilterSelection.bind(this)} >
                    Limpar filtros
                </Button>
                <Button className="space" onClick={this.handleShow.bind(this)} >
                    Novo check
                </Button>

                <Modal show={showModal} onHide={this.handleClose.bind(this)} animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Novo check</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Essa ação irá acessar as contas do Organizations e fazer os checks para gerar um novo relatório de compliance, poderá demorar alguns minutos. Deseja continuar?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="success" value="new_check" onClick={this.handleClose.bind(this)}>
                            Sim
                        </Button>
                        <Button variant="danger" onClick={this.handleClose.bind(this)}>
                            Não
                        </Button>
                    </Modal.Footer>
                </Modal>                

                
                <Form className="form_select" >
                    <Form.Group controlId="exampleForm.ControlSelect1">
                        <Form.Label>Data do compliance</Form.Label>
                        <Form.Control as="select" onChange={this.getCompliance.bind(this)} >
                            {accounts && accounts.slice(0,1).map((elem,index) =>{
                                return <option className="filter_selected" key='selected'>{elem['DateAction']}</option>;
                            })}
                            {dates_available && dates_available.map((elem,index) =>{
                                return <option key={elem} value={elem} >{elem}</option>;
                            })}
                        </Form.Control>
                    </Form.Group>
                </Form>
                

                <span className="total_results">Total de resultados: {total_rows}</span>

                <Table responsive striped bordered  size="sm">
                    <thead>
                        <tr>
                            <th className="width9em">
                                <div>
                                AccountId
                                    <Dropdown className="right_side">
                                        {/* <Dropdown.Toggle size="sm" variant="ligth" id="dropdown-basic">{filter_text === "" ? "" : ""}</Dropdown.Toggle> */}
                                        <Dropdown.Toggle size="sm" variant="ligth" id="dropdown-basic"></Dropdown.Toggle>
                                        
                                        <Dropdown.Menu className="scroll_bar">
                                            <input type="text" placeholder="Search" name="filter_account_id" 
                                            defaultValue="" 
                                            className="form-control"
                                            onChange={this.handleUserInputSearchColumn.bind(this)} 
                                            />
                                            
                                            {accounts && accounts.map((elem,index) =>{
                                                if(filter_text.account_id.length !== 0 && elem['Account'].indexOf(filter_text.account_id) === 0){
                                                    return <Dropdown.Item key={index} className="filter_selected" name="account_id" value={elem['Account']}>{elem['Account']}</Dropdown.Item>
                                                }
                                                return (
                                            <Dropdown.Item key={index} onClick={this.handleFilterSelection.bind(this)} name="account_id" value={elem['Account']}>{elem['Account']}</Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </th>
                            <th className="width8em">
                                <div>
                                Name Account
                                    <Dropdown className="right_side">
                                        {/* <Dropdown.Toggle size="sm" variant="light" id="dropdown-basic">{filter_text === "" ? "" : ""}</Dropdown.Toggle> */}
                                        <Dropdown.Toggle size="sm" variant="light" id="dropdown-basic"></Dropdown.Toggle>

                                        <Dropdown.Menu className="scroll_bar">
                                            <input type="text" placeholder="Search" name="filter_account_name" 
                                            defaultValue="" 
                                            className="form-control"
                                            onChange={this.handleUserInputSearchColumn.bind(this)} 
                                            />
                                            {/* <Dropdown.Item key="0" name="account_name" value="todos">Todos</Dropdown.Item> */}
                                            {accounts && accounts.map((elem,index) =>{
                                                if(filter_text.account_name.length !== 0 && elem['Name'].indexOf(filter_text.account_name) === 0){
                                                    return <Dropdown.Item key={index} className="filter_selected" name="account_name" value={elem['Name']}>{elem['Name']}</Dropdown.Item>
                                                }
                                                return (
                                            <Dropdown.Item key={index} onClick={this.handleFilterSelection.bind(this)} name="account_name" value={elem['Name']}>{elem['Name']}</Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </th>
                            <th className="width8em">
                                <div>
                                Role name
                                    <Dropdown className="right_side">
                                        {/* <Dropdown.Toggle size="sm" variant="light" id="dropdown-basic">{filter_text === "" ? "" : ""}</Dropdown.Toggle> */}
                                        <Dropdown.Toggle size="sm" variant="light" id="dropdown-basic"></Dropdown.Toggle>

                                        <Dropdown.Menu className="scroll_bar">
                                            {/* <Dropdown.Item key="0" name="role_name" value="todos">Todos</Dropdown.Item> */}
                                        {roles.map((elem,index) =>{
                                            if(filter_text.role_name.length !== 0 && elem.indexOf(filter_text.role_name) === 0){
                                                return <Dropdown.Item key={index} className="filter_selected" name="role_name" value={elem}>{elem}</Dropdown.Item>
                                            }
                                                return (
                                            <Dropdown.Item key={index} onClick={this.handleFilterSelection.bind(this)} name="role_name" value={elem}>{elem}</Dropdown.Item>
                                                );
                                        })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </th>
                            <th className="width8em">
                                <div>
                                Policy
                                    <Dropdown className="right_side">
                                        {/* <Dropdown.Toggle size="sm" variant="light" id="dropdown-basic">{filter_text === "" ? "" : ""}</Dropdown.Toggle> */}
                                        <Dropdown.Toggle size="sm" variant="light" id="dropdown-basic"></Dropdown.Toggle>

                                        <Dropdown.Menu className="scroll_bar">
                                            {/* <Dropdown.Item key="0" name="role_policy" value="todos">Todos</Dropdown.Item> */}
                                            {policy.map((elem,index) =>{
                                                if(filter_text.role_policy.length !== 0 && elem.indexOf(filter_text.role_policy) === 0){
                                                    return <Dropdown.Item key={index} className="filter_selected" name="role_policy" value={elem}>{elem}</Dropdown.Item>
                                                }
                                                return (
                                            <Dropdown.Item key={index} onClick={this.handleFilterSelection.bind(this)} name="role_policy" value={elem}>{elem}</Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </th>
                            <th className="width9em">
                                <div>
                                Compliance
                                    <Dropdown className="right_side">
                                        {/* <Dropdown.Toggle size="sm" variant="light" id="dropdown-basic">{filter_text === "" ? "" : ""}</Dropdown.Toggle> */}
                                        <Dropdown.Toggle size="sm" variant="light" id="dropdown-basic"></Dropdown.Toggle>

                                        <Dropdown.Menu className="scroll_bar">
                                            {/* <Dropdown.Item key="0" name="compliance" value="todos">Todos</Dropdown.Item> */}
                                            {compliance.map((elem,index) =>{
                                                if(filter_text.compliance.length !== 0 && elem.indexOf(filter_text.compliance) === 0){
                                                    return <Dropdown.Item key={index} className="filter_selected" name="compliance" value={elem}>{elem.toString()}</Dropdown.Item>
                                                }
                                                return (
                                            <Dropdown.Item key={index} onClick={this.handleFilterSelection.bind(this)} name="compliance" value={elem}>{elem.toString()}</Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </th>
                            <th className="width12em">
                                <div>
                                Status
                                    <Dropdown className="right_side">
                                        {/* <Dropdown.Toggle size="sm" variant="light" id="dropdown-basic">{filter_text === "" ? "" : ""}</Dropdown.Toggle> */}
                                        <Dropdown.Toggle size="sm" variant="light" id="dropdown-basic"></Dropdown.Toggle>

                                        <Dropdown.Menu className="scroll_bar">
                                            {/* <Dropdown.Item key="0" name="status" value="todos">Todos</Dropdown.Item> */}
                                            {status.map((elem,index) =>{
                                                if(filter_text.status.length !== 0 && elem === filter_text.status){
                                                    return <Dropdown.Item key={index} className="filter_selected" name="status" value={elem}>{elem}</Dropdown.Item>
                                                }
                                                return (
                                            <Dropdown.Item key={index} onClick={this.handleFilterSelection.bind(this)} name="status" value={elem}>{elem}</Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </th>
                            <th className="width9em">
                                <div>
                                Policies adicionais
                                    <Dropdown className="right_side" drop='left'>
                                        {/* <Dropdown.Toggle size="sm" variant="light" id="dropdown-basic">{filter_text === "" ? "" : ""}</Dropdown.Toggle> */}
                                        <Dropdown.Toggle size="sm" variant="light" id="dropdown-basic"></Dropdown.Toggle>

                                        <Dropdown.Menu className="scroll_bar">
                                            <input type="text" placeholder="Search" name="filter_policies_adicionais" 
                                            defaultValue="" 
                                            className="form-control"
                                            onChange={this.handleUserInputSearchColumn.bind(this)} 
                                            />                                            
                                            {/* <Dropdown.Item key="0" name="policies_adicionais" value="todos">Todos</Dropdown.Item> */}
                                            {policies_adicionais.map((elem,index) =>{
                                                if(filter_text.policies_adicionais.length !== 0 && elem === filter_text.policies_adicionais){
                                                    return <Dropdown.Item key={index} className="filter_selected" name="policies_adicionais" value={elem}>{elem}</Dropdown.Item>
                                                }
                                                return (
                                            <Dropdown.Item key={index} onClick={this.handleFilterSelection.bind(this)} name="policies_adicionais" value={elem}>{elem}</Dropdown.Item>
                                                );
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts && accounts.map((elem,index) =>{

                            return (

                                JSON.parse(elem['DataCompliance']).map((elem2,index) => {
                                    return(
                                        <tr key={index}>
                                            <td className="width8em" data_filter="account_id">{elem['Account']}</td>
                                            <td className="width8em" data_filter="account_name">{elem['Name']}</td>
                                            <td className="width8em" data_filter="role_name">{elem2['name']}</td>
                                            <td className="width8em" data_filter="role_policy">{elem2['policy']}</td>
                                            <td className="width8em" data_filter="compliance">{elem2['compliance'].toString()}</td>
                                            <td className="width8em" data_filter="status">{elem2['status']}</td>
                                            <td className="width8em" data_filter="policies_adicionais">{elem2.hasOwnProperty("policies_adicionais") ? elem2['policies_adicionais'].toString() : ""}</td>
                                        </tr>
                                    );
                                })
                            );
                        })}
                    </tbody>
                </Table>
                {img_loading}



            </section>
        );
    }

}
