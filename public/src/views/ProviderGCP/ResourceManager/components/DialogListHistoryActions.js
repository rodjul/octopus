import React from "react";
import { Button } from 'reactstrap';
import {
    TextField, DialogTitle, DialogContentText, DialogContent, DialogActions, Dialog, Table,
} from "@material-ui/core";

import TableHistoryLogs from "./TableHistoryLogs";
import LoadingCircularProgress from "../../../../components/LoadingCircularProgress";


const DialogListHistoryActions = ({historyActions, onClickGetHistoryActions, blocking}) => {
    const [openModalCreateProject, setOpenModalCreateProject] = React.useState(false);
    // const [newProjectName, setNewProjectName] = React.useState("");
    // const [motive, setMotive] = React.useState("");

    const handleCloseModalCreateProject = () => setOpenModalCreateProject(false);
    const handleClickModalCreateProject = async () => {
        onClickGetHistoryActions();
        setOpenModalCreateProject(true);
    }

    
    return (
        <>
            <Button color="primary" onClick={() => handleClickModalCreateProject()}>Histório de ações</Button>

            <Dialog
                maxWidth={"lg"}
                open={openModalCreateProject}
                onClose={() => handleCloseModalCreateProject()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Histório de ações 
                    {blocking ? <LoadingCircularProgress size={20} className="icon-loading-position-history" /> : null} 
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        
                        <TableHistoryLogs 
                            historyActions={historyActions}
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

export default DialogListHistoryActions;