import React, {useState} from "react";
import {Fab, Box, Zoom, Tabs, Tab, Typography, CircularProgress, Tooltip} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import {Edit, Add as AddIcon, Save as SaveIcon, MoreVert as MoreVertIcon } from '@material-ui/icons';

import PropTypes from 'prop-types';

import { green } from '@material-ui/core/colors';

/* Local imports */
import AlertMessage from "../../../components/AlertMessage";
import PoliciesItem from "./PoliciesItem";
import TrustItem    from "./TrustsItem";

import RolesHtml   from "./RolesItem/RolesHtml";


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
    // paper: {
    //     padding: theme.spacing(2),
    //     color: theme.palette.text.secondary,
    //     backgroundColor: "white",
    // },

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
            height: "36em",
        },
        "@media (min-height: 841px)":{
            height: "50em",
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


const PoliciesHtml = (props) => {
    const classes = useStyles();
    const policies = props.policies;
    const trusts = props.trusts;
    
    const [valueIndexRoles, setValueRoles] = React.useState(0);
    const [valueIndexPolicies, setValuePolicies] = React.useState(0);
    const [valueIndexTrusts, setValueTrusts] = React.useState(0);
    const [valueTitleTabIndex, setValueTitleTabIndex] = React.useState("iam_roles");
    const [loading, setLoading] = React.useState(false);
    const [openAlert, setOpenAlert] = React.useState(false);
    const [typeMessage, setTypeMessage] = React.useState("");
    const [messageAlert, setMessageAlert] = React.useState("");

    const policies_available = props.policies_available;
    const handleChangeForms = props.handleChangeForms;
    const handleRemoveFields = props.handleRemoveFields;
    const handleChangePolicyARN = props.handleChangePolicyARN;
    const onChangeSelect = props.onChangeSelect;

    const handleOpenAlert = elem => setOpenAlert(elem);
    const handleChangeRoles = (event, newValue) => setValueRoles(newValue);
    const handleChangePolicies = (event, newValue) => setValuePolicies(newValue);
    const handleChangeTrusts = (event, newValue) => setValueTrusts(newValue);

    const handleChangeTabX = (event, newValue) => setValueTitleTabIndex(newValue);

    const handleAddFields = value => props.handleAddFields(value);

    const onChangeForms = (type, index, event) => {
        if(type==="trust"){
            let regex = new RegExp("\\s+|[.,/#!$%^&*;:{}=_`~()@¨'\"+[\\]`´?><]");
            // if does not contains space, set the state
            if(!regex.test(event.target.value)){
                props.handleForm(type, index, event);
            }else{
                event.target.value = event.target.value.slice(0, event.target.value.length -1 );
            }

        }else if(type==="policy"){
            props.handleForm(type, index, event);

        }else if(type==="policy_name"){
            let regex = new RegExp("\\s+|[.,/#!$%^&*;:{}=_`~()@¨'\"+[\\]`´?><]");
            // if does not contains space, set the state
            if(!regex.test(event.target.value)){
                props.handleForm(type, index, event);
            }else{
                // console.log(event.target.value.length);
                event.target.value = event.target.value.slice(0, event.target.value.length -1 );
                
            }
        }
    }

    const handleSelect = (selectedOption, type, index, role_name) => {
        if(!isQuantityPoliciesAttachedReached(index)){
            props.onChangeSelect(selectedOption, type, index, role_name);
        }else{
            setOpenAlert(true);
            setTypeMessage("error");
            setMessageAlert("A role "+props.roles[index].role_name+" so pode possuir até 10 policies");
        }

    }

    /**
     * Valid if the total number (10) of attached policies is not reached
     * Check policy ARN and custom policies
     */
    const isQuantityPoliciesAttachedReached = index => {
        const number_permited = 10;
        let policies = props.roles[index].policies.length +1;
        let policies_arn = props.roles[index].policy_arn_aws.split(",");
        if(policies_arn[0] === "") policies_arn = 0;
        else policies_arn = policies.length;

        if( (policies + policies_arn) > number_permited ){
            return true;
        }
    
        return false;
    }

    async function saveData(valueIndex){
        setLoading(true);

        await props.handleOnSubmitForm(valueIndex)
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
                Gerenciar IAM
            </Typography>
            <Box boxShadow={3}>
                {/* <div className={classes.paper} > */}

                <Tabs value={valueTitleTabIndex} className={classes.tabsMain} indicatorColor="primary" textColor="primary" onChange={handleChangeTabX} aria-label="">
                    <Tab className={classes.tabsMain} label="Roles" value="iam_roles" {...a11yProps('iam_roles')}/> 
                    <Tab className={classes.tabsMain} label="Policies" value="iam_policy" {...a11yProps('iam_policy')}/> 
                    <Tab className={classes.tabsMain} label="Trust Relationship" value="iam_trust_relantionship" {...a11yProps('iam_trust_relantionship')} />
                </Tabs>

                {policies.length ? (
                    <>
                        <TabPanel value={valueTitleTabIndex} index="iam_roles">
                            <div className={classes.root}>
                                <Tabs
                                    orientation="vertical"
                                    variant="scrollable"
                                    value={valueIndexRoles}
                                    onChange={handleChangeRoles}
                                    aria-label="Vertical roles"
                                    className={classes.tabs}
                                    style={{
                                        // backgroundColor:"red"
                                        minWidth: "15em",
                                        maxWidth: "15em"
                                    }}
                                >
                                    {props.roles.map((role, index) => {
                                        return <Tab className={classes.tabsMain}  key={`${role['role_name']}~${index}`} label={role['role_name']} {...a11yProps(index)} />
                                    })}
                    
                                </Tabs>
                                {props.roles.map((role, index) => {
                                    return (
                                        <TabPanel index={index} value={valueIndexRoles}  key={`${role['role_name']}~${index}`} className={classes.tabContent}>
                                            <RolesHtml key={`${role['role_name']}~${index}`}
                                                role_name={role['role_name']}
                                                role_description={role['role_description']}
                                                policy_arn_aws={role['policy_arn_aws']}
                                                trust_select={role['trust_relationship']}
                                                policies_select={
                                                    role['policies'] === undefined ? [] : role['policies']
                                                }
                                                policies_available={policies_available}
                                                trusts_available={trusts}
                                                index={index}
                                                handleForm={props.onChangeForms.bind(this)}
                                                handleRemoveFields={props.handleRemoveFields}
                                                handleChangePolicyARN={props.handleChangePolicyARN.bind(this)}
                                                onChangeSelect={handleSelect.bind(this)}
                                            /> 
                                        </TabPanel>
                                    )
                                })}   
            
                            </div>

                            
                            <Zoom key="primary" unmountOnExit in={1 === 1} onClick={ () => handleAddFields("role")} >
                                <Tooltip title="Criar uma nova role" aria-label="add" placement="top" arrow>
                                    <Fab aria-label="Add role" className={classes.fabAdd} color="primary">
                                        <AddIcon  />
                                    </Fab>
                                </Tooltip>
                            </Zoom>
                        </TabPanel>
                        
                        <TabPanel value={valueTitleTabIndex} index="iam_policy">
                            <div className={classes.root}>
                                <Tabs
                                    orientation="vertical"
                                    variant="scrollable"
                                    value={valueIndexPolicies}
                                    onChange={handleChangePolicies}
                                    aria-label="Vertical policies"
                                    className={classes.tabs}
                                    style={{
                                        // backgroundColor:"red"
                                        minWidth: "15em",
                                        maxWidth: "15em"
                                    }}
                                >
                                    {policies.map((policy, index) => {
                                        return <Tab className={classes.tabsMain}  key={`${policy['Name']}~${index}`} label={policy['Name']} {...a11yProps(index)} />
                                    })}
                    
                                </Tabs>
                                {policies.map((policy, index) => {
                                    return (
                                        <TabPanel index={index} value={valueIndexPolicies}  key={`${policy['Name']}~${index}`} className={classes.tabContent}>
                                            <PoliciesItem key={`${policy['Name']}~${index}`}
                                                policy_name={policy['Name']}
                                                description={policy['Description']}
                                                path={policy['Path']}
                                                policy_document={policy['PolicyDocument']}
                                                index={index}
                                                handleJson={props.handleJson}
                                                // handleForm={props.handleForm}
                                                handleForm={onChangeForms.bind(this)}
                                                handleRemoveFields={props.handleRemoveFields}
                                            />
                                        </TabPanel>
                                    )
                                })}
            
                            </div>

                            
                            <Zoom key="primary" unmountOnExit in={1 === 1} onClick={ () => handleAddFields("policy")} >
                                <Tooltip title="Criar um nova policy" aria-label="add" placement="top" arrow>
                                    <Fab aria-label="Add policy" className={classes.fabAdd} color="primary">
                                        <AddIcon  />
                                    </Fab>
                                </Tooltip>
                            </Zoom>
                        </TabPanel>
                        
                        <TabPanel value={valueTitleTabIndex} index="iam_trust_relantionship" >
                            <div className={classes.root}>
                                <Tabs
                                    orientation="vertical"
                                    variant="scrollable"
                                    value={valueIndexTrusts}
                                    onChange={handleChangeTrusts}
                                    aria-label="Vertical trust relationship"
                                    className={classes.tabs}
                                    style={{
                                        // backgroundColor:"red"
                                        minWidth: "15em",
                                        maxWidth: "15em"
                                    }}
                                >
                                    {trusts.map((trust, index) => {
                                        return <Tab className={classes.tabsMain} key={`${trust['Name']}~${index}`} label={trust['Name']} {...a11yProps(index)} />
                                    })}
                                </Tabs>
                                {trusts.map((trust, index) => {
                                    return (
                                        <TabPanel index={index} value={valueIndexTrusts} key={`${trust['Name']}~${index}`} className={classes.tabContent}>
                                            <p className="disclaimer">OBS: os documentos que possuírem "ACCOUNT_ID" no lugar da Account ID, irão ser interpretados pelo código para serem substituídos pelo valor do Account ID.</p>
                                            <TrustItem key={`${trust['Name']}~${index}`}
                                                trust_name={trust['Name']}
                                                policy_document={trust['AssumeRolePolicyDocument']}
                                                index={index}
                                                handleJson={props.handleJson}
                                                handleForm={onChangeForms.bind(this)}
                                                handleRemoveFields={props.handleRemoveFields}
                                            />
                                        </TabPanel>
                                    )
                                })}
                            </div>
                        
                            <Zoom key="primary" unmountOnExit  in={1 === 1}  onClick={ () => handleAddFields("trustrelationships")} >
                                <Tooltip title="Criar um novo trust relationship" aria-label="add" placement="top" arrow>
                                    <Fab aria-label="Add trust relationship" className={classes.fabAdd} color="primary">
                                        <AddIcon />
                                    </Fab>
                                </Tooltip>
                            </Zoom>
                        </TabPanel>

                        <Zoom key="primary" unmountOnExit  in={1 === 1} onClick={() => saveData()}>
                            <Tooltip title="Salvar" aria-label="add" placement="top" arrow>
                                <Fab aria-label="Save" className={classes.fabSave} color="primary">
                                    <SaveIcon  />
                                    {loading && <CircularProgress size={68} className={classes.fabProgress} />}
                                </Fab>
                            </Tooltip>
                        </Zoom>

                    </>
                ):(
                    <CircularProgress style={{display:"grid",margin:"auto"}}/>
                )

                }
                
                
            </Box>

            <AlertMessage open={openAlert} typeMessage={typeMessage} message={messageAlert} openAlertCallback={handleOpenAlert}/>

        </main>
    );
}



export default PoliciesHtml;