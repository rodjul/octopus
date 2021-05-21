import React from "react";
import { Button } from 'reactstrap';
import {
    TextField, DialogTitle, DialogContentText, DialogContent, DialogActions, Dialog,
} from "@material-ui/core";



const DialogCreateFolder = ({dataSelected, onSubmitCreateFolder}) => {
    const [openModalCreateFolder, setOpenModalCreateFolder] = React.useState(false);
    const [newFolderName, setNewFolderName] = React.useState("");
    // const [motive, setMotive] = React.useState("");

    const handleCloseModalCreateFolder = () => setOpenModalCreateFolder(false);
    const handleClickModalCreateFolder = () => setOpenModalCreateFolder(true);

    const handleNewFolderName = (e) => setNewFolderName(e.target.value);
    // const handleMotive = (e) => setMotive(e.target.value);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let data = {
            "folder": newFolderName,
            // "motive": motive,
        }
        onSubmitCreateFolder(data);

        handleCloseModalCreateFolder();
    }

    const folder = dataSelected.length && dataSelected[0].name.startsWith("folders/") ? dataSelected[0] : "";

    return (
        <>
            <Button color="primary" onClick={() => handleClickModalCreateFolder()}>Criar uma nova pasta</Button>

            <Dialog
                open={openModalCreateFolder}
                onClose={() => handleCloseModalCreateFolder()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Nova Pasta "}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <form id="create-folder" autoComplete="false" onSubmit={(e) => handleSubmit(e)}>
                            Criar uma nova pasta em: <b>{folder.displayName}</b>

                            <TextField 
                                id="standard-basic" 
                                name="folder-name"
                                type="text" 
                                label="Nome da pasta" 
                                placeholder="New Folder Group" 
                                onBlur={e => handleNewFolderName(e)}
                                style={{ marginTop: 12 }} 
                                // helperText="Full width!"
                                disabled={folder ? false : true}
                                margin="normal" 
                                fullWidth 
                            />
                            
                            {/* <TextField 
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
                            /> */}

                        </form>

                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button form="create-folder" color="primary" autoFocus disabled={folder ? false : true}>
                        Sim
                    </Button>
                    <Button onClick={() => handleCloseModalCreateFolder()} color="secondary">
                        Não
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default DialogCreateFolder;