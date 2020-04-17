import React, { Component, useState } from 'react';
// import "./CreateAccount.css";
import CreateAccountForm from "../../components/CreateAccountForm";


export default class CreateAccount extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email: '',
            name: '',
            account_type: "",
            type_roles: [],
            lists: [],
            load_table: false,
            fetch_vars: { tryCount: 0, retryLimit: 30, }, // not the best solution to do fetch retry
        };

    }

    

    componentDidMount(){
        fetch(process.env.REACT_APP_ENDPOINT+"/role/available",{
            headers: {"X-Api-Key": process.env.REACT_APP_X_API_KEY_AWS},
        })
        .then(resp => resp.json())
        .then(data => {
            if(data.message === "Internal server error"){
                console.error("Error in fetching data");
            }else{
                this.setState({ 
                    type_roles: data.type_roles,
                    account_type: data.type_roles[0]
                });
            }
        });
    }

    validateForm() {
        console.log(1);
        return this.state.email.length > 0 && this.state.name.length > 0;
    }

    handleInputChange = (event) => {
        const { value, name } = event.target;
        // console.log("Handle:",event.target);
        this.setState({
            [name]: value.toLowerCase()
        });
    }

    handleSelectAccountType = event => this.setState({ account_type:  event.target.value });

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

    onSubmit = (event) => {
        event.preventDefault();
        //https://stackoverflow.com/questions/49684217/how-to-use-fetch-api-in-react-to-setstate
        const self = this;
        fetch(process.env.REACT_APP_ENDPOINT + '/account/create', {
            method: 'POST',
            body: JSON.stringify(this.state),
            headers: {
                'Content-Type': 'application/json',
                "X-Api-Key": process.env.REACT_APP_X_API_KEY_AWS,
            }
        })
        .then(res => {
            if (res.status === 200) {
                //this.props.history.push('/');
                //console.log(res.json().then( body => console.log(body) ));
                document.getElementById("output_text").textContent = "Criando a conta...";
                let name = self.state.name;

                // definimos um intervalo a cada 2 segundos para obter o resultado 
                var interval = setInterval(function () {
                    fetch("https://dq8yro2vbd.execute-api.us-east-2.amazonaws.com/dev/account/id/" + name, {
                        method: "GET",
                        headers: { 
                            "Content-Type": "application/json",
                            "X-Api-Key": process.env.REACT_APP_X_API_KEY_AWS,
                        },
                    })
                    .then(response => response.json()) // convertendo o result pra json
                    .then(data => {
                        let tryCount = self.state.fetch_vars.tryCount;
                        let retryLimit = self.state.fetch_vars.retryLimit;

                        console.log(data);

                        if (!(data.message.startsWith("AccountId: "))) {
                            if (tryCount <= retryLimit) {
                                let p1 = tryCount + 1;
                                self.setState({ fetch_vars: { tryCount: p1, retryLimit: retryLimit } })
                                fetch(this);
                                return;
                            }
                        }

                        clearInterval(interval);
                        document.getElementById("temporary").remove();

                        let format = "";
                        if (tryCount > retryLimit) {
                            format = { name: self.state.name, email: self.state.email, accountid: "ERRO EM OBTER ACCOUNTID" };
                        } else {
                            let accountid = data.message.split("AccountId: ")[1];
                            format = { name: self.state.name, email: self.state.email, accountid };
                        }

                        let prv = [...self.state.lists, format];
                        // colocando o valor da nova conta
                        self.setState({ lists: prv });

                        //document.getElementById("output").innerHTML += "<p style='font-size:1.5em'>Conta: "+name+" - "+data.message+"</p>";
                    })
                    .catch(err => {
                        console.error(err);
                        //alert('Error logging in please try again');
                        document.getElementById("output").innerHTML = "<p>Erro em obter account id da conta:" + name + "</p>";
                    });

                }, 2000); // usando setInterval para executar a cada 2 segundos


                // loop end

            } else {
                const error = new Error(res.error);
                throw error;
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error logging in please try again');
        });
    }

    render() {
        const {type_roles, load_table} = this.state;
        // let load_table = true;


        return (
            <>
                <CreateAccountForm 
                email_form={this.state.email} 
                name_form={this.state.name} 
                type_roles={type_roles}
                onSubmit={this.onSubmit.bind(this)}
                handleSelectAccountType={this.handleSelectAccountType.bind(this)}
                handleForm={this.handleInputChange.bind(this)}
                validateForm={this.validateForm.bind(this)}
                // load_table={true}
                
                />
            </>
        );
    }
}

