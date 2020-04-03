import React from 'react';
import './ManageIAM.css';

import PoliciesHtml from "./components/PoliciesHtml";

/**
 * The PureComponente is almost equal to shouldComponentUpdate() which do a comparation in each component
 * for what has changed their values
 * @see see https://pt-br.reactjs.org/docs/optimizing-performance.html#examples
 */
export default class ManageIAM extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {
          showModal: false,
          trusts:[],
          policies:[],
          actionModal: "",
          modalMessage: "",

          document_name: "",
          description:"",
          roles:[],
          trusts_select:[],
          policies_select:[],
          roles_select:[],
          roles_available: [],
          delete_roletype: "não declarado",
          role_type:"",
          selectedOption: null
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
        fetch(process.env.REACT_APP_ENDPOINT+"/policy/content", {
            headers: {"X-Api-Key": process.env.X_API_KEY_AWS},
        })
        .then(resp => resp.json())
        .then(data => {
            if(data.message === "Internal server error"){
                console.error("Error in fetching data");
            }else{
                // console.log(data);
                let policies_json = JSON.parse(data['policies']);
                let trusts_json = JSON.parse(data['trusts']);
                let roles_json = JSON.parse(data['roles']);
                let tmp_trusts = [];
                let tmp_policies =[];
                let tmp_roles =[];
                let policy_ar = [];
                policies_json.map( elem => tmp_policies.push( JSON.parse(elem['Data']) ) );
                trusts_json.map(elem => tmp_trusts.push( JSON.parse(elem['Data']) ) );
                roles_json.map(elem => tmp_roles.push( JSON.parse(elem['Data']) ) );
                
                if(tmp_policies.length === 0 ){
                    tmp_policies.push({Description: "Description of this new policy", Name: "New-Policy", Path: "/", PolicyDocument:{"null":true}});
                }
                policies_json.map(elem => {
                    let data = JSON.parse(elem['Data'])['Name'];
                    policy_ar.push({ "value":data , "label":data }); 
                });

                this.setState({ 
                    // trusts: data.message.TrustRelationships,
                    // policies: data.message.Policies
                    trusts: tmp_trusts,
                    policies: tmp_policies,
                    policies_select: policy_ar,
                    roles: tmp_roles
                });
            }
        })

    }

   /**
    * Dynamic forms which add new field on the form
    * @see see https://dev.to/fuchodeveloper/dynamic-form-fields-in-react-1h6c
    */
    handleAddFields = tipo => {
        if(tipo === "role"){
            const values = [...this.state.roles];
            values.push({
                role_name: 'New-Role',
                role_description: "Description of this role",
                policy_arn_aws:"" , 
                policies:[],
                trust_relationship:""
            });
            this.setState({roles : values});
        }else if(tipo === "trustrelationships"){
            const values = [...this.state.trusts];
            values.push({ Name: 'New-Trust-Relationship', AssumeRolePolicyDocument: {"null":true} });
            this.setState({trusts : values});

        }else if(tipo === "policy"){
            const values = [...this.state.policies];
            values.push({ Name: 'New-Policy', Description:"", Path:"", PolicyDocument:{"null":true} });
            this.setState({policies : values});
            console.log("State policies: ",this.state.policies);
        }
    };

    /**
     * Dynamic form which removes dynamically the part of the form
     */
    handleRemoveFields = (index,type) => {
        // console.log(type, index);
        if(type === "trustrelationships"){
            const values = [...this.state.trusts];
            values.splice(index, 1);
            this.setState({trusts : values});
        }else if(type === "role"){
                const values = [...this.state.roles];
                values.splice(index, 1);
                this.setState({roles : values});
        }else if(type === "policy"){
            const values = [...this.state.policies];
            values.splice(index, 1);
            this.setState({policies : values});
        }
    };


    /**
     * Handle the input change for the json field
     * @param {str} type 
     * @param {int} index
     * @param {Object} event
     */    
    onChangeJson = (type,index,event) => {
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
    }

    /**
     * Handle the changes inputs for each field
     * @param {str} type 
     * @param {int} index
     * @param {Object} event
     */    
    onChangeForms = (type, index, event) => {
        if(type==="trust"){
            let tmp_trusts = this.state.trusts;
            tmp_trusts[index][event.target.name] = event.target.value
            this.setState({ trusts: tmp_trusts });
        
        }else if(type==="policy"){
            let tmp_policies = this.state.policies;
            tmp_policies[index][event.target.name] = event.target.value;
            this.setState( { policies: tmp_policies } );
        
        }else if(type === "role_name"){
            // let tmp_roles = this.state.roles;
            // tmp_roles[index]['role_name'] = event.target.value
            // this.setState({ roles: tmp_roles });
            this.state.roles[index]['role_name'] = event.target.value;
            
        }else if(type==="policy_name"){
            let tmp_policies = this.state.policies;
            tmp_policies[index][event.target.name] = event.target.value
            this.setState({ policies: tmp_policies });
        }
    }

    /**
     * Handle the input changes for each field
     * @param {Object} event
     */
    async onSubmitForm(event){
        // event.preventDefault();
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
        return await fetch(process.env.REACT_APP_ENDPOINT+"/policy/update",{
            method:"POST", mode:"cors", headers: {"X-Api-Key": process.env.X_API_KEY_AWS},
            body: JSON.stringify( {
                "policies":this.state.policies, 
                "trusts_relationship":this.state.trusts,
                "roles":this.state.roles
            } )
        })
        .then(resp => {
            if( resp.status === 502 ){
                // this.setState({
                //     showModal: true,
                //     actionModal: "Erro ao atualizar",
                //     modalMessage: "Ocorreu um erro ao executar essa aÃ§Ã£o"
                // });
                return {"error":true, "message":"Ocorreu um erro ao executar a ação"};
            }else if( resp.status === 400 ){
                // this.setState({
                //     showModal: true,
                //     actionModal: "Erro ao atualizar",
                //     modalMessage: "Todos os campos precisam ser preenchidos"
                // });
                return {"error":true, "message":"Todos os campos precisam ser preenchidos"};
            }else if( resp.status === 200 ){
                // this.setState({
                //     showModal: true,
                //     actionModal: "Atualizar",
                //     modalMessage: "Executado com sucesso"
                // });
                return {"error":false, "message":"Executado com sucesso"};
            }
        })
        
    }

    /**
     * Handle the select tag for which role type to load
     * If there is not role type to get, it will load the default values if null values.
     * If exists values to get, it will fetch the values then set the values to localStorage to not request again.
     * 
     * @param {Object} e 
     */
    onChangeRoleTypeSelect(e){   
        // console.log("Value: ",e);
        if(e !== undefined && e.length !== 0 && e != "New type"){
            let value = e;
            if( localStorage.getItem( value ) === null ){
                fetch(process.env.REACT_APP_ENDPOINT+"/role/"+value,{
                    method:"GET", mode:"cors", headers: {"X-Api-Key": process.env.X_API_KEY_AWS},
                })
                .then(resp => resp.json())
                .then(data => {
                    let type_role_json =  data.type_role[0] ;
                    let roles =  JSON.parse( type_role_json.Roles ) ;

                    this.setState({ 
                        //document_name: type_role_json.RoleType,
                        role_type: type_role_json.RoleType,
                        description: type_role_json.Description,
                        roles: roles,
                        delete_roletype: type_role_json.RoleType
                    });
                    
                    // armazenando no local storage
                    localStorage.setItem( this.state.role_type, 
                        JSON.stringify({description : this.state.description, roles : this.state.roles})
                    );
                    
                });
            }else{
                let data = localStorage.getItem( value );
                let role_type = value;
                let description = JSON.parse(data)['description'];
                let roles = JSON.parse(data)['roles'];
                this.setState({
                    role_type: role_type,
                    description: description,
                    roles: roles,
                    delete_roletype: role_type
                })
            }

        // if the value is null, show the first view
        }else if(e !== undefined && e === "New type"){
            this.setState({ 
                role_type: "New type",
                description: "",
                roles: [],
                delete_roletype: "não declarado"
            });
        }
    }

       /**
     * Handle the policyArnAWS input and do a match regex if the value does not contains spaces
     * 
     */
    handleChangePolicyARN = (event, index) => {
        event.preventDefault();
        const { value } = event.target;
        //console.log(name,value);
        //let term = "arn:aws:iam::aws:policy/ReadOnlyAccess";
        //let regex = new RegExp("(arn:aws:iam::(aws|([0-9]+)):policy\/[A-Za-z0-9-]+\/*[A-Za-z0-9-]*$,*)");
        // let regex = new RegExp("\\s+");
        let regex = new RegExp("\\s+|[.#!$%^&*;{}=_`~()@¨'\"+[\\]`´]");
        
        if(!regex.test(value)){
            let roles_tmp = this.state.roles;
            roles_tmp[index]['policy_arn_aws'] = value;
            // this.setState({roles: roles_tmp});
            this.state.roles[index]['policy_arn_aws'] = value;
        }else{
            event.target.value = this.state.roles[index]['policy_arn_aws'];
            //this.setState({test: this.state.test});
        }
    }

        /**
     * Handle the select tag in the form (policies, trust relationshops)
     * @param {str/Array} selectedOption
     * @param {str} type
     * @param {int} index
     */
    onChangeSelect = (selectedOption, type, index, role_name) => {
        console.log(selectedOption, type, index, role_name);
        //console.log(this.state.roles);
        if(type === "policies"){
            if( selectedOption !== null) this.state.roles[index][type].push(selectedOption[selectedOption.length -1].value);
        }else{
            // if the value is an array, we get the index with the value
            let value = selectedOption[0].value;
            // but if not an array, just get the value
            if(type === "trust_relationship"){
                value = selectedOption;
            }
            this.state.roles[index][type] = value;
        }
    };

    /**
     * Handle the button delete, also set the states to initial value and remove from localStorage
     */
    requestDeleteRoleType(){
        fetch(process.env.REACT_APP_ENDPOINT+"/role/delete",{
            method:"DELETE", mode:"cors",
            body: JSON.stringify( {"role_type":this.state.delete_roletype} ),
            headers: {"X-Api-Key": process.env.X_API_KEY_AWS},
        })
        .then(resp => resp.json())
        .then( _ => {
            let index = this.state.roles_available.indexOf(this.state.delete_roletype);
            let new_available = this.state.roles_available;
            new_available.splice(index, 1);
            this.setState({ 
                roles_available: new_available,
                document_name: "",
                description:"",
                trusts:[],
                policies:[],
                roles:[],
                delete_roletype: "não declarado",
                actionModal: "Deletar",
                showModal: true,
                modalMessage: "Excluído com sucesso"
            });

            localStorage.removeItem( this.state.role_type );

        } )
    }

    render(){
        //console.log(this.state.data);
        const { trusts, policies }= this.state;
        const { role_type, description, roles, roles_available, policies_select, trusts_select, delete_roletype } = this.state;
        
        return (
            <PoliciesHtml
            trusts={trusts}
            policies={policies}
            // showModal, actionModal, modalMessage
            handleJson={this.onChangeJson.bind(this)}
            handleForm={this.onChangeForms.bind(this)}
            handleRemoveFields={this.handleRemoveFields.bind(this)}
            handleAddFields={this.handleAddFields.bind(this)}
            handleOnSubmitForm={this.onSubmitForm.bind(this)}

            // roles
            role_type={role_type}
            description={description}
            roles={roles}
            roles_available={roles_available}
            policies_available={policies_select}
            trusts_available={trusts_select}
            delete_roletype={delete_roletype}
            
            onChangeRoleTypeSelect={this.onChangeRoleTypeSelect.bind(this)}
            onChangeForms={this.onChangeForms.bind(this)}
            handleChangePolicyARN={this.handleChangePolicyARN.bind(this)}
            onChangeSelect={this.onChangeSelect.bind(this)}
            onSubmit={this.onSubmitForm.bind(this)}
            
            handleDeleteRole={this.requestDeleteRoleType.bind(this)}




            />
        );
    }

}