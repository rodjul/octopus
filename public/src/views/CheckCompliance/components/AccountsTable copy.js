import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import {Fab, Box, Zoom, Tabs, Tab, Typography, CircularProgress} from "@material-ui/core";
// import { Table, Dropdown, Button, Form, Modal } from "react-bootstrap";

import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';


const useStyles = makeStyles(theme => ({
    // paper: {
    //     padding: theme.spacing(2),
    //     color: theme.palette.text.secondary,
    //     backgroundColor: "white",
    // },

    formStyle: {
        padding: "2vw",
        width: "40vw",
    },
    content: {
        overflow: "none",
        marginTop: 64,
        flexGrow: 1,
        marginLeft: 240,
        paddingLeft: 20,
        padding: theme.spacing(3),
        "@media (max-width: 600px)":{
            marginLeft: 0,
            paddingLeft: 20,
      }
    },
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        // height: 224,
        height: "38em",
        // height: "1%",
      },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
    },
    tabsMain: {
        // color: "#DCDCDC",
        // backgroundColor: "#17192b",
        fontWeight: "bolder",
    },
    tabContent: {
        width: "100%",
        overflowY: "scroll",
    },
    fabAdd: {
        position: 'absolute',
        bottom: theme.spacing(5),
        right: theme.spacing(5),
    },
    fabSave: {
        position: 'absolute',
        bottom: theme.spacing(5),
        right: theme.spacing(13),
    },
    fabProgress: {
        // color: green[500],
        position: 'absolute',
        top: -6,
        left: -6,
        zIndex: 1,
    }
}));

const AccountsTable = (props) => {
    const classes = useStyles();

    const type_role_selected = props.type_role_selected;
    const type_roles = props.type_roles;
    const accounts = props.accounts;
    const dates_available = props.dates_available;
    const total_rows = props.total_rows;
    const filter_text = props.filter_text;
    const roles = props.roles;
    const policy = props.policy;
    const compliance = props.compliance;
    const policies_adicionais = props.policies_adicionais;
    const status = props.status;
    const img_loading = "";
    const showModal = "";
    
    return (
        <main className={classes.content}>
            <Box boxShadow={3}>

                <h1>Compliance das contas</h1>

                <Button className="space_y" value="clear" 
                // onClick={this.handleFilterSelection.bind(this)} 
                >
                    Limpar filtros
                </Button>
                <Button className="space" 
                //onClick={this.handleShow.bind(this)} 
                >
                    Novo check
                </Button>
                <Button value="table_main" 
                // onClick={this.download_table_as_csv.bind(this)} 
                >
                    Exportar csv
                </Button>

                <Modal show={showModal} 
                // onHide={this.handleClose.bind(this)}
                animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Novo check</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Essa ação irá acessar as contas do Organizations utilizando o tipo de conta "{type_role_selected}" 
                    e fazer os checks para gerar um novo relatório de compliance. Poderá demorar alguns minutos, deseja continuar?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="success" value="new_check" 
                        // onClick={this.handleClose.bind(this)}
                        >
                            Sim
                        </Button>
                        <Button variant="danger" 
                        // onClick={this.handleClose.bind(this)}
                        >
                            Não
                        </Button>
                    </Modal.Footer>
                </Modal>                
                <Form className="form_select" >
                    <Form.Group controlId="exampleForm.ControlSelect1">
                        <Form.Label>Data do compliance</Form.Label>
                        <Form.Control as="select" 
                        // onChange={this.getCompliance.bind(this)} 
                        >
                            {/* <option className="filter_selected" key='selected'>Cloud210398</option> */}
                            {/* filter selecte */}
                            {accounts && accounts.slice(0,1).map((elem,index) =>{
                                return <option className="filter_selected" key='selected'>{elem['DateAction']}</option>;
                            })}
                            {/* available values */}
                            {dates_available && dates_available.map((elem,index) =>{
                                return <option key={elem} value={elem} >{elem}</option>;
                            })}
                        </Form.Control>
                    </Form.Group>
                </Form>

                <Form className="form_select" >
                    <Form.Group controlId="exampleForm.ControlSelect2">
                        <Form.Label>Tipo de conta</Form.Label>
                        <Form.Control as="select" 
                        // onChange={this.onChangeTypeRole.bind(this)} 
                        >
                            {type_roles && type_roles.map((elem,index) =>{
                                return <option key={elem} value={elem} >{elem}</option>;
                            })}
                        </Form.Control>
                    </Form.Group>
                </Form>
                
                

                <span className="total_results">Total de resultados: {total_rows}</span>

                <Table id="table_main" responsive striped bordered size="sm">
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
                                            // onChange={this.handleUserInputSearchColumn.bind(this)} 
                                            />
                                            
                                            {accounts && accounts.map((elem,index) =>{
                                                if(filter_text.account_id.length !== 0 && elem['Account'].indexOf(filter_text.account_id) === 0){
                                                    return <Dropdown.Item key={index} className="filter_selected" name="account_id" value={elem['Account']}>{elem['Account']}</Dropdown.Item>
                                                }
                                                return (
                                            <Dropdown.Item key={index} 
                                            // onClick={this.handleFilterSelection.bind(this)} 
                                            name="account_id" value={elem['Account']}>{elem['Account']}</Dropdown.Item>
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
                                            // onChange={this.handleUserInputSearchColumn.bind(this)} 
                                            />
                                            {/* <Dropdown.Item key="0" name="account_name" value="todos">Todos</Dropdown.Item> */}
                                            {accounts && accounts.map((elem,index) =>{
                                                if(filter_text.account_name.length !== 0 && elem['Name'].indexOf(filter_text.account_name) === 0){
                                                    return <Dropdown.Item key={index} className="filter_selected" name="account_name" value={elem['Name']}>{elem['Name']}</Dropdown.Item>
                                                }
                                                return (
                                            <Dropdown.Item key={index} 
                                            // onClick={this.handleFilterSelection.bind(this)} 
                                            name="account_name" value={elem['Name']}>{elem['Name']}</Dropdown.Item>
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
                                            <Dropdown.Item key={index} 
                                            // onClick={this.handleFilterSelection.bind(this)} 
                                            name="role_name" value={elem}>{elem}</Dropdown.Item>
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
                                            <Dropdown.Item key={index} 
                                            // onClick={this.handleFilterSelection.bind(this)} 
                                            name="role_policy" value={elem}>{elem}</Dropdown.Item>
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
                                            <Dropdown.Item key={index} 
                                            // onClick={this.handleFilterSelection.bind(this)} 
                                            name="compliance" value={elem}>{elem.toString()}</Dropdown.Item>
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
                                            <Dropdown.Item key={index} 
                                            // onClick={this.handleFilterSelection.bind(this)} 
                                            name="status" value={elem}>{elem}</Dropdown.Item>
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
                                            // onChange={this.handleUserInputSearchColumn.bind(this)} 
                                            />                                            
                                            {/* <Dropdown.Item key="0" name="policies_adicionais" value="todos">Todos</Dropdown.Item> */}
                                            {policies_adicionais.map((elem,index) =>{
                                                if(filter_text.policies_adicionais.length !== 0 && elem === filter_text.policies_adicionais){
                                                    return <Dropdown.Item key={index} className="filter_selected" name="policies_adicionais" value={elem}>{elem}</Dropdown.Item>
                                                }
                                                return (
                                            <Dropdown.Item key={index} 
                                            // onClick={this.handleFilterSelection.bind(this)}
                                             name="policies_adicionais" value={elem}>{elem}</Dropdown.Item>
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



            </Box>
        </main>
        
    );
}


export default AccountsTable;