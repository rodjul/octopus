import React from 'react';
//import './Policies.css';

import RolesItem from "./components/RolesItem";


export default class RolesAccount extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          document_name: "",
          showModalDelete: false,
          actionModal: "",
          showModal: false,
          modalMessage: "",
          description:"",
          trusts:[],
          policies:[],
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

            fetch(process.env.REACT_APP_ENDPOINT+"/policy/available/iam")
            .then(resp => resp.json())
            .then(data => {
                if(data.error === true){
                    console.error("Error in fetching data");
                }else{
                    let policy_ar = [];
                    data.policies.map( (elem,index) => policy_ar[index] = { "value":elem, "label":elem } );
                    
                    this.setState({ 
                        policies: policy_ar,
                        policies_select: policy_ar
                    });
                }
            })

            fetch(process.env.REACT_APP_ENDPOINT+"/policy/available/trust")
            .then(resp => resp.json())
            .then(data => {
                if(data.error === true){
                    console.error("Error in fetching data");
                }else{
                    let trust_ar = [];
                    data.policies.map( (elem,index) => trust_ar[index] = { "value":elem, "label":elem } );
                    
                    this.setState({ 
                        trusts: trust_ar,
                        trusts_select: trust_ar
                    });
                }
            })


        })
    }
    
    /**
     * Valid if the total number (10) of attached policies is not reached
     * Check policy ARN and custom policies
     */
    isQuantityPoliciesAttachedReached = () => {
        let number_permited = 10
        for(var i=0; i<this.state.roles.length; i++){
            let policies = this.state.roles[i].policies.length;
            let policies_arn = this.state.roles[i].policy_arn_aws.split(",").length;
            
            if( (policies + policies_arn) > number_permited ){
                return [true, this.state.roles[i].role_name];
            }
        }
        
        return [false, null]
    }

    /**
     * Handle the button delete, also set the states to initial value and remove from localStorage
     */
    requestDeleteRoleType(){
        fetch(process.env.REACT_APP_ENDPOINT+"/role/delete",{
            method:"DELETE", mode:"cors",
            body: JSON.stringify( {"role_type":this.state.delete_roletype} )
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

   /**
    * Dynamic forms which add new field on the form
    */
    handleAddFields = tipo => {
        if(tipo === "role"){
            const values = [...this.state.roles];
            values.push({
                role_name: 'New-Role',
                role_description: "Description of this role",
                policies:[], 
                policy_arn_aws:"" , 
                trust_relationship:""
            });
            this.setState({roles : values});
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

    /**
     * Handle the general modal. This function close the modal
     */
    handleModalCloseActions = () => this.setState({showModal:false}) ;

    /**
     * Handle the modal at the delete button. If user accept the action, calls requestDeleteRoleType() to delete
     * @param {Object} e 
     */
    handleClose(e){ 
        //console.log(e, e.target);
        if(e !== undefined && e.target.value === "new_check"){
            this.requestDeleteRoleType();
        }
        this.setState({showModalDelete:false}) ;
    }

    /**
     * Handle the modal at the delete button. This closes the modal
     */
    handleShow = () => this.setState({showModalDelete:true});

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
     * Handle the input changes for each field
     * @param {str} type 
     * @param {int} index
     * @param {Object} event
     */
    onChangeForms = (type, index, event) => {
        if(type === "role_type"){
            //TODO: how to use setState when the unser input frozen each time a key is pressed?
            // this.setState({role_type: event.target.value});
            this.state.role_type = event.target.value;

        }else if(type === "description"){
            // this.setState({description: event.target.value});
            this.state.description = event.target.value;

        }else if(type === "role_name"){
            let regex = new RegExp("\\s+|[.,/#!$%^&*;:{}=_`~()@¨'\"+[\\]`´]");
            // if does not contains space, set the state
            if(!regex.test(event.target.value)){
                // let tmp_roles = this.state.roles;
                // tmp_roles[index]['role_name'] = event.target.value
                // this.setState({ roles: tmp_roles });
                this.state.roles[index]['role_name'] = event.target.value;
            }else{
                // if it does, set the value of the state (not from the event input)
                event.target.value = this.state.roles[index]['role_name'];
            }

        }else{
            this.state.roles[index][event.target.name] = event.target.value;
        }
    }

    /**
     * Handle the select tag in the form (policies, trust relationshops)
     * @param {str/Array} selectedOption
     * @param {str} type
     * @param {int} index
     */
    onChangeSelect = (selectedOption, type, index) => {
        if(type === "policies"){
            if( selectedOption !== null) this.state.roles[index][type].push(selectedOption[0].value);
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
     * Handle the submit form when doing the update or new document role
     * @param {Object} event 
     */
    onSubmitForm(event){
        event.preventDefault();

        let format = {
            role_type: this.state.role_type,
            description: this.state.description,
            roles: this.state.roles,
        };
        
        let url = ""; let method = ""; let action = "";
        if(this.state.delete_roletype === "não declarado"){
            url = process.env.REACT_APP_ENDPOINT+"/role/new";
            method = "POST";
            action = "Criar";
        }else{
            url = process.env.REACT_APP_ENDPOINT+"/role/update"
            method = "PUT";
            action = "Atualizar";
        }

        let values = this.isQuantityPoliciesAttachedReached();
        let reached = values[0];
        let role_reached = values[1];
        if(reached){
            this.setState({
                showModal: true,
                actionModal: "Erro "+action,
                modalMessage: "A role \""+role_reached+"\" contém mais de 10 policies atachadas. Remova para poder proseguir com a ação."
            });
            return;
        }
        
        fetch(url,{ 
            method: method, 
            mode:"cors", 
            body: JSON.stringify( format )
        })
        .then( resp =>{
            console.log("Data: ",resp);
            if( resp.status === 502 ){
                this.setState({
                    showModal: true,
                    actionModal: "Erro "+action,
                    modalMessage: "Ocorreu um erro ao executar essa ação"
                });
            }else if( resp.status === 400 ){
                this.setState({
                    showModal: true,
                    actionModal: "Erro "+action,
                    modalMessage: "Todos os campos precisam ser preenchidos"
                });
            }else if( resp.status === 200 ){
                this.setState({
                    showModal: true,
                    actionModal: action,
                    modalMessage: "Executado com sucesso"
                });

                localStorage.setItem( this.state.role_type, 
                    JSON.stringify({description : this.state.description, roles : this.state.roles})
                );
                
                let exists = false;
                this.state.roles_available.map( elem => {
                    if( elem === this.state.role_type ){
                        exists = true;
                    }
                });
                if(!exists){
                    let new_roles_available = this.state.roles_available;
                    new_roles_available.push(this.state.role_type);
                    this.setState({ roles_available: new_roles_available});
                }
            }
            //resp => resp.json()
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
        if(e !== undefined && e.target.value.length !== 0){

            if( localStorage.getItem( e.target.value ) === null ){
                fetch(process.env.REACT_APP_ENDPOINT+"/role/"+e.target.value,{
                    method:"GET", mode:"cors"
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
                let data = localStorage.getItem( e.target.value );
                let role_type = e.target.value;
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
        }else if(e !== undefined && e.target.value.length === 0){
            this.setState({ 
                role_type: "",
                description: "",
                trusts: [],
                policies: [],
                roles: [],
                delete_roletype: "não declarado"
            });
        }
    }

    /**
     * Render the html page
     */
    render(){
        //console.log(this.state.data);
        const { 
            role_type, description, roles, roles_available,
            actionModal, showModal, showModalDelete, modalMessage,
            delete_roletype, trusts_select, policies_select 
        } = this.state;
        
        
        return (
            <RolesItem />
            
        );
    }

}