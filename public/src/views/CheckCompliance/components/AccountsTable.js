import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import {Fab, Box, Button, InputLabel, Select, FormControl, MenuItem, Typography } from "@material-ui/core";
import MaterialTable from 'material-table';
// import { Table, Dropdown, Button, Form, Modal } from "react-bootstrap";

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


const columns = [
    { field: 'account_id', title: 'Account\u00a0ID', headerStyle: {fontWeight: 'bolder',} },
    { field: 'account_name', title: 'Name\u00a0Account', align: 'justify', format: value => value.toLocaleString(), headerStyle: {fontWeight: 'bolder',} },
    { field: 'role_name', title: 'Role\u00a0Name',  align: 'justify', format: value => value.toLocaleString(), headerStyle: {fontWeight: 'bolder',} },
    { field: 'role_policy', title: 'Policy', align: 'justify', format: value => value.toFixed(2), headerStyle: {fontWeight: 'bolder',} },
    { field: 'compliance', title: 'Compliance',  align: 'justify', format: value => value.toLocaleString(), headerStyle: {fontWeight: 'bolder',} },
    { field: 'status', title: 'Status',  align: 'justify', format: value => value.toLocaleString(), headerStyle: {fontWeight: 'bolder',} },
    { field: 'policies_adicionais', title: 'Policies\u00a0Adicionais',  align: 'justify', format: value => value.toLocaleString(), headerStyle: {fontWeight: 'bolder',} },
];



const useStyles = makeStyles(theme => ({
    formStyle: {
        padding: "2vw",
        width: "40vw",
    },
    content: {
        overflow: "none",
        // marginTop: 64,
        flexGrow: 1,
        marginLeft: 240,
        paddingLeft: 20,
        paddingRight: 20,
        // padding: theme.spacing(3),
        "@media (max-width: 600px)":{
            marginLeft: 0,
            paddingLeft: 20,
      }
    },
    titleHeader: {
        // marginTop: 0,
        // flexGrow: 1,
        // marginLeft: 240,
        // paddingLeft: 20,
        // padding: theme.spacing(3),
        paddingBottom: theme.spacing(4),
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
        // height: "38em",
        // height: "1%",
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
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(50);
    const [openRefresh, setOpenRefresh] = React.useState(false);
    const [openAddNewCheck, setOpenAddNewCheck] = React.useState(false);
    const [disabledButtonRequestCompliance, setDisabledButtonRequestCompliance] = React.useState(true);

    const handleClickOpenRefresh = () => setOpenRefresh(true);

    const handleCloseRefresh = () => setOpenRefresh(false);

    const handleClickOpenAdd = () => setOpenAddNewCheck(true);

    const handleCloseAddNewCheck = () => {
        setDisabledButtonRequestCompliance(true);
        setOpenAddNewCheck(false);
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = event => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const onChangeTypeRole = e => {
        setDisabledButtonRequestCompliance(false);
        props.onChangeTypeRole(e);
    }

    const requestNewCompliance = () => {
        setOpenAddNewCheck(false);
        props.requestNewCompliance();
    }

    // const requestNewCompliance = () => {
    //     props.requestNewCompliance;
    //     if (!loading) {
    //         setLoading(true);
    //         setSuccess(false);
            
    //         let resp = await onSubmit(event);
    //         resp = JSON.parse(resp);
    //         console.log(resp);
    //         if(!resp['error']){
    //             setLoading(false);

    //             setOpenAlert(true);
    //             setTypeMessage("success");
    //             setMessageAlert("CriaÃ§Ã£o da conta com sucesso");
                
    //             setLoadTable(true);
    //         }else{
    //             setLoading(false);

    //             setOpenAlert(true);
    //             setTypeMessage("error");
    //             setMessageAlert("Ocorreu um erro ao criar a conta. Contate o suporte");
                
    //         }
    // }


    const type_roles = props.type_roles;
    const accounts = props.accounts;
    const dates_available = props.dates_available;


    let rows = [];
    if(accounts.length){
        accounts.map(elem => {
            JSON.parse(elem['DataCompliance']).map(elem2 => {
                // id: 'Account', title: 'Account\u00a0ID'; id: 'Name', title: 'Name\u00a0Account'; id: 'name', title: 'Role\u00a0Name';
                // id: 'policy', title: 'Policy'; id: 'compliance', title: 'Compliance'; id: 'status', title: 'Status';
                // id: 'policies_adicionais', title: 'Policie
                
                rows.push( {
                    "account_id":elem['Account'], "account_name":elem['Name'], "role_name":elem2['name'], 
                    "role_policy":elem2['policy'], "compliance":elem2['compliance'].toString(), "status":elem2['status'],
                    "policies_adicionais":elem2.hasOwnProperty("policies_adicionais") ? elem2['policies_adicionais'].toString() : "",
                } );
            });
        });
    }
    
    console.log("Accounts: ",accounts);

    return (
        <main className={classes.content}>
            <Typography className={classes.titleHeader} variant="h4" noWrap >
                Compliance das contas
            </Typography>
            <Box boxShadow={3}>

                {/* <div style={{marginBot:"1em"}}>
                   <Button className="space" variant="contained" color="primary"
                    //onClick={this.handleShow.bind(this)} 
                    >
                        Novo check
                    </Button>
                </div> */}

                <MaterialTable
                    title="Resultados"
                    // isLoading={rows.length ? false: true}
                    columns={columns}
                    data={rows}
                    options={{
                        exportButton: true,
                        pageSize: 25,
                        pageSizeOptions: [25,50,100,200],
                        exportAllData: true,
                        // filtering: true,
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
                    onClose={handleCloseRefresh}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Selecionar o dia do relatório por conta"}</DialogTitle>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <FormControl style={{width:"10em", marginRight:"1em"}}>
                            <InputLabel id="controlled-open-select-label-tipo-da-conta">Data da ação</InputLabel>
                            <Select required labelId="controlled-open-select-label-tipo-da-conta" id="demo-controlled-open-select"
                            onChange={e => props.onChangeDataCheck(e)}
                            >   
                                {accounts && accounts.slice(0,1).map((elem,index) =>{
                                    return <MenuItem selected className="filter_selected" key='selected'>{elem['DateAction']}</MenuItem>;
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
                            onChange={e => props.onChangeTypeRole(e)}
                            >   
                                {type_roles && type_roles.map((elem,index) =>{
                                    return <MenuItem key={elem} value={elem}>{elem}</MenuItem>;
                                })}
                            </Select>
                        </FormControl>

                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    <Button 
                    onClick={() => {
                        props.getCompliance();
                        handleCloseRefresh();
                    }} 
                    variant="contained" color="primary">
                        Obter
                    </Button>
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
                            <Select required labelId="controlled-open-select-label-tipo-da-conta" id="demo-controlled-open-select"
                            onChange={e => onChangeTypeRole(e)}
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


             

            </Box>
        </main>
        
    );
}


export default AccountsTable;