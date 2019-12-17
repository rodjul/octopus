import React from 'react';
import { Button, FormGroup, FormControl, FormLabel, Table } from "react-bootstrap";

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
                
                <h3>Trust Relationships</h3>
                <form onSubmit={this.onSubmit}>
                
                {trusts.map((trust) => {
                    console.log(trust);
                    return (
                        <div key={trust['Name']}>
                        <FormGroup  controlId="email" bssize="large">
                            <FormLabel>Name</FormLabel>
                            <FormControl autoFocus name="name" type="email" defaultValue={trust['Name']} />
                        </FormGroup>
                        <FormGroup  controlId="email2" bssize="large">
                            <FormLabel>AssumeRolePolicyDocument</FormLabel>
                            <FormControl name="name2" as="textarea" rows="3" defaultValue={JSON.stringify( trust['AssumeRolePolicyDocument'] )} />
                        </FormGroup>
                        </div>
                        // <div>
                        //     <p key={trust['Name']}>}</p>
                        //     <textarea key={trust['Name']} value={JSON.stringify( trust['AssumeRolePolicyDocument'] ) }  />
                        // </div>
                    );
                })}
                </form>
                
                <h3>Roles</h3>
                {roles.map((role) => {
                    return (
                        <div key={role['Name']}>
                            <p >Name: {role['Name']}</p>
                            <p >Policies: {role['Policies']}</p>
                            <p >PolicyArnAWS: {role['PolicyArnAWS']}</p>
                            <p >TrustRelationship: {role['TrustRelationship']}</p>
                        </div>
                    );
                 
                })}
                
                <h3>Policies</h3>
                {policies.map((policy) => {
                    return (
                        <div key={policy['Name']}>
                            <p>Name: {policy['Name']}</p>
                            <p>Description: {policy['Description']}</p>
                            <p>Path: {policy['Path']}</p> 
                            <textarea key={policy['PolicyDocument']} value={JSON.stringify( policy['PolicyDocument'] ) }  />
                        </div>
                    );
                })}
                
            </section>
        );
    }

}