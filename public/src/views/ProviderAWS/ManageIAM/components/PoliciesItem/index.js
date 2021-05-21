import React, {memo} from "react";
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';
import { FormGroup, FormLabel} from "react-bootstrap";
import { Button, DialogTitle, DialogContentText, DialogContent, DialogActions, Dialog } from "@material-ui/core";
import { Delete as DeleteIcon} from '@material-ui/icons';


const PoliciesItem = ({policyData, index, callbackDeleteIndex, callbackSaveData}) => {

    const [policyName, setPolicyName] = React.useState(policyData.policy_name);
    const [policyDescription, setPolicyDescription] = React.useState(policyData.policy_description);
    const [policyPath, setPolicyPath] = React.useState(policyData.policy_path);
    const [policyDocument, setPolicyDocument] = React.useState(policyData.policy_document);
    
    const [openModalDelete, setOpenModalDelete] = React.useState(false);
    const handleCloseModalDelete = () => setOpenModalDelete(false);
    const handleClickModalDelete = () => setOpenModalDelete(true);

    const handleDeleteRoleModalConfirm = () => {
        callbackDeleteIndex("policy", index);
        handleCloseModalDelete();
    }

    const onChangeForms = event => {
        if(event.target.name === "policy_name"){
            let regex = new RegExp("\\s+|[.,/#!$%^&*;:{}=`~()@¨'\"+[\\]`´]");
            // if does not contains space, set the state
            if(!regex.test(event.target.value)){
                setPolicyName(event.target.value);
            }else{
                // if it does, set the value of the state (not from the event input)
                let previousValue = event.target.value.slice(0, event.target.value.length -1 );
                setPolicyName(previousValue);
            }
        }else if(event.target.name === "policy_description"){
            setPolicyDescription(event.target.value);

        }else if(event.target.name === "policy_path"){
            setPolicyPath(event.target.value);

        }
    }
 
    const onChangeJson = event => setPolicyDocument( event.jsObject);

    React.useEffect( () => {
        let data = {
            "policy_name": policyName, 
            "policy_description": policyDescription, 
            "policy_path": policyPath, 
            "policy_document": policyDocument, 
        }
        if(policyData.hasOwnProperty("new"))
            data['new'] = true;

        callbackSaveData("policy",data, index);
        
    },[ policyName, policyDescription, policyPath, JSON.stringify(policyDocument)]);

    return (
        <div className="form_margin_bottom shadow">
            <Button variant="contained" color="secondary" startIcon={<DeleteIcon />} onClick={ handleClickModalDelete }
            style={{display:"flex", marginLeft:"auto"}}
            html="true">
                Deletar
            </Button>

            <div className="form-group row" style={{marginTop:"-1.8em"}}>
                <label htmlFor="policy_name" className="col-sm-2 col-form-label bolder">Name: </label>
                <div className="col-sm-12">
                    <input type="text" name="policy_name"
                    onChange={(e) => onChangeForms(e)}
                    disabled={policyData.hasOwnProperty("new")? false : true}
                    className="form-control" placeholder="policy-seginfo" value={policyName} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="policy_description" className="col-sm-2 col-form-label bolder">Description: </label>
                <div className="col-sm-12">
                    <input type="text" name="policy_description"
                    onChange={(e) => onChangeForms(e)}
                    className="form-control" placeholder="Policy with read only" value={policyDescription} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="policy_path" className="col-sm-2 col-form-label bolder">Path: </label>
                <div className="col-sm-12">
                    <input type="text" name="policy_path"
                    onChange={(e) => onChangeForms(e)}
                    className="form-control" placeholder="/" value={policyPath} />
                </div>
            </div>

            <div className="form_margin_bottom">
                <FormGroup controlId="email2" bssize="large">
                    <FormLabel className="bolder">PolicyDocument: </FormLabel>
                    {/* <FormControl name={"textarea_"+ policy_name} as="textarea" rows="12" defaultValue={JSON.stringify( policy_document, null, '\t' )} /> */}
                </FormGroup>
                <JSONInput onChange={(e) => onChangeJson(e)} //className="custom-rod"
                        id          = 'policy_document'
                        placeholder = { policyDocument }
                        locale      = { locale }
                        height      = 'auto'
                        width       = 'auto'
                /> 
            </div>

            <Dialog
                open={openModalDelete}
                onClose={handleCloseModalDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Deletando "+policyName}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Deseja realmente deletar {policyName}? Essa ação é irreversível.
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

        </div>
    )
}

export default memo(PoliciesItem);