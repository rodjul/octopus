import React from "react";
import {
    TextField, DialogTitle, DialogContentText, DialogContent, DialogActions, Dialog
} from "@material-ui/core";
import {
    Input, Table as TableStrap, Button, Pagination, PaginationItem, PaginationLink, FormGroup, Label
} from 'reactstrap';

import ChipInput from 'material-ui-chip-input'


const DialogAddUserProject = ({dataSelected, onSubmitAddUserProject}) => {
    const [openModalAddUser, setOpenModalAddUser] = React.useState(false);
    const [users, setUsers] = React.useState([]);
    const [rolePermission, setRolePermission] = React.useState("");
    const [motive, setMotive] = React.useState("");

    const handleCloseModalAddUser = () => setOpenModalAddUser(false);
    const handleClickModalAddUser = () => setOpenModalAddUser(true);

    const handleRolePermission = (e) => setRolePermission(e.target.value);
    const handleMotive = (e) => setMotive(e.target.value);

    const handleSubmit = (e) => {
        e.preventDefault();

        if(rolePermission && users.length && dataSelected.length ){
            let data = {
                "users": users,
                "role_id": rolePermission,
                "motive": motive
            }
            onSubmitAddUserProject(data);
            setUsers([]);
            setRolePermission("");
        }

        handleCloseModalAddUser();
    }

    const handleAddChip = (chip) => {
        let newUsers = [...users, chip];
        setUsers(newUsers);
    }

    const handleDeleteChip = (chip, index) => {
        let newUsers = users.filter((user, i) => i!==index ? user : "" );
        setUsers(newUsers);
    }

    const project = dataSelected.length && !dataSelected[0].name.startsWith("folders/") ? dataSelected[0].name : "";

    return (
        <>
            <Button color="primary" onClick={() => handleClickModalAddUser()}>Adicionar usuário no projeto</Button>

            <Dialog
                open={openModalAddUser}
                onClose={() => handleCloseModalAddUser()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Adicionar usuário no projeto</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <form id="add-user-iam-project" autoComplete="false" onSubmit={(e) =>  handleSubmit(e)}>
                            Projeto selecionado: <b>{project}</b>

                            {/* <TextField 
                                id="standard-basic" 
                                name="motive"
                                type="text" 
                                label="Usuários" 
                                placeholder="Usuários de email" 
                                onBlur={e => handleUsers(e)}
                                style={{ marginTop: 12 }} 
                                // helperText="Full width!"
                                disabled={dataSelected.length ? false : true}
                                margin="normal" 
                                fullWidth 
                            /> */}
                            
                            {/* 
                            https://github.com/TeamWertarbyte/material-ui-chip-input 
                            https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
                            */}
                            <TextField 
                                id="standard-basic" 
                                name="motive"
                                type="text" 
                                label="Motivo dessa ação" 
                                placeholder="..." 
                                onBlur={e => handleMotive(e)}
                                style={{ marginTop: 12 }} 
                                // helperText="Full width!"
                                disabled={project.length ? false : true}
                                margin="normal" 
                                fullWidth 
                            />
                            
                            <ChipInput
                                value={users}
                                onAdd={(chip) => handleAddChip(chip)}
                                onDelete={(chip, index) => handleDeleteChip(chip, index)}
                                fullWidth
                                newChipKeys={[',',' ','Enter']}
                                label='Usuários para incluir'
                                placeholder='Digite o email e de enter para inserir ou separar por vírgula'
                                style={{marginTop:"1rem",marginBottom:"1rem"}}
                            />
                            
                            <FormGroup>
                                <Label for="selectPermission">Permissão dos usuários</Label>
                                <Input type="select" name="selectPermission" id="selectPermission" onChange={(e) => handleRolePermission(e)}>
                                    <option value=""></option>
                                    <option value="roles/editor">Editor</option>
                                    <option value="roles/viewer">Viewer</option>
                                </Input>
                            </FormGroup>


                        </form>

                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button form="add-user-iam-project" color="primary" autoFocus disabled={project.length ? false : true}>
                        Sim
                    </Button>
                    <Button onClick={() => handleCloseModalAddUser()} color="secondary">
                        Não
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default DialogAddUserProject;