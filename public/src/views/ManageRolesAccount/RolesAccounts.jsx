import React from 'react';
//import './Policies.css';

import RolesItem from "./components/RolesItem";


export default class RolesAccount extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          description:"description",
          roles:[], // roles the account have
          roles_select:[], // roles with format to display in react-select which were created at Manage IAM
          roles_available: [], // which roles exists at the moment (local or stored)
          delete_roletype: "New type 1",
          role_type:"", // name of the currently role
          selectedOption: null,
          number_count_new_type: 1,
      };
    }
    
    /**
     * When the components are ready, execute this first and fetch for the roles available, then fetch for the policies
     */
     componentDidMount(){
        
        fetch(process.env.REACT_APP_ENDPOINT+"/role/available", {
            headers: {"X-Api-Key": process.env.REACT_APP_X_API_KEY_AWS},
        })
        // fetch(process.env.REACT_APP_ENDPOINT+"/policy/available")
        .then(resp => resp.json())
        .then(data => {
            if(data.message === "Internal server error"){
                console.error("Error in fetching data");
            }
            console.log("data role available: ",data);

            if(data.type_roles.length){
                let formatData = [];

                let countGottAllValues = 0;
                data.type_roles.map(async (value, index, arr) => {
                    let data = undefined;
                    if( localStorage.getItem( value ) === null ){
                        data = await fetch(process.env.REACT_APP_ENDPOINT+"/role/"+value,{
                            method:"GET", mode:"cors", headers: {"X-Api-Key": process.env.REACT_APP_X_API_KEY_AWS},
                        })
                        .then(resp => resp.json())
                        .then(data => {
                            let content = data.type_role[0];
                            return { "name":value, "type":"database", "description": content['Description'], "roles": JSON.parse(content['Roles']) }
                            // return data.type_role[0] ;
                        });

                        // storing at local storage
                        localStorage.setItem( value, 
                            JSON.stringify({description : data['description'], roles : data['roles']})
                        );

                        formatData.push( data );

                    }else{
                        // getting content from local storage
                        data = localStorage.getItem( value );
                        let description = JSON.parse(data)['description'];
                        let roles = JSON.parse(data)['roles'];

                        formatData.push({ "name":value, "type":"database", "description": description, "roles":roles } );
                    }
                    countGottAllValues++;

                    if(arr.length === countGottAllValues) this.setState({ roles_available: formatData});

                }) ;
                

            }else{
                // it doesn't exists data..
                const type_roles = [] ;//[... this.state.roles_available];
                type_roles.push({"name":"New type 1", "type":"new type", "description":"Description of this"});
                this.setState({roles_available: type_roles});
            }
        
            // get the roles available which were created at Manage IAM
            fetch(process.env.REACT_APP_ENDPOINT+"/policy/available/role", { 
                headers: {"X-Api-Key": process.env.REACT_APP_X_API_KEY_AWS} 
            })
            .then(resp => resp.json())
            .then(data => {
                if(data.error === true){
                    console.error("Error in fetching data");
                }else{
                    console.log("Data policy available role: ",data);
                    let roles_ar = [];
                    data.policies.map( (elem,index) => roles_ar[index] = { "value":elem, "label":elem } );
                    this.setState({ roles_select: roles_ar });
                }
            })

        })
    }
    

    /**
     * Handle the button delete, also set the states to initial value and remove from localStorage
     */
    requestDeleteRoleType(index){
        let { roles_available, delete_roletype } = this.state;
        
        if(roles_available[index]['type'] === "new type"){
            let findIndex = 0;
            roles_available.map((value,index) =>{
                if(value['name'] === delete_roletype){
                    findIndex = index;
                    return;
                }
            });
            
            let new_available = roles_available;
            new_available.splice(findIndex, 1);

            if(new_available.length === 0){
                new_available.push({"name":"New type 1", "type":"new type", "description":"Description of this"});  
            }

            this.setState({ 
                roles_available: new_available,
                role_type: new_available.length ? new_available[new_available.length -1]['name'] : "New type 1",
            });

            if(roles_available.length > 0){
                // setting the view for the available role
                this.setState({delete_roletype: roles_available[ roles_available.length -1 ]});
                // this.onChangeRoleTypeSelect(roles_available[ roles_available.length -1 ]);
            }

        }else{
            let name = roles_available[index]['name'];

            fetch(process.env.REACT_APP_ENDPOINT+"/role/delete",{
                method:"DELETE", mode:"cors", headers: {"X-Api-Key": process.env.REACT_APP_X_API_KEY_AWS},
                body: JSON.stringify( {"role_type": name} )
            })
            .then(resp => resp.json())
            .then( _ => {
                // let index = roles_available.indexOf(name);
                let new_available = roles_available;
                new_available.splice(index, 1);
        
                // if the available roles (created) is empty, add default form
                if(new_available.length === 0){
                    new_available.push({"name":"New type 1", "type":"new type", "description":"Description of this"});  
                } 

                // console.log(this.state);
                this.setState({ 
                    roles_available: new_available,
                    role_type: new_available.length ? new_available[new_available.length -1] : [],
                });
                
                // delete item from local storage
                localStorage.removeItem( name );

                if(roles_available.length > 0){
                    // setting the view for the available role
                    this.setState({delete_roletype: roles_available[ roles_available.length -1 ]});
                    // this.onChangeRoleTypeSelect(roles_available[ roles_available.length -1 ]);
                }
            } );
        }

        
    }

   /**
    * Dynamic forms which add new field on the form
    */
    handleAddFields = tipo => {
        if(tipo === "type_role"){
            let {number_count_new_type } = this.state;
            let count_number = number_count_new_type;

            const roles_available = [... this.state.roles_available];

            count_number++;

            this.setState({number_count_new_type: count_number});

            let data = {"name":"New type "+count_number, "type":"new type", "description":"Description of this"};
            roles_available.push(data);
            
            this.setState({
                roles_available: roles_available,
                delete_roletype: data
            });
        }
    };
    
    /**
     * Handle the input changes for each field
     * @param {str} type 
     * @param {int} index
     * @param {Object} event
     */
    onChangeForms = (type, index, event, role_name) => {
        // console.log(type, index, event.target, role_name);
        if(type === "role_type"){
            //TODO: how to use setState when the unser input frozen each time a key is pressed?
            // this.setState({role_type: event.target.value});
            // this.state.role_type = event.target.value;
            
            let newData = this.state.roles_available;
            newData[index]["name"] = event.target.value;
            // this.setState({roles_available: newData});
            this.state.roles_available[index]["name"] = event.target.value;

        }else if(type === "description"){
            // this.setState({description: event.target.value});
            // this.state.description = event.target.value;
            let newData = this.state.roles_available;
            newData[index]["description"] = event.target.value;
            // this.setState({roles_available: newData});
            newData[index]["description"] = event.target.value;
            
        }else{
            console.log("Chegou aquu, n sei oq é");
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
                

                let newData = this.state.roles_available;
                let roles = newData[index];

                if(roles.hasOwnProperty("roles")){
                    roles['roles'].push( selectedOption[selectedOption.length -1].value );
                }else{
                    roles["roles"] = [ selectedOption[selectedOption.length -1].value ] ;
                }
                this.state.roles_available[index] = roles;
                // this.setState({roles_available: newData});
                // console.log("onChangeSelect: ",this.state);

                // this.state.roles.push(selectedOption[selectedOption.length -1].value);
            }
        }
    };

    /**
     * Handle the submit form when doing the update or new document role
     * @param {Object} event 
     */
    async onSubmitForm(event){
        let { roles_available } = this.state;
        
        let format = [];
        roles_available.filter(value => value.hasOwnProperty("roles")).map( value => format.push( value ) );
        
        return await fetch(process.env.REACT_APP_ENDPOINT+"/role/new",{ 
            method: "POST", 
            mode:"cors", 
            body: JSON.stringify( format ),
            headers: {"X-Api-Key": process.env.REACT_APP_X_API_KEY_AWS},
        })
        .then( resp =>{
            // console.log("Data: ",resp);
            if( resp.status === 502 ){
                return {"error":true, "message":"Ocorreu um erro ao executar a ação"};
            }else if( resp.status === 400 ){
                return {"error":true, "message":"Todos os campos precisam ser preenchidos"};
            }else if( resp.status === 200 ){
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
    onChangeRoleTypeSelect(value){   
        // console.log("Value: ",value);
        // console.log("onChangeRoleTypeSelect: ",this.state);
        
        if(value !== undefined && value.length !== 0){
            let isLocal = false;
            let findIndex = 0;
            let { roles_available } = this.state;

            roles_available.map((valueJson, index) => {
                if(valueJson['name'] === value){ 
                    findIndex = index;
                    isLocal = valueJson['type'] === "new type" ? true : false;
                    return;
                }
            });
            if(isLocal){

                // let data = localStorage.getItem( value );
                let role_type = value;
             
                let description = roles_available[findIndex].hasOwnProperty("description") ? roles_available[findIndex]['description'] : "Description of this";
                let roles = roles_available[findIndex].hasOwnProperty("roles") ? roles_available[findIndex]['roles'] : [];
                
                // setting the format for react-select to output the values selected/saved in db
                let roles_format = [];
                roles.map(value => { roles_format.push( { "value":value, "label":value} ) });
                
                this.setState({
                    role_type: role_type,
                    description: description,
                    roles: roles,
                    // roles_select: roles_format,
                    delete_roletype: role_type
                });

                // storing at local storage
                // localStorage.setItem( this.state.role_type, 
                //     JSON.stringify({description : this.state.description, roles : this.state.roles})
                // );




            }
            // else{
            //     let data = undefined;
            //     if( localStorage.getItem( value ) === null ){
            //         fetch(process.env.REACT_APP_ENDPOINT+"/role/"+value,{
            //             method:"GET", mode:"cors"
            //         })
            //         .then(resp => resp.json())
            //         .then(data => {
            //             let content = data.type_role[0];
            //             data = { "name":value, "type":"database", "description": content['Description'], "roles": JSON.parse(content['Roles']) }
            //             // return data.type_role[0] ;

            //             // storing at local storage
            //             localStorage.setItem( value, 
            //                 JSON.stringify({description : data['description'], roles : data['roles']})
            //             );
            //         });
                    
            //     }else{
            //         let data = localStorage.getItem( value );
            //         let description = JSON.parse(data)['description'];
            //         let roles = JSON.parse(data)['roles'];
            //         data = { "name":value, "type":"database", "description": description, "roles": roles }
            //     }
            //     this.setState({ roles_available: data});
            // }

        // if the value is null, show the first view
        }
    }

    /**
     * Render the html page
     */
    render(){
        //console.log(this.state.data);
        const { 
            role_type, roles_available, roles_select
        } = this.state;
        
        
        // console.log(roles_format);
        return (
            <RolesItem 
                role_type={role_type}
                roles_available={roles_available}
                roles_select={roles_select}
                
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