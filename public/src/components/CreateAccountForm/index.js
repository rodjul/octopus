import React from "react";
import { makeStyles } from '@material-ui/core/styles';
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
import { green } from '@material-ui/core/colors';


// import image from "../../assets/img/landing-bg.jpg";

import AlertMessage from "../AlertMessage";



const useStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(2),
        color: theme.palette.text.secondary,
        backgroundColor: "white",
        // borderColor: "black",
        // borderWidth: 1,
        // borderStyle: "solid",
    },
    table: {
        minWidth: 650,
        backgroundColor: "white",
        // marginTop: "2em",
        "& th":{
            fontWeight: "bold",
        },
    },
    formStyle: {
        padding: "2vw",
        width: "40vw",
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
    content: {
        // marginTop: 20,
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
    background:{
        backgroundColor: "white",
        padding: 1,
    },
    wrapper: {
        margin: theme.spacing(1),
        position: 'relative',
      },
    buttonSuccess: {
        backgroundColor: green[500],
            '&:hover': {
                backgroundColor: green[700],
        },
    },
    fabProgress: {
        color: green[500],
        position: 'absolute',
        top: -6,
        left: -6,
        zIndex: 1,
    },
    buttonProgress: {
        color: green[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}));


const CreateAccount = (
    {
        type_roles, 
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
        <main className={classes.content}>
            <Typography className={classes.titleHeader} variant="h4" noWrap >
                Criar conta
            </Typography>
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
                                    <MenuItem key="Cloud" value="Cloud">Cloud</MenuItem>
                                    {type_roles && type_roles.map((elem, index) => {
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

        <AlertMessage open={openAlert} typeMessage={typeMessage} message={messageAlert} openAlertCallback={handleOpenAlert}/>
        
    </main>
    
    )
}

export default CreateAccount;