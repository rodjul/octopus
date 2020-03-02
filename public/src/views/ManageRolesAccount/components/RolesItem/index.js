import React from "react";
import { Form, Modal } from "react-bootstrap";
import { makeStyles } from '@material-ui/core/styles';
import { 
    Fab, Box, Zoom, Button, CircularProgress, Tooltip, Typography, Tab, Tabs, 
    DialogTitle, DialogContentText, DialogContent, DialogActions, Dialog
} from "@material-ui/core";

import PropTypes from 'prop-types';
import { green } from '@material-ui/core/colors';
import {Edit, Add as AddIcon, Save as SaveIcon, MoreVert as MoreVertIcon, Delete as DeleteIcon, Info as InfoIcon } from '@material-ui/icons';

import RolesHtml from "../RolesHtml";
import AlertMessage from "../../../../components/AlertMessage";


function TabPanel(props) {
    const { children, value, index, ...other} = props;
    return (
      <Typography
        component="div"
        role="tabpanel"
        hidden={value !== index}
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        {...other}
      >
        {value === index && <Box p={3}>{children}</Box>}
       
      </Typography>
    );
}

TabPanel.propTypes = {
children: PropTypes.node,
index: PropTypes.any.isRequired,
value: PropTypes.any.isRequired,
};

function a11yProps(index) {
return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
};
}


const useStyles = makeStyles(theme => ({
    formStyle: {
        padding: "2vw",
        width: "40vw",
    },
    content: {
        overflow: "none",
        // marginTop: 64,
        flexGrow: 1,
        marginLeft: 240,
        paddingLeft: 20,
        paddingRight: 20,
        // padding: theme.spacing(3),
        "@media (max-width: 600px)":{
            marginLeft: 0,
            paddingLeft: 20,
      }
    },
    titleHeader: {
        // marginTop: 0,
        // flexGrow: 1,
        // marginLeft: 240,
        // paddingLeft: 20,
        // padding: theme.spacing(3),
        paddingBottom: theme.spacing(4),
        "@media (max-width: 600px)":{
            marginLeft: 0,
            paddingLeft: 20,
      }
    },
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        // height: 224,
        "@media (max-height: 840px)":{
            height: "38em",
        },
        "@media (min-height: 841px)":{
            height: "60em",
        }
        // height: "1%",
      },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
    },
    tabsMain: {
        // color: "#DCDCDC",
        // backgroundColor: "#17192b",
        fontWeight: "bolder",
    },
    tabContent: {
        width: "100%",
        overflowY: "scroll",
    },
    fabAdd: {
        position: 'absolute',
        bottom: theme.spacing(5),
        right: theme.spacing(5),
    },
    fabSave: {
        position: 'absolute',
        bottom: theme.spacing(5),
        right: theme.spacing(13),
    },
    fabProgress: {
        color: green[500],
        position: 'absolute',
        top: -6,
        left: -6,
        zIndex: 1,
    }
}));


const RolesItem = (
    {
        role_type, description, roles, roles_available, delete_roletype, roles_select, roles_created_local,
        handleAddFieldsParent, onChangeRoleTypeSelect, handleRemoveFields, handleDeleteRole, 
        onChangeForms, onChangeSelect, onSubmit
    }) => {
    const classes = useStyles();
    const [loading, setLoading] = React.useState(false);
    const [valueIndex, setValue] = React.useState(0);
    const [openAlert, setOpenAlert] = React.useState(false);
    const [typeMessage, setTypeMessage] = React.useState("");
    const [messageAlert, setMessageAlert] = React.useState("");
    const [openModalDelete, setOpenModalDelete] = React.useState(false);
    
    
    const handleClickModalDelete = () => setOpenModalDelete(true);
    const handleCloseModalDelete = () => setOpenModalDelete(false);
    const handleDeleteRoleModal = () => {
        handleDeleteRole();
        handleCloseModalDelete();
    }

    const handleOpenAlert = elem => setOpenAlert(elem);

    const handleChange = (event, newValue) => {
        // get the value of type account if it's not the first time loading
        let offsetParent = event.target.offsetParent;
        if(offsetParent.attributes.hasOwnProperty("data-value")){
            let dataValue = offsetParent.attributes['data-value'].value
            onChangeRoleTypeSelect(dataValue);
            
            // set the new value of index
            setValue(newValue);
        }
    }

    const handleAddFields = value => handleAddFieldsParent(value);

    const handleChangeForms = (type, index, event) => {
        // console.log(type, index, event.target);
        if(type === "role_type" || type === "description" || type=="role_description"){
            onChangeForms(type, index, event);

        }else if(type === "role_name"){
            let regex = new RegExp("\\s+|[.,/#!$%^&*;:{}=_`~()@¨'\"+[\\]`´]");
            // if does not contains space, set the state
            if(!regex.test(event.target.value)){
                onChangeForms(type, index, event);
            }else{
                // if it does, set the value of the state (not from the event input)
                event.target.value = event.target.value.slice(0, event.target.value.length -1 );
            }

        }else{
            event.target.value = event.target.value.slice(0, event.target.value.length -1 );
        }
    }

    async function saveData(){
        setLoading(true);
        console.log("openalert: ",openAlert);
        await onSubmit(valueIndex)
        .then(data => {
            if(!data['error']){
                setLoading(false);
    
                setOpenAlert(true);
                setTypeMessage("success");
                setMessageAlert(data.message);
                
            }else{
                setLoading(false);
    
                setOpenAlert(true);
                setTypeMessage("error");
                setMessageAlert(data.message);
                
            }
        });
    }

    return (
        <main className={classes.content}>
            <Typography className={classes.titleHeader} variant="h4" noWrap >
                Gerenciar tipos de conta
            </Typography>
            <Box boxShadow={3}> 
                <div className={classes.root}>

                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={valueIndex}
                        onChange={handleChange}
                        aria-label="Vertical type of roles by account"
                        className={classes.tabs}
                    >
                        {roles_available.map((role, index) => {
                            // return <Tab className={classes.tabsMain} key={`${role}~${index}`} label={<><AddIcon  style={{verticalAlign: 'middle'}} />  {role}</>} {...a11yProps(index)}  /> 
                            return <Tab className={classes.tabsMain} data-value={role}  key={`${role}~${index}`} label={role} {...a11yProps(index)} />
                            // return <div style={{flexDirection:'row', zIndex:"-1"}} ><AddIcon fontSize="large"/><Tab style={{zIndex:99}} className={classes.tabsMain} data-value={role}  key={`${role}~${index}`} label={role} {...a11yProps(index)} /></div>
                        })}
            
                    </Tabs>
                    {roles_available.length ? (
                        roles_available.map((role, index) => {
                            return (
                                <TabPanel key={`${role}'~'${index}`} index={index} value={valueIndex} className={classes.tabContent}>
                                    
                                    {delete_roletype != "não declarado" ?
                                    (
                                    <Button variant="contained" color="secondary" startIcon={<DeleteIcon />} onClick={ handleClickModalDelete }
                                    html
                                    style={{display:"flex", marginLeft:"auto"}} >
                                        Deletar
                                    </Button>
                                    ) : (
                                    <Button variant="contained" color="secondary" startIcon={<DeleteIcon />} 
                                    style={{display:"flex", marginLeft:"auto", visibility:"hidden"}} >
                                        Deletar
                                    </Button>
                                    )                                    
                                    }
                                    
                                    <div className="form-group row" style={{marginTop: "-2em"}}>
                                        <label htmlFor="name_trust" style={{marginLeft: "0.8em"}} className="col-form-label bolder">Tipo da conta: </label>
                                        <Tooltip title="O nome da conta tem que ser único" arrow>
                                            <InfoIcon size="small" color="primary"/>
                                        </Tooltip>

                                        <div className="col-sm-12">
                                            <input key={role_type} required type="text" name="role_type"
                                                onChange={(e) => handleChangeForms("role_type", null, e)}
                                                className="form-control" placeholder="policies-cloud" defaultValue={role_type} />
                                        </div>
                                    </div>

                                    <div className="form-group row">
                                        <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">Descrição: </label>
                                        <div className="col-sm-12">
                                            <input key={description} required type="text" name="description"
                                                onChange={(e) => handleChangeForms("description",null,e)}
                                                className="form-control" placeholder="This document..." defaultValue={description} />
                                        </div>
                                    </div>
                                        

                                    <RolesHtml
                                        key={`${role}'~'${index}`}
                                        role_type={role_type}
                                        role_description={"role['role_description']"}
                                        policy_arn_aws={"role['policy_arn_aws']"}
                                        trust_select={"role['trust_relationship']"}
                                        policies_selected={ roles }
                                        policies_available={roles_select}
                                        
                                        handleForm={handleChangeForms.bind(this)}
                                        handleRemoveFields={handleRemoveFields}
                                        onChangeSelect={onChangeSelect.bind(this)}
                                    /> 
                                    

                                    <Dialog
                                        open={openModalDelete}
                                        onClose={handleCloseModalDelete}
                                        aria-labelledby="alert-dialog-title"
                                        aria-describedby="alert-dialog-description"
                                    >
                                        <DialogTitle id="alert-dialog-title">{"Deletando "+role_type}</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText id="alert-dialog-description">
                                                Deseja realmente deletar {role}? Essa ação é irreversível.
                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleCloseModalDelete} color="secondary">
                                                Não
                                            </Button>
                                            <Button onClick={handleDeleteRoleModal} color="primary" autoFocus>
                                                Sim
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </TabPanel>
                                
                            )
                        })
                        ): (
                            //https://css-tricks.com/centering-css-complete-guide/
                            <CircularProgress style={{display:"grid",margin:"auto"}}/>
                        )
                    }

                </div>
                
            </Box>
                {/* <Zoom key="primary" unmountOnExit in={1 === 1} onClick={() => handleAddRole("teste")} > */}
                <Zoom key="add_type" unmountOnExit in={1 === 1} 
                onClick={() => handleAddFields("type_role")} 
                >
                    <Tooltip title="Criar uma novo tipo de role" aria-label="add" placement="top" arrow>
                        <Fab aria-label="Add policy" className={classes.fabAdd} color="primary">
                            <AddIcon  />
                        </Fab>
                    </Tooltip>
                </Zoom>
                <Zoom key="save" unmountOnExit  in={1 === 1} onClick={() => saveData()}  >
                    <Tooltip title="Salvar alterações" aria-label="save" placement="top" arrow>
                        <Fab aria-label="Save" className={classes.fabSave} color="primary">
                            <SaveIcon  />
                            {loading && <CircularProgress size={68} className={classes.fabProgress} />}
                        </Fab>
                    </Tooltip>
                </Zoom>

                <AlertMessage open={openAlert} typeMessage={typeMessage} message={messageAlert} openAlertCallback={handleOpenAlert}/>

        </main>
    );

}


export default RolesItem;