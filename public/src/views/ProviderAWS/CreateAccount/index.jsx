import React, { Component} from 'react';
import { getAuthorization } from "../../../utils";
import BlockUi from 'react-block-ui';
import LoadingCircularProgress from "../../../components/LoadingCircularProgress";
// import "./CreateAccount.css";
// import CreateAccountForm from "./components/CreateAccountForm";
import {
    TextField, Grid, Select, InputLabel,  MenuItem, FormControl,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, CircularProgress, Box, Typography
} from "@material-ui/core";
import Add from '@material-ui/icons/Add';

import "./styles.css";

export default class CreateAccount extends Component {
    constructor() {
        super()
        this.state = {
            //inputs
            email: '',
            name: '',
            motive: "",
            accountType: "",
            typeRoles: [],
            lists: [],
            createdAccounts: [],

            // view handlers
            invalidEmail: false,
            disableCreateButton: true,
            blocking: false,
            loadTable: false,
            loading: false,
            // load_table: false,
            fetch_vars: { tryCount: 0, retryLimit: 30, }, // not the best solution to do fetch retry
        };

    }


    componentDidMount(){
        window.document.title = "Octopus - Criar conta";

        let stateValues = this;
        fetch(process.env.REACT_APP_ENDPOINT+"/aws/roles",{
            headers: {"Authorization": getAuthorization()},
        })
        .then(response => this._handleFetchErrors(response, stateValues))
        .then(resp => {
            if(resp.message === "Internal server error"){
                console.error("Error in fetching data");
            }else{
                let typeRolesAvailable = [];
                resp.data.roles.map(role => typeRolesAvailable.push(role.role_type));
                this.setState({ 
                    typeRoles: typeRolesAvailable,
                    // accountType: data.roles[0].role_type
                });
            }
        }).catch(e => console.error(e));
    }

    validateForm() {
        // console.log(1);
        return this.state.email.length > 0 && this.state.name.length > 0 
            && this.state.accountType.length > 0 && this.state.motive.length > 0;
    }

    handleInputChange = (event) => {
        const { value, name } = event.target;
        // console.log("Handle:",event.target);
        this.setState({
            [name]: value
        }, 
        () => {

            if(name === "email"){
                let regex = new RegExp("[^@]+@[^@]+\.[^@]+");
                // if email regex fail
                if(!regex.test(value)){
                    this.setState({invalidEmail: true});
                }else{
                    this.setState({invalidEmail: false});
                }
            }

            if(this.validateForm()){
                this.setState({disableCreateButton: false});
            }else{
                if(!this.state.disableCreateButton)
                    this.setState({disableCreateButton: true});
            }
        }
        );
    }

    handleSelectAccountType = event => {
        this.setState({ accountType:  event.target.value }, 
        () => {
            if(this.validateForm()){
                this.setState({disableCreateButton: false});
            }else{
                if(!this.state.disableCreateButton)
                    this.setState({disableCreateButton: true});
            }
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async onSubmit(event){
        event.preventDefault();
        // console.log(event, event.target);
        // console.log(this.state);

        if(!this.validateForm()){
            return JSON.stringify( {"error":true, "message":"Os campos precisam ser preenchidos"} );
        }
        
        // return JSON.stringify( {"error":false, 
        //     "accounts":[ 
        //         { 
        //             name: this.state.name, 
        //             email: this.state.email, 
        //             "account_id":"0123456789",
        //             "accountType": this.state.accountType,
        //         }, 
        //         { 
        //             name: "seginfo-products.aws", 
        //             email: "seginfo-products.aws@email.com.br", 
        //             "account_id":"9876543210",
        //             "accountType": "Siem",
        //         } 
        //     ]} );

        this.setState({blocking: true});

        //https://stackoverflow.com/questions/49684217/how-to-use-fetch-api-in-react-to-setstate
        const self = this;
        let stateValues = this;
        await fetch(process.env.REACT_APP_ENDPOINT + '/aws/accounts', {
            method: 'POST',
            body: JSON.stringify({
                "name": this.state.name,
                "email": this.state.email,
                "account_type": this.state.accountType,
                "motive": this.state.motive,
            }),
            headers: {
                'Content-Type': 'application/json',
                "Authorization": getAuthorization(),
            }
        })
        .then(response => this._handleFetchErrors(response, stateValues))
        .then(res => {
            console.log(res);
            //this.props.history.push('/');
            //console.log(res.json().then( body => console.log(body) ));
            document.getElementById("output_text").textContent = "Criando a conta...";
            let name = stateValues.state.name;

            // definimos um intervalo a cada 2 segundos para obter o resultado 
            // var interval = setInterval(async function () {
            //     await fetch(`${process.env.REACT_APP_ENDPOINT}/aws/accounts/${encodeURIComponent(name)}`, {
            //         method: "GET",
            //         headers: { 
            //             "Content-Type": "application/json",
            //             "Authorization": getAuthorization(),
            //         },
            //     })
            //     .then(response => this._handleFetchErrors(response, stateValues))
            //     .then(data => {
            //         let tryCount = self.state.fetch_vars.tryCount;
            //         let retryLimit = self.state.fetch_vars.retryLimit;

            //         // console.log(data);

            //         if (!(data.message.startsWith("AccountId: "))) {
            //             if (tryCount <= retryLimit) {
            //                 let p1 = tryCount + 1;
            //                 self.setState({ fetch_vars: { tryCount: p1, retryLimit: retryLimit } })
            //                 fetch(this);
            //                 return;
            //             }
            //         }

            //         clearInterval(interval);
            //         document.getElementById("temporary").remove();

            //         let format = "";
            //         if (tryCount > retryLimit) {
            //             format = { name: self.state.name, email: self.state.email, "account_id": "ERRO EM OBTER ACCOUNTID", "accountType":self.state.accountType };
            //         } else {
            //             let accountid = data.message.split("AccountId: ")[1];
            //             format = { name: self.state.name, email: self.state.email, "account_id":accountid, "accountType":self.state.accountType  };
            //         }

            //         let prv = [...self.state.lists, format];
            //         // colocando o valor da nova conta
            //         self.setState({ lists: prv });
                    
            //         return JSON.stringify( {"error":false, "accounts": this.state.lists} );
            //         //document.getElementById("output").innerHTML += "<p style='font-size:1.5em'>Conta: "+name+" - "+data.message+"</p>";
            //     })
            //     .catch(err => {
            //         console.error(err);
            //         //alert('Error logging in please try again');
            //         // document.getElementById("output").innerHTML = "<p>Erro em obter account id da conta:" + name + "</p>";
            //         return JSON.stringify( {"error":true} );
            //     });

            // }, 2000); // usando setInterval para executar a cada 2 segundos


            // loop end

        })
        .catch(err => {
            console.error(err);
        });

        this.setState({blocking: false});
    }

    async _handleFetchErrors(response, stateValues = {}) {
        if (!response.ok) {
            if(response.status === 401){
                alert("Not authenticated. Login again");
                window.location.reload();
            }else{
                let message = "";
                if(response.status === 400){
                    message = "Invalid request";
                }else if(response.status === 403){
                    message = "You don't have permissions to do this action";
                }else if(response.status === 404){
                    message = "Not found";
                }else if(response.status === 500 || response.status === 502){
                    message = "Server error. Contact administrator!";
                }
                                
                // let hasJsonData = false;
                // await response.json().then(e => {
                //     hasJsonData = true;
                //     stateValues.setState({
                //         errorMessagePopup: message + " Message: " + e.message,
                //         requestError: true,
                //     });
                // });

                // if(!hasJsonData){
                    stateValues.setState({
                        errorMessagePopup: message,
                        requestError: true,
                    },()=>stateValues.setState({requestError: false}));
                // }

                // stateValues.setState({isLoading: false});
                throw Error(response);
            }
        }
        return response.json();
    }

    render() {
        const {typeRoles, load_table} = this.state;
        // let load_table = true;


        return (
            <>
                <main className="content">
                    <Typography className="titleHeader" variant="h4" noWrap >
                        Criar conta
                    </Typography>
                    <Box boxShadow={3}>
                        <div className="paper" >
                            <BlockUi tag="div" blocking={this.state.blocking} message="" loader={<LoadingCircularProgress/>}>
                                <Grid container direction="column" alignItems="center" justify="center">


                                    <FormControl className="formStyle" noValidate autoComplete="off">

                                        <TextField id="standard-basic" type="text" label="Nome da conta" style={{ marginTop: 12 }} placeholder="Nome da conta" 
                                            // helperText="Full width!" 
                                            fullWidth margin="normal" name="name"
                                            onBlur={this.handleInputChange.bind(this)}
                                        />

                                        <TextField id="standard-basic" type="text" label="Email" style={{ margin: 0 }} placeholder="Email" 
                                            // helperText="Full width!" 
                                            fullWidth margin="normal" name="email"
                                            onBlur={this.handleInputChange.bind(this)}
                                            error={this.state.invalidEmail}
                                            helperText={this.state.invalidEmail ? "Invalid email" : ""}
                                        />
                                        
                                        <TextField id="standard-basic" type="text" label="Motivo" style={{ margin: 0 }} placeholder="Motivo da criação" 
                                            // helperText="Full width!" 
                                            fullWidth margin="normal" name="motive"
                                            onBlur={this.handleInputChange.bind(this)}
                                        />

                                        <FormControl>
                                            <InputLabel id="controlled-open-select-label-tipo-da-conta">Tipo da conta</InputLabel>
                                            <Select labelId="controlled-open-select-label-tipo-da-conta" id="demo-controlled-open-select"
                                            // open={open}
                                            // onClose={handleClose}
                                            // onOpen={handleOpen}
                                            // value={age}
                                            onChange={this.handleSelectAccountType.bind(this)}
                                            >   
                                                {/* <MenuItem key="Cloud" value="Cloud">Cloud</MenuItem> */}
                                                {this.state.typeRoles && this.state.typeRoles.map((elem, index) => {
                                                    return <MenuItem key={`${elem+'-'+index}`} value={elem}>{elem}</MenuItem>
                                                })}
                                            </Select>
                                        </FormControl>
                                        
                                        {this.state.disableCreateButton ? (
                                            <Button variant="contained" color="primary" 
                                                style={{ marginTop: 30 , width:"12em", marginLeft: "auto", marginRight: "auto" }} 
                                                startIcon={<Add/>}
                                                className={"success"}
                                                disabled={true}
                                            >
                                                Criar conta
                                            {/* {this.state.loading && <CircularProgress size={24} className={"buttonProgress"} />} */}
                                            </Button> 
                                            
                                        ):(
                                            <Button type="submit" variant="contained" color="primary" 
                                                style={{ marginTop: 30 , width:"12em", marginLeft: "auto", marginRight: "auto" }} 
                                                startIcon={<Add/>}
                                                className={"success"}
                                                onClick={this.onSubmit.bind(this)}
                                            >
                                                Criar conta
                                            </Button>
                                        )}


                                    </FormControl>

                                </Grid>
                            </BlockUi>
                        </div>
                    </Box>

                    {this.state.loadTable ? (
                        <Box boxShadow={3}>
                            <TableContainer style={{marginTop:"2em"}}>
                                <Table className={"table"} aria-label="caption table">
                                    <TableHead>
                                    <TableRow>
                                        <TableCell>Nome da conta</TableCell>
                                        <TableCell align="center">Email da conta</TableCell>
                                        <TableCell align="center">Account ID</TableCell>
                                        <TableCell align="center">Tipo da conta</TableCell>
                                    </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    {this.state.createdAccounts.map(account => (
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
                
            </main>
                {/* <CreateAccountForm 
                typeRoles={typeRoles}
                onSubmit={this.onSubmit.bind(this)}
                handleSelectAccountType={this.handleSelectAccountType.bind(this)}
                handleForm={this.handleInputChange.bind(this)}
                validateForm={this.validateForm.bind(this)}
                // load_table={true}
                
                /> */}
            </>
        );
    }
}

