import React from 'react';
import BlockUi from 'react-block-ui';
import LoadingCircularProgress from "../../../components/LoadingCircularProgress";
import { getAuthorization } from "../../../utils";
import SnackbarNotification from "../../../components/SnackbarNotification";

import TabsView from "./components/TabsView";

import './style.css';


/**
 * The PureComponente is almost equal to shouldComponentUpdate() which do a comparation in each component
 * for what has changed their values
 * @see see https://pt-br.reactjs.org/docs/optimizing-performance.html#examples
 */
export default class ManageIAM extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            trusts: [],
            policies: [],
            roles: [],
            policies_select: [],
            firstLoading: true,
            requestError: false,
            errorMessagePopup: "",
            requestSuccess: false,
        };
    }


    /**
     * When the components are ready, execute this first and fetch for the roles available, then fetch for the policies
     */
    async componentDidMount() {
        // Policies - Name, Description, Path, PolicyDocument
        // Roles  - Name, Policies[], PolicyArnAWS[] , TrustRelationship
        // TrustRelationships - Name, AssumeRolePolicyDocument
        let stateValues = this
        await fetch(process.env.REACT_APP_ENDPOINT+"/aws/policies", {
            headers: { "Authorization": getAuthorization() },
        })
        .then(response => this._handleFetchErrors(response, stateValues))
        .then(response => {
            let policies_json = JSON.parse(response.data['policies']);
            let trusts_json = JSON.parse(response.data['trusts']);
            let roles_json = JSON.parse(response.data['roles']);
            let tmp_trusts = [];
            let tmp_policies = [];
            let tmp_roles = [];
            let policy_ar = [];
            policies_json.map(elem => {
                let data = JSON.parse(elem['data']);
                tmp_policies.push({
                    policy_name: data['Name'],
                    policy_description: data['Description'],
                    policy_path: data['Path'],
                    policy_document: data['PolicyDocument'],
                })
            });
            trusts_json.map(elem => {
                let data = JSON.parse(elem['data']);
                tmp_trusts.push({
                    trust_name: data['Name'],
                    trust_description: data['Description'],
                    trust_assume_role_policy_document: data['AssumeRolePolicyDocument'],
                });
            });
            roles_json.map(elem => {
                let data = JSON.parse(elem['data']);
                tmp_roles.push({
                    role_name: data['Name'],
                    role_description: data['Description'],
                    policies: data['Policies'],
                    trust_relationship: data['TrustRelationship'],
                    policy_arn_aws: data['PolicyArnAWS'],
                })
            });

            if (tmp_roles.length === 0) {
                tmp_roles.push({
                    role_name: 'New-Role',
                    role_description: "Description of this role",
                    policy_arn_aws:"" , 
                    policies:[],
                    trust_relationship:"",
                    new: true,
                });
            }
            if (tmp_policies.length === 0) {
                tmp_policies.push({
                    policy_name: 'New-Policy', 
                    policy_description:"", 
                    policy_path:"/", 
                    policy_document: {
                        "Version": "2012-10-17",
                        "Statement": []
                    },
                    new: true,
                });
            }
            if (tmp_trusts.length === 0) {
                tmp_trusts.push({ 
                    trust_name: 'New-Trust-Relationship',
                    trust_description: "Description",
                    trust_assume_role_policy_document: {
                        "Version": "2012-10-17",
                        "Statement": [
                            {
                                "Effect": "Allow",
                                "Principal": {
                                    "Federated": "arn:aws:iam::ACCOUNT_ID:saml-provider/ADFS"
                                },
                                "Action": "sts:AssumeRoleWithSAML",
                                "Condition": {
                                    "StringEquals": {
                                        "SAML:aud": "https://signin.aws.amazon.com/saml"
                                    }
                                }
                            }
                        ]
                    }, 
                    new: true,
                });
            }
            policies_json.map(elem => {
                // let data = JSON.parse(elem['Data'])['Name'];
                let data = elem.policy_name;
                policy_ar.push({ "value": data, "label": data });
            });

            this.setState({
                // trusts: data.message.TrustRelationships,
                // policies: data.message.Policies
                trusts: tmp_trusts,
                policies: tmp_policies,
                policies_select: policy_ar,
                roles: tmp_roles,
            });
        })
        .catch(error => console.error(error));
        this.setState({ firstLoading: false, requestSuccess: false, requestError: false});

    }


    async onSubmitForm() {
        let stateValues = this;
        this.setState({requestSuccess: false, requestError: false});
        await fetch(process.env.REACT_APP_ENDPOINT+"/aws/policies", {
            method: "PUT", mode: "cors", headers: {"Authorization": getAuthorization()},
            body: JSON.stringify({
                "policies": this.state.policies,
                "trusts_relationship": this.state.trusts,
                "roles": this.state.roles
            })
        })
        .then(resp => this._handleFetchErrors(resp, stateValues))
        .then(resp => {
            let newPolicies = this.state.policies;
            newPolicies.map(policy => delete policy.new);
            
            let newTrusts = this.state.trusts;
            newTrusts.map(trust => delete trust.new);
            
            let newRoles = this.state.roles;
            newRoles.map(role => delete role.new);

            this.setState({ requestSuccess: true, policies: newPolicies, trusts: newTrusts, roles: newRoles});
        })
        .catch(error => console.error(error));
        this.setState({ requestSuccess: false, requestError: false});

    }


    async requestDeleteFieldType(type, index) {
        if (type && index >= 0) {
            let newData = [];
            ///policies/{policy_type}/{policy_name}
            let policyName = "";

            if (type === "role") {
                let roles = this.state.roles;
                roles.map((val, i) => i !== index ? newData.push(val) : "");
                policyName = roles[index].role_name;

            } else if (type === "policy") {
                let policies = this.state.policies;
                policies.map((val, i) => i !== index ? newData.push(val) : "");
                policyName = policies[index].policy_name;

            } else if (type === "trust") {
                let trusts = this.state.trusts;
                trusts.map((val, i) => i !== index ? newData.push(val) : "");
                policyName = trusts[index].trust_name;
            }

            let stateValues = this;

            this.setState({requestSuccess: false, requestError: false});

            await fetch(`${process.env.REACT_APP_ENDPOINT}/aws/policies/${encodeURIComponent(type.toUpperCase())}/${encodeURIComponent(policyName)}`, {
                method: "DELETE", mode: "cors", headers: {"Authorization": getAuthorization()},
            })
            .then(response => this._handleFetchErrors(response, stateValues))
            .then(_ => {
                if (type === "role") {
                    this.setState({ roles: newData });
                } else if (type === "policy") {
                    this.setState({ policies: newData });
                } else if (type === "trust") {
                    this.setState({ trusts: newData });
                }
                    this.setState({ requestSuccess: true });
            })
            .catch(error => console.error(error));
            this.setState({requestSuccess: false, requestError: false});
        }
    }

    async _handleFetchErrors(response, stateValues = {}) {
        if (!response.ok) {
            if (response.status === 401) {
                alert("Not authenticated. Login again");
                window.location.reload();
            } else {
                let message = "";
                if (response.status === 400) {
                    message = "Invalid request";
                } else if (response.status === 403) {
                    message = "You don't have permissions to do this action";
                } else if (response.status === 404) {
                    message = "Not found";
                } else if (response.status === 500 || response.status === 502) {
                    message = "Server error. Contact administrator!";
                }
                
                // let hasJsonData = false;
                // await response.json().then(e => {
                //     hasJsonData = true;
                //     stateValues.setState({
                //         errorMessagePopup: message + " Message: " + e.message,
                //         requestError: true,
                //     });
                // });

                // if(!hasJsonData){
                    stateValues.setState({
                        errorMessagePopup: message,
                        requestError: true,
                    },()=>stateValues.setState({requestError: false}));
                // }

                // stateValues.setState({isLoading: false});
                // stateValues.setState({ requestError: false });
                throw Error(response.statusText);
                //https://gist.github.com/odewahn/5a5eeb23279eed6a80d7798fdb47fe91
                // return Promise.resolve(response.json()).then((responseInJson) => { // This will end up in ERROR part
                //     return Promise.reject({"promise":responseInJson, "status":response.status}); //  responseInJson.message = "Some nasty error message!"
                // });
            }
        }
        return response.json();
    }

    handleDataChanged(roles, policies, trusts) {
        this.setState({
            roles: roles,
            policies: policies,
            trusts: trusts,
        })
    }

    render() {
        //console.log(this.state.data);
        const { trusts, policies } = this.state;
        const { roles, policies_select } = this.state;

        return (
            <>
                {/* <BlockUi tag="div" blocking={this.state.blocking} message="" loader={<LoadingCircularProgress />}> */}
                    <TabsView
                        trustsData={trusts}
                        policiesData={policies}
                        rolesData={roles}
                        policiesOptionsAvailable={policies_select}
                        onSubmit={this.onSubmitForm.bind(this)}
                        callbackDeleteTypeIndex={this.requestDeleteFieldType.bind(this)}
                        callbackSaveDataChanged={this.handleDataChanged.bind(this)}
                        blocking={this.state.firstLoading}
                    />
                {/* </BlockUi> */}

                {this.state.requestError && <SnackbarNotification variant="error" message={this.state.errorMessagePopup} />}
                {this.state.requestSuccess && <SnackbarNotification variant="success" message="Success!" />}
            </>
        );
    }

}