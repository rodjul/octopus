import React from "react";
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';
import { FormGroup, FormLabel} from "react-bootstrap";

const PoliciesItem = ({policy_name, description, path, policy_document, index, handleJson, handleForm, handleRemoveFields}) => {
    return (
        <div className="form_margin_bottom shadow" key={policy_name}>
            <div className="form-group row">
                <label htmlFor="name_policy" className="col-sm-2 col-form-label bolder">Name: </label>
                <div className="col-sm-10">
                    <input type="text" name="Name"
                    onChange={(e) => handleForm("policy_name",index,e)}
                    className="form-control" placeholder="policy-seginfo" defaultValue={policy_name} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="description_policy" className="col-sm-2 col-form-label bolder">Description: </label>
                <div className="col-sm-10">
                    <input type="text" name="Description"
                    onChange={(e) => handleForm("policy",index,e)}
                    className="form-control" placeholder="Policy with read only" defaultValue={description} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="path_policy" className="col-sm-2 col-form-label bolder">Path: </label>
                <div className="col-sm-10">
                    <input type="text" name="Path"
                    onChange={(e) => handleForm("policy_path",index,e)}
                    className="form-control" placeholder="/" defaultValue={path} />
                </div>
            </div>

            <div className="form_margin_bottom">
                <FormGroup controlId="email2" bssize="large">
                    <FormLabel className="bolder">PolicyDocument: </FormLabel>
                    {/* <FormControl name={"textarea_"+ policy_name} as="textarea" rows="12" defaultValue={JSON.stringify( policy_document, null, '\t' )} /> */}
                </FormGroup>
                <JSONInput onChange={(e) => handleJson("policy", index, e)} className="custom-rod"
                        id          = 'json_editor'
                        placeholder = { policy_document }
                        locale      = { locale }
                        height      = 'auto'
                        width       = 'auto'
                /> 
            </div>

            <div className="form-group col-sm-2">
                <button className="btn btn-danger" type="button"
                onClick={() => handleRemoveFields(index, "policy")} 
                >Remover</button>
            </div>

        </div>
    )
}

export default PoliciesItem;