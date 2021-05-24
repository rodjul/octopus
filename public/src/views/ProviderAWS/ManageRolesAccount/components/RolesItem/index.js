import React from "react";
import { 
    Fab, Box, Zoom, CircularProgress, Tooltip, Typography, Tab, Tabs, 
} from "@material-ui/core";

import PropTypes from 'prop-types';
import { Add as AddIcon, Save as SaveIcon} from '@material-ui/icons';


import styles from "./styles";
import RolesForm from "./RolesForm";


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


const useStyles = styles;


const RolesItem = ({rolesOptions, roles, callbackDeleteIndex, callbackSaveData}) => {
    const classes = useStyles();
    const [loading, setLoading] = React.useState(false);
    const [valueIndex, setValue] = React.useState(0);
    const [rolesData, setRolesData] = React.useState(roles);
    const [countNewRoles, setCountNewRoles] = React.useState(0);
    

    // const handleOpenAlert = elem => setOpenAlert(elem);

    const handleTabsChange = (event, newValue) => {
        // get the value of type account if it's not the first time loading
        let offsetParent = event.target.offsetParent;
        if(offsetParent.attributes.hasOwnProperty("data-value")){
            // let dataValue = offsetParent.attributes['data-value'].value
            
            // set the new value of index
            setValue(newValue);
        }
    }

    // const handleAddFields = value => handleAddFieldsParent(value);

    const handleAddFields = () => {
        let newRoles = rolesData;
        let data = {"role_type_name":"New-type-"+countNewRoles, "new":true, "description":"Description of this", roles: []};
        newRoles.push(data);
        setRolesData(newRoles);
        setCountNewRoles( countNewRoles + 1);
    };

    const handleDataChanged = (newData, index)=>{
        // console.log("callbackSaveData -> handleDataChanged: ",newData, index);
        let newRoles = rolesData;
        newRoles[index] = newData;
        setRolesData(newRoles);
    }

    const isNewObjectToDelete = index => {
        if(rolesData[index].hasOwnProperty("new")){
            let newData = [];
            rolesData.map((val, i) => i !== index ? newData.push(val) : "");
            setRolesData(newData);
        }else
            callbackDeleteIndex(index);
        
        // reseting position of tab
        if(index-1 >=0)
            setValue(index-1);
        else
            setValue(0);
    }

    const saveData = async () =>{
        let valid = true;
        setLoading(true);
        
        rolesData.map(val => {
            if(!val.role_type_name.length && !val.description.length && !val.roles.length){
                alert("Incomplete data");
                valid = false;
                return;
            }
        })
        if(valid)
            await callbackSaveData(rolesData);
        
            setLoading(false);
    }

    React.useEffect(() => {
        setRolesData(roles);
    }, [JSON.stringify(roles)]);
    

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
                        onChange={handleTabsChange}
                        aria-label="Vertical type of roles by account"
                        className={classes.tabs}
                        style={{
                            minWidth: "15em",
                            maxWidth: "15em"
                        }}
                    >
                        {rolesData.map((role, index) => {
                            // return <Tab className={classes.tabsMain} key={`${role}~${index}`} label={<><AddIcon  style={{verticalAlign: 'middle'}} />  {role}</>} {...a11yProps(index)}  /> 
                            return <Tab className={classes.tabsMain} data-value={role['role_type_name']}  key={`${role['role_type_name']}~${index}`} label={role['role_type_name']} {...a11yProps(index)} />
                            // return <div style={{flexDirection:'row', zIndex:"-1"}} ><AddIcon fontSize="large"/><Tab style={{zIndex:99}} className={classes.tabsMain} data-value={role}  key={`${role}~${index}`} label={role} {...a11yProps(index)} /></div>
                        })}
            
                    </Tabs>
                    {rolesData.length ? (
                        rolesData.map((role, index) => {
                            let rolesSetted = [];
                            try{
                                rolesSetted = JSON.parse(role['roles']);
                            }catch(e){
                                // console.error(e, role);
                                rolesSetted = role['roles'];
                            }
                            
                            return (
                                <TabPanel key={`${role['role_type_name']}'~'${index}`} index={index} value={valueIndex} className={classes.tabContent}>
                                    <RolesForm 
                                    roleName={role['role_type_name']}
                                    roleDescription={role['description']}
                                    rolesSetted={rolesSetted}
                                    rolesAvailable={rolesOptions}
                                    index={index}
                                    callbackSaveData={handleDataChanged}
                                    isNewRoleTypeAccount={role.hasOwnProperty("new") ? true : false}
                                    callbackDeleteIndex={isNewObjectToDelete}
                                    />
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
                <Zoom key="add_type" unmountOnExit in={true} 
                    onClick={() => handleAddFields()} 
                    >
                    <Tooltip title="Criar uma novo tipo de role" aria-label="add" placement="top" arrow>
                        <Fab aria-label="Add policy" className="fabAdd" color="primary">
                            <AddIcon  />
                        </Fab>
                    </Tooltip>
                </Zoom>
                <Zoom key="save" unmountOnExit in={true} onClick={() => saveData()}  >
                    <Tooltip title="Salvar alterações" aria-label="save" placement="top" arrow>
                        <Fab aria-label="Save" className="fabSave" color="primary">
                            <SaveIcon  />
                            {loading && <CircularProgress size={68} className="fabProgress" />}
                        </Fab>
                    </Tooltip>
                </Zoom>

                {/* <AlertMessage open={openAlert} typeMessage={typeMessage} message={messageAlert} openAlertCallback={handleOpenAlert}/> */}

        </main>
    );

}


export default RolesItem;