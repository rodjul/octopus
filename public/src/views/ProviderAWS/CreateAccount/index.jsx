import React, { Component} from 'react';
import { getAuthorization } from "../../../utils";
import BlockUi from 'react-block-ui';
import LoadingCircularProgress from "../../../components/LoadingCircularProgress";
import SnackbarNotification from "../../../components/SnackbarNotification";
import {
    TextField, Grid, Select, InputLabel,  MenuItem, FormControl,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Box, Typography
} from "@material-ui/core";
import Add from '@material-ui/icons/Add';
import DialogListAccounts from "./components/DialogListAccounts";

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
            accountPayer: "",
            typeRoles: [],
            lists: [],
            createdAccounts: [],

            accounts: [],

            // view handlers
            invalidEmail: false,
            disableCreateButton: true,
            blocking: false,
            loadingIcon: false,
            loadTableStatusAccount: false,
            loading: false,
            requestSuccess: false,
            requestError: false,
            errorMessagePopup: "",
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
            && this.state.accountType.length > 0 && this.state.motive.length > 0
            && this.state.accountPayer.length > 0;
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
    
    handleSelectAccountPayer = event => {
        this.setState({ accountPayer:  event.target.value }, 
        () => {
            if(this.validateForm()){
                this.setState({disableCreateButton: false});
            }else{
                if(!this.state.disableCreateButton)
                    this.setState({disableCreateButton: true});
            }
        });
    }

    async getAccountsCreated(){
        this.setState({loadingIcon: true});
        await fetch(process.env.REACT_APP_ENDPOINT + '/aws/accounts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": getAuthorization(),
            }
        })
        .then(response => this._handleFetchErrors(response, this))
        .then(response => {
            this.setState({accounts: response.accounts});
        }).catch(e => console.error(e));
        this.setState({loadingIcon: false, requestError: false});
    }

    // sleep(ms) {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    // }

    async onSubmit(event){
        event.preventDefault();

        if(!this.validateForm()){
            return JSON.stringify( {"error":true, "message":"Os campos precisam ser preenchidos"} );
        }
        

        this.setState({blocking: true});

        //https://stackoverflow.com/questions/49684217/how-to-use-fetch-api-in-react-to-setstate
        // const self = this;
        let stateValues = this;
        let uuid = null;
        await fetch(process.env.REACT_APP_ENDPOINT + '/aws/accounts', {
            method: 'POST',
            body: JSON.stringify({
                "name": this.state.name,
                "email": this.state.email,
                "account_type": this.state.accountType,
                "motive": this.state.motive,
                "account_payer": this.state.accountPayer,
            }),
            headers: {
                'Content-Type': 'application/json',
                "Authorization": getAuthorization(),
            }
        })
        .then(response => this._handleFetchErrors(response, stateValues))
<<<<<<< HEAD
        .then(response => {
            this.setState({requestSuccess: true, loadTableStatusAccount: true}, () => this.setState({requestSuccess: false}));
                        
            uuid = response.data.uuid;

            let format = { 
                name: self.state.name, 
                email: self.state.email, 
                "account_id": null, 
                "accountType":self.state.accountType,
                "status": "NOT_CREATED",
                loading: true,
            };

            let prv = [...self.state.lists, format];
            this.setState({lists: prv});

=======
        .then(res => {
            console.log(res);
            //this.props.history.push('/');
            //console.log(res.json().then( body => console.log(body) ));
            document.getElementById("output_text").textContent = "Criando a conta...";
            // let name = stateValues.state.name;
>>>>>>> d0f7616913dc2726f81cc6ebb4c8c5f267bb7adb

            // definimos um intervalo a cada 2 segundos para obter o resultado 
            var interval = setInterval(async function () {
                await fetch(`${process.env.REACT_APP_ENDPOINT}/aws/accounts/${encodeURIComponent(uuid)}/status`, {
                    method: "GET",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": getAuthorization(),
                    },
                })
                .then(response => self._handleFetchErrors(response, stateValues))
                .then(async response => {
                    let tryCount = self.state.fetch_vars.tryCount;
                    let retryLimit = self.state.fetch_vars.retryLimit;

                    // console.log(data);
                    let currentList = self.state.lists;
                    let index = currentList.length - 1;

                    currentList[index].status = response.status;

                    if(!currentList[index].account_id){
                        await fetch(`${process.env.REACT_APP_ENDPOINT}/aws/accounts/${encodeURIComponent(uuid)}/accountid`, {
                            method: "GET",
                            headers: { 
                                "Content-Type": "application/json",
                                "Authorization": getAuthorization(),
                            },
                        })
                        .then(response => self._handleFetchErrors(response, stateValues))
                        .then(response => currentList[index].account_id = response.account_id)
                        .catch(e => console.error(e));
                    }
                    
                    if (response.status.toUpperCase() !== "SUCCESSFULY_CREATED" && !response.status.toUpperCase().startsWith("ERROR") ){
                        self.setState({lists: currentList});
                        if (tryCount <= retryLimit) {
                            let p1 = tryCount + 1;
                            self.setState({ fetch_vars: { tryCount: p1, retryLimit: retryLimit } })
                            fetch(this);
                            return;
                        }
                    }
                    
                    currentList[index].loading = false;
                    self.setState({lists: currentList});

                    clearInterval(interval);
                })
                .catch(err => console.error(err));

            }, 3000); // usando setInterval para executar a cada 2 segundos

            // loop end


        }).catch(err => console.error(err));

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
<<<<<<< HEAD
=======
        // const {typeRoles, load_table} = this.state;
        // let load_table = true;


>>>>>>> d0f7616913dc2726f81cc6ebb4c8c5f267bb7adb
        return (
            <main className="content">
                <Typography className="titleHeader" variant="h4" noWrap >
                    Criar conta
                </Typography>
                <Box boxShadow={3}>
                    <div className="paper" >
                        <section className="actions">
                            <DialogListAccounts
                                blocking={this.state.loadingIcon}
                                accounts={this.state.accounts}
                                getAccounts={this.getAccountsCreated.bind(this)}
                                // dataSelected={this.state.dataSelected} 
                                // onSubmitCreateProject={this.onSubmitCreateProject.bind(this)} 
                            />
                        </section>
                        <BlockUi tag="section" blocking={this.state.blocking} message="" loader={<LoadingCircularProgress/>}>
                            <Grid container direction="column" alignItems="center" justify="center">
                                <form>
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
                                            <InputLabel id="controlled-open-select-label-tipo-da-conta">Selecione conta pagadora</InputLabel>
                                            <Select labelId="controlled-open-select-label-account-payer-organization" id="account-payer-organizatio"
                                            onChange={this.handleSelectAccountPayer.bind(this)}
                                            >   
                                                <MenuItem key="Brasileira" value="Brasileira">Brasileira</MenuItem>
                                                <MenuItem key="Americana" value="Americana">Americana</MenuItem>
                                                {/* {this.state.typeRoles && this.state.typeRoles.map((elem, index) => {
                                                    return <MenuItem key={`${elem+'-'+index}`} value={elem}>{elem}</MenuItem>
                                                })} */}
                                            </Select>
                                        </FormControl>

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
                                </form>
                            </Grid>
                        </BlockUi>
                    </div>
                </Box>

                {this.state.loadTableStatusAccount ? (
                    <Box boxShadow={3}>
                        <TableContainer style={{marginTop:"2em"}}>
                            <Table aria-label="caption table" id="tableAccountCreation">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">Nome da conta</TableCell>
                                        <TableCell align="center">Email da conta</TableCell>
                                        <TableCell align="center">Account ID</TableCell>
                                        <TableCell align="center">Tipo da conta</TableCell>
                                        <TableCell align="center">STATUS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                {this.state.lists.map(account => (
                                    <TableRow key={`${account['name']+'-'+account['account_id']}`}>
                                        <TableCell align="center">{account['name']}</TableCell>
                                        <TableCell align="center">{account['email']}</TableCell>
                                        <TableCell align="center">{account['account_id']}</TableCell>
                                        <TableCell align="center">{account['accountType']}</TableCell>
                                        <TableCell align="center">{account['status']}{account['loading'] ? <LoadingCircularProgress className="icon-loading-status-account" size={25}/> : null}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                    ) 
                    : null
                }

                {this.state.requestSuccess && <SnackbarNotification variant="success" message="Success!"/>}
                {this.state.requestError && <SnackbarNotification variant="error" message={this.state.errorMessagePopup}/>}

            </main>
        );
    }
}
