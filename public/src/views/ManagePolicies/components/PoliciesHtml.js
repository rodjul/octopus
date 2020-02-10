import React, {useState} from "react";
import { FormGroup, FormLabel, Form, Modal } from "react-bootstrap";

import {Fab, Box, Zoom } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import {Edit, Add as AddIcon, Save as SaveIcon, MoreVert as MoreVertIcon } from '@material-ui/icons';

import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

/* Local imports */
import AlertMessage from "../../../components/AlertMessage";
import PoliciesItem from "./PoliciesItem";
import TrustItem    from "./TrustsItem";



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
        marginTop: 64,
        flexGrow: 1,
        marginLeft: 240,
        paddingLeft: 20,
        padding: theme.spacing(3),
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
        height: "38em",
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
}));


const PoliciesHtml = (props) => {
    const classes = useStyles();
    const policies = props.policies;
    const trusts = props.trusts;
    const showModal = false;
    const actionModal = "CRIAR";
    const modalMessage = "BLA BLA";

    const [valueIndex, setValue] = React.useState(0);
    const [valueTabXIndex, setValueTabXIndex] = React.useState("iam_policy");

    const handleChange = (event, newValue) => setValue(newValue);

    const handleChangeTabX = (event, newValue) => setValueTabXIndex(newValue);

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

    // const onChangeFor

    // React.useEffect(() => {
    //     console.log(props.policies);
    // },[props.policies]);

    return (
        <main className={classes.content}>
            <Box boxShadow={3}>
                {/* <div className={classes.paper} > */}

                <Tabs value={valueTabXIndex} className={classes.tabsMain} indicatorColor="primary" textColor="primary" onChange={handleChangeTabX} aria-label="">
                    <Tab className={classes.tabsMain} label="Policies" value="iam_policy" {...a11yProps('iam_policy')}/> 
                    <Tab className={classes.tabsMain} label="Trust Relantionship" value="iam_trust_relantionship" {...a11yProps('iam_trust_relantionship')} />
                </Tabs>

                <TabPanel value={valueTabXIndex} index="iam_policy">
                    <div className={classes.root}>
                        <Tabs
                            orientation="vertical"
                            variant="scrollable"
                            value={valueIndex}
                            onChange={handleChange}
                            aria-label="Vertical policies"
                            className={classes.tabs}
                        >
                            {policies.map((policy, index) => {
                                return <Tab className={classes.tabsMain}  key={`${policy['Name']}~${index}`} label={policy['Name']} {...a11yProps(index)} />
                            })}
               
                        </Tabs>
                        {policies.map((policy, index) => {
                            return (
                                <TabPanel index={index} value={valueIndex}  key={`${policy['Name']}~${index}`} className={classes.tabContent}>
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
                        <Fab aria-label="Add policy" className={classes.fabAdd} color="primary">
                            <AddIcon  />
                        </Fab>
                    </Zoom>
                </TabPanel>
                
                <TabPanel value={valueTabXIndex} index="iam_trust_relantionship" >
                    <div className={classes.root}>
                        <Tabs
                            orientation="vertical"
                            variant="scrollable"
                            value={valueIndex}
                            onChange={handleChange}
                            aria-label="Vertical trust relationship"
                            className={classes.tabs}
                        >
                            {trusts.map((trust, index) => {
                                return <Tab className={classes.tabsMain} key={`${trust['Name']}~${index}`} label={trust['Name']} {...a11yProps(index)} />
                            })}
                        </Tabs>
                        {trusts.map((trust, index) => {
                            return (
                                <TabPanel index={index} value={valueIndex} key={`${trust['Name']}~${index}`} className={classes.tabContent}>
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
                        <Fab aria-label="Add trust relationship" className={classes.fabAdd} color="primary">
                            <AddIcon />
                        </Fab>
                    </Zoom>
                </TabPanel>
                
                <Zoom key="primary" unmountOnExit  in={1 === 1}>
                    <Fab aria-label="Save" className={classes.fabSave} color="primary">
                        <SaveIcon  />
                    </Fab>
                </Zoom>
            </Box>

            
        </main>
    );
}



export default PoliciesHtml;