import React, {memo} from "react";
import Select from "react-select";

function RoleSelect({index, rolesSelected, rolesAvailable, onChangeSelect}){
    let selectFormat = [];
    try{
        rolesSelected.map(role => selectFormat.push({"value":role, "label": role} ));
    }catch(e){
        JSON.parse(rolesSelected).map(role => selectFormat.push({"value":role, "label": role} ));
    }
    
    return (
        <div className="" key={`${index}`}>
            <div className="form-group row">
                <label htmlFor="policies_role" className="col-sm-2 col-form-label bolder">Roles: </label>
                <div className="col-sm-12">
                    <Select key={`${index}`} className="roles" closeMenuOnSelect={false} isMulti 
                    options={rolesAvailable} 
                    defaultValue={selectFormat}
                    onChange={e_arr => onChangeSelect(e_arr)}
                    />
                </div>
            </div>

        </div>
    );
}

export default memo(RoleSelect);
