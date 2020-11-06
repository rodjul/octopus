import React from "react";
import PropTypes from "prop-types";
import { Box, Button, InputLabel, Select, FormControl, MenuItem, Typography, Grid, Paper } from "@material-ui/core";
import MaterialTable from 'material-table';

import JSONPretty from 'react-json-pretty';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import AlertMessage from "../../../../components/AlertMessage";

import useStyles from "./styles";



const AccountsTable = (props) => {
    const classes = useStyles();
    const [openRefresh, setOpenRefresh] = React.useState(false);
    const [openAddNewCheck, setOpenAddNewCheck] = React.useState(false);
    const [disabledButtonRequestCompliance, setDisabledButtonRequestCompliance] = React.useState(true);

    // modal table details
    const [openRenderModalTableDetails, setRenderModalTableDetails] = React.useState(false);
    const [contentRenderModalTableDetails, setContentRenderModalTableDetails] = React.useState("");
    const handleClickRenderModalTableDetails = (content) => {
        setContentRenderModalTableDetails(content);
        setRenderModalTableDetails(true);
    }
    const handleCloseRenderModalTableDetails = () => {
        setRenderModalTableDetails(false);
        // setContentRenderModalTableDetails("");
    }
    const renderModalTableOffender = (rowData) => {
        // console.log("openRenderModalTableDetails: ",openRenderModalTableDetails);
        if(rowData.info){
            return (
                <>
                    <Button variant="contained"
                    onClick={() => handleClickRenderModalTableDetails(rowData.info)} 
                    >
                    Expandir
                    </Button>
                    
                </>
            );
    
        }
        return "";
    }
    
    // select handle values
    const [dataSelect, setDataSelect] = React.useState("");
    const [accountSelect, setAccountSelect] = React.useState("");

    // AlertMessage
    const handleOpenAlert = elem => setOpenAlert(elem);
    const [isLoading, setLoading] = React.useState(false);
    const [openAlert, setOpenAlert] = React.useState(false);
    const [typeMessage, setTypeMessage] = React.useState("");
    const [messageAlert, setMessageAlert] = React.useState("");

    const handleClickOpenRefresh = () => setOpenRefresh(true);

    const handleCloseRefresh = () => {
        setOpenRefresh(false);
        setAccountSelect("");
        setDataSelect("");
    }

    const handleClickOpenAdd = () => setOpenAddNewCheck(true);

    const handleCloseAddNewCheck = () => {
        setDisabledButtonRequestCompliance(true);
        setOpenAddNewCheck(false);
    }

    const onChangeTypeRole = e => {
        setDisabledButtonRequestCompliance(false);
        props.onChangeTypeRole(e);
    }

    const requestNewCompliance = async () => {
        setOpenAddNewCheck(false);

        setLoading(true);
        
        await props.requestNewCompliance()
        .then( data => {
            if(!data['error']){
                setLoading(false);
    
                setOpenAlert(true);
                setTypeMessage("success");
                setMessageAlert(data.message);
                
            }else{
                setLoading(false);
    
                setOpenAlert(true);
                setTypeMessage("error");
                setMessageAlert(data.message);
                
            }
        });
    }


    const type_roles = props.type_roles;
    const accounts = props.accounts;
    const dates_available = props.dates_available;

    let rows = [];

    let filterAccountid = {};
    let filterAccountName = {};
    let filterRoleName = {};
    let filterRolePolicy = {};
    let filterStatus = {};
    let filterPoliciesAdicionais = {};

    if(accounts && accounts.length){
        accounts.map(elem => {
            JSON.parse(elem['DataCompliance']).map(elem2 => {
                // id: 'Account', title: 'Account\u00a0ID'; id: 'Name', title: 'Name\u00a0Account'; id: 'name', title: 'Role\u00a0Name';
                // id: 'policy', title: 'Policy'; id: 'compliance', title: 'Compliance'; id: 'status', title: 'Status';
                // id: 'policies_adicionais', title: 'Policie
                
                rows.push( {
                    "account_id":elem['Account'], "account_name":elem['Name'], "role_name":elem2['name'], 
                    "role_policy":elem2['policy'], "compliance":elem2['compliance'].toString(), "status":elem2['status'],
                    "policies_adicionais":elem2.hasOwnProperty("policies_adicionais") ? elem2['policies_adicionais'].toString() : "",
                    "info": elem2.hasOwnProperty("info") ? 
                        elem2['info']['policy_not_in_compliance'].toString() + "%SPLIT%" + elem2['info']['policy_master'].toString()
                        : "",
                } );
            });
        });

        rows.map( elem => {
            filterAccountid[elem['account_id']] = elem['account_id'];
            filterAccountName[elem['account_name']] = elem['account_name'];
            filterRoleName[elem['role_name']] = elem['role_name'];
            filterRolePolicy[elem['role_policy']] = elem['role_policy'];
            filterStatus[elem['status']] = elem['status'];
            filterPoliciesAdicionais[elem['policies_adicionais']] = elem['policies_adicionais'];
        })

        // sorting values in order asc
        let tmp = {};
        Object.keys(filterAccountid).sort().map(elem => tmp[elem] = elem); filterAccountid = tmp; tmp = {};
        Object.keys(filterAccountName).sort().map(elem => tmp[elem] = elem); filterAccountName = tmp; tmp = {};
        Object.keys(filterRoleName).sort().map(elem => tmp[elem] = elem); filterRoleName = tmp; tmp = {};
        Object.keys(filterRolePolicy).sort().map(elem => tmp[elem] = elem); filterRolePolicy = tmp; tmp = {};
        Object.keys(filterStatus).sort().map(elem => tmp[elem] = elem); filterStatus = tmp; tmp = {};
        Object.keys(filterPoliciesAdicionais).sort().map(elem => tmp[elem] = elem); filterPoliciesAdicionais = tmp; tmp = {};
        
    }
    
    // console.log("Accounts: ",accounts);

    return (
        <main className={classes.content}>
            <Typography className={classes.titleHeader} variant="h4" noWrap >
                IAM Compliance
            </Typography>
            <Box boxShadow={3}>

                <MaterialTable
                    title="Resultados"
                    // isLoading={rows.length ? false: true}
                    columns={[
                        { 
                            field: 'account_id', title: 'Account\u00a0ID', 
                            headerStyle: {fontWeight: 'bolder',},
                            lookup: filterAccountid
                        },
                        { 
                            field: 'account_name', title: 'Name\u00a0Account', align: 'justify', format: value => value.toLocaleString(), 
                            headerStyle: {fontWeight: 'bolder',},
                            lookup: filterAccountName
                        },
                        { 
                            field: 'role_name', title: 'Role\u00a0Name',  align: 'justify', format: value => value.toLocaleString(), 
                            headerStyle: {fontWeight: 'bolder',},
                            lookup: filterRoleName
                        },
                        { 
                            field: 'role_policy', title: 'Policy', align: 'justify', format: value => value.toFixed(2), 
                            headerStyle: {fontWeight: 'bolder',},
                            lookup: filterRolePolicy
                        },
                        { 
                            field: 'compliance', title: 'Compliance',  align: 'justify', format: value => value.toLocaleString(), 
                            headerStyle: {fontWeight: 'bolder',},
                            lookup: {true:"true", false:"false"}
                        },
                        { 
                            field: 'status', title: 'Status',  align: 'justify', format: value => value.toLocaleString(), 
                            headerStyle: {fontWeight: 'bolder',},
                            lookup: filterStatus
                        },
                        { 
                            field: 'policies_adicionais', title: 'Policies\u00a0Adicionais',  align: 'justify', format: value => value.toLocaleString(), 
                            headerStyle: {fontWeight: 'bolder',},
                            lookup: filterPoliciesAdicionais 
                        },
                        { 
                            field: 'info', title: 'Details',  align: 'justify', 
                            format: value => value.toLocaleString(), 
                            headerStyle: {fontWeight: 'bolder',}, 
                            render: rowData => renderModalTableOffender(rowData),
                        },
                    ]}
                    data={rows}
                    isLoading={isLoading}
                    options={{
                        exportButton: true,
                        pageSize: 25,
                        pageSizeOptions: [25,50,100,200],
                        exportAllData: true,
                        filtering: true,
                    }}
                    actions={[
                        {
                            icon: 'refresh',
                            tooltip: 'Obter dados',
                            isFreeAction: true,
                            onClick: () => handleClickOpenRefresh(),
                        },
                        {
                            icon: 'add',
                            tooltip: 'Gerar um novo relatório',
                            isFreeAction: true,
                            onClick: () => handleClickOpenAdd()
                        }
                      ]}
                />

                <Dialog
                    open={openRefresh}
                    onClose={() => handleCloseRefresh()}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Selecionar o dia do relatório por conta"}</DialogTitle>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <FormControl style={{width:"10em", marginRight:"1em"}}>
                            <InputLabel id="controlled-open-select-label-tipo-da-conta">Data da ação</InputLabel>
                            <Select required labelId="controlled-open-select-label-tipo-da-conta" id="demo-controlled-open-select"
                            onChange={e => {
                                setDataSelect(e.target.value);
                                props.onChangeDataCheck(e)
                            }}
                            >   
                                {accounts && accounts.slice(0,1).map((elem,index) =>{
                                    return <MenuItem selected className="filter_selected" key='selected'>{elem['DateAction'].split("-")[0]}</MenuItem>;
                                })}
                                {/* available values */}
                                {dates_available && dates_available.map((elem,index) =>{
                                    return <MenuItem key={elem} value={elem}>{elem}</MenuItem>;
                                })}
                            </Select>
                        </FormControl>

                        <FormControl style={{width:"10em"}}>
                            <InputLabel id="controlled-open-select-label-tipo-da-conta">Tipo da conta</InputLabel>
                            <Select required labelId="controlled-open-select-label-tipo-da-conta" id="demo-controlled-open-select"
                            onChange={e => {
                                setAccountSelect(e.target.value);
                                props.onChangeTypeRole(e);
                            }}
                            >   
                                {type_roles && type_roles.map((elem,index) =>{
                                    return <MenuItem key={elem} value={elem}>{elem}</MenuItem>;
                                })}
                            </Select>
                        </FormControl>

                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    {accountSelect!=="" && dataSelect!=="" ? 
                    (
                        <Button 
                        onClick={async () => {
                            // both values need to have values setted
                            if(accountSelect !== "" && dataSelect !== ""){
                                setLoading(true);
                                handleCloseRefresh();
                                await props.getCompliance()
                                .then( _ => {
                                    setLoading(false);
                                })
                            }
                        }} 
                        variant="contained" color="primary">
                            Obter
                        </Button>
                    )
                    :
                    (
                        <Button 
                        disabled
                        variant="contained" color="primary">
                            Obter
                        </Button>
                    )
                    
                    }
                    
                    <Button onClick={handleCloseRefresh} variant="contained" color="primary">
                        Fechar
                    </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={openAddNewCheck}
                    onClose={handleCloseAddNewCheck}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title2">{"Novo check"}</DialogTitle>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Essa ação irá acessar as contas do Organizations e fazer a partir das roles do tipo "
                        <FormControl style={{width:"10em"}}>
                            {/* <InputLabel id="controlled-open-select-label-tipo-da-conta">Tipo da conta</InputLabel> */}
                            <Select required={true} labelId="controlled-open-select-label-tipo-da-conta" id="demo-controlled-open-select"
                            onChange={e => {
                                setAccountSelect(e.target.value);
                                onChangeTypeRole(e);
                            }}
                            >   
                                {type_roles && type_roles.map((elem,index) =>{
                                    return <MenuItem key={elem} value={elem}>{elem}</MenuItem>;
                                })}
                            </Select>
                        </FormControl>
                        " e fazer os checks para gerar um novo relatório de compliance. Poderá demorar alguns minutos, deseja continuar?
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    {disabledButtonRequestCompliance ? (
                        <Button disabled
                        variant="contained" color="primary">
                            Sim
                        </Button>
                    ) : (
                        <Button
                        onClick={requestNewCompliance} 
                        variant="contained" color="primary">
                            Sim
                        </Button>
                    )
                
                    }
                    
                    <Button onClick={handleCloseAddNewCheck} variant="contained" color="secondary" autoFocus>
                        Não
                    </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={openRenderModalTableDetails}
                    onClose={() => handleCloseRenderModalTableDetails()}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    fullWidth={true}
                    maxWidth={"md"}
                    // maxWidth={false}
                >
                    <DialogTitle id="alert-dialog-title2">Details</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Paper className={classes.paper}>
                                    <h1 style={{fontSize: "18px"}}>Policy in runtime (not compliant)</h1>
                                    <JSONPretty id="json-pretty" data={contentRenderModalTableDetails.split("%SPLIT%")[0]}></JSONPretty>
                                </Paper>
                            </Grid>
                            {/* <hr /> */}
                            <Grid item xs={6}>
                                <Paper className={classes.paper}>
                                    <h1 style={{fontSize: "18px"}}>Template policy (compliant)</h1>
                                    <JSONPretty id="json-pretty" data={contentRenderModalTableDetails.split("%SPLIT%")[1]}></JSONPretty>
                                </Paper>
                            </Grid>
                        </Grid>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => handleCloseRenderModalTableDetails()} variant="contained" color="primary" autoFocus>
                            Fechar
                        </Button>
                    </DialogActions>
                </Dialog>
             
                <AlertMessage open={openAlert} typeMessage={typeMessage} message={messageAlert} openAlertCallback={handleOpenAlert}/>
            </Box>
        </main>
        
    );
}

AccountsTable.propTypes = {
    // onChangeTypeRole: PropTypes.func.isRequired
    onChange: PropTypes.func,
    required: PropTypes.bool,
    // data: (elem) => {
    //     if(elem.id === "type-roles"){
    //         console.log(elem);
    //     }
    // }
    // value: PropTypes.object.isRequired
};

export default AccountsTable;