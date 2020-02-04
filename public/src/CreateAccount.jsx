import React, { Component, useState } from 'react';
import { Button, FormGroup, Form, FormControl, FormLabel, Table } from "react-bootstrap";
import "./CreateAccount.css";

export default class CreateAccount extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email: 'octopus.teste-20@cloudtotvs.com.br',
            name: 'octopus.teste-20',
            account_type: "",
            type_roles: [],
            lists: [],
            load_table: false,
            fetch_vars: { tryCount: 0, retryLimit: 30, }, // not the best solution to do fetch retry
        };

    }

    componentDidMount(){
        fetch(process.env.REACT_APP_ENDPOINT+"/role/available")
        // fetch(process.env.REACT_APP_ENDPOINT+"/policy/available")
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

        let render_html = "<div id='temporary'>\n\
        <img id='loader' style='display:block; margin:auto' src='images/loading-spinning-bubbles.svg' alt='loading' >\n\
        <p id='output_text' style='font-size:1.3em'>Enviando os dados..</p>\n\
        </div>";

        //$("#output").after(render_html);
        document.getElementById("output").innerHTML = render_html;
        
        // // remover isso
        this.sleep(1000).then( () =>{ document.getElementById("output_text").textContent = "Criando a conta...";  }  );
        this.sleep(2000).then( () =>{ document.getElementById("temporary").remove(); }  );
        this.sleep(3000).then( () =>{ 
            if(!this.state.load_table) this.setState({load_table : true})
        });
        
        // console.log("Event:",this.state);
        

        return ;
        //fetch('/api/authenticate', {
        //https://stackoverflow.com/questions/49684217/how-to-use-fetch-api-in-react-to-setstate
        const self = this;
        fetch(process.env.REACT_APP_ENDPOINT + '/account/create', {
            method: 'POST',
            body: JSON.stringify(this.state),
            headers: {
                'Content-Type': 'application/json'
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
                        headers: { "Content-Type": "application/json" },
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
            <section className="forms margin_header_forms">
                <form className="shadow space_y" onSubmit={this.onSubmit} >
                    <FormGroup controlId="email" bssize="large">
                        <FormLabel>Email</FormLabel>
                        <FormControl autoFocus name="email" type="email" defaultValue={this.state.email} onChange={this.handleInputChange}></FormControl>
                    </FormGroup>

                    <FormGroup controlId="name" bssize="large">
                        <FormLabel>Nome da conta</FormLabel>
                        <FormControl autoFocus name="name" type="name" defaultValue={this.state.name} onChange={this.handleInputChange}></FormControl>
                    </FormGroup>
                    {/* <Button block bsSize="large" disabled={!validateForm()} type="submit"> */}
                    <FormGroup controlId="conta.controlSelect">
                        <FormLabel>Tipo da conta</FormLabel>
                        <Form.Control as="select" className="role_cloudformation"
                        onChange={e => this.handleSelectAccountType(e)}
                        >
                            {type_roles && type_roles.map((elem, index) => {
                                return <option key={elem} value={elem} >{elem}</option>;
                            })}
                        </Form.Control>
                    </FormGroup>
                    <Button block bssize="large" disabled={!this.validateForm()} type="submit">
                        Criar conta
                </Button>
                    <div id="output"></div>
                </form>

                
                {load_table ? (
                    <Table striped bordered hover className="margin_header_forms">
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
                            {this.state.lists.map((field, idx) => {

                                return (
                                    <tr key={`${field}-${idx}`}>
                                        <td>{field.name}</td>
                                        <td>{field.email}</td>
                                        <td>{field.accountid}</td>
                                    </tr>

                                );
                            })}

                        </tbody>
                    </Table>
                    ) 
                    : null
                }
                
                
            </section>
            //   <div key={`${field}-${idx}`}>
            //   {/* <input type="text" placeholder="Enter text" value={field} {#onChange={e => handleChange(idx, e)}#} /> */}
            //   <input type="text" placeholder="Enter text" value={field} />
            //   {/* <button type="button" onClick={() => handleRemove(idx)}>X</button> */}
            //  <p>{field}</p>
            // </div>

        );
    }
}

