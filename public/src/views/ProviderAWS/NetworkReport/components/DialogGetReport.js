import React from "react";
import {
     DialogTitle, DialogContentText, DialogContent, DialogActions, Dialog
} from "@material-ui/core";
import {
    Input, Button, FormGroup, Label
} from 'reactstrap';

import {formatDateTimezone} from "../../../../utils";


const DialogCreateFolder = ({dateReports, onSubmitGetReport}) => {
    const [openModalCreateFolder, setOpenModalCreateFolder] = React.useState(false);
    // const [newFolderName, setNewFolderName] = React.useState("");
    const [inputValue, setInputValue] = React.useState("");

    const handleCloseModalCreateFolder = () => setOpenModalCreateFolder(false);
    const handleClickModalCreateFolder = () => setOpenModalCreateFolder(true);

    const handleDateReport = (e) => setInputValue(e.target.value);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let data = {
            "dateReport": inputValue.split("#")[0],
            "typeReport": inputValue.split("#")[1],
            // "motive": motive,
        }
        if(data.typeReport === "ec2" || data.typeReport === "rds")
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
                                        return <option value={`${value['Timestamp']}#${value['TypeRequest']}`}>{`${formatDateTimezone(value['Timestamp'],"America/Sao_Paulo")} - ${value['TypeRequest']}`}</option>
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