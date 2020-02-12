import React, {useState} from "react";
import {Fab, Box, Zoom, Tabs, Tab, Typography, CircularProgress} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import {Edit, Add as AddIcon, Save as SaveIcon, MoreVert as MoreVertIcon } from '@material-ui/icons';

import PropTypes from 'prop-types';

import { green } from '@material-ui/core/colors';

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
    
    const [valueIndex, setValue] = React.useState(0);
    const [valueTabXIndex, setValueTabXIndex] = React.useState("iam_policy");
    const [loading, setLoading] = React.useState(false);
    const [openAlert, setOpenAlert] = React.useState(false);
    const [typeMessage, setTypeMessage] = React.useState("");
    const [messageAlert, setMessageAlert] = React.useState("");

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

    async function saveData(){
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

    // const onChangeFor

    // React.useEffect(() => {
    //     console.log(props.policies);
    // },[props.policies]);

    return (
        <main className={classes.content}>
            <Typography className={classes.titleHeader} variant="h4" noWrap >
                Gerenciar policies
            </Typography>
            <Box boxShadow={3}>
                {/* <div className={classes.paper} > */}

                <Tabs value={valueTabXIndex} className={classes.tabsMain} indicatorColor="primary" textColor="primary" onChange={handleChangeTabX} aria-label="">
                    <Tab className={classes.tabsMain} label="Policies" value="iam_policy" {...a11yProps('iam_policy')}/> 
                    <Tab className={classes.tabsMain} label="Trust Relationship" value="iam_trust_relantionship" {...a11yProps('iam_trust_relantionship')} />
                </Tabs>

                {policies.length ? (
                    <>
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
                </>
                ):(
                    <CircularProgress style={{display:"grid",margin:"auto"}}/>
                )
                
                }
                
                <Zoom key="primary" unmountOnExit  in={1 === 1} onClick={() => saveData()}>
                    <Fab aria-label="Save" className={classes.fabSave} color="primary">
                        <SaveIcon  />
                        {loading && <CircularProgress size={68} className={classes.fabProgress} />}
                    </Fab>
                </Zoom>
            </Box>

            <AlertMessage open={openAlert} typeMessage={typeMessage} message={messageAlert} />

        </main>
    );
}



export default PoliciesHtml;