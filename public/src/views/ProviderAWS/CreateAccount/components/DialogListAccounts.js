import React from "react";
import { Button } from 'reactstrap';
import {
    TextField, DialogTitle, DialogContentText, DialogContent, DialogActions, Dialog, Table,
} from "@material-ui/core";

import TableAccountsCreated from "./TableAccountsCreated";
import LoadingCircularProgress from "../../../../components/LoadingCircularProgress";

const DialogListAccounts = ({accounts, getAccounts, blocking}) => {
    const [openModalCreateProject, setOpenModalCreateProject] = React.useState(false);
    // const [newProjectName, setNewProjectName] = React.useState("");
    // const [motive, setMotive] = React.useState("");

    const handleCloseModalCreateProject = () => setOpenModalCreateProject(false);
    const handleClickModalCreateProject = async () => {
        getAccounts();
        setOpenModalCreateProject(true);
    }

    // const handleNewProjectName = (e) => setNewProjectName(e.target.value);
    // const handleMotive = (e) => setMotive(e.target.value);

    const handleSubmit = (e) => {
        e.preventDefault();

        // let data = {
        //     "project": newProjectName,
        //     "motive": motive,
        // }
        // onSubmitCreateProject(data);

        // handleCloseModalCreateProject();
    }

    // const folder = dataSelected.length && dataSelected[0].name.startsWith("folders/") ? dataSelected[0] : "";
    // console.log("accounts: ",accounts);
    
    return (
        <>
            <Button color="primary" onClick={() => handleClickModalCreateProject()}>
                Informações das contas 
            </Button>

            <Dialog
                maxWidth={"lg"}
                open={openModalCreateProject}
                onClose={() => handleCloseModalCreateProject()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Informações das contas
                    {blocking ? <LoadingCircularProgress size={20} className="icon-loading-position-history" /> : null} 
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        
                        <TableAccountsCreated 
                            accounts={accounts}
                            blocking={false}
                        />

                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {/* <Button form="create-project" color="primary" autoFocus disabled={folder ? false : true}>
                        Sim
                    </Button> */}
                    <Button onClick={() => handleCloseModalCreateProject()} color="secondary">
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default DialogListAccounts;