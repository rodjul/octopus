import React from "react";
import { makeStyles, useTheme } from '@material-ui/core/styles';
// import { Button, FormGroup, Form, FormControl, FormLabel, Table } from "react-bootstrap";
// import { Table } from "react-bootstrap";
import Add from '@material-ui/icons/Add';

import {
    TextField, Grid, Select, InputLabel,  MenuItem, FormControl,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button,

} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    paper: {
        padding: theme.spacing(2),
        color: theme.palette.text.secondary,
        backgroundColor: "white",
        borderColor: "black",
        borderWidth: 1,
        borderStyle: "solid",
    },
    table: {
        minWidth: 650,
        marginTop: "2vw",
        "& th":{
            fontWeight: "bold",
        },
    },
    formStyle: {
        padding: "2vw",
        width: "40vw",
        // "& select": {
        //     width: "100%",
        // },
    },
    content: {
        marginTop: 64,
        flexGrow: 1,
        // maxWidth:1200,
        marginLeft: 240,
        paddingLeft: 20,
    // display: "flex",
    //     flexDirection: "row",
    //     justifyContent: "center",
    //     alignItems: "center",
      padding: theme.spacing(3),
      "@media (max-width: 600px)":{
          marginLeft: 0,
          paddingLeft: 20,
      }
    },
    background:{
        backgroundColor: "white",
        padding: 1,
    }
  }));


const CreateAccount = ({email_form, name_form, type_roles, onSubmit, handleSelectAccountType, handleForm, validateForm, load_table }) => {
    const classes = useStyles();
    type_roles = ["rod","rod2","rod3"];
    return (
        <main className={classes.content}>
            <div className={classes.paper} >
                <Grid container direction="column" alignItems="center" justify="center">
                    <FormControl className={classes.formStyle} noValidate autoComplete="off" onSubmit={"props.onSubmit"}>

                        <TextField id="standard-basic" type="text" label="Email" style={{ margin: 0 }} placeholder="Email" 
                        // helperText="Full width!" 
                        fullWidth margin="normal" name="email"
                        />

                        <TextField id="standard-basic" type="text" label="Nome da conta" style={{ marginTop: 12 }} placeholder="Nome da conta" 
                        // helperText="Full width!" 
                        fullWidth margin="normal" name="name"
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
                                {type_roles && type_roles.map((elem, index) => {
                                    return <MenuItem value={elem}>{elem}</MenuItem>
                                })}
                            </Select>
                        </FormControl>

                        <Button type="submit" variant="contained" color="primary" 
                        style={{ marginTop: 30 , width:"50%", marginLeft: "auto", marginRight: "auto" }} 
                        startIcon={<Add/>}
                        >
                        Criar conta
                        </Button>

                    </FormControl>
                </Grid>
                {/* <form className="" onSubmit={onSubmit} >
                    <FormGroup controlId="email" bssize="large">
                        <FormLabel>Email</FormLabel>
                        <FormControl autoFocus name="email" type="email" placeholder="conta@cloudtotvs.com.br" defaultValue={email_form} onChange={handleForm}></FormControl>
                    </FormGroup>

                    <FormGroup controlId="name" bssize="large">
                        <FormLabel>Nome da conta</FormLabel>
                        <FormControl autoFocus name="name" type="name" placeholder="nome da conta" defaultValue={name_form} onChange={handleForm}></FormControl>
                    </FormGroup>
                    
                    <FormGroup controlId="conta.controlSelect">
                        <FormLabel>Tipo da conta</FormLabel>
                        <Form.Control as="select" className=""
                        onChange={e => handleSelectAccountType(e)}
                        >
                            {type_roles && type_roles.map((elem, index) => {
                                return <option key={elem} value={elem} >{elem}</option>;
                            })}
                        </Form.Control>
                    </FormGroup>
                    <Button block bssize="large" disabled={!validateForm()} type="submit">
                        Criar conta
                </Button>
                    <div id="output"></div>
                </form> */}

        </div>
                
                {load_table ? (
                       <TableContainer>
                       <Table className={classes.table} aria-label="caption table">
                         <TableHead>
                           <TableRow>
                             <TableCell>Nome da conta</TableCell>
                             <TableCell align="center">Email da conta</TableCell>
                             <TableCell align="center">Account ID</TableCell>
                           </TableRow>
                         </TableHead>
                         <TableBody>
                           {/* {rows.map(row => ( */}
                             <TableRow key="nome da conta A">
                               <TableCell>nome da conta A</TableCell>
                               <TableCell align="center">nome-da-conta-a@cloudtotvs.com.br</TableCell>
                               <TableCell align="center">987598715987</TableCell>
                             </TableRow>
                             <TableRow key="nome da conta b">
                               <TableCell>nome da conta b</TableCell>
                               <TableCell align="center">nome-da-conta-a@cloudtotvs.com.br</TableCell>
                               <TableCell align="center">987598715987</TableCell>
                             </TableRow>
                           {/* ))} */}
                         </TableBody>
                       </Table>
                     </TableContainer>

                    ) 
                    : null
                }
    
        
    </main>
    
    )
}

export default CreateAccount;