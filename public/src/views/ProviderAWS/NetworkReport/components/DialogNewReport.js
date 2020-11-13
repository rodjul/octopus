import React from "react";
import {
    DialogTitle, DialogContentText, DialogContent, DialogActions, Dialog
} from "@material-ui/core";
import {
   Button,
} from 'reactstrap';


const DialogNewReport = ({onSubmitRequestNewReport}) => {
    const [openModalNewReport, setopenModalNewReport] = React.useState(false);

    const handleCloseModalNewReport = () => setopenModalNewReport(false);
    const handleClickModalNewReport = () => setopenModalNewReport(true);


    const handleSubmit = () => {
        // e.preventDefault();
        onSubmitRequestNewReport();
        handleCloseModalNewReport();
    }


    return (
        <>
            <Button color="primary" onClick={() => handleClickModalNewReport()}>Novo relatório</Button>

            <Dialog
                fullWidth={true}
                maxWidth={"sm"}
                open={openModalNewReport}
                onClose={() => handleCloseModalNewReport()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Obter relatório</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Deseja criar um novo relatório? Essa ação irá demorar alguns minutos para concluir.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button form="new-report" color="primary" autoFocus onClick={() => handleSubmit()}>
                        Obter
                    </Button>
                    <Button onClick={() => handleCloseModalNewReport()} color="secondary">
                        Cancelar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default DialogNewReport;