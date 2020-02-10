import React from "react";
import Select from "react-select";

const RolesHtml = (
    {
        role_name, policy_arn_aws, index, trust_relationship, policies_select, trusts_select,
        handleJson, handleForm, handleRemoveFields
    }) =>{
    const role = []

    return (
        <div className="form_margin_bottom shadow" key={`${role_name}~${index}`}>
            <div className="form-group row">
                <label htmlFor="role_name" className="col-sm-2 col-form-label bolder">Name: </label>
                <div className="col-sm-10">
                    <input key={`${role_name}~${index}`} type="text" name="role_name" 
                    //onChange={(e) => this.onChangeForms("role_name",index,e)}
                    className="form-control" placeholder="accessmngt" 
                    defaultValue={role_name}
                    />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="name_role" className="col-sm-2 col-form-label bolder">Description: </label>
                <div className="col-sm-10">
                    <input key={`${role['role_description']}~${index}`} type="text" name="role_description"
                    //onChange={(e) => this.onChangeForms("role_description",index,e)}
                    className="form-control" placeholder="" defaultValue={role['role_description']} />
                </div>
            </div>                            
            <div className="form-group row">
                <label htmlFor="policies_role" className="col-sm-2 col-form-label bolder">Policies: </label>
                <div className="col-sm-10">
                    <Select key={`${role_name}~${index}`} className="policies" closeMenuOnSelect={false} isMulti 
                    options={policies_select} 
                    defaultValue={ 
                        role['policies'].map(elem => {
                            return { "value":elem ,"label":elem }
                        }) 
                    }
                    //onChange={e_arr => this.onChangeSelect(e_arr, "policies", index)}
                    />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="policyArnAws_role" className="col-sm-2 col-form-label bolder">PolicyArnAWS: </label>
                <div className="col-sm-10">
                    <input key={`${policy_arn_aws}~${index}`} type="text" name="policy_arn_aws" 
                    // //onChange={this.handleInputChange}
                    ////onChange={(e) => this.onChangeForms("policy_arn_aws",index,e)}
                    className="form-control" 
                    placeholder="arn:aws:iam::aws:policy/aws-service-role/AccessAnalyzerServiceRolePolicy,arn:aws:iam::0123456789:policy/policy-accessmngt" 
                    defaultValue={policy_arn_aws}
                    ////onChange={e => this.handleChangePolicyARN(e.value, "policy_arn", index)}
                    //onChange={e => this.handleChangePolicyARN(e, index)}
                    />
                    <span className="text-note">Separar por vírgula se tiver mais de uma ARN</span>
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="trustRelationship_role" className="col-sm-2 col-form-label bolder">TrustRelationship: </label>
                <div className="col-sm-10">
                    <Select key={`${role_name}~${index}`} 
                    className="trust_relationship" closeMenuOnSelect={true} options={trusts_select} 
                    defaultValue={ { "value":trust_relationship ,"label":trust_relationship } }
                    //onChange={e => this.onChangeSelect(e.value, "trust_relationship", index)}
                    />
                </div>
            </div>
            
            <div className="form-group col-sm-2">
                <button className="btn btn-danger" type="button"
                onClick={() => this.handleRemoveFields(index, "role")} 
                >Remover</button>
            </div>

        </div>
    );
}

export default RolesHtml;
