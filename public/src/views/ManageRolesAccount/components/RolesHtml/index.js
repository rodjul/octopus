import React from "react";
import Select from "react-select";

const RolesHtml = (
    {
        role_name, index, policies_selected, policies_available, onChangeSelect
    }) =>{
    console.log(policies_selected);
    return (
        <div className="" key={`${role_name}~${index}`}>
                                   
            <div className="form-group row">
                <label htmlFor="policies_role" className="col-sm-2 col-form-label bolder">Roles: </label>
                <div className="col-sm-10">
                    <Select key={`${role_name}~${index}`} className="policies" closeMenuOnSelect={false} isMulti 
                    options={policies_available} 
                    defaultOptions={ 
                        // { "value":"accessmngt" ,"label":"accessmngt" } }
                        policies_selected.map(elem => {
                            console.log(elem);
                            return { "value":"accessmngt" ,"label":"accessmngt" }
                        }) 
                    }
                    onChange={e_arr => onChangeSelect(e_arr, "policies", index, role_name)}
                    />
                </div>
            </div>

        </div>
    );
}

export default RolesHtml;
