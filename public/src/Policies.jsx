import React from 'react';
import { Button, FormGroup, FormControl, FormLabel, Table, Form, Row, horizontal } from "react-bootstrap";
import './Policies.css';

// import { JsonEditor as Editor } from 'jsoneditor-react';
// import 'jsoneditor-react/es/editor.min.css';

// // import ace from 'brace';
// // import 'brace';
// // import 'brace/mode/json';
// // import 'brace/theme/github';

// import AceEditor from "react-ace";

// import "ace-builds/src-noconflict/mode-json";
// import "ace-builds/src-noconflict/theme-github";


export default class Login extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          description:"",
          trusts:[],
          policies:[],
          roles:[],
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
    
    render(){
        //console.log(this.state.data);
        const { description, trusts, policies, roles } = this.state;
        // VER https://www.robinwieruch.de/react-fetching-data
        return (
            <section className="forms">
                {/* <p>{data['Description']}</p> */}
                {/* <p>{data['Roles'][0]['Name']}</p> */}
                
                <h1 id="policy_titles">Trust Relationships</h1>
                

                <Form horizontal="true" onSubmit={this.onSubmit}>
                {trusts.map((trust) => {
                    console.log(trust);
                    return (
                        <div className="form_margin_bottom shadow" key={trust['Name']}>
                            <div className="form-group row">
                                <label htmlFor="name_trust" className="col-sm-1 col-form-label bolder">Name: </label>
                                <div className="col-sm-11">
                                    <input type="text" id="name_trust" name={"name_"+ trust['Name']} className="form-control" placeholder="Readonly" value={trust['Name']} />
                                </div>
                            </div>
                            <FormGroup controlId="email2" >
                                <FormLabel className="bolder">AssumeRolePolicyDocument:</FormLabel>
                                <FormControl name="name2" as="textarea" rows="12" defaultValue={JSON.stringify( trust['AssumeRolePolicyDocument'], null, '\t' )} />
                            </FormGroup>

                            {/* <Editor theme="ace/theme/github"  value={trust['AssumeRolePolicyDocument']} onChange="" name="unique_name" ace={ace} /> */}
                            {/* <Editor value={trust['AssumeRolePolicyDocument']} ace={ace} theme="ace/theme/github" /> */}
                            
                            {/* <FormGroup  controlId="email">
                                <FormLabel  >Name</FormLabel>
                                <FormControl autoFocus name="name" type="text" defaultValue={trust['Name']} />
                            </FormGroup>
                            <FormGroup controlId="email2" >
                                <FormLabel>AssumeRolePolicyDocument</FormLabel>
                                <FormControl name="name2" as="textarea" rows="12" defaultValue={JSON.stringify( trust['AssumeRolePolicyDocument'], null, '\t' )} />
                            </FormGroup> */}
                        </div>
                        // <div>
                        //     <p key={trust['Name']}>}</p>
                        //     <textarea key={trust['Name']} value={JSON.stringify( trust['AssumeRolePolicyDocument'] ) }  />
                        // </div>
                    );
                })}
                </Form>

                <h1 id="policy_titles">Roles</h1>
                <Form>
                {roles.map((role) => {
                    return (
                        <div className="form_margin_bottom shadow" key={role['Name']}>
                            <div className="form-group row">
                                <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">Name: </label>
                                <div className="col-sm-10">
                                    <input type="text" id="name_trust" name={"name_"+ role['Name']} className="form-control" placeholder="seginfo" value={role['Name']} />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">Policies: </label>
                                <div className="col-sm-10">
                                    <input type="text" id="name_trust" name={"name_"+ role['Policies']} className="form-control" placeholder="policy-example" value={role['Policies']} />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">PolicyArnAWS: </label>
                                <div className="col-sm-10">
                                    <input type="text" id="name_trust" name={"name_"+ role['PolicyArnAWS']} className="form-control" placeholder="arn:aws:iam::aws:policy/ReadOnlyAccess" value={role['PolicyArnAWS']} />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">TrustRelationship: </label>
                                <div className="col-sm-10">
                                    <input type="text" id="name_trust" name={"name_"+ role['TrustRelationship']} className="form-control" placeholder="ADFS" value={role['TrustRelationship']} />
                                </div>
                            </div>
                        </div>
                    );
                 
                })}
                </Form>

                <h1 id="policy_titles">Policies</h1>
                <Form>
                {policies.map((policy) => {
                    return (
                        <div className="form_margin_bottom shadow" key={policy['Name']}>
                            <div className="form-group row">
                                <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">Name: </label>
                                <div className="col-sm-10">
                                    <input type="text" id="name_trust" name={"name_"+ policy['Name']} className="form-control" placeholder="seginfo" value={policy['Name']} />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">Description: </label>
                                <div className="col-sm-10">
                                    <input type="text" id="name_trust" name={"name_"+ policy['Name']} className="form-control" placeholder="seginfo" value={policy['Description']} />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">Path: </label>
                                <div className="col-sm-10">
                                    <input type="text" id="name_trust" name={"name_"+ policy['Path']} className="form-control" placeholder="seginfo" value={policy['Path']} />
                                </div>
                            </div>
                            <FormGroup  controlId="email2" bssize="large">
                                <FormLabel className="bolder">AssumeRolePolicyDocument</FormLabel>
                                <FormControl name="name2" as="textarea" rows="12" defaultValue={JSON.stringify( policy['PolicyDocument'], null, '\t' )} />
                            </FormGroup>                                                                              
                        </div>
                    );
                })}
                </Form>
                
            </section>
        );
    }

}