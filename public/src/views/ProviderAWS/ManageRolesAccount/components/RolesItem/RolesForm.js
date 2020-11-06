import React, {memo} from "react";
import { 
    Fab, Box, Zoom, Button, CircularProgress, Tooltip, Typography, Tab, Tabs, 
    DialogTitle, DialogContentText, DialogContent, DialogActions, Dialog
} from "@material-ui/core";
import { Add as AddIcon, Save as SaveIcon, Delete as DeleteIcon, Info as InfoIcon } from '@material-ui/icons';

import RoleSelect from "./RoleSelect";


function RolesForm({roleName, roleDescription, rolesSetted, rolesAvailable, isNewRoleTypeAccount, index, callbackSaveData, callbackDeleteIndex,}){
    const [openModalDelete, setOpenModalDelete] = React.useState(false);
    const [formRoleName, setFormRoleName] = React.useState(roleName);
    const [formDescription, setFormDescription] = React.useState(roleDescription);
    const [formRolesSelected, setFormRolesSelected] = React.useState(rolesSetted);

    const handleClickModalDelete = () => setOpenModalDelete(true);

    const handleChangeForms = event => {
        if(event.target.name === "role_type_name"){
            let regex = new RegExp("\\s+|[.,/#!$%^&*;:{}=`~()@¨'\"+[\\]`´]");
            // if does not contains space, set the state
            if(!regex.test(event.target.value)){
                setFormRoleName(event.target.value);
            }else{
                // if it does, set the value of the state (not from the event input)
                let previousValue = event.target.value.slice(0, event.target.value.length -1 );
                setFormRoleName(previousValue);
            }
        }else{
            setFormDescription(event.target.value);
        }
        saveData()
    }

    const saveData = () =>{
        let dataCallback = {
            "role_type_name": formRoleName,
            "description": formDescription,
            "roles":formRolesSelected,
        }
        if(isNewRoleTypeAccount)
            dataCallback["new"] = true;
        
        callbackSaveData(dataCallback, index);
    }


    const handleCloseModalDelete = () => setOpenModalDelete(false);

    const handleDeleteRoleModalConfirm = () => {
        callbackDeleteIndex(index);
        handleCloseModalDelete();
        
        // if(index) setValue(index -1);
    }


    const onChangeSelect = selectedOption => {
        if( selectedOption !== null && selectedOption.length){
            let allData = selectedOption.map(data => data.value);
            setFormRolesSelected(allData);
        }else
            setFormRolesSelected([]);
    };

    React.useEffect(() => {
        // console.log(formRolesSelected);
        saveData();
    }, [formRolesSelected.toString()]);


    return (
        <>
            <Button variant="contained" color="secondary" startIcon={<DeleteIcon />} onClick={ handleClickModalDelete }
            html="true"
            style={{display:"flex", marginLeft:"auto"}} >
                Deletar
            </Button>
            
            <div className="form-group row" style={{marginTop: "-2em"}}>
                <label htmlFor="name_trust" style={{marginLeft: "0.8em"}} className="col-form-label bolder">Tipo da conta: </label>
                <Tooltip title="O nome da conta tem que ser único" style={{marginTop: "7px", marginLeft: "5px", fontSize: "20px"}} arrow>
                    <InfoIcon size="small" color="primary"/>
                </Tooltip>

                <div className="col-sm-12">
                    <input required type="text" name="role_type_name" disabled={!isNewRoleTypeAccount}
                        onChange={(e) => handleChangeForms(e)}
                        className="form-control" placeholder="policies-cloud" value={formRoleName}
                    />
                </div>
            </div>

            <div className="form-group row">
                <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">Descrição: </label>
                <div className="col-sm-12">
                    <input key={ formDescription } required type="text" name="description"
                        onBlur={(e) => handleChangeForms(e)}
                        className="form-control" placeholder="This document..." defaultValue={ formDescription} />
                </div>
            </div>
                

            <RoleSelect
                key={`${roleName}'~'${index}`}
                index={index}
                // policies_selected={ roles }
                rolesSelected={ formRolesSelected }
                rolesAvailable={ rolesAvailable }
                
                onChangeSelect={onChangeSelect.bind(this)}
            /> 
            

            <Dialog
                open={openModalDelete}
                onClose={handleCloseModalDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Deletando "+formRoleName}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Deseja realmente deletar {roleName}? Essa ação é irreversível.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModalDelete} color="secondary">
                        Não
                    </Button>
                    <Button onClick={handleDeleteRoleModalConfirm} color="primary" autoFocus>
                        Sim
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default memo(RolesForm);