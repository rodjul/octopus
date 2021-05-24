import React, {memo} from "react";
import Select from "react-select";
import AlertMessage from "../../../../../components/AlertMessage";
import { Button, DialogTitle, DialogContentText, DialogContent, DialogActions, Dialog } from "@material-ui/core";
import {  Delete as DeleteIcon } from '@material-ui/icons';


const RolesHtml = ({roleData, index, policiesAvailable, trustsAvailable, callbackDeleteIndex, callbackSaveData}) =>{

    const [roleName, setRoleName] = React.useState(roleData.role_name);
    const [roleDescription, setRoleDescription] = React.useState(roleData.role_description);
    const [rolePolicies, setRolePolicies] = React.useState(roleData.policies);
    const [roleTrustRelationship, setRoleTrustRelationship] = React.useState(roleData.trust_relationship);
    const [rolePolicyArnAws, setRolePolicyArnAws] = React.useState(roleData.policy_arn_aws);

    const [openAlert, setOpenAlert] = React.useState(false);
    const [typeMessage, setTypeMessage] = React.useState("");
    const [messageAlert, setMessageAlert] = React.useState("");

    const [openModalDelete, setOpenModalDelete] = React.useState(false);
    const handleCloseModalDelete = () => setOpenModalDelete(false);
    const handleClickModalDelete = () => setOpenModalDelete(true);

    const handleDeleteRoleModalConfirm = () => {
        callbackDeleteIndex("role", index);
        handleCloseModalDelete();
    }

    const handleOpenAlert = elem => setOpenAlert(elem);

    const onChangeForms = event => {
        if(event.target.name === "role_name"){
            let regex = new RegExp("\\s+|[.,/#!$%^&*;:{}=`~()@¨'\"+[\\]`´]");
            // if does not contains space, set the state
            if(!regex.test(event.target.value)){
                setRoleName(event.target.value);
            }else{
                // if it does, set the value of the state (not from the event input)
                let previousValue = event.target.value.slice(0, event.target.value.length -1 );
                setRoleName(previousValue);
            }
        }else if(event.target.name === "role_description"){
            setRoleDescription(event.target.value);

        }else if(event.target.name === "policy_arn_aws"){
            // console.log(event.target, event.target.value);
            //let term = "arn:aws:iam::aws:policy/ReadOnlyAccess";
            // let regex = new RegExp("(arn:aws:iam::(aws|([0-9]+)):policy\/[A-Za-z0-9-]+\/*[A-Za-z0-9-]*$,*)");
            //let regex = new RegExp("((arn:aws:iam::(aws|([0-9]+)):policy\/[A-Za-z0-9-]+\/*[A-Za-z0-9-]*),*)+");
            let regex = new RegExp("\\s");
            // let regex = new RegExp("\\s+|[.#!$%^&*;{}=_`~()@¨'\"+[\\]`´]");
            
            if(!regex.test(event.target.value)){
                setRolePolicyArnAws(event.target.value);
            }else{
                let previousValue = event.target.value.slice(0, event.target.value.length -1 );
                setRolePolicyArnAws(previousValue);
            }
        }
    }

    const onChangeSelect = (selectedOption, type) => {
        if(selectedOption !== undefined && isQuantityPoliciesAttachedReached()){
            setOpenAlert(true);
            setTypeMessage("error");
            setMessageAlert("A role "+roleName+" so pode possuir até 10 policies");
            return;
        }
        
        if(type === "policies"){
            if( selectedOption !== null && selectedOption.length){
                let allData = selectedOption.map(data => data.value);
                setRolePolicies(allData);
            }else
                setRolePolicies([]);

        }else if (type === "trust_relationship"){
            if( selectedOption !== null){
                setRoleTrustRelationship(selectedOption.value);
            }else
                setRoleTrustRelationship([]);
        }
    };

    /**
     * Valid if the total number (10) of attached policies is not reached
     * Check policy ARN and custom policies
     */
    const isQuantityPoliciesAttachedReached = () => {
        const maxNumberAttachedAllowed = 10;
        let policies = rolePolicies.length +1;
        let policiesArn = rolePolicyArnAws.split(",");
        if(policiesArn[0] === "") 
            policiesArn = 0;
        else 
            policiesArn = policies.length;
        
        if( (policies + policiesArn) > maxNumberAttachedAllowed ){
            return true;
        }
    
        return false;
    }

    React.useEffect( () => {
        let data = {
            "role_name": roleName, 
            "role_description": roleDescription, 
            "policies": rolePolicies, 
            "trust_relationship": roleTrustRelationship, 
            "policy_arn_aws": rolePolicyArnAws,
        }
        if(roleData.hasOwnProperty("new"))
            data['new'] = true;

        callbackSaveData("role",data, index);
        
    },[ roleName, roleDescription, JSON.stringify(rolePolicies), roleTrustRelationship, rolePolicyArnAws ])
    
    
    return (
        <div className="form_margin_bottom shadow" key={`${roleData.role_name}~${index}`}>
            <Button variant="contained" color="secondary" startIcon={<DeleteIcon />} onClick={ handleClickModalDelete }
            style={{display:"flex", marginLeft:"auto"}}
            html="true">
                Deletar
            </Button>

            <div className="form-group row" style={{marginTop:"-1.8em"}}>
                <label htmlFor="role_name" className="col-sm-3 col-form-label bolder">Name: </label>
                <div className="col-sm-12">
                    <input type="text" name="role_name" 
                    onChange={(e) => onChangeForms(e)}
                    className="form-control" placeholder="accessmngt" 
                    disabled={roleData.hasOwnProperty("new")? false : true}
                    value={roleName}
                    />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="name_role" className="col-sm-3 col-form-label bolder">Description: </label>
                <div className="col-sm-12">
                    <input type="text" name="role_description"
                    onChange={(e) => onChangeForms(e)}
                    className="form-control" placeholder="" defaultValue={roleDescription} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="policies_role" className="col-sm-3 col-form-label bolder">Policies: </label>
                <div className="col-sm-12">
                    <Select key={`${roleData.role_name}~${index}`} className="policies" 
                    closeMenuOnSelect={false} 
                    isMulti 
                    options={
                        policiesAvailable.map(policy => { return { "value": policy.policy_name, "label": policy.policy_name}})
                    } //policies_available
                    defaultValue={
                        rolePolicies === undefined ? [] : rolePolicies.map(elem => {
                            return { "value":elem ,"label":elem }
                        }) 
                    }
                    onChange={e => onChangeSelect(e, "policies")}
                    />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="policyArnAws_role" className="col-sm-3 col-form-label bolder">PolicyArnAWS: </label>
                <div className="col-sm-12">
                    <input type="text" name="policy_arn_aws" 
                    // //onChange={this.handleInputChange}
                    ////onChange={(e) => onChangeForms("policy_arn_aws",index,e)}
                    className="form-control" 
                    placeholder="arn:aws:iam::aws:policy/aws-service-role/AccessAnalyzerServiceRolePolicy,arn:aws:iam::0123456789:policy/policy-accessmngt" 
                    value={rolePolicyArnAws}
                    ////onChange={e => this.handleChangePolicyARN(e.value, "policy_arn", index)}
                    onChange={e => onChangeForms(e)}
                    />
                    <span className="text-note">Separar por ví­rgula se tiver mais de uma ARN</span>
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="trustRelationship_role" className="col-sm-3 col-form-label bolder">TrustRelationship: </label>
                <div className="col-sm-12">
                    <Select key={`${roleName}~${index}`} 
                    className="trust_relationship" closeMenuOnSelect={true} 
                    options={
                        trustsAvailable.map(elem => {
                            return { "value":elem['trust_name'] ,"label":elem['trust_name'] };
                        })
                    } 
                    defaultValue={ { "value":roleTrustRelationship ,"label":roleTrustRelationship } }
                    // onChange={e => onChangeSelect(e.value, "trust_relationship", index)}
                    onChange={e => onChangeSelect(e, "trust_relationship")}
                    />
                </div>
            </div>

                
            <Dialog
                open={openModalDelete}
                onClose={handleCloseModalDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Deletando "+roleName}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Deseja realmente deletar {roleName}? Essa ação é irreversível.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteRoleModalConfirm} color="primary" autoFocus>
                        Sim
                    </Button>
                    <Button onClick={handleCloseModalDelete} color="secondary">
                        Não
                    </Button>
                </DialogActions>
            </Dialog>

            <AlertMessage open={openAlert} typeMessage={typeMessage} message={messageAlert} openAlertCallback={handleOpenAlert}/>
        </div>
    );
}

export default memo(RolesHtml);
