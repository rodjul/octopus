import React from 'react';
import { Button, FormGroup, FormControl, FormLabel, Table, Form, Row, horizontal } from "react-bootstrap";
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';
import "./ManageAccounts.css";

export default class ManageAccounts extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        accounts: []
    };
    }

    componentDidMount(){
        fetch("https://dq8yro2vbd.execute-api.us-east-2.amazonaws.com/dev/account/organizations")
        .then(resp => resp.json())
        .then(data => this.setState( {accounts:data['accounts']} ))
        
    }

    render(){
        const {accounts} = this.state;
        return (
            <section>

                 {/* {accounts.map((field,index) => {
                    console.log(field);
                    // Id, Arn, Email, Name, Status, JoinedMethod
                    return (
                         <p key={`${field['Name']}~${index}`}>{field['Name']}</p>
                    );
                 
                })} */}

            </section>
        );
    }

}


// <section>
//                 <section className="forms">
//                     <form className="shadow" onSubmit={this.onSubmit} >
//                         <h2 id="policy_titles">Atualizar policy de uma role</h2>
//                         <FormGroup controlId="email" bssize="large">
//                             <FormLabel>Role para atualizar</FormLabel>
//                             <FormControl as="select" name="role_cloudformation">
//                                 <option>octopusmngt</option>
//                             {roles.map((role, index) => {
//                                 return (
//                                     <option key={`${role['Name']}~${index}`}>{role['Name']}</option>
//                                 );
//                             })}
//                             </FormControl>
//                         </FormGroup>

//                         <FormGroup controlId="name" bssize="large">
//                             <FormLabel>Nome da conta</FormLabel>
//                             <FormControl name="name" type="name" ></FormControl>

//                         </FormGroup>
                        
//                         {/* <FormGroup controlId="conta.controlSelect">
//                             <FormLabel>Tipo da conta</FormLabel>
//                             <FormControl as="select" name="role_cloudformation">
//                             {roles.map((role, index) => {
//                                 return (
//                                     <option>{role['Name']}</option>
//                                 );
//                             })}
//                             </FormControl>
//                         </FormGroup> */}
//                         <Button block bssize="large" type="submit"> 
//                             Aplicar nas contas
//                         </Button>
//                     </form>
//                 </section>
//                 <section className="forms">
//                     <form>
//                         <div className="form_margin_bottom shadow">
//                             <h2 id="policy_titles" >Cria nova role</h2>
//                             <div className="form-group row">
//                                 <label htmlFor="name_policy" className="col-sm-2 col-form-label bolder">Name: </label>
//                                 <div className="col-sm-10">
//                                     <input type="text" name="Name"
//                                     // onChange={(e) => this.onChangeForms("policy",index,e)}
//                                     className="form-control" placeholder="policy-seginfo" defaultValue="" />
//                                 </div>
//                             </div>
//                             <div className="form-group row">
//                                 <label htmlFor="description_policy" className="col-sm-2 col-form-label bolder">Description: </label>
//                                 <div className="col-sm-10">
//                                     <input type="text" name="Description"
//                                     // onChange={(e) => this.onChangeForms("policy",index,e)}
//                                     className="form-control" placeholder="Policy with read only" defaultValue="{policy['Description']}" />
//                                 </div>
//                             </div>
//                             <div className="form-group row">
//                                 <label htmlFor="path_policy" className="col-sm-2 col-form-label bolder">Path: </label>
//                                 <div className="col-sm-10">
//                                     <input type="text" name="Path"
//                                     // onChange={(e) => this.onChangeForms("policy",index,e)}
//                                     className="form-control" placeholder="/" defaultValue="{policy['Path']}" />
//                                 </div>
//                             </div>

//                             <div className="form_margin_bottom">
//                                 <FormGroup controlId="email2" bssize="large">
//                                     <FormLabel className="bolder">AssumeRolePolicyDocument: </FormLabel>
//                                     {/* <FormControl name={"textarea_"+ policy['Name']} as="textarea" rows="12" defaultValue={JSON.stringify( policy['PolicyDocument'], null, '\t' )} /> */}
//                                 </FormGroup>
//                                 <JSONInput className="custom-rod"
//                                         //onChange={(e) => this.onChangeJson("policy", index, e)} 
//                                         id          = 'json_editor'
//                                         placeholder = {  { "null":true}  }
//                                         locale      = { locale }
//                                         height      = 'auto'
//                                         width       = 'auto'
//                                 /> 
//                             </div>
//                         {/* role */}
//                         {/* <div className="form_margin_bottom shadow" > */}
//                             <div className="form-group row">
//                                 <label htmlFor="name_role" className="col-sm-3 col-form-label bolder">Name: </label>
//                                 <div className="col-sm-9">
//                                     <input type="text" name="Name"
//                                     // onChange={(e) => this.onChangeForms("role",index,e)}
//                                     className="form-control" placeholder="seginfo" defaultValue="" />
//                                 </div>
//                             </div>
//                             <div className="form-group row">
//                                 <label htmlFor="policies_role" className="col-sm-3 col-form-label bolder">Policies: </label>
//                                 <div className="col-sm-9">
//                                     <input type="text" name="Policies" 
//                                     // onChange={(e) => this.onChangeForms("role",index,e)}
//                                     className="form-control" placeholder="policy-example" defaultValue="" />
//                                 </div>
//                             </div>
//                             <div className="form-group row">
//                                 <label htmlFor="policyArnAws_role" className="col-sm-3 col-form-label bolder">PolicyArnAWS: </label>
//                                 <div className="col-sm-9">
//                                     <input type="text" name="PolicyArnAWS" 
//                                     // onChange={this.handleInputChange}
//                                     // onChange={(e) => this.onChangeForms("role",index,e)}
//                                     className="form-control" placeholder="arn:aws:iam::aws:policy/ReadOnlyAccess" defaultValue="" />
//                                     <span className="text-note">Separar por vírgula se tiver mais de uma ARN</span>
//                                 </div>
//                             </div>
//                             <div className="form-group row">
//                                 <label htmlFor="trustRelationship_role" className="col-sm-3 col-form-label bolder">TrustRelationship: </label>
//                                 <div className="col-sm-9">
//                                     <input type="text" name="TrustRelationship" 
//                                     // onChange={(e) => this.onChangeForms("role",index,e)}
//                                     className="form-control" placeholder="ADFS" defaultValue="" />
//                                 </div>
//                             </div>

//                         {/* trust relantioship */}
//                         {/* <div className="form_margin_bottom shadow"> */}
//                             <div className="form-group row">
//                                 <label htmlFor="name_trust" className="col-sm-1 col-form-label bolder">Name: </label>
//                                 <div className="col-sm-11">
//                                     <input type="text" id="name_trust" name="Name" 
//                                     //onChange={(e) => this.onChangeForms("trust",index,e)}
//                                     className="form-control" placeholder="Readonly" defaultValue="" />
//                                 </div>
//                             </div>
//                             <div className="form_margin_bottom">
//                                 <FormGroup>
//                                     <FormLabel htmlFor="assumerolepolicydocument_" className="bolder">AssumeRolePolicyDocument: </FormLabel>
//                                 </FormGroup>
                                
//                                 {/* https://github.com/AndrewRedican/react-json-editor-ajrm */}
//                                 <JSONInput className="custom-rod" name="teste"
//                                     //onChange={(e) => this.onChangeJson("trust",index,e)}
//                                     id          = 'json_editor'
//                                     placeholder = { { "null":true} }
//                                     //theme="light_mitsuketa_tribute"
//                                     // colors      = { {
//                                     //     string: "#DAA520" // overrides theme colors with whatever color value you want
//                                     //   }}
//                                     locale      = { locale }
//                                     height      = 'auto'
//                                     width       = 'auto'
//                                 />
//                             </div>
//                         </div>
//                     </form>
//                 </section>
//             </section>
        




