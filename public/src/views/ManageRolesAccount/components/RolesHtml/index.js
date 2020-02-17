import React from "react";
import Select from "react-select";

const RolesHtml = (
    {
        role_type, index, policies_selected, policies_available, onChangeSelect
    }) =>{

    // this condition is to be certain that are results to be render when doing componentDidMount
    // without this, the first value the will come is null ([]) and the react-select will not update their values
    // making the html select render with blank results, where in reality there are results
    if(role_type !== "New type" && policies_selected.length){
        return (
            <div className="" key={`${role_type}~${index}`}>
                                    
                <div className="form-group row">
                    <label htmlFor="policies_role" className="col-sm-2 col-form-label bolder">Roles: </label>
                    <div className="col-sm-12">
                        <Select key={`${role_type}~${index}`} className="policies" closeMenuOnSelect={false} isMulti 
                        options={policies_available} 
                        defaultValue={policies_selected}
                        onChange={e_arr => onChangeSelect(e_arr, "policies", index, role_type)}
                        />
                    </div>
                </div>

            </div>
        );
    }
    return (
        <div className="" key={`${role_type}~${index}`}>
                                
            <div className="form-group row">
                <label htmlFor="policies_role" className="col-sm-2 col-form-label bolder">Roles: </label>
                <div className="col-sm-12">
                    <Select key={`${role_type}~${index}`} className="policies" closeMenuOnSelect={false} isMulti 
                    options={policies_available} 
                    defaultValue={policies_selected}
                    onChange={e_arr => onChangeSelect(e_arr, "policies", index, role_type)}
                    />
                </div>
            </div>

        </div>
    );
}

export default RolesHtml;
