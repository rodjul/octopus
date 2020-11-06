import React from "react";
import { Button } from 'reactstrap';
import {
    TextField, DialogTitle, DialogContentText, DialogContent, DialogActions, Dialog,
} from "@material-ui/core";



const DialogCreateProject = ({dataSelected, onSubmitCreateProject}) => {
    const [openModalCreateProject, setOpenModalCreateProject] = React.useState(false);
    const [newProjectName, setNewProjectName] = React.useState("");
    const [motive, setMotive] = React.useState("");

    const handleCloseModalCreateProject = () => setOpenModalCreateProject(false);
    const handleClickModalCreateProject = () => setOpenModalCreateProject(true);

    const handleNewProjectName = (e) => setNewProjectName(e.target.value);
    const handleMotive = (e) => setMotive(e.target.value);

    const handleSubmit = (e) => {
        e.preventDefault();

        let data = {
            "project": newProjectName,
            "motive": motive,
        }
        onSubmitCreateProject(data);

        handleCloseModalCreateProject();
    }

    const folder = dataSelected.length && dataSelected[0].name.startsWith("folders/") ? dataSelected[0] : "";
    
    return (
        <>
            <Button color="primary" onClick={() => handleClickModalCreateProject()}>Criar um novo projeto</Button>

            <Dialog
                open={openModalCreateProject}
                onClose={() => handleCloseModalCreateProject()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Novo projeto "}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <form id="create-project" autoComplete="false" onSubmit={(e) => handleSubmit(e)}>
                            Criar uma novo projeto em: <b>{folder.displayName}</b>

                            <TextField 
                                id="standard-basic" 
                                name="project-name"
                                type="text" 
                                label="Nome do projeto" 
                                placeholder="New Project" 
                                onBlur={e => handleNewProjectName(e)}
                                style={{ marginTop: 12 }} 
                                // helperText="Full width!"
                                disabled={folder ? false : true}
                                margin="normal" 
                                fullWidth 
                            />
                            
                            <TextField 
                                id="standard-basic" 
                                name="motive"
                                type="text" 
                                label="Motivo da criação" 
                                placeholder="Motivo da criação" 
                                onBlur={e => handleMotive(e)}
                                style={{ marginTop: 12 }} 
                                // helperText="Full width!"
                                disabled={folder ? false : true}
                                margin="normal" 
                                fullWidth 
                            />

                        </form>

                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button form="create-project" color="primary" autoFocus disabled={folder ? false : true}>
                        Sim
                    </Button>
                    <Button onClick={() => handleCloseModalCreateProject()} color="secondary">
                        Não
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default DialogCreateProject;