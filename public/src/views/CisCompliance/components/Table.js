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
import { DepartureBoardTwoTone } from "@material-ui/icons";

import AlertMessage from "../../../components/AlertMessage";


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
    const accounts = props.accounts;
    const dates_available = props.dates_available;

    const classes = useStyles();
    const [openRefresh, setOpenRefresh] = React.useState(false);
    const [openAddNewCheck, setOpenAddNewCheck] = React.useState(false);
    const [openRenderModalTableOffender, setRenderModalTableOffender] = React.useState(false);
    const [contentRenderModalTableOffender, setContentRenderModalTableOffender] = React.useState("");
    const [disabledButtonRequestCompliance, setDisabledButtonRequestCompliance] = React.useState(true);

    // handle values of selct
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
    }
    
    const handleClickOpenAdd = () => setOpenAddNewCheck(true);
    
    const handleClickRenderModalTableOffender = (content) => {
        setContentRenderModalTableOffender(content);
        setRenderModalTableOffender(true);
    }

    const handleCloseRenderModalTableOffender = () => {
        setRenderModalTableOffender(false);
        // setContentRenderModalTableOffender("");
    } 
    
    const handleCloseAddNewCheck = () => {
        setDisabledButtonRequestCompliance(true);
        setOpenAddNewCheck(false);
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

    
    let rows = [];
    if(accounts && accounts.length){
        // para cada conta
        accounts.map( account => {
            // obtemos o conteudo do compliance
            let data_content = JSON.parse(account['DataCompliance']);
            
            let i_keys_length = Object.keys(data_content).length;
            for(let i=0; i<i_keys_length; i++){
                let j_keys_length = Object.keys(data_content[i]).length;

                for(let j=0; j<j_keys_length ; j++){
                    let data = data_content[i][j];
                    if(data === undefined) continue;

                    rows.push(
                        {
                            "account_id":account['Account'],
                            "account_name":account['Name'],
                            "title":data['ControlId'] +" "+data['Description'],
                            "compliance":data['Result'],
                            "offenders":data['Offenders'] === undefined ? 
                                            "" : data['Offenders'].toString().slice(0,1500),
                            "failReason":data['failReason']
                        }
                    );
                    // handleDynamicVarsTab[account['Account']] = false;
                    // console.log("handleDynamicVarsTab:",handleDynamicVarsTab);
                }
            }
        });
        // console.log(handleDynamicVarsTab);
        // setRenderModalTableOffender(handleDynamicVarsTab);
    }

    const renderModalTableOffender = (rowData) => {
        // console.log("openRenderModalTableOffender: ",openRenderModalTableOffender);
        if(rowData.offenders.length){
            if(rowData.offenders.split(",").length > 1){
                return (
                    <>
                        <Button variant="contained"
                        onClick={() => handleClickRenderModalTableOffender(rowData.offenders)} 
                        >
                        Expandir
                        </Button>
                        
                    </>
                );
            }
            return rowData.offenders;

        }
        return "";
    }
    

    return (
        <main className={classes.content}>
            <Typography className={classes.titleHeader} variant="h4" noWrap >
                CIS Compliance
            </Typography>
            <Box boxShadow={3}>

                <MaterialTable
                    title="Resultados"
                    // isLoading={rows.length ? false: true}
                    columns={[
                        { field: 'account_id', title: 'Account\u00a0ID', headerStyle: { fontWeight: 'bolder', } },
                        { field: 'account_name', title: 'Nome', headerStyle: { fontWeight: 'bolder', } },
                        { field: 'title', title: 'Title', headerStyle: { fontWeight: 'bolder', } },
                        { field: 'compliance', title: 'Compliance', align: 'justify', format: value => value.toLocaleString(), headerStyle: { fontWeight: 'bolder', } },
                        {
                            field: 'offenders', title: 'Offenders', align: 'justify', format: value => value.toLocaleString(), headerStyle: { fontWeight: 'bolder', },
                            cellStyle: { maxWidth: "17em", wordWrap: "break-word" },
                            render: rowData => renderModalTableOffender(rowData),
                        },
                        { field: 'failReason', title: 'Fail\u00a0Reason', align: 'justify', format: value => value.toFixed(2), headerStyle: { fontWeight: 'bolder', } }
                    ]}
                    data={rows}
                    isLoading={isLoading}
                    options={{
                        exportButton: true,
                        pageSize: 25,
                        pageSizeOptions: [25, 50, 100, 200],
                        // filtering: true,
                        exportAllData: true,
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
                                setAccountSelect(e.target.value);
                                props.onChangeDataCheck(e);
                            }}
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

                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    {accountSelect!=="" ?
                        (
                            <Button 
                            onClick={async () => {
                                setLoading(true);
                                handleCloseRefresh();
                                await props.getCompliance()
                                .then( _ => {
                                    setLoading(false);
                                })
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
                        Essa ação irá acessar as contas do Organizations e fazer os checks do CIS para gerar um novo relatório de compliance. 
                        Poderá demorar alguns minutos, deseja continuar?
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                        onClick={requestNewCompliance} 
                        variant="contained" color="primary">
                            Sim
                        </Button>
                    
                    <Button onClick={handleCloseAddNewCheck} variant="contained" color="secondary" autoFocus>
                        Não
                    </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={openRenderModalTableOffender}
                    onClose={() => handleCloseRenderModalTableOffender()}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title2">Offender</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {contentRenderModalTableOffender}

                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => handleCloseRenderModalTableOffender()} variant="contained" color="primary" autoFocus>
                            Fechar
                        </Button>
                    </DialogActions>
                </Dialog>
             

            </Box>
            <AlertMessage open={openAlert} typeMessage={typeMessage} message={messageAlert} openAlertCallback={handleOpenAlert}/>
        </main>
        
    );
}


export default AccountsTable;