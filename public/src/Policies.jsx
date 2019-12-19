import React from 'react';
import { Button, FormGroup, FormControl, FormLabel, Table, Form, Row, horizontal } from "react-bootstrap";
import './Policies.css';

import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';


export default class Login extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          description:"",
          trusts:[],
          policies:[],
          roles:[],
          test:""
      };
  
    }
    
    componentDidMount(){
        // Policies - Name, Description, Path, PolicyDocument
        // Roles  - Name, Policies[], PolicyArnAWS[] , TrustRelationship
        // TrustRelationships - Name, AssumeRolePolicyDocument
        fetch("https://dq8yro2vbd.execute-api.us-east-2.amazonaws.com/dev/policy/default")
        .then(resp => resp.json())
        .then(data => this.setState({ description: data.message.Description,
                                    trusts: data.message.TrustRelationships,
                                    policies: data.message.Policies,
                                    roles:  data.message.Roles}))
    }
    
    handleInputChangeARN = (event) => {
        event.preventDefault();
        const {name, value} = event.target;
        //console.log(name,value);
        //let term = "arn:aws:iam::aws:policy/ReadOnlyAccess";
        let regex = new RegExp("arn:aws:iam::aws:policy\/([A-Za-z]+),*");
        console.log(value, regex.test(value));
        if(regex.test(value)){
            this.setState({test: value});
        }else{
            console.log(this.state.test);
            event.target.value = this.state.test;
            //this.setState({test: this.state.test});
        }
    }

    onSubmit = (event) => {
        event.preventDefault();
        console.log(event.target);
        console.log(event.target[0].value);
    }

    // https://dev.to/fuchodeveloper/dynamic-form-fields-in-react-1h6c
    // add dynamically the part of the form
    handleAddFields = tipo => {
        //console.log(tipo);
        if(tipo === "trustrelationships"){
            const values = [...this.state.trusts];
            values.push({ Name: '', AssumeRolePolicyDocument: {"null":true} });
            this.setState({trusts : values});

        }else if(tipo === "role"){
            const values = [...this.state.roles];
            values.push({ Name: '',Policies:"", PolicyArnAWS:"" , TrustRelationship:""});
            this.setState({roles : values});

        }else if(tipo === "policy"){
            const values = [...this.state.policies];
            values.push({ Name: '', Description:"", Path:"", PolicyDocument:{"null":true} });
            this.setState({policies : values});
        }
    };
    
    // remove dynamically the part of the form
    handleRemoveFields = (index,tipo) => {
        if(tipo === "trustrelationships"){
            const values = [...this.state.trusts];
            values.splice(index, 1);
            this.setState({trusts : values});
        }else if(tipo === "role"){
            const values = [...this.state.trusts];
            values.splice(index, 1);
            this.setState({trusts : values});
        }else if(tipo === "policy"){
            const values = [...this.state.trusts];
            values.splice(index, 1);
            this.setState({trusts : values});
        }
    };

    onChangeTest = (event) => {
        console.log(event);
    }

    render(){
        //console.log(this.state.data);
        const { description, trusts, policies, roles } = this.state;
        // VER https://www.robinwieruch.de/react-fetching-data
        return (
            <section className="forms">
     
                <h1 id="policy_titles">Trust Relationships</h1>
                
                <Form name="form_trust" onSubmit={this.onSubmit}>
                {trusts.map((trust, index) => {
                    //console.log(trust);
                    return (
                        <div className="form_margin_bottom shadow" key={`${trust['Name']}~${index}`}>
                            <div className="form-group row">
                                <label htmlFor="name_trust" className="col-sm-1 col-form-label bolder">Name: </label>
                                <div className="col-sm-11">
                                    <input type="text" id="name_trust" name={"name_"+ trust['Name']} className="form-control" placeholder="Readonly" defaultValue={trust['Name']} />
                                </div>
                            </div>
                            <div className="form_margin_bottom">
                                <FormGroup>
                                    <FormLabel htmlFor="assumerolepolicydocument_" className="bolder">AssumeRolePolicyDocument: </FormLabel>
                                    {/* <FormControl name={"assumerolepolicydocument_"+ trust['Name']} as="textarea" rows="12" defaultValue={JSON.stringify( trust['AssumeRolePolicyDocument'], "", '\t' )} /> */}
                                </FormGroup>
                                
                                {/* https://github.com/AndrewRedican/react-json-editor-ajrm */}
                                <JSONInput onChange={this.onChangeTest} className="custom-rod" name="teste"
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
                            </div>

                               
                            <div className="form-group col-sm-2">
                                <button className="btn btn-danger" type="button"
                                onClick={() => this.handleRemoveFields(index, "trustrelationships")} 
                                >Remover {trust['Name']}</button>
                            </div>

                        </div>
                    );
                })}
                    <button className="btn btn-primary form_margin_bottom" type="button"
                    onClick={() => this.handleAddFields("trustrelationships")}
                    >Adicionar novo Trust Relationships</button>

                    <Button block bssize="small" type="submit">Enviar</Button>
                </Form>

                <h1 id="policy_titles">Roles</h1>
                <Form name="form_role" onSubmit={this.onSubmit}>
                {roles.map((role, index) => {
                    // return (
                    //     <div className="form_margin_bottom shadow" key={role['Name']}>
                    //         <div className="form-group row">
                    //             <label htmlFor="name_role" className="col-sm-3 col-form-label bolder">Name: </label>
                    //             <div className="col-sm-9">
                    //                 <input type="text" id="name_trust" name={"name_"+ role['Name']} className="form-control" placeholder="seginfo" defaultValue={role['Name']} />
                    //             </div>
                    //         </div>
                    //         <div className="form-group row">
                    //             <label htmlFor="policies_role" className="col-sm-3 col-form-label bolder">Policies: </label>
                    //             <div className="col-sm-9">
                    //                 <input type="text" id="name_trust" name={"policies_"+ role['Name']} className="form-control" placeholder="policy-example" defaultValue={role['Policies']} />
                    //             </div>
                    //         </div>
                    //         <div className="form-group row">
                    //             <label htmlFor="policyArnAws_role" className="col-sm-3 col-form-label bolder">PolicyArnAWS: </label>
                    //             <div className="col-sm-9">
                    //                 <input type="text" id="name_trust" name={"policyarnaws_"+ role['Name']} onChange={this.handleInputChange} className="form-control" placeholder="arn:aws:iam::aws:policy/ReadOnlyAccess" defaultValue={role['PolicyArnAWS']} />
                    //                 <span className="text-note">Separar por vírgula se tiver mais de uma ARN</span>
                    //             </div>
                    //         </div>
                    //         <div className="form-group row">
                    //             <label htmlFor="trustRelationship_role" className="col-sm-3 col-form-label bolder">TrustRelationship: </label>
                    //             <div className="col-sm-9">
                    //                 <input type="text" id="name_trust" name={"trustrelationship_"+ role['Name']} className="form-control" placeholder="ADFS" defaultValue={role['TrustRelationship']} />
                    //             </div>
                    //         </div>
                            
                    //         <div className="form-group col-sm-2">
                    //             <button className="btn btn-danger" type="button"
                    //             onClick={() => this.handleRemoveFields(index, "role")} 
                    //             >Remover {role['Name']}</button>
                    //         </div>

                    //     </div>
                    // );
                 
                })}
                {/* <Button block bssize="large" disabled={!this.validateForm()} type="submit"></Button> */}

                    <button className="btn btn-primary form_margin_bottom" type="button"
                    onClick={() => this.handleAddFields("role")}
                    >Adicionar nova Policy</button>

                    <Button block bssize="large" type="submit">Enviar</Button>
                </Form>

                <h1 id="policy_titles">Policies</h1>
                <Form name="form_policies" onSubmit={this.onSubmit}>
                {policies.map((policy, index) => {
                    // return (
                    //     <div className="form_margin_bottom shadow" key={policy['Name']}>
                    //         <div className="form-group row">
                    //             <label htmlFor="name_policy" className="col-sm-2 col-form-label bolder">Name: </label>
                    //             <div className="col-sm-10">
                    //                 <input type="text" id="name_trust" name={"name_"+ policy['Name']} className="form-control" placeholder="policy-seginfo" defaultValue={policy['Name']} />
                    //             </div>
                    //         </div>
                    //         <div className="form-group row">
                    //             <label htmlFor="description_policy" className="col-sm-2 col-form-label bolder">Description: </label>
                    //             <div className="col-sm-10">
                    //                 <input type="text" id="name_trust" name={"name_"+ policy['Name']} className="form-control" placeholder="Policy with read only" defaultValue={policy['Description']} />
                    //             </div>
                    //         </div>
                    //         <div className="form-group row">
                    //             <label htmlFor="path_policy" className="col-sm-2 col-form-label bolder">Path: </label>
                    //             <div className="col-sm-10">
                    //                 <input type="text" id="name_trust" name={"name_"+ policy['Name']} className="form-control" placeholder="/" defaultValue={policy['Path']} />
                    //             </div>
                    //         </div>

                    //         <div className="form_margin_bottom">
                    //             <FormGroup controlId="email2" bssize="large">
                    //                 <FormLabel className="bolder">AssumeRolePolicyDocument: </FormLabel>
                    //                 {/* <FormControl name={"textarea_"+ policy['Name']} as="textarea" rows="12" defaultValue={JSON.stringify( policy['PolicyDocument'], null, '\t' )} /> */}
                    //             </FormGroup>
                    //             <JSONInput className="custom-rod"
                    //                     id          = 'json_editor'
                    //                     placeholder = { policy['PolicyDocument'] }
                    //                     locale      = { locale }
                    //                     height      = 'auto'
                    //                     width       = 'auto'
                    //             /> 
                    //         </div>

                    //         <div className="form-group col-sm-2">
                    //             <button className="btn btn-danger" type="button"
                    //             onClick={() => this.handleRemoveFields(index, "trustrelationships")} 
                    //             >Remover {policy['Name']}</button>
                    //         </div>

                    //     </div>
                    // );
                })}

                    <button className="btn btn-primary form_margin_bottom" type="button"
                    onClick={() => this.handleAddFields("policy")}
                    >Adicionar nova Policy</button>

                    <Button block bssize="large" type="submit">Enviar</Button>
                </Form>
                
            </section>
        );
    }

}