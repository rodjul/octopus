import React from "react";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Button, FormGroup, Form, FormControl, FormLabel, Table } from "react-bootstrap";

import {TextField, Grid, Select, InputLabel,  MenuItem
} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      width: 240,
    },
    paper: {
        marginTop: 50,
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        backgroundColor: "white",
        borderColor: "black",
        borderWidth: 1,
        borderStyle: "solid",
    },
    content: {
      flexGrow: 1,
      marginLeft: 240,
      paddingLeft: 20,
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
    return (
        <main className={classes.content}>
              <div className={classes.paper} >
                <Grid justify="center" sm={12} className={"classes.background"}>
                    <form className={classes.pageHeader} noValidate autoComplete="off" onSubmit={"props.onSubmit"}>

                        <TextField id="standard-basic" type="text" label="Email" style={{ margin: 0 }} placeholder="Email" 
                        // helperText="Full width!" 
                        fullWidth margin="normal" name="email"
                        />

                        <TextField id="standard-basic" type="text" label="Nome da conta" style={{ marginTop: 12 }} placeholder="Nome da conta" 
                        // helperText="Full width!" 
                        fullWidth margin="normal" name="name"
                        />

                        <InputLabel id="demo-controlled-open-select-label">Age</InputLabel>
                        <Select
                        labelId="demo-controlled-open-select-label"
                        id="demo-controlled-open-select"
                        // open={open}
                        // onClose={handleClose}
                        // onOpen={handleOpen}
                        // value={age}
                        // onChange={handleChange}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value={10}>Ten</MenuItem>
                            <MenuItem value={20}>Twenty</MenuItem>
                            <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                        

                        {/* <FormGroup controlId="conta.controlSelect">
                            <FormLabel>Tipo da conta</FormLabel>
                            <Form.Control as="select" className=""
                            onChange={e => handleSelectAccountType(e)}
                            >
                                {type_roles && type_roles.map((elem, index) => {
                                    return <option key={elem} value={elem} >{elem}</option>;
                                })}
                            </Form.Control>
                        </FormGroup> */}

                        <Button type="submit" variant="contained" color="primary" style={{ marginTop: 40 }} fullWidth>
                        Login
                        </Button>

                    </form>
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

                
                {load_table ? (
                    <Table striped bordered hover className="">
                        <thead>
                            <tr>
                                <th>Nome da conta</th>
                                <th>Email da conta</th>
                                <th>Account Id</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>nome da conta A</td>
                                <td>nome-da-conta-a@cloudtotvs.com.br</td>
                                <td>987598715987</td>
                            </tr>
                            {/* {this.state.lists.map((field, idx) => {

                                return (
                                    <tr key={`${field}-${idx}`}>
                                        <td>{field.name}</td>
                                        <td>{field.email}</td>
                                        <td>{field.accountid}</td>
                                    </tr>

                                );
                            })} */}

                        </tbody>
                    </Table>
                    ) 
                    : null
                }
    
        </div>
    </main>
    
    )
}

export default CreateAccount;