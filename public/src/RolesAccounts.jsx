import React from 'react';
import { Button, FormGroup, FormLabel, Form, Tab,Tabs, Modal } from "react-bootstrap";
//import './Policies.css';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';
/*

MOSTRAR SOMENTE AS POLICIES
NA PAGINA DE ROLES, É A MSM DINAMICA MAS CRIAR POR TIPO DE CONTA/ROLE


*/

export default class Login extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          document_name: "",
          showModal: false,
          description:"",
          trusts:[],
          policies:[],
          roles:[],
          trusts_select:[],
          policies_select:[],
          roles_select:[],
          roles_available: [],
          delete_policy: "não declarado",
          role_type:"",
          selectedOption: null
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
                // console.log(data);
                this.setState({ roles_available: data.type_roles});
            }

            fetch(process.env.REACT_APP_ENDPOINT+"/policy/default")
            .then(resp => resp.json())
            .then(data => {
                if(data.message === "Internal server error"){
                    console.error("Error in fetching data");
                }else{
                    console.log(data);
                    let trust_ar = []; let policy_ar = []; let role_ar = [];
                    data.message.TrustRelationships.map((elem, index)=>{
                        trust_ar[index] = { "value":elem['Name'] ,"label":elem['Name'] };
                    })
                    data.message.Policies.map((elem,index)=>{
                        policy_ar[index] = { "value":elem['Name'], "label":elem['Name'] };
                    });
                    data.message.Roles.map((elem,index)=>{
                        role_ar[index] = { "value":elem['Name'], "label":elem['Name'] };
                    });
                    this.setState({ 
                        trusts: trust_ar,
                        policies: policy_ar,
                        trusts_select: trust_ar,
                        roles_select: role_ar,
                        policies_select: policy_ar
                    });
                }
            })

            })
        
    }
    
    handleInputChangeARN = (event) => {
        event.preventDefault();
        const {name, value} = event.target;
        //console.log(name,value);
        //let term = "arn:aws:iam::aws:policy/ReadOnlyAccess";
        let regex = new RegExp("arn:aws:iam::aws:policy/([A-Za-z]+),*");
        console.log(value, regex.test(value));
        if(regex.test(value)){
            this.setState({test: value});
        }else{
            console.log(this.state.test);
            event.target.value = this.state.test;
            //this.setState({test: this.state.test});
        }
    }

    onSubmit(event){
        event.preventDefault();
        console.log("Event: ",event.target);
        console.log("Event: ",this.state);
        // event.preventDefault();
        // console.log(event.target);
        // console.log(event.target[0].value);
        // console.log(this.state.document_name);
        let format = {
            role_type: this.state.role_type,
            description: this.state.description,
            roles: this.state.roles,
        };
        console.log(format);
        // console.log(JSON.stringify(format));
        fetch(process.env.REACT_APP_ENDPOINT+"/role/new",{
            method:"POST", mode:"cors",
            body: JSON.stringify( format )
        })
        .then(resp => resp.json())
    }

    requestDeleteRoleType(){
        fetch(process.env.REACT_APP_ENDPOINT+"/role/delete",{
            method:"DELETE", mode:"cors",
            body: JSON.stringify( {"role_type":this.state.delete_policy} )
        })
        .then(resp => resp.json())
        .then( _ => {
            let index = this.state.roles_available.indexOf(this.state.delete_policy);
            let new_available = this.state.roles_available;
            new_available.splice(index, 1);
            this.setState({ 
                roles_available: new_available,
                document_name: "",
                description:"",
                trusts:[],
                policies:[],
                roles:[],
                delete_policy: "não declarado"
            });
        } )
    }


    // https://dev.to/fuchodeveloper/dynamic-form-fields-in-react-1h6c
    // add dynamically the part of the form
    handleAddFields = tipo => {
        if(tipo === "role"){
            const values = [...this.state.roles];
            values.push({
                role_name: 'New Role',
                role_description: "Description of this role",
                policies:[], 
                policy_arn_aws:"" , 
                trust_relationship:""
            });
            this.setState({roles : values});
        }
    };
    
    // remove dynamically the part of the form
    handleRemoveFields = (index,type) => {
        if(type === "trustrelationships"){
            const values = [...this.state.trusts];
            values.splice(index, 1);
            this.setState({trusts : values});
        }else if(type === "role"){
            const values = [...this.state.roles];
            values.splice(index, 1);
            this.setState({roles : values});
        }else if(type === "policy"){
            const values = [...this.state.trusts];
            values.splice(index, 1);
            this.setState({trusts : values});
        }
    };

    onChangeJson = (type,index,event) => {
        //console.log(event.jsObject);
        //console.log(index);
        if(type === "trust"){
            this.state.trusts[index]['AssumeRolePolicyDocument'] = event.jsObject;
        }
        else if(type === "policy"){
            this.state.policies[index]['AssumeRolePolicyDocument'] = event.jsObject;
        }
    }

    onChangeForms = (type, index, event) => {
        if(type === "role_type"){
            this.state.role_type = event.target.value;
        }else if(type === "description"){
            this.state.description = event.target.value;
        }else{
            this.state.roles[index][event.target.name] = event.target.value;
        }
    }

    onChangeSelect = (selectedOption, type, index) => {
        if(type === "policies"){
            this.state.roles[index][type].push(selectedOption[0].value);
        }else{
            let value = selectedOption[0].value;
            if(type === "trust_relationship"){
                value = selectedOption;
            }
            this.state.roles[index][type] = value;
        }
    };

    /* MODAL NOVO CHECK*/
    handleClose(e){ 
        //console.log(e, e.target);
        if(e != undefined && e.target.value === "new_check"){
            this.requestDeleteRoleType();
        }
        this.setState({showModal:false}) ;
    }
    handleShow(){ 
        this.setState({showModal:true}); 
    }

    onChangeGetPolicy(e){
        
        if(e != undefined && e.target.value.length != 0){
            fetch(process.env.REACT_APP_ENDPOINT+"/role/"+e.target.value,{
                method:"GET", mode:"cors"
            })
            .then(resp => resp.json())
            .then(data => {
                let type_role_json =  data.type_role[0] ;
                let roles =  JSON.parse( type_role_json.Roles ) ;

                this.setState({ 
                    document_name: type_role_json.RoleType,
                    description: type_role_json.Description,
                    roles: roles,
                    delete_policy: type_role_json.RoleType
                });
            //     console.log(roles);
            //     // this.setState({ trusts_select: [ { "value":"ADFS" ,"label":"ADFS" } ] } );
            //     // FAZER UM FETCH NAS POLICIES PARA OBTER OS TRUTS E POLICIES
            //     // removing the duplicates and setting the values in select tag
            //     let trust_ar = []; let policy_ar = []; let role_ar = [];
            //     // data.message.TrustRelationships.map((elem, index)=>{
            //     //     trust_ar[index] = { "value":elem['Name'] ,"label":elem['Name'] };
            //     // })
            //     data.message.Policies.map((elem,index)=>{
            //         policy_ar[index] = { "value":elem['Name'], "label":elem['Name'] };
            //     });
            //     // // data.message.Roles.map((elem,index)=>{
            //     // //     role_ar[index] = { "value":elem['Name'], "label":elem['Name'] };
            //     // // });
            //     this.setState({ 
            //         // description: data.message.Description,
            //         // trusts: trust_ar,
            //         // roles:  [],
            //         // policies: policy_ar,
            //         // trusts_select: trust_ar,
            //         // roles_select: role_ar,
            //         policies_select: policy_ar
            //     });
                
            });


        // if the value is null, show the first view
        }else if(e != undefined && e.target.value.length == 0){
            this.setState({ 
                document_name: "",
                description: "",
                trusts: [],
                policies: [],
                roles: [],
                delete_policy: "não declarado"
            });
        }
    }

    render(){
        //console.log(this.state.data);
        const { document_name, description, trusts, policies, roles, roles_available, showModal, delete_policy, roles_select, trusts_select, policies_select } = this.state;
        console.log("trusts_select:",trusts_select);
        let html_delete_button = "";
        if(delete_policy != "não declarado"){
            html_delete_button = <Button variant="danger" className="" onClick={this.handleShow.bind(this)} >Deletar "{delete_policy}"</Button>;
        }
        // VER https://www.robinwieruch.de/react-fetching-data
        return (
            <section className="margin_header_forms">
                {/* <h1>Gerenciar policies</h1> */}

                <div className="header_buttons">
                    {html_delete_button}

                    <Form className="space_y" >
                        <Form.Group controlId="exampleForm.ControlSelect1">
                            <Form.Label>Selecionar tipo de role da conta:</Form.Label>
                            <Form.Control as="select" className="header_button_select"
                                onChange={this.onChangeGetPolicy.bind(this)} 
                                >
                                <option key="null" value="" >Criar novo documento</option>
                                {roles_available && roles_available.map((elem,index) =>{
                                    return <option key={elem} value={elem} >{elem}</option>;
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Form>


                    <Modal show={showModal} onHide={this.handleClose.bind(this)} animation={false}>
                        <Modal.Header closeButton>
                            <Modal.Title>Novo check</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Essa ação irá deletar o documento "{delete_policy}" permanentemente. Deseja continuar?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="success" value="new_check" onClick={this.handleClose.bind(this)}>
                                Sim
                            </Button>
                            <Button variant="danger" onClick={this.handleClose.bind(this)}>
                                Não
                            </Button>
                        </Modal.Footer>
                    </Modal> 
                    
                {/* <img className="centralize-img2" src="images/loading-spinning-bubbles.svg" /> */}
                </div>

                <Form className="padding_header_forms" name="form_trust" onSubmit={this.onSubmit.bind(this)}>
                    {/* <h1 id="policy_titles">Description of "{document_name}"</h1> */}
                    <div className="form-group row">
                        <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">Tipo da conta: </label>
                        <div className="col-sm-10">
                            <input type="text" name="role_type" 
                            onChange={(e) => this.onChangeForms("role_type",null,e)}
                            className="form-control" placeholder="policies-cloud" defaultValue={document_name} />
                        </div>
                    </div>

                    <div className="form-group row">
                        <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">Description: </label>
                        <div className="col-sm-10">
                            <input type="text" name="Description" 
                            onChange={(e) => this.onChangeForms("description",null,e)}
                            className="form-control" placeholder="This document..." defaultValue={description} />
                        </div>
                    </div>
                    <h1 id="policy_titles">Roles</h1>
                    {/* <Form name="form_role" onSubmit={this.onSubmit}> */}
                    {roles.map((role, index) => {
                        return (
                            <div className="form_margin_bottom shadow" key={`${role['Name']}~${index}`}>
                                <div className="form-group row">
                                    <label htmlFor="role_name" className="col-sm-3 col-form-label bolder">Name: </label>
                                    <div className="col-sm-9">
                                        {/* <input type="text" name="Name"
                                        onChange={(e) => this.onChangeForms("role",index,e)}
                                        className="form-control" placeholder="seginfo" defaultValue={role['Name']} /> */}
                                        {/* <Select className="trust_relationship" closeMenuOnSelect={true} options={roles_select} 
                                        //defaultValue={roles[0]}
                                        onChange={e => this.onChangeSelect(e.value, "role_name", index)}
                                        /> */}
                                        
                                        <input type="text" name="role_name" 
                                        onChange={(e) => this.onChangeForms("role_name",index,e)}
                                        className="form-control" placeholder="accessmngt" 
                                        defaultValue={role['role_name']}
                                        //onChange={e => this.onChangeSelect(e.value, "policy_arn", index)}
                                        />


                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="name_role" className="col-sm-3 col-form-label bolder">Description: </label>
                                    <div className="col-sm-9">
                                        <input type="text" name="role_description"
                                        onChange={(e) => this.onChangeForms("role_description",index,e)}
                                        className="form-control" placeholder="" defaultValue={role['role_description']} />
                                    </div>
                                </div>                            
                                <div className="form-group row">
                                    <label htmlFor="policies_role" className="col-sm-3 col-form-label bolder">Policies: </label>
                                    <div className="col-sm-9">
                                        {/* <input type="text" name="Policies" 
                                        onChange={(e) => this.onChangeForms("role",index,e)}
                                        className="form-control" placeholder="policy-example" defaultValue={role['Policies']} /> */}
                                        <Select className="policies" closeMenuOnSelect={false} isMulti 
                                        options={policies_select} 
                                        // options={this.trusts_select } 
                                        defaultValue={ 
                                            role['policies'].map(elem => {
                                                return { "value":elem ,"label":elem }
                                            }) 
                                        }
                                        onChange={e_arr => this.onChangeSelect(e_arr, "policies", index)}
                                        />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="policyArnAws_role" className="col-sm-3 col-form-label bolder">PolicyArnAWS: </label>
                                    <div className="col-sm-9">
                                        <input type="text" name="policy_arn_aws" 
                                        // onChange={this.handleInputChange}
                                        onChange={(e) => this.onChangeForms("policy_arn_aws",index,e)}
                                        className="form-control" placeholder="arn:aws:iam::aws:policy/ReadOnlyAccess" 
                                        defaultValue={role['policy_arn_aws']}
                                        //onChange={e => this.onChangeSelect(e.value, "policy_arn", index)}
                                        />
                                        <span className="text-note">Separar por vírgula se tiver mais de uma ARN</span>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="trustRelationship_role" className="col-sm-3 col-form-label bolder">TrustRelationship: </label>
                                    <div className="col-sm-9">
                                        <Select className="trust_relationship" closeMenuOnSelect={true} options={trusts_select} 
                                        defaultValue={ { "value":role['trust_relationship'] ,"label":role['trust_relationship'] } }
                                        onChange={e => this.onChangeSelect(e.value, "trust_relationship", index)}
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group col-sm-2">
                                    <button className="btn btn-danger" type="button"
                                    onClick={() => this.handleRemoveFields(index, "role")} 
                                    >Remover</button>
                                </div>

                            </div>
                        );
                    
                    })}
                     <button className="btn btn-primary form_margin_bottom" type="button"
                        onClick={() => this.handleAddFields("role")}
                        >Adicionar nova Policy</button>
                   

                    <Button block className="button_small_central" type="submit">Atualizar</Button>
                </Form>
                
            </section>
        );
    }

}