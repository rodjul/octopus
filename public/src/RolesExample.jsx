import React from 'react';
import { Button, FormGroup, FormLabel, Form, Tab,Tabs, Modal } from "react-bootstrap";
import './Policies.css';

import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';


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
          policies_available: [],
          delete_policy: "não declarado",
          test:""
      };
    }
    
    componentDidMount(){
        // Policies - Name, Description, Path, PolicyDocument
        // Roles  - Name, Policies[], PolicyArnAWS[] , TrustRelationship
        // TrustRelationships - Name, AssumeRolePolicyDocument
        // fetch(process.env.REACT_APP_ENDPOINT+"/policy/default")
        // .then(resp => resp.json())
        // .then(data => {
        //     if(data.message === "Internal server error"){
        //         console.error("Error in fetching data");
        //     }else{
        //         console.log(data);
        //         this.setState({ description: data.message.Description,
        //                         trusts: data.message.TrustRelationships,
        //                         policies: data.message.Policies,
        //                         roles:  data.message.Roles});
        //         }
        //     }
        // )
        
        fetch(process.env.REACT_APP_ENDPOINT+"/policy/available")
        .then(resp => resp.json())
        .then(data => {
            if(data.message === "Internal server error"){
                console.error("Error in fetching data");
            }else{
                console.log(data);
                this.setState({ policies_available: data.policies});
                }
            }
        )


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
        // console.log(event.target);
        // console.log(event.target[0].value);
        console.log(this.state.document_name);
        let format = {
            Name: this.state.document_name,
            Description: this.state.description,
            TrustRelationships: this.state.trusts,
            Policies: this.state.policies,
            Roles: this.state.roles,
        };
        console.log(JSON.stringify(format));
        fetch(process.env.REACT_APP_ENDPOINT+"/policy/update",{
            method:"POST", mode:"cors",
            body: JSON.stringify( {"policy_name":this.state.document_name, "policy_data":format} )
        })
        .then(resp => resp.json())
    }

    requestDeletePolicy(){
        fetch(process.env.REACT_APP_ENDPOINT+"/policy/delete",{
            method:"POST", mode:"cors",
            body: JSON.stringify( {"policy_name":this.state.delete_policy} )
        })
        .then(resp => resp.json())
        .then( _ => {
            let index = this.state.policies_available.indexOf(this.state.delete_policy);
            let new_available = this.state.policies_available;
            new_available.splice(index, 1);
            this.setState({ 
                policies_available: new_available,
                document_name: "",
                description:"",
                trusts:[],
                policies:[],
                roles:[],
                policies_available: [],
                delete_policy: "não declarado"
            });
        } )
    }

    onChangeGetPolicy(e){
        if(e != undefined && e.target.value.length != 0){
            fetch(process.env.REACT_APP_ENDPOINT+"/policy/"+e.target.value,{
                method:"GET", mode:"cors"
            })
            .then(resp => resp.json())
            .then(data => {
                // console.log("Data:",data);
                if( data['policy'][0].hasOwnProperty("Data") ){
                    let policy = JSON.parse(data['policy'][0]['Data']);
                    // console.log(policy);
                    this.setState({ 
                        document_name: policy.Name,
                        description: policy.Description,
                        trusts: policy.TrustRelationships,
                        policies: policy.Policies,
                        roles: policy.Roles,
                        delete_policy: policy.Name
                    });
                }else{
                    let policy = data['policy'][0];
                    this.setState({ 
                        document_name: policy.PolicyName,
                        description: "",
                        trusts: [],
                        policies: [],
                        roles: [],
                        delete_policy: policy.PolicyName
                    });
                }
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

    // https://dev.to/fuchodeveloper/dynamic-form-fields-in-react-1h6c
    // add dynamically the part of the form
    handleAddFields = tipo => {
        //console.log(tipo);
        if(tipo === "trustrelationships"){
            const values = [...this.state.trusts];
            values.push({ Name: 'New Trust Relationship', AssumeRolePolicyDocument: {"null":true} });
            this.setState({trusts : values});

        }else if(tipo === "role"){
            const values = [...this.state.roles];
            values.push({ Name: 'New Role',Policies:"", PolicyArnAWS:"" , TrustRelationship:""});
            this.setState({roles : values});

        }else if(tipo === "policy"){
            const values = [...this.state.policies];
            values.push({ Name: 'New Policy', Description:"", Path:"", PolicyDocument:{"null":true} });
            this.setState({policies : values});
        }
    };
    
    // remove dynamically the part of the form
    handleRemoveFields = (index,type) => {
        if(type === "trustrelationships"){
            const values = [...this.state.trusts];
            values.splice(index, 1);
            this.setState({trusts : values});
        }else if(type === "role"){
            const values = [...this.state.trusts];
            values.splice(index, 1);
            this.setState({trusts : values});
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
        if(type==="trust"){
            this.state.trusts[index][event.target.name] = event.target.value;
            //this.setState( this.state.trusts );
        }else if(type==="role"){
            this.state.roles[index][event.target.name] = event.target.value;
            // this.setState( this.state.roles );
        }else if(type==="policy"){
            this.state.policies[index][event.target.name] = event.target.value;
            // this.setState( this.state.policies );
        }else if(type==="description"){
            this.state.description = event.target.value;
            // this.setState( this.state.policies );
        }
        
    }

    /* MODAL NOVO CHECK*/
    handleClose(e){ 
        //console.log(e, e.target);
        if(e != undefined && e.target.value === "new_check"){
            this.requestDeletePolicy();
        }
        this.setState({showModal:false}) ;
    }
    handleShow(){ 
        this.setState({showModal:true}); 
    }


    render(){
        //console.log(this.state.data);
        const { document_name, description, trusts, policies, roles, policies_available, showModal, delete_policy } = this.state;
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
                            <Form.Label>Selecionar policy:</Form.Label>
                            <Form.Control as="select" className="header_button_select"
                                onChange={this.onChangeGetPolicy.bind(this)} 
                                >
                                <option key="null" value="" >Criar novo documento</option>
                                {policies_available && policies_available.map((elem,index) =>{
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
                        <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">Document name: </label>
                        <div className="col-sm-10">
                            <input type="text" name="Description" 
                            //onChange={(e) => this.onChangeForms("description",null,e)}
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


                    <h1 id="policy_titles">Trust Relationships</h1>
                    <p className="disclaimer">OBS: os documentos que possuírem "ACCOUNT_ID" no lugar da Account ID, irão ser interpretados pelo código para serem substituídos pelo valor do Account ID.</p>
                    {trusts.map((trust, index) => {
                        //console.log(trust['AssumeRolePolicyDocument']);
                        //console.log(trust['Name']);
                        return (
                            <div className="form_margin_bottom shadow" key={`${trust['Name']}~${index}`}>
                                <div className="form-group row">
                                    <label htmlFor="name_trust" className="col-sm-1 col-form-label bolder">Name: </label>
                                    <div className="col-sm-11">
                                        <input type="text" id="name_trust" name="Name" 
                                        onChange={(e) => this.onChangeForms("trust",index,e)}
                                        className="form-control" placeholder="Readonly" defaultValue={trust['Name']} />
                                    </div>
                                    {/* <label htmlFor="name_trust" className="col-sm-1 col-form-label bolder">Description: </label>
                                    <div className="col-sm-11">
                                        <input type="text" id="name_trust" name={"name_"+ trust['Name']} className="form-control" placeholder="Readonly" defaultValue={trust['Name']} />
                                    </div> */}
                                </div>
                                <div className="form_margin_bottom">
                                    <FormGroup>
                                        <FormLabel htmlFor="assumerolepolicydocument_" className="bolder">AssumeRolePolicyDocument: </FormLabel>
                                        {/* <FormControl name={"assumerolepolicydocument_"+ trust['Name']} as="textarea" rows="12" defaultValue={JSON.stringify( trust['AssumeRolePolicyDocument'], "", '\t' )} /> */}
                                    </FormGroup>
                                    
                                    <Tabs defaultActiveKey="json" id="uncontrolled-tab-example">

                                        <Tab eventKey="json" title="JSON">

                                            {/* https://github.com/AndrewRedican/react-json-editor-ajrm */}
                                            <JSONInput onChange={(e) => this.onChangeJson("trust",index,e)} className="custom-rod" name="teste"
                                                id          = 'json_editor'
                                                placeholder = { trust['AssumeRolePolicyDocument'] }
                                                //theme="light_mitsuketa_tribute"
                                                // colors      = { {
                                                //     string: "#DAA520" // overrides theme colors with whatever color value you want
                                                //   }}
                                                locale      = { locale }
                                                height      = 'auto'
                                                width       = 'auto'
                                            />

                                        </Tab>
                                        <Tab eventKey="editor" title="Editor">
                                            <p>item 2</p>
                                        </Tab>
                                    </Tabs>

                                    
                                </div>

                                
                                <div className="form-group col-sm-2">
                                    <button className="btn btn-danger" type="button"
                                    onClick={() => this.handleRemoveFields(index, "trustrelationships")} 
                                    >Remover</button>
                                </div>

                            </div>
                        );
                    })}
                        <button className="btn btn-primary form_margin_bottom" type="button"
                        onClick={() => this.handleAddFields("trustrelationships")}
                        >Adicionar novo Trust Relationship</button>

                        {/* <Button block bssize="small" type="submit">Atualizar</Button> */}
                    {/* </Form> */}

                    <h1 id="policy_titles">Roles</h1>
                    {/* <Form name="form_role" onSubmit={this.onSubmit}> */}
                    {roles.map((role, index) => {
                        return (
                            <div className="form_margin_bottom shadow" key={role['Name']}>
                                <div className="form-group row">
                                    <label htmlFor="name_role" className="col-sm-3 col-form-label bolder">Name: </label>
                                    <div className="col-sm-9">
                                        <input type="text" name="Name"
                                        onChange={(e) => this.onChangeForms("role",index,e)}
                                        className="form-control" placeholder="seginfo" defaultValue={role['Name']} />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="name_role" className="col-sm-3 col-form-label bolder">Description: </label>
                                    <div className="col-sm-9">
                                        <input type="text" name="Description"
                                        onChange={(e) => this.onChangeForms("role",index,e)}
                                        className="form-control" placeholder="" defaultValue={role['Name']} />
                                    </div>
                                </div>                            
                                <div className="form-group row">
                                    <label htmlFor="policies_role" className="col-sm-3 col-form-label bolder">Policies: </label>
                                    <div className="col-sm-9">
                                        <input type="text" name="Policies" 
                                        onChange={(e) => this.onChangeForms("role",index,e)}
                                        className="form-control" placeholder="policy-example" defaultValue={role['Policies']} />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="policyArnAws_role" className="col-sm-3 col-form-label bolder">PolicyArnAWS: </label>
                                    <div className="col-sm-9">
                                        <input type="text" name="PolicyArnAWS" 
                                        // onChange={this.handleInputChange}
                                        onChange={(e) => this.onChangeForms("role",index,e)}
                                        className="form-control" placeholder="arn:aws:iam::aws:policy/ReadOnlyAccess" defaultValue={role['PolicyArnAWS']} />
                                        <span className="text-note">Separar por vírgula se tiver mais de uma ARN</span>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="trustRelationship_role" className="col-sm-3 col-form-label bolder">TrustRelationship: </label>
                                    <div className="col-sm-9">
                                        <input type="text" name="TrustRelationship" 
                                        onChange={(e) => this.onChangeForms("role",index,e)}
                                        className="form-control" placeholder="ADFS" defaultValue={role['TrustRelationship']} />
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
                    {/* <Button block bssize="large" disabled={!this.validateForm()} type="submit"></Button> */}

                        <button className="btn btn-primary form_margin_bottom" type="button"
                        onClick={() => this.handleAddFields("role")}
                        >Adicionar nova Policy</button>

                        {/* <Button block bssize="large" type="submit">Atualizar</Button> */}
                    {/* </Form> */}

                    <h1 id="policy_titles">Policies</h1>
                    {/* <Form name="form_policies" onSubmit={this.onSubmit}> */}
                    {policies.map((policy, index) => {
                        return (
                            <div className="form_margin_bottom shadow" key={policy['Name']}>
                                <div className="form-group row">
                                    <label htmlFor="name_policy" className="col-sm-2 col-form-label bolder">Name: </label>
                                    <div className="col-sm-10">
                                        <input type="text" name="Name"
                                        onChange={(e) => this.onChangeForms("policy",index,e)}
                                        className="form-control" placeholder="policy-seginfo" defaultValue={policy['Name']} />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="description_policy" className="col-sm-2 col-form-label bolder">Description: </label>
                                    <div className="col-sm-10">
                                        <input type="text" name="Description"
                                        onChange={(e) => this.onChangeForms("policy",index,e)}
                                        className="form-control" placeholder="Policy with read only" defaultValue={policy['Description']} />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="path_policy" className="col-sm-2 col-form-label bolder">Path: </label>
                                    <div className="col-sm-10">
                                        <input type="text" name="Path"
                                        onChange={(e) => this.onChangeForms("policy",index,e)}
                                        className="form-control" placeholder="/" defaultValue={policy['Path']} />
                                    </div>
                                </div>

                                <div className="form_margin_bottom">
                                    <FormGroup controlId="email2" bssize="large">
                                        <FormLabel className="bolder">AssumeRolePolicyDocument: </FormLabel>
                                        {/* <FormControl name={"textarea_"+ policy['Name']} as="textarea" rows="12" defaultValue={JSON.stringify( policy['PolicyDocument'], null, '\t' )} /> */}
                                    </FormGroup>
                                    <JSONInput onChange={(e) => this.onChangeJson("policy", index, e)} className="custom-rod"
                                            id          = 'json_editor'
                                            placeholder = { policy['PolicyDocument'] }
                                            locale      = { locale }
                                            height      = 'auto'
                                            width       = 'auto'
                                    /> 
                                </div>

                                <div className="form-group col-sm-2">
                                    <button className="btn btn-danger" type="button"
                                    onClick={() => this.handleRemoveFields(index, "trustrelationships")} 
                                    >Remover</button>
                                </div>

                            </div>
                        );
                    })}

                    <button className="btn btn-primary form_margin_bottom" type="button"
                    onClick={() => this.handleAddFields("policy")}
                    >Adicionar nova Policy</button>

                    <Button block className="button_small_central" type="submit">Atualizar</Button>
                </Form>
                
            </section>
        );
    }

}