import React, { Component, useState } from 'react';
import { Button, FormGroup, FormControl, FormLabel, Table } from "react-bootstrap";
import "./Conta.css";

export default class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email : 'rodjul@example.com',
      name: 'rodjul',
      cloudformation: 'tcloud',
      lists: [],
      fetch_vars: {tryCount:0, retryLimit: 0,}, // not the best solution to do fetch retry
    };

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


  onSubmit = (event) => {
    event.preventDefault();
    
    let render_html = "<div id='temporary'><p id='output_text' style='font-size:1.3em'>Enviando os dados..</p>\n\
    <img id='loader' style='width:15em; display:block; margin:auto' src='images/loadinfo.net.gif' alt='loading' ></div>";
    
    //$("#output").after(render_html);
    document.getElementById("output").innerHTML = render_html;

    //console.log("Event:",this.state);

    //fetch('/api/authenticate', {
    //https://stackoverflow.com/questions/49684217/how-to-use-fetch-api-in-react-to-setstate
    const self = this;
    fetch('https://ph9emn94e6.execute-api.us-east-2.amazonaws.com/dev/account/create', {
      method: 'POST',
      body: JSON.stringify(this.state),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.status === 200) {
        //this.props.history.push('/');
        
        document.getElementById("output_text").textContent = "Criando a conta...";
        let name = self.state.name;
        // console.log("name:",name);
        
        // definimos um intervalo a cada 2 segundos para obter o resultado 
        var interval = setInterval(function(){
          fetch("https://ph9emn94e6.execute-api.us-east-2.amazonaws.com/dev/account/id/"+name,{
            method: "GET",
            headers: {"Content-Type":"application/json"},
          })
          .then(response => response.json()) // convertendo o result pra json
          .then( data => {
              let tryCount = self.state.fetch_vars.tryCount;
              let retryLimit = self.state.fetch_vars.retryLimit;
              
              console.log(data);
              
              if(! ( data.message.startsWith("AccountId: ")) ){
                if(tryCount <= retryLimit){
                  let p1 = tryCount + 1;
                  self.setState( {fetch_vars: {tryCount : p1, retryLimit:retryLimit} } )
                  fetch(this);
                  return;
                }
              }

              clearInterval(interval);
              document.getElementById("temporary").remove();

              let format = "";
              if(tryCount > retryLimit){
                format = {name: self.state.name, email: self.state.email, accountid: "ERRO EM OBTER ACCOUNTID" };
              }else{
                let accountid = data.message.split("AccountId: ")[1];
                format = {name: self.state.name, email: self.state.email, accountid };
              }

              let prv = [ ... self.state.lists, format];
              // colocando o valor da nova conta
              self.setState({lists: prv});

              //document.getElementById("output").innerHTML += "<p style='font-size:1.5em'>Conta: "+name+" - "+data.message+"</p>";
            })
          .catch(err => {
            console.error(err);
            //alert('Error logging in please try again');
            document.getElementById("output").innerHTML = "<p>Erro em obter account id da conta:"+name+"</p>";
          });
              
        },2000); // usando setInterval para executar a cada 2 segundos
        

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
    return (
        <section className="forms">
		    	<form onSubmit={this.onSubmit} >
                {/* <span >
                    Octopus - Criar conta
                </span> */}
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
                    <FormControl as="select" name="role_cloudformation" defaultValue={this.state.cloudformation}>
                        <option>TCloud</option>
                        {/* <option>2</option>*/}
                    </FormControl>
                </FormGroup>
                <Button block bssize="large" disabled={!this.validateForm()} type="submit"> 
                    Criar conta
                </Button>
                <div id="output"></div>

            </form>
            
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nome da conta</th>
                  <th>Email da conta</th>
                  <th>Account Id</th>
                </tr>
              </thead>
              <tbody>
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

//export default Conta;
