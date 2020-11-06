import React from "react";
// import { Button, FormGroup, Form, FormControl, FormLabel, Table } from "react-bootstrap";
// import { Table } from "react-bootstrap";
import Add from '@material-ui/icons/Add';
// import CheckIcon from '@material-ui/icons/Check';
// import SaveIcon from '@material-ui/icons/Save';

import {
    TextField, Grid, Select, InputLabel,  MenuItem, FormControl,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, CircularProgress, Box, Typography
} from "@material-ui/core";


import clsx from 'clsx';


// import image from "../../assets/img/landing-bg.jpg";

// import SnackbarNotification from "../../../components/SnackbarNotification";

import useStyles from "./styles";


const CreateAccount = (
    {
        typeRoles, 
        onSubmit, handleSelectAccountType, handleForm,
        validateForm,
        //  load_table ,
    }) => {
    const classes = useStyles();

    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [loadTable, setLoadTable] = React.useState(false);
    const [createdAccounts, setCreatedAccounts] = React.useState([]);
    const timer = React.useRef();

    const [openAlert, setOpenAlert] = React.useState(false);
    const [typeMessage, setTypeMessage] = React.useState("");
    const [messageAlert, setMessageAlert] = React.useState("");
    
    const handleOpenAlert = elem => setOpenAlert(elem)
  
    const buttonClassname = clsx({
      [classes.buttonSuccess]: success,
    });
  
    React.useEffect(() => {
      return () => {
        clearTimeout(timer.current);
      };
    }, []);

    const handleButtonClick = async (event) => {
        if (!loading) {
            setLoading(true);
            setSuccess(false);
            
            let resp = await onSubmit(event);
            resp = JSON.parse(resp);
            // console.log(resp);
            if(!resp['error']){
                setCreatedAccounts(resp['accounts'])
                setLoading(false);

                setOpenAlert(true);
                setTypeMessage("success");
                setMessageAlert("Criação da conta com sucesso");
                
                setLoadTable(true);
            }else{
                setLoading(false);

                setOpenAlert(true);
                setTypeMessage("error");
                if(resp.hasOwnProperty("message")){
                    setMessageAlert(resp['message']);
                }else{
                    setMessageAlert("Ocorreu um erro ao criar a conta. Contate o suporte");
                }
                
            }

            // timer.current = setTimeout(() => {
            //     setLoading(false);

            //     setOpenAlert(true);
            //     setTypeMessage("success");
            //     setMessageAlert("Criação da conta com sucesso");

            // }, 2000);
        }
    };

    // document.getElementById("titleHeader").value = "123";

    return (
        <>
            <Box boxShadow={3}>
                <div className={classes.paper} >
                    <Grid container direction="column" alignItems="center" justify="center">
                        <FormControl className={classes.formStyle} noValidate autoComplete="off">

                            <TextField id="standard-basic" type="text" label="Nome da conta" style={{ marginTop: 12 }} placeholder="Nome da conta" 
                            // helperText="Full width!" 
                            fullWidth margin="normal" name="name"
                            onChange={e => handleForm(e)}
                            />

                            <TextField id="standard-basic" type="text" label="Email" style={{ margin: 0 }} placeholder="Email" 
                            // helperText="Full width!" 
                            fullWidth margin="normal" name="email"
                            onChange={e => handleForm(e)}
                            />

                            <FormControl>
                                <InputLabel id="controlled-open-select-label-tipo-da-conta">Tipo da conta</InputLabel>
                                <Select labelId="controlled-open-select-label-tipo-da-conta" id="demo-controlled-open-select"
                                // open={open}
                                // onClose={handleClose}
                                // onOpen={handleOpen}
                                // value={age}
                                onChange={e => handleSelectAccountType(e)}
                                >   
                                    {/* <MenuItem key="Cloud" value="Cloud">Cloud</MenuItem> */}
                                    {typeRoles && typeRoles.map((elem, index) => {
                                        console.log(typeRoles)
                                        return <MenuItem key={`${elem+'-'+index}`} value={elem}>{elem}</MenuItem>
                                    })}
                                </Select>
                            </FormControl>

                            <Button type="submit" variant="contained" color="primary" 
                            style={{ marginTop: 30 , width:"12em", marginLeft: "auto", marginRight: "auto" }} 
                            startIcon={<Add/>}
                            className={buttonClassname}
                            disabled={!validateForm || loading}
                            // disabled={loading}
                            onClick={handleButtonClick}
                            >
                            Criar conta
                            {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                            </Button>


                        </FormControl>
                    </Grid>
                </div>
            </Box>
            {loadTable ? (
                <Box boxShadow={3}>
                    <TableContainer style={{marginTop:"2em"}}>
                        <Table className={classes.table} aria-label="caption table">
                            <TableHead>
                            <TableRow>
                                <TableCell>Nome da conta</TableCell>
                                <TableCell align="center">Email da conta</TableCell>
                                <TableCell align="center">Account ID</TableCell>
                                <TableCell align="center">Tipo da conta</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {createdAccounts.map(account => (
                                <TableRow key={`${account['name']+'-'+account['account_id']}`}>
                                    <TableCell>{account['name']}</TableCell>
                                    <TableCell align="center">{account['email']}</TableCell>
                                    <TableCell align="center">{account['account_id']}</TableCell>
                                    <TableCell align="center">{account['account_type']}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                ) 
                : null
            }

        {/* <AlertMessage open={openAlert} typeMessage={typeMessage} message={messageAlert} openAlertCallback={handleOpenAlert}/> */}
        {/* {this.state.requestError && <SnackbarNotification variant="error" message="Error!"/>} */}
        
    </>
    
    )
}

export default CreateAccount;