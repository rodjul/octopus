import React from 'react';
import { Button, FormGroup, FormLabel, Form, Modal, Tab, Tabs } from "react-bootstrap";
import './Policies.css';

import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';


/**
 * The PureComponente is almost equal to shouldComponentUpdate() which do a comparation in each component
 * for what has changed their values
 * @see see https://pt-br.reactjs.org/docs/optimizing-performance.html#examples
 */
export default class Policies extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {
          showModal: false,
          trusts:[],
          policies:[],
          actionModal: "",
          modalMessage: ""
      };
    }
    
    
    /**
     * When the components are ready, execute this first and fetch for the roles available, then fetch for the policies
     */    
    componentDidMount(){
        // Policies - Name, Description, Path, PolicyDocument
        // Roles  - Name, Policies[], PolicyArnAWS[] , TrustRelationship
        // TrustRelationships - Name, AssumeRolePolicyDocument
        // fetch(process.env.REACT_APP_ENDPOINT+"/policy/default")
        fetch(process.env.REACT_APP_ENDPOINT+"/policy/content")
        .then(resp => resp.json())
        .then(data => {
            if(data.message === "Internal server error"){
                console.error("Error in fetching data");
            }else{
                // console.log(data);
                let policies_json = JSON.parse(data['policies']);
                let trusts_json = JSON.parse(data['trusts']);
                let tmp_trusts = [];
                let tmp_policies =[];
                policies_json.map( elem => tmp_policies.push( JSON.parse(elem['Data']) ) );
                trusts_json.map(elem => tmp_trusts.push( JSON.parse(elem['Data']) ) );
                
                console.log(tmp_trusts);
                this.setState({ 
                    // trusts: data.message.TrustRelationships,
                    // policies: data.message.Policies
                    trusts: tmp_trusts,
                    policies: tmp_policies
                });
            }
        })
    }

   /**
    * Dynamic forms which add new field on the form
    * @see see https://dev.to/fuchodeveloper/dynamic-form-fields-in-react-1h6c
    */
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

    /**
     * Dynamic form which removes dynamically the part of the form
     */
    handleRemoveFields = (index,type) => {
        if(type === "trustrelationships"){
            const values = [...this.state.trusts];
            values.splice(index, 1);
            this.setState({trusts : values});
        }else if(type === "policy"){
            const values = [...this.state.policies];
            values.splice(index, 1);
            this.setState({policies : values});
        }
    };

    /**
     * Handle the general modal. This function close the modal
     */
    handleModalCloseActions = () => this.setState({showModal:false}) ;

    /**
     * Handle the input change for the json field
     * @param {str} type 
     * @param {int} index
     * @param {Object} event
     */    
    onChangeJson = (type,index,event) => {
        //console.log(event.jsObject);
        //console.log(index);
        if(type === "trust"){
            let tmp_trusts = this.state.trusts;
            tmp_trusts[index]['AssumeRolePolicyDocument'] = event.jsObject;
            this.setState({ trusts: tmp_trusts });
        }
        else if(type === "policy"){
            let tmp_policies = this.state.policies;
            tmp_policies[index]['PolicyDocument'] = event.jsObject;
            this.setState({ policies: tmp_policies });
        }
        // console.log(this.state);
    }

    /**
     * Handle the changes inputs for each field
     * @param {str} type 
     * @param {int} index
     * @param {Object} event
     */    
    onChangeForms = (type, index, event) => {
        if(type==="trust"){
            let regex = new RegExp("\\s+|[.,/#!$%^&*;:{}=_`~()@¨'\"+[\\]`´?><]");
            // if does not contains space, set the state
            if(!regex.test(event.target.value)){
                let tmp_trusts = this.state.trusts;
                tmp_trusts[index][event.target.name] = event.target.value
                this.setState({ trusts: tmp_trusts });
            }else{
                // if it does, set the value of the state (not from the event input)
                event.target.value = this.state.trusts[index][event.target.name];
            }
            // let tmp_trusts = this.state.trusts;
            // tmp_trusts[index][event.target.name] = event.target.value;
            // this.setState( { trusts: tmp_trusts } );
            this.state.trusts[index][event.target.name] = event.target.value;
        }else if(type==="policy"){
            // let tmp_policies = this.state.policies;
            // tmp_policies[index][event.target.name] = event.target.value;
            // this.setState( { policies: tmp_policies } );
            this.state.policies[index][event.target.name] = event.target.value;
        }else if(type==="policy_name"){
            let regex = new RegExp("\\s+|[.,/#!$%^&*;:{}=_`~()@¨'\"+[\\]`´?><]");
            // if does not contains space, set the state
            if(!regex.test(event.target.value)){
                let tmp_policies = this.state.policies;
                tmp_policies[index][event.target.name] = event.target.value
                this.setState({ policies: tmp_policies });
            }else{
                // if it does, set the value of the state (not from the event input)
                event.target.value = this.state.policies[index][event.target.name];
            }
        }
        
    }

    /**
     * Handle the input changes for each field
     * @param {Object} event
     */
    onSubmitForm(event){
        event.preventDefault();
        // console.log(event.target);
        // console.log(event.target[0].value);
        // console.log(this.state.document_name);
        //let format = {
            //Name: this.state.document_name,
            //Description: this.state.description,
            //TrustRelationships: this.state.trusts,
            //Policies: this.state.policies
            //Roles: this.state.roles,
        //};
        
        // return ;
        fetch(process.env.REACT_APP_ENDPOINT+"/policy/update",{
            method:"POST", mode:"cors",
            body: JSON.stringify( {"policies":this.state.policies, "trusts_relationship":this.state.trusts} )
        })
        .then(resp => {
            if( resp.status === 502 ){
                this.setState({
                    showModal: true,
                    actionModal: "Erro ao atualizar",
                    modalMessage: "Ocorreu um erro ao executar essa ação"
                });
            }else if( resp.status === 400 ){
                this.setState({
                    showModal: true,
                    actionModal: "Erro ao atualizar",
                    modalMessage: "Todos os campos precisam ser preenchidos"
                });
            }else if( resp.status === 200 ){
                this.setState({
                    showModal: true,
                    actionModal: "Atualizar",
                    modalMessage: "Executado com sucesso"
                });
            }
        })
        
    }    

    render(){
        //console.log(this.state.data);
        const { trusts, policies, showModal, actionModal, modalMessage } = this.state;
        
        return (
            <section className="">
                {/* <h1>Gerenciar policies</h1> */}


                <Form className="padding_header_forms" name="form_trust" onSubmit={this.onSubmitForm.bind(this)}>

                    <Tabs defaultActiveKey="Policies" id="uncontrolled-tab-example">

                        <Tab eventKey="Policies" title="Policies">
                            <h1 id="policy_titles">Policies</h1>
                        
                            {policies.map((policy, index) => {
                                return (
                                    <div className="form_margin_bottom shadow" key={policy['Name']}>
                                        <div className="form-group row">
                                            <label htmlFor="name_policy" className="col-sm-2 col-form-label bolder">Name: </label>
                                            <div className="col-sm-10">
                                                <input type="text" name="Name"
                                                onChange={(e) => this.onChangeForms("policy_name",index,e)}
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
                                                onChange={(e) => this.onChangeForms("policy_path",index,e)}
                                                className="form-control" placeholder="/" defaultValue={policy['Path']} />
                                            </div>
                                        </div>

                                        <div className="form_margin_bottom">
                                            <FormGroup controlId="email2" bssize="large">
                                                <FormLabel className="bolder">PolicyDocument: </FormLabel>
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
                                            onClick={() => this.handleRemoveFields(index, "policy")} 
                                            >Remover</button>
                                        </div>

                                    </div>
                                );
                            })}

                            <button className="btn btn-primary form_margin_bottom" type="button"
                            onClick={() => this.handleAddFields("policy")}
                            >Adicionar nova Policy</button>
                        </Tab>

                        <Tab eventKey="Trust" title="Trust Relationships">
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
                        </Tab>

                    </Tabs>
                    
                    <Button block className="button_small_central" type="submit">Atualizar</Button>
                </Form>

                <Modal show={showModal} onHide={this.handleModalCloseActions.bind(this)} animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>{actionModal} documento</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{modalMessage}</Modal.Body>
                    <Modal.Footer>
                        <Button className="centralize-elements" variant="info" onClick={this.handleModalCloseActions.bind(this)}>
                            OK
                        </Button>
                    </Modal.Footer>
                </Modal>
                
                
            </section>
        );
    }

}