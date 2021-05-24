import React from "react";
import {Fab, Box, Zoom, Tabs, Tab, Typography, CircularProgress, Tooltip} from "@material-ui/core";
// import { makeStyles } from '@material-ui/core/styles';
import {Add as AddIcon, Save as SaveIcon } from '@material-ui/icons';
import PropTypes from 'prop-types';
import useStyles from "./styles";
// import AlertMessage from "../../../../components/AlertMessage";
import PoliciesItem from "./PoliciesItem";
import TrustItem    from "./TrustsItem"
import RolesItem   from "./RolesItem";
import BlockUi from 'react-block-ui';
import LoadingCircularProgress from "../../../../components/LoadingCircularProgress";

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





const TabsView = ({trustsData, policiesData, rolesData, policiesOptionsAvailable, onSubmit, callbackDeleteTypeIndex, callbackSaveDataChanged, blocking}) => {
    const classes = useStyles();
    
    const [valueIndexRoles, setValueRoles] = React.useState(0);
    const [valueIndexPolicies, setValuePolicies] = React.useState(0);
    const [valueIndexTrusts, setValueTrusts] = React.useState(0);
    const [valueTitleTabIndex, setValueTitleTabIndex] = React.useState("iam_roles");
    const [loading, setLoading] = React.useState(false);
    const [roles, setRoles] = React.useState(rolesData);
    const [policies, setPolicies] = React.useState(policiesData);
    const [trusts, setTrusts] = React.useState(trustsData);

    // const policiesOptionsAvailable = policiesOptionsAvailable;

    // const handleOpenAlert = elem => setOpenAlert(elem);
    const handleChangeTabRoles = (event, newValue) => setValueRoles(newValue);
    const handleChangeTabPolicies = (event, newValue) => setValuePolicies(newValue);
    const handleChangeTabTrusts = (event, newValue) => setValueTrusts(newValue);

    const handleChangeTabX = (event, newValue) => setValueTitleTabIndex(newValue);

    const [countNewRole, setCountNewRole] = React.useState(0);
    const [countNewPolicy, setCountNewPolicy] = React.useState(0);
    const [countNewTrust, setCountNewTrust] = React.useState(0);
    // const handleAddFields = value => callbackAddNewField(value);
    
    const handleAddFields = type => {
        if(type === "role"){
            let copyRoles = roles;
            copyRoles.push({
                role_name: 'New-Role-'+countNewRole,
                role_description: "Description of this role",
                policy_arn_aws:"" , 
                policies:[],
                trust_relationship:"",
                new: true,
            });
            setRoles(copyRoles);
            let increment = countNewRole;
            increment++;
            setCountNewRole(increment);

        }else if(type === "policy"){
            let copyPolicies = policies;
            copyPolicies.push({ 
                policy_name: 'New-Policy-'+countNewPolicy, 
                policy_description:"", 
                policy_path:"/", 
                policy_document: {
                    "Version": "2012-10-17",
                    "Statement": []
                },
                new: true,
            });
            setPolicies(copyPolicies);
            let increment = countNewPolicy;
            increment++;
            setCountNewPolicy(increment)
        
        }else if(type === "trustrelationships"){
            let copyTrusts = trusts;
            copyTrusts.push({ 
                trust_name: 'New-Trust-Relationship-'+countNewTrust,
                trust_description: "Description",
                trust_assume_role_policy_document: {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {
                                "Federated": "arn:aws:iam::ACCOUNT_ID:saml-provider/ADFS"
                            },
                            "Action": "sts:AssumeRoleWithSAML",
                            "Condition": {
                                "StringEquals": {
                                    "SAML:aud": "https://signin.aws.amazon.com/saml"
                                }
                            }
                        }
                    ]
                }, 
                new: true,
            });
            setTrusts(copyTrusts);
            let increment = countNewTrust;
            increment++;
            setCountNewTrust(increment);
        }

    };


    const saveData = async () => {
        setLoading(true);
        await onSubmit();
        setLoading(false);
    }

    const saveFormData = (type, data, index) => {
        if(type === "role"){
            let newData = roles;
            newData[index] = data;
            setRoles(newData);
        }else if(type === "policy"){
            let newData = policies;
            newData[index] = data;
            setPolicies(newData);
        }else if(type === "trust"){
            let newData = trusts;
            newData[index] = data;
            setTrusts(newData);
        }
    }

    // const handleDeleteForm = (type, index) => callbackDeleteTypeIndex(type, index);
    const handleDeleteForm = (type, index) => {
        let newData = [];
        if(type === "role"){
            if(!roles[index].hasOwnProperty("new")){
                callbackDeleteTypeIndex("role", index);
            }else{
                roles.map((val, i) => i !== index ? newData.push(val) : "");
                setRoles(newData);
            }

        }else if(type === "policy"){
            if(!policies[index].hasOwnProperty("new")){
                callbackDeleteTypeIndex("policy", index);
            }else{
                policies.map((val, i) => i !== index ? newData.push(val) : "");
                setPolicies(newData);
            }

        }else if(type === "trust"){
            if(!trusts[index].hasOwnProperty("new")){
                callbackDeleteTypeIndex("trust", index);
            }else{
                trusts.map((val, i) => i !== index ? newData.push(val) : "");
                setTrusts(newData);
            }
        }
    }

    React.useEffect(() => {
        callbackSaveDataChanged(roles, policies, trusts)
    }, [JSON.stringify(roles), JSON.stringify(policies), JSON.stringify(trusts)])
    
    // when redering for the first time, it will set as null so we need to check again after fetched
    React.useEffect(() => {
        setRoles(rolesData);
        setPolicies(policiesData)
        setTrusts(trustsData)
    }, [JSON.stringify(rolesData), JSON.stringify(policiesData), JSON.stringify(trustsData)])
    
    
    return (
        <main className={classes.content}>
            <Typography className={classes.titleHeader} variant="h4" noWrap >
                Gerenciar IAM
            </Typography>
            <Box boxShadow={3}>

                {/* <BlockUi tag="div" blocking={blocking} message="" loader={<LoadingCircularProgress />}> */}
                {blocking ? (
                    <BlockUi tag="div" blocking={blocking} message="" loader={<LoadingCircularProgress />}>
                         <Tabs value={valueTitleTabIndex} className={classes.tabsMain} indicatorColor="primary" textColor="primary" aria-label="">
                            <Tab disabled className={classes.tabsMain} label="Roles" value="iam_roles" {...a11yProps('iam_roles')}/> 
                            <Tab disabled className={classes.tabsMain} label="Policies" value="iam_policy" {...a11yProps('iam_policy')}/> 
                            <Tab disabled className={classes.tabsMain} label="Trust Relationship" value="iam_trust_relantionship" {...a11yProps('iam_trust_relantionship')} />
                        </Tabs>
                    </BlockUi>

                ):(
                    <>  
                        <Tabs value={valueTitleTabIndex} className={classes.tabsMain} indicatorColor="primary" textColor="primary" onChange={handleChangeTabX} aria-label="">
                            <Tab className={classes.tabsMain} label="Roles" value="iam_roles" {...a11yProps('iam_roles')}/> 
                            <Tab className={classes.tabsMain} label="Policies" value="iam_policy" {...a11yProps('iam_policy')}/> 
                            <Tab className={classes.tabsMain} label="Trust Relationship" value="iam_trust_relantionship" {...a11yProps('iam_trust_relantionship')} />
                        </Tabs>

                        <TabPanel value={valueTitleTabIndex} index="iam_roles">
                            <div className={classes.root}>
                                <Tabs
                                    orientation="vertical"
                                    variant="scrollable"
                                    value={valueIndexRoles}
                                    onChange={handleChangeTabRoles}
                                    aria-label="Vertical roles"
                                    className={classes.tabs}
                                    style={{
                                        // backgroundColor:"red"
                                        minWidth: "15em",
                                        maxWidth: "15em"
                                    }}
                                >
                                    {roles.map((role, index) => {
                                        return <Tab className={classes.tabsMain}  key={`${role['role_name']}~${index}`} label={role['role_name']} {...a11yProps(index)} />
                                    })}
                    
                                </Tabs>
                                {roles.map((role, index) => {
                                    return (
                                        <TabPanel index={index} value={valueIndexRoles}  key={`${role['role_name']}~${index}`} className={classes.tabContent}>
                                            <RolesItem key={`${role['role_name']}~${index}`}
                                                roleData={role}
                                                // policiesAvailable={policiesOptionsAvailable}
                                                policiesAvailable={policies}
                                                trustsAvailable={trusts}
                                                index={index}
                                                callbackDeleteIndex={handleDeleteForm}
                                                callbackSaveData={saveFormData}
                                            /> 
                                        </TabPanel>
                                    )
                                })}   
            
                            </div>

                            
                            <Zoom key="primary" unmountOnExit in={true} onClick={ () => handleAddFields("role")} >
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
                                    onChange={handleChangeTabPolicies}
                                    aria-label="Vertical policies"
                                    className={classes.tabs}
                                    style={{
                                        // backgroundColor:"red"
                                        minWidth: "15em",
                                        maxWidth: "15em"
                                    }}
                                >
                                    {policies.map((policy, index) => {
                                        return <Tab className={classes.tabsMain}  key={`${policy['policy_name']}~${index}`} label={policy['policy_name']} {...a11yProps(index)} />
                                    })}
                    
                                </Tabs>
                                {policies.map((policy, index) => {
                                    return (
                                        <TabPanel index={index} value={valueIndexPolicies}  key={`${policy['policy_name']}~${index}`} className={classes.tabContent}>
                                            <PoliciesItem key={`${policy['policy_name']}~${index}`}
                                                policyData={policy}
                                                index={index}
                                                callbackDeleteIndex={handleDeleteForm}
                                                callbackSaveData={saveFormData}
                                            />
                                        </TabPanel>
                                    )
                                })}
            
                            </div>

                            
                            <Zoom key="primary" unmountOnExit in={true} onClick={ () => handleAddFields("policy")} >
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
                                    onChange={handleChangeTabTrusts}
                                    aria-label="Vertical trust relationship"
                                    className={classes.tabs}
                                    style={{
                                        // backgroundColor:"red"
                                        minWidth: "15em",
                                        maxWidth: "15em"
                                    }}
                                >
                                    {trusts.map((trust, index) => {
                                        return <Tab className={classes.tabsMain} key={`${trust['trust_name']}~${index}`} label={trust['trust_name']} {...a11yProps(index)} />
                                    })}
                                </Tabs>
                                {trusts.map((trust, index) => {
                                    return (
                                        <TabPanel index={index} value={valueIndexTrusts} key={`${trust['trust_name']}~${index}`} className={classes.tabContent}>
                                            <p className="disclaimer">OBS: os documentos que possuírem "ACCOUNT_ID" no lugar da Account ID, irão ser interpretados pelo código para serem substituídos pelo valor do Account ID.</p>
                                            <TrustItem key={`${trust['trust_name']}~${index}`}
                                                trustData={trust}
                                                index={index}
                                                callbackDeleteIndex={handleDeleteForm}
                                                callbackSaveData={saveFormData}
                                            />
                                        </TabPanel>
                                    )
                                })}
                            </div>
                        
                            <Zoom key="primary" unmountOnExit  in={true}  onClick={ () => handleAddFields("trustrelationships")} >
                                <Tooltip title="Criar um novo trust relationship" aria-label="add" placement="top" arrow>
                                    <Fab aria-label="Add trust relationship" className={classes.fabAdd} color="primary">
                                        <AddIcon />
                                    </Fab>
                                </Tooltip>
                            </Zoom>
                        </TabPanel>

                        <Zoom key="primary" unmountOnExit  in={true} onClick={() => saveData()}>
                            <Tooltip title="Salvar" aria-label="add" placement="top" arrow>
                                <Fab aria-label="Save" className={classes.fabSave} color="primary">
                                    <SaveIcon  />
                                    {loading ? <CircularProgress size={68} className={classes.fabProgress} /> : null}
                                    {/* {loading && <CircularProgress size={68} className={classes.fabProgress} />} */}
                                </Fab>
                            </Tooltip>
                        </Zoom>
                
                    </>
                )}
            </Box>

        </main>
    );
}



export default TabsView;