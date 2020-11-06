import React from "react";
import {
    TextField, DialogTitle, DialogContentText, DialogContent, DialogActions, Dialog
} from "@material-ui/core";
import {
    Input, Table as TableStrap, Button, Pagination, PaginationItem, PaginationLink, FormGroup, Label
} from 'reactstrap';



const DialogCreateFolder = ({dateReports, onSubmitGetReport}) => {
    const [openModalCreateFolder, setOpenModalCreateFolder] = React.useState(false);
    const [newFolderName, setNewFolderName] = React.useState("");
    const [date, setDate] = React.useState("");

    const handleCloseModalCreateFolder = () => setOpenModalCreateFolder(false);
    const handleClickModalCreateFolder = () => setOpenModalCreateFolder(true);

    const handleDateReport = (e) => setDate(e.target.value);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let data = {
            "dateReport": date,
            // "motive": motive,
        }
        onSubmitGetReport(data);

        handleCloseModalCreateFolder();
    }


    return (
        <>
            <Button color="primary" onClick={() => handleClickModalCreateFolder()}>Obter relatório</Button>

            <Dialog
                fullWidth={true}
                maxWidth={"sm"}
                open={openModalCreateFolder}
                onClose={() => handleCloseModalCreateFolder()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Obter relatório</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <form id="get-report" autoComplete="false" onSubmit={(e) => handleSubmit(e)}>

                            <FormGroup>
                                <Label for="selectPermission">Selecione o dia do reporte</Label>
                                <Input type="select" name="selectPermission" id="selectPermission" onChange={(e) => handleDateReport(e)}>
                                    <option value=""></option>
                                    {dateReports.map(value => {
                                        return <option value={`${value['Timestamp']}`}>{value['Timestamp']}</option>
                                    })}
                                </Input>
                            </FormGroup>

                        </form>

                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button form="get-report" color="primary" autoFocus disabled={dateReports.length ? false : true}>
                        Obter
                    </Button>
                    <Button onClick={() => handleCloseModalCreateFolder()} color="secondary">
                        Cancelar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default DialogCreateFolder;