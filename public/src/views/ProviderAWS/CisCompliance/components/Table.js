import React from "react";
import { Box, Button, InputLabel, Select, FormControl, MenuItem, Typography } from "@material-ui/core";
import MaterialTable from 'material-table';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { getAuthorization } from "../../../../utils";
import AlertMessage from "../../../../components/AlertMessage";

import useStyles from "./styles";

const AccountsTable = (props) => {
    const accounts = props.accounts;
    const dates_available = props.dates_available;

    const classes = useStyles();
    const [openRefresh, setOpenRefresh] = React.useState(false);
    const [openAddNewCheck, setOpenAddNewCheck] = React.useState(false);
    const [openRenderModalTableOffender, setRenderModalTableOffender] = React.useState(false);
    const [contentRenderModalTableOffender, setContentRenderModalTableOffender] = React.useState("");
    // const [disabledButtonRequestCompliance, setDisabledButtonRequestCompliance] = React.useState(true);

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
        // setDisabledButtonRequestCompliance(true);
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

    const getStatus = async () => {
        fetch(process.env.REACT_APP_ENDPOINT+"/aws/policiescompliance/cis/status", {
            method:"GET", mode:"cors", headers: {"Authorization": getAuthorization()},
        })
        .then(resp => resp.json())
        .then(response => {
            // this.setState( {dates_available: data['dates_available']} );
            alert(JSON.stringify(response.data));
        })
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
                            icon: 'report',
                            tooltip: 'STATUS',
                            isFreeAction: true,
                            onClick: () => getStatus(),
                        },
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