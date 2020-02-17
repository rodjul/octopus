import React from 'react';
//import './Policies.css';

import RolesItem from "./components/RolesItem";


export default class RolesAccount extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          description:"",
          roles:[],
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
            
            // TODO: change function name
            if(this.state.roles_available.length > 0) this.onChangeRoleTypeSelect(this.state.roles_available[0]);
            else{
                const type_roles = [... this.state.roles_available];
                type_roles.push("New type");
                this.setState({roles_available: type_roles});
            }

            fetch(process.env.REACT_APP_ENDPOINT+"/policy/available/role")
            .then(resp => resp.json())
            .then(data => {
                if(data.error === true){
                    console.error("Error in fetching data");
                }else{
                    let roles_ar = [];
                    data.policies.map( (elem,index) => roles_ar[index] = { "value":elem, "label":elem } );
                    
                    this.setState({ 
                        // roles: roles_ar,
                        policies_select: roles_ar
                    });
                }
            })

        })
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
            
            // if the available roles (created) is empty, add default form
            if(new_available.length === 0) new_available.push("New type");
            
            localStorage.removeItem( this.state.role_type );
            
            this.setState({ 
                roles_available: new_available,
                role_type: new_available.length ? new_available[0] : "New type",
                description:"",
                roles:[],
                delete_roletype: "não declarado",
            });


        } )
    }

   /**
    * Dynamic forms which add new field on the form
    */
    handleAddFields = tipo => {
        if(tipo === "type_role"){
            const type_roles = [... this.state.roles_available];
            type_roles.push("New type");
            this.setState({roles_available: type_roles});
        }
    };
    
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
    onChangeSelect = (selectedOption, type, index, role_name) => {
        if(type === "policies"){
            if( selectedOption !== null){
                this.state.roles.push(selectedOption[selectedOption.length -1].value);
            }
        }
    };

    /**
     * Handle the submit form when doing the update or new document role
     * @param {Object} event 
     */
    async onSubmitForm(event){
        console.log("Submit: ",event);
        // event.preventDefault();
        
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
        
        return await fetch(url,{ 
            method: method, 
            mode:"cors", 
            body: JSON.stringify( format )
        })
        .then( resp =>{
            console.log("Data: ",resp);
            if( resp.status === 502 ){
                return {"error":true, "message":"Ocorreu um erro ao executar a ação de"+action};
            }else if( resp.status === 400 ){
                return {"error":true, "message":"Todos os campos precisam ser preenchidos"};
            }else if( resp.status === 200 ){

                localStorage.setItem( this.state.role_type, 
                    JSON.stringify({description : this.state.description, roles : this.state.roles})
                );
                
                let exists = false;
                this.state.roles_available.map( elem => {
                    if( elem === this.state.role_type ){
                        exists = true;
                    }
                });
                
                // setting the format for react-select to output the values selected/saved in db
                let roles_format = [];
                // roles.map(e => { roles_format.push( { "value":e.toString(), "label":e.toString()} ) });
                this.state.roles.map(e => { roles_format.push( { "value":e.toString(), "label":e.toString()} ) });

                if(!exists){
                    if(method === "POST"){
                        let new_roles_available = this.state.roles_available;
                        for(var i=0; i<new_roles_available.length; i++){
                            if(new_roles_available[i] == "New type"){
                                new_roles_available[i] = this.state.role_type;
                                this.setState({ 
                                    roles_available: new_roles_available,
                                    delete_roletype: new_roles_available[i],
                                    roles: roles_format
                                 });
                                break;
                            }
                        }
                    }
                }
                console.log("Teste: ",this.state);
                return {"error":false, "message":"Executado com sucesso"};
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
        console.log("Value: ",e);
        if(e !== undefined && e.length !== 0 && e != "New type"){
            let value = e;
            if( localStorage.getItem( value ) === null ){
                fetch(process.env.REACT_APP_ENDPOINT+"/role/"+value,{
                    method:"GET", mode:"cors"
                })
                .then(resp => resp.json())
                .then(data => {
                    let type_role_json =  data.type_role[0] ;

                    if(type_role_json !== undefined){
                        let roles =  JSON.parse( type_role_json.Roles ) ;

                        // setting the format for react-select to output the values selected/saved in db
                        let roles_format = [];
                        // roles.map(e => { roles_format.push( { "value":e.toString(), "label":e.toString()} ) });
                        roles.map(e => { roles_format.push( { "value":e.toString(), "label":e.toString()} ) });
    
                        this.setState({ 
                            role_type: type_role_json.RoleType,
                            description: type_role_json.Description,
                            roles: roles_format,
                            delete_roletype: type_role_json.RoleType
                        });
                        
                        // armazenando no local storage
                        localStorage.setItem( this.state.role_type, 
                            JSON.stringify({description : this.state.description, roles : this.state.roles})
                        );
                    }
                });
            }else{
                let data = localStorage.getItem( value );
                let role_type = value;
                let description = JSON.parse(data)['description'];
                let roles = JSON.parse(data)['roles'];

                // setting the format for react-select to output the values selected/saved in db
                let roles_format = [];
                // roles.map(e => { roles_format.push( { "value":e.toString(), "label":e.toString()} ) });
                roles.map(e => { roles_format.push( { "value":e.toString(), "label":e.toString()} ) });
                console.log("Roles_format: ",roles_format);
                this.setState({
                    role_type: role_type,
                    description: description,
                    roles: roles_format,
                    delete_roletype: role_type
                })
                console.log(this.state);
                console.log("Roles: ",this.state.roles);
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
     * Render the html page
     */
    render(){
        //console.log(this.state.data);
        const { 
            role_type, description, roles, roles_available,
            delete_roletype, policies_select 
        } = this.state;
        
        
        // console.log(roles_format);
        return (
            <RolesItem 
                role_type={role_type}
                description={description}

                roles={roles}
                roles_available={roles_available}
                roles_select={policies_select}
                delete_roletype={delete_roletype}
                
                onChangeRoleTypeSelect={this.onChangeRoleTypeSelect.bind(this)}
                onChangeForms={this.onChangeForms.bind(this)}
                onChangeSelect={this.onChangeSelect.bind(this)}
                handleAddFieldsParent={this.handleAddFields.bind(this)}
                onSubmit={this.onSubmitForm.bind(this)}
                
                handleDeleteRole={this.requestDeleteRoleType.bind(this)}

            />
            
        );
    }

}