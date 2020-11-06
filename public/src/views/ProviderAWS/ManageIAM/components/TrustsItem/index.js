import React, {memo} from "react";
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';
import { FormGroup, FormLabel, Tab, Tabs} from "react-bootstrap";
import { Button, DialogTitle, DialogContentText, DialogContent, DialogActions, Dialog } from "@material-ui/core";
import { Add as AddIcon, Save as SaveIcon, Delete as DeleteIcon, Info as InfoIcon } from '@material-ui/icons';

const TrustItem = ({trustData, index, callbackDeleteIndex, callbackSaveData}) =>{
    const [trustName, setTrustName] = React.useState(trustData.trust_name);
    const [trustDescription, setTrustDescription] = React.useState(trustData.trust_description);
    const [trustDocument, setTrustDocument] = React.useState(trustData.trust_assume_role_policy_document);

    const [openModalDelete, setOpenModalDelete] = React.useState(false);
    const handleCloseModalDelete = () => setOpenModalDelete(false);
    const handleClickModalDelete = () => setOpenModalDelete(true);

    const handleDeleteRoleModalConfirm = () => {
        callbackDeleteIndex("trust", index);
        handleCloseModalDelete();
    }

    const onChangeForms = event => {
        if(event.target.name === "trust_name"){
            let regex = new RegExp("\\s+|[.,/#!$%^&*;:{}=`~()@¨'\"+[\\]`´]");
            // if does not contains space, set the state
            if(!regex.test(event.target.value)){
                setTrustName(event.target.value);
            }else{
                // if it does, set the value of the state (not from the event input)
                let previousValue = event.target.value.slice(0, event.target.value.length -1 );
                setTrustName(previousValue);
            }
        }else if(event.target.name === "trust_description"){
            setTrustDescription(event.target.value);
        }
    }
 
    const onChangeJson = event => setTrustDocument( event.jsObject);

    React.useEffect( () => {
        let data = {
            "trust_name": trustName, 
            "trust_description": trustDescription,
            "trust_assume_role_policy_document": trustDocument, 
        }
        if(trustData.hasOwnProperty("new"))
            data['new'] = true;
            
        callbackSaveData("trust", data, index);
        
    },[ trustName, trustDescription,  JSON.stringify(trustDocument)]);


    return (
        <div className="form_margin_bottom shadow">
            <Button variant="contained" color="secondary" startIcon={<DeleteIcon />} onClick={ handleClickModalDelete }
            style={{display:"flex", marginLeft:"auto"}}
            html="true">
                Deletar
            </Button>

            <div className="form-group row" style={{marginTop:"-1.8em"}}>
                <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">Name: </label>
                <div className="col-sm-12">
                    <input type="text" id="name_trust" name="trust_name" 
                    onChange={(e) => onChangeForms(e)}
                    disabled={trustData.hasOwnProperty("new")? false : true}
                    className="form-control" placeholder="Readonly" value={trustName} />
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">Description: </label>
                <div className="col-sm-12">
                    <input type="text" name="trust_description" className="form-control" 
                    placeholder="Description of this document" 
                    onChange={e => onChangeForms(e)}
                    value={trustDescription} 
                    />
                </div>
            </div>
            <div className="form_margin_bottom">
                <FormGroup>
                    <FormLabel htmlFor="assumerolepolicydocument_" className="bolder">AssumeRolePolicyDocument: </FormLabel>
                    {/* <FormControl name={"assumerolepolicydocument_"+ trust_name} as="textarea" rows="12" defaultValue={JSON.stringify( policy_document, "", '\t' )} /> */}
                </FormGroup>
                
                <Tabs defaultActiveKey="json" id="uncontrolled-tab-example">

                    <Tab eventKey="json" title="JSON">

                        {/* https://github.com/AndrewRedican/react-json-editor-ajrm */}
                        <JSONInput onChange={(e) => onChangeJson(e)} className="custom-rod" name="trust_document"
                            id          = 'json_editor'
                            placeholder = { trustDocument }
                            //theme="light_mitsuketa_tribute"
                            // colors      = { {
                            //     string: "#DAA520" // overrides theme colors with whatever color value you want
                            //   }}
                            locale      = { locale }
                            height      = 'auto'
                            width       = 'auto'
                        />

                    </Tab>
                    <Tab eventKey="editor" title="Editor">
                        <p>item 2</p>
                    </Tab>
                </Tabs>

                
            </div>


            <Dialog
                open={openModalDelete}
                onClose={handleCloseModalDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Deletando "+trustName}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Deseja realmente deletar {trustName}? Essa ação é irreversível.
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

export default memo(TrustItem);