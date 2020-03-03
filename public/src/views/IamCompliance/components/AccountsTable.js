import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from '@material-ui/core/styles';
import {Fab, Box, Button, InputLabel, Select, FormControl, MenuItem, Typography, Grid, Paper } from "@material-ui/core";
import MaterialTable from 'material-table';

import JSONPretty from 'react-json-pretty';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import AlertMessage from "../../../components/AlertMessage";



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
        // height: "38em",
        // height: "1%",
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
        // color: green[500],
        position: 'absolute',
        top: -6,
        left: -6,
        zIndex: 1,
    },
    paper: {
        padding: theme.spacing(2),
        // textAlign: 'center',
        color: theme.palette.text.secondary,
    }
}));

const AccountsTable = (props) => {
    const classes = useStyles();
    const [openRefresh, setOpenRefresh] = React.useState(false);
    const [openAddNewCheck, setOpenAddNewCheck] = React.useState(false);
    const [disabledButtonRequestCompliance, setDisabledButtonRequestCompliance] = React.useState(true);

    // modal table details
    const [openRenderModalTableDetails, setRenderModalTableDetails] = React.useState(false);
    const [contentRenderModalTableDetails, setContentRenderModalTableDetails] = React.useState("");
    const handleClickRenderModalTableDetails = (content) => {
        setContentRenderModalTableDetails(content);
        setRenderModalTableDetails(true);
    }
    const handleCloseRenderModalTableDetails = () => {
        setRenderModalTableDetails(false);
        // setContentRenderModalTableDetails("");
    }
    const renderModalTableOffender = (rowData) => {
        // console.log("openRenderModalTableDetails: ",openRenderModalTableDetails);
        if(rowData.info){
            return (
                <>
                    <Button variant="contained"
                    onClick={() => handleClickRenderModalTableDetails(rowData.info)} 
                    >
                    Expandir
                    </Button>
                    
                </>
            );
    
        }
        return "";
    }
    
    // select handle values
    const [dataSelect, setDataSelect] = React.useState("");
    const [accountSelect, setAccountSelect] = React.useState("");

    // AlertMessage
    const handleOpenAlert = elem => setOpenAlert(elem);
    const [isLoading, setLoading] = React.useState(false);
    const [openAlert, setOpenAlert] = React.useState(false);
    const [typeMessage, setTypeMessage] = React.useState("");
    const [messageAlert, setMessageAlert] = React.useState("");

    const handleClickOpenRefresh = () => setOpenRefresh(true);

    const handleCloseRefresh = () => {
        setOpenRefresh(false);
        setAccountSelect("");
        setDataSelect("");
    }

    const handleClickOpenAdd = () => setOpenAddNewCheck(true);

    const handleCloseAddNewCheck = () => {
        setDisabledButtonRequestCompliance(true);
        setOpenAddNewCheck(false);
    }

    const onChangeTypeRole = e => {
        setDisabledButtonRequestCompliance(false);
        props.onChangeTypeRole(e);
    }

    const requestNewCompliance = async () => {
        setOpenAddNewCheck(false);

        setLoading(true);
        
        await props.requestNewCompliance()
        .then( data => {
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


    const type_roles = props.type_roles;
    // const accounts = props.accounts;
    const dates_available = props.dates_available;

    let accounts = [{"Account":"350819178402","DateAction":"03032020-IAM","TypeCompliance":"IAM","DataCompliance":"[{\"name\": \"supportportal\", \"policy\": \"policy-supportportal\", \"compliance\": false, \"status\": \"Policy possui modificações na policy\", \"policies_adicionais\": \"N/A\", \"info\": {\"policy_not_in_compliance\": \"{\\\"Version\\\": \\\"2012-10-17\\\", \\\"Statement\\\": [{\\\"Action\\\": [\\\"iam:GenerateCredentialReport\\\", \\\"iam:GetPolicyVersion\\\", \\\"iam:GetPolicy\\\", \\\"iam:GetCredentialReport\\\", \\\"iam:ListAttachedRolePolicies\\\", \\\"iam:ListUsers\\\", \\\"iam:ListAccessKeys\\\", \\\"ec2:DescribeInstances\\\", \\\"ec2:DescribeNetworkInterfaces\\\", \\\"ec2:DescribeVpcs\\\", \\\"cloudtrail:DescribeTrails\\\", \\\"s3:GetBucketLocation\\\"], \\\"Resource\\\": \\\"*\\\", \\\"Effect\\\": \\\"Allow\\\", \\\"Sid\\\": \\\"ReadAccessForSiem\\\"}]}\", \"policy_master\": \"{\\\"Version\\\": \\\"2012-10-17\\\", \\\"Statement\\\": [{\\\"Sid\\\": \\\"ReadAccessForSiem\\\", \\\"Effect\\\": \\\"Allow\\\", \\\"Action\\\": [\\\"iam:GenerateCredentialReport\\\", \\\"iam:GetPolicyVersion\\\", \\\"iam:GetPolicy\\\", \\\"iam:GetCredentialReport\\\", \\\"iam:ListAttachedRolePolicies\\\", \\\"iam:ListUsers\\\", \\\"iam:ListAccessKeys\\\", \\\"ec2:DescribeInstances\\\", \\\"ec2:DescribeNetworkInterfaces\\\", \\\"ec2:DescribeVpcs\\\", \\\"cloudtrail:DescribeTrails\\\", \\\"s3:GetBucketLocation\\\"], \\\"Resource\\\": \\\"*\\\"}]}\"}}, {\"name\": \"accessmngt\", \"policy\": \"policy-accessmngt\", \"compliance\": false, \"status\": \"Policy possui modificações na policy\", \"policies_adicionais\": \"N/A\", \"info\": {\"policy_not_in_compliance\": \"{\\\"Version\\\": \\\"2012-10-17\\\", \\\"Statement\\\": [{\\\"Condition\\\": {\\\"IpAddress\\\": {\\\"aws:SourceIp\\\": \\\"187.94.52.20/32\\\"}}, \\\"Action\\\": [\\\"iam:*\\\", \\\"cloudtrail:*\\\", \\\"support:*\\\"], \\\"Resource\\\": \\\"*\\\", \\\"Effect\\\": \\\"Allow\\\", \\\"Sid\\\": \\\"accessmngt\\\"}]}\", \"policy_master\": \"{\\\"Version\\\": \\\"2012-10-17\\\", \\\"Statement\\\": [{\\\"Sid\\\": \\\"accessmngt\\\", \\\"Effect\\\": \\\"Allow\\\", \\\"Action\\\": [\\\"iam:*\\\", \\\"cloudtrail:*\\\", \\\"support:*\\\"], \\\"Resource\\\": \\\"*\\\", \\\"Condition\\\": {\\\"IpAddress\\\": {\\\"aws:SourceIp\\\": \\\"187.94.52.20/32\\\"}}}]}\"}}, {\"name\": \"ateleia-systemmanager\", \"policy\": \"policy-ateleiasystemmanager\", \"compliance\": false, \"status\": \"Policy possui modificações na policy e policy adicionais\", \"policies_adicionais\": [\"AmazonSSMFullAccess\", \"AmazonSNSFullAccess\", \"policy-ateleiasystemmanager\"], \"info\": {\"policy_not_in_compliance\": \"{\\\"Version\\\": \\\"2012-10-17\\\", \\\"Statement\\\": [{\\\"Action\\\": [\\\"iam:GetRole\\\", \\\"iam:PassRole\\\", \\\"iam:ListGroupsForUser\\\", \\\"iam:ListRoles\\\", \\\"iam:CreateRole\\\", \\\"iam:AttachRolePolicy\\\", \\\"iam:ListGroups\\\"], \\\"Resource\\\": \\\"*\\\", \\\"Effect\\\": \\\"Allow\\\", \\\"Sid\\\": \\\"VisualEditor0\\\"}]}\", \"policy_master\": \"{\\\"Version\\\": \\\"2012-10-17\\\", \\\"Statement\\\": [{\\\"Sid\\\": \\\"VisualEditor0\\\", \\\"Effect\\\": \\\"Allow\\\", \\\"Action\\\": [\\\"iam:GetRole\\\", \\\"iam:PassRole\\\", \\\"iam:ListGroupsForUser\\\", \\\"iam:ListRoles\\\", \\\"iam:CreateRole\\\", \\\"iam:AttachRolePolicy\\\", \\\"iam:ListGroups\\\"], \\\"Resource\\\": \\\"*\\\"}]}\"}}, {\"name\": \"businessops\", \"policy\": \"policy-businessops\", \"compliance\": false, \"status\": \"Policy possui modificações na policy\", \"policies_adicionais\": \"N/A\", \"info\": {\"policy_not_in_compliance\": \"{\\\"Version\\\": \\\"2012-10-17\\\", \\\"Statement\\\": [{\\\"Condition\\\": {\\\"IpAddress\\\": {\\\"aws:SourceIp\\\": \\\"187.94.52.20/32\\\"}}, \\\"Action\\\": [\\\"aws-portal:*\\\", \\\"awsbillingconsole:*\\\", \\\"budgets:*\\\", \\\"cur:*\\\", \\\"support:*\\\"], \\\"Resource\\\": \\\"*\\\", \\\"Effect\\\": \\\"Allow\\\", \\\"Sid\\\": \\\"businessops\\\"}]}\", \"policy_master\": \"{\\\"Version\\\": \\\"2012-10-17\\\", \\\"Statement\\\": [{\\\"Sid\\\": \\\"businessops\\\", \\\"Effect\\\": \\\"Allow\\\", \\\"Action\\\": [\\\"aws-portal:*\\\", \\\"awsbillingconsole:*\\\", \\\"budgets:*\\\", \\\"cur:*\\\", \\\"support:*\\\"], \\\"Resource\\\": \\\"*\\\", \\\"Condition\\\": {\\\"IpAddress\\\": {\\\"aws:SourceIp\\\": \\\"187.94.52.20/32\\\"}}}]}\"}}, {\"name\": \"siemaudit\", \"policy\": \"policy-siemaudit\", \"compliance\": false, \"status\": \"Policy possui modificações na policy\", \"policies_adicionais\": \"N/A\", \"info\": {\"policy_not_in_compliance\": \"{\\\"Version\\\": \\\"2012-10-17\\\", \\\"Statement\\\": [{\\\"Action\\\": [\\\"iam:GenerateCredentialReport\\\", \\\"iam:GetPolicyVersion\\\", \\\"iam:GetPolicy\\\", \\\"iam:GetCredentialReport\\\", \\\"iam:ListAttachedRolePolicies\\\", \\\"iam:ListUsers\\\", \\\"iam:ListAccessKeys\\\", \\\"ec2:DescribeInstances\\\", \\\"ec2:DescribeNetworkInterfaces\\\", \\\"ec2:DescribeVpcs\\\", \\\"cloudtrail:DescribeTrails\\\", \\\"s3:GetBucketLocation\\\"], \\\"Resource\\\": \\\"*\\\", \\\"Effect\\\": \\\"Allow\\\", \\\"Sid\\\": \\\"ReadAccessForSiem\\\"}]}\", \"policy_master\": \"{\\\"Version\\\": \\\"2012-10-17\\\", \\\"Statement\\\": [{\\\"Sid\\\": \\\"ReadAccessForSiem\\\", \\\"Effect\\\": \\\"Allow\\\", \\\"Action\\\": [\\\"iam:GenerateCredentialReport\\\", \\\"iam:GetPolicyVersion\\\", \\\"iam:GetPolicy\\\", \\\"iam:GetCredentialReport\\\", \\\"iam:ListAttachedRolePolicies\\\", \\\"iam:ListUsers\\\", \\\"iam:ListAccessKeys\\\", \\\"ec2:DescribeInstances\\\", \\\"ec2:DescribeNetworkInterfaces\\\", \\\"ec2:DescribeVpcs\\\", \\\"cloudtrail:DescribeTrails\\\", \\\"s3:GetBucketLocation\\\"], \\\"Resource\\\": \\\"*\\\"}]}\"}}, {\"name\": \"lionsplatform\", \"policy\": \"policy-lionsplataform\", \"compliance\": false, \"status\": \"Policy possui modificações na policy\", \"policies_adicionais\": \"N/A\", \"info\": {\"policy_not_in_compliance\": \"{\\\"Version\\\": \\\"2012-10-17\\\", \\\"Statement\\\": [{\\\"Action\\\": [\\\"cloudtrail:UpdateTrail\\\", \\\"cloudtrail:StopLogging\\\", \\\"cloudtrail:DeleteTrail\\\", \\\"cloudtrail:CreateTrail\\\"], \\\"Resource\\\": \\\"*\\\", \\\"Effect\\\": \\\"Deny\\\", \\\"Sid\\\": \\\"lionsplatformDenyStopDeleteCloudtrail\\\"}, {\\\"Action\\\": [\\\"aws-portal:ModifyPaymentMethods\\\", \\\"aws-portal:ModifyBilling\\\", \\\"aws-portal:ModifyAccount\\\"], \\\"Resource\\\": \\\"*\\\", \\\"Effect\\\": \\\"Deny\\\", \\\"Sid\\\": \\\"lionsplatformDenyWRITEPortal\\\"}, {\\\"Action\\\": [\\\"iam:UploadSigningCertificate\\\", \\\"iam:UploadSSHPublicKey\\\", \\\"iam:UpdateUser\\\", \\\"iam:UpdateSigningCertificate\\\", \\\"iam:UpdateSSHPublicKey\\\", \\\"iam:UpdateSAMLProvider\\\", \\\"iam:UpdateLoginProfile\\\", \\\"iam:UpdateGroup\\\", \\\"iam:UpdateAssumeRolePolicy\\\", \\\"iam:UpdateAccountPasswordPolicy\\\", \\\"iam:RemoveUserFromGroup\\\", \\\"iam:PutUserPolicy\\\", \\\"iam:PutGroupPolicy\\\", \\\"iam:DetachUserPolicy\\\", \\\"iam:DetachGroupPolicy\\\", \\\"iam:DeleteUserPolicy\\\", \\\"iam:DeleteUser\\\", \\\"iam:DeleteSigningCertificate\\\", \\\"iam:DeleteSSHPublicKey\\\", \\\"iam:DeleteSAMLProvider\\\", \\\"iam:DeletePolicyVersion\\\", \\\"iam:DeletePolicy\\\", \\\"iam:DeleteLoginProfile\\\", \\\"iam:DeleteGroupPolicy\\\", \\\"iam:DeleteGroup\\\", \\\"iam:DeleteAccountPasswordPolicy\\\", \\\"iam:DeactivateMFADevice\\\", \\\"iam:CreateUser\\\", \\\"iam:CreateSAMLProvider\\\", \\\"iam:CreateLoginProfile\\\", \\\"iam:CreateGroup\\\", \\\"iam:AttachUserPolicy\\\", \\\"iam:AttachGroupPolicy\\\", \\\"iam:AddUserToGroup\\\"], \\\"Resource\\\": \\\"*\\\", \\\"Effect\\\": \\\"Deny\\\", \\\"Sid\\\": \\\"lionsplatformDenyWriteIAM\\\"}, {\\\"Action\\\": [\\\"iam:SetDefaultPolicyVersion\\\", \\\"iam:PutRolePolicy\\\", \\\"iam:DetachRolePolicy\\\", \\\"iam:DeleteRolePolicy\\\", \\\"iam:DeleteRole\\\", \\\"iam:CreateRole\\\", \\\"iam:CreatePolicyVersion\\\", \\\"iam:CreatePolicy\\\", \\\"iam:AttachRolePolicy\\\"], \\\"Resource\\\": [\\\"arn:aws:iam::*:role/supportportal\\\", \\\"arn:aws:iam::*:role/lionsplatform\\\", \\\"arn:aws:iam::*:role/devopsplatform\\\", \\\"arn:aws:iam::*:role/businessops\\\", \\\"arn:aws:iam::*:role/accessmngt\\\"], \\\"Effect\\\": \\\"Deny\\\", \\\"Sid\\\": \\\"lionsplatformDenyChangeManagedRoles\\\"}, {\\\"Condition\\\": {\\\"IpAddress\\\": {\\\"aws:SourceIp\\\": \\\"187.94.52.20/32\\\"}}, \\\"Action\\\": \\\"*\\\", \\\"Resource\\\": \\\"*\\\", \\\"Effect\\\": \\\"Allow\\\", \\\"Sid\\\": \\\"lionsplatformAllowFromIntranet\\\"}]}\", \"policy_master\": \"{\\\"Version\\\": \\\"2012-10-17\\\", \\\"Statement\\\": [{\\\"Sid\\\": \\\"lionsplatformDenyStopDeleteCloudtrail\\\", \\\"Effect\\\": \\\"Deny\\\", \\\"Action\\\": [\\\"cloudtrail:UpdateTrail\\\", \\\"cloudtrail:StopLogging\\\", \\\"cloudtrail:DeleteTrail\\\", \\\"cloudtrail:CreateTrail\\\"], \\\"Resource\\\": \\\"*\\\"}, {\\\"Sid\\\": \\\"lionsplatformDenyWRITEPortal\\\", \\\"Effect\\\": \\\"Deny\\\", \\\"Action\\\": [\\\"aws-portal:ModifyPaymentMethods\\\", \\\"aws-portal:ModifyBilling\\\", \\\"aws-portal:ModifyAccount\\\"], \\\"Resource\\\": \\\"*\\\"}, {\\\"Sid\\\": \\\"lionsplatformDenyWriteIAM\\\", \\\"Effect\\\": \\\"Deny\\\", \\\"Action\\\": [\\\"iam:UploadSigningCertificate\\\", \\\"iam:UploadSSHPublicKey\\\", \\\"iam:UpdateUser\\\", \\\"iam:UpdateSigningCertificate\\\", \\\"iam:UpdateSSHPublicKey\\\", \\\"iam:UpdateSAMLProvider\\\", \\\"iam:UpdateLoginProfile\\\", \\\"iam:UpdateGroup\\\", \\\"iam:UpdateAssumeRolePolicy\\\", \\\"iam:UpdateAccountPasswordPolicy\\\", \\\"iam:RemoveUserFromGroup\\\", \\\"iam:PutUserPolicy\\\", \\\"iam:PutGroupPolicy\\\", \\\"iam:DetachUserPolicy\\\", \\\"iam:DetachGroupPolicy\\\", \\\"iam:DeleteUserPolicy\\\", \\\"iam:DeleteUser\\\", \\\"iam:DeleteSigningCertificate\\\", \\\"iam:DeleteSSHPublicKey\\\", \\\"iam:DeleteSAMLProvider\\\", \\\"iam:DeletePolicyVersion\\\", \\\"iam:DeletePolicy\\\", \\\"iam:DeleteLoginProfile\\\", \\\"iam:DeleteGroupPolicy\\\", \\\"iam:DeleteGroup\\\", \\\"iam:DeleteAccountPasswordPolicy\\\", \\\"iam:DeactivateMFADevice\\\", \\\"iam:CreateUser\\\", \\\"iam:CreateSAMLProvider\\\", \\\"iam:CreateLoginProfile\\\", \\\"iam:CreateGroup\\\", \\\"iam:AttachUserPolicy\\\", \\\"iam:AttachGroupPolicy\\\", \\\"iam:AddUserToGroup\\\"], \\\"Resource\\\": \\\"*\\\"}, {\\\"Sid\\\": \\\"lionsplatformDenyChangeManagedRoles\\\", \\\"Effect\\\": \\\"Deny\\\", \\\"Action\\\": [\\\"iam:SetDefaultPolicyVersion\\\", \\\"iam:PutRolePolicy\\\", \\\"iam:DetachRolePolicy\\\", \\\"iam:DeleteRolePolicy\\\", \\\"iam:DeleteRole\\\", \\\"iam:CreateRole\\\", \\\"iam:CreatePolicyVersion\\\", \\\"iam:CreatePolicy\\\", \\\"iam:AttachRolePolicy\\\"], \\\"Resource\\\": [\\\"arn:aws:iam::*:role/supportportal\\\", \\\"arn:aws:iam::*:role/lionsplatform\\\", \\\"arn:aws:iam::*:role/devopsplatform\\\", \\\"arn:aws:iam::*:role/businessops\\\", \\\"arn:aws:iam::*:role/accessmngt\\\"]}, {\\\"Sid\\\": \\\"lionsplatformAllowFromIntranet\\\", \\\"Effect\\\": \\\"Allow\\\", \\\"Action\\\": \\\"*\\\", \\\"Resource\\\": \\\"*\\\", \\\"Condition\\\": {\\\"IpAddress\\\": {\\\"aws:SourceIp\\\": \\\"187.94.52.20/32\\\"}}}]}\"}}]","Name":"licenseserversm2plataforma.aws","TypeRole":"Cloud"}];
    let rows = [];
    if(accounts && accounts.length){
        accounts.map(elem => {
            JSON.parse(elem['DataCompliance']).map(elem2 => {
                // id: 'Account', title: 'Account\u00a0ID'; id: 'Name', title: 'Name\u00a0Account'; id: 'name', title: 'Role\u00a0Name';
                // id: 'policy', title: 'Policy'; id: 'compliance', title: 'Compliance'; id: 'status', title: 'Status';
                // id: 'policies_adicionais', title: 'Policie
                
                rows.push( {
                    "account_id":elem['Account'], "account_name":elem['Name'], "role_name":elem2['name'], 
                    "role_policy":elem2['policy'], "compliance":elem2['compliance'].toString(), "status":elem2['status'],
                    "policies_adicionais":elem2.hasOwnProperty("policies_adicionais") ? elem2['policies_adicionais'].toString() : "",
                    "info": elem2.hasOwnProperty("info") ? 
                        elem2['info']['policy_not_in_compliance'].toString() + "%SPLIT%" + elem2['info']['policy_master'].toString()
                        : "",
                } );
            });
        });
    }
    
    // console.log("Accounts: ",accounts);

    return (
        <main className={classes.content}>
            <Typography className={classes.titleHeader} variant="h4" noWrap >
                IAM Compliance
            </Typography>
            <Box boxShadow={3}>

                {/* <div style={{marginBot:"1em"}}>
                   <Button className="space" variant="contained" color="primary"
                    //onClick={this.handleShow.bind(this)} 
                    >
                        Novo check
                    </Button>
                </div> */}

                <MaterialTable
                    title="Resultados"
                    // isLoading={rows.length ? false: true}
                    columns={[
                        { field: 'account_id', title: 'Account\u00a0ID', headerStyle: {fontWeight: 'bolder',} },
                        { field: 'account_name', title: 'Name\u00a0Account', align: 'justify', format: value => value.toLocaleString(), headerStyle: {fontWeight: 'bolder',} },
                        { field: 'role_name', title: 'Role\u00a0Name',  align: 'justify', format: value => value.toLocaleString(), headerStyle: {fontWeight: 'bolder',} },
                        { field: 'role_policy', title: 'Policy', align: 'justify', format: value => value.toFixed(2), headerStyle: {fontWeight: 'bolder',} },
                        { field: 'compliance', title: 'Compliance',  align: 'justify', format: value => value.toLocaleString(), headerStyle: {fontWeight: 'bolder',} },
                        { field: 'status', title: 'Status',  align: 'justify', format: value => value.toLocaleString(), headerStyle: {fontWeight: 'bolder',} },
                        { field: 'policies_adicionais', title: 'Policies\u00a0Adicionais',  align: 'justify', format: value => value.toLocaleString(), headerStyle: {fontWeight: 'bolder',} },
                        { 
                            field: 'info', title: 'Details',  align: 'justify', 
                            format: value => value.toLocaleString(), 
                            headerStyle: {fontWeight: 'bolder',}, 
                            render: rowData => renderModalTableOffender(rowData),
                        },
                    ]}
                    data={rows}
                    isLoading={isLoading}
                    options={{
                        exportButton: true,
                        pageSize: 25,
                        pageSizeOptions: [25,50,100,200],
                        exportAllData: true,
                        // filtering: true,
                    }}
                    actions={[
                        {
                            icon: 'refresh',
                            tooltip: 'Obter dados',
                            isFreeAction: true,
                            onClick: () => handleClickOpenRefresh(),
                        },
                        {
                            icon: 'add',
                            tooltip: 'Gerar um novo relatório',
                            isFreeAction: true,
                            onClick: () => handleClickOpenAdd()
                        }
                      ]}
                />

                <Dialog
                    open={openRefresh}
                    onClose={() => handleCloseRefresh()}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Selecionar o dia do relatório por conta"}</DialogTitle>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <FormControl style={{width:"10em", marginRight:"1em"}}>
                            <InputLabel id="controlled-open-select-label-tipo-da-conta">Data da ação</InputLabel>
                            <Select required labelId="controlled-open-select-label-tipo-da-conta" id="demo-controlled-open-select"
                            onChange={e => {
                                setDataSelect(e.target.value);
                                props.onChangeDataCheck(e)
                            }}
                            >   
                                {accounts && accounts.slice(0,1).map((elem,index) =>{
                                    return <MenuItem selected className="filter_selected" key='selected'>{elem['DateAction']}</MenuItem>;
                                })}
                                {/* available values */}
                                {dates_available && dates_available.map((elem,index) =>{
                                    return <MenuItem key={elem} value={elem}>{elem}</MenuItem>;
                                })}
                            </Select>
                        </FormControl>

                        <FormControl style={{width:"10em"}}>
                            <InputLabel id="controlled-open-select-label-tipo-da-conta">Tipo da conta</InputLabel>
                            <Select required labelId="controlled-open-select-label-tipo-da-conta" id="demo-controlled-open-select"
                            onChange={e => {
                                setAccountSelect(e.target.value);
                                props.onChangeTypeRole(e);
                            }}
                            >   
                                {type_roles && type_roles.map((elem,index) =>{
                                    return <MenuItem key={elem} value={elem}>{elem}</MenuItem>;
                                })}
                            </Select>
                        </FormControl>

                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    {accountSelect!=="" && dataSelect!=="" ? 
                    (
                        <Button 
                        onClick={() => {
                            // both values need to have values setted
                            if(accountSelect !== "" && dataSelect !== ""){
                                props.getCompliance();
                                handleCloseRefresh();
                            }
                        }} 
                        variant="contained" color="primary">
                            Obter
                        </Button>
                    )
                    :
                    (
                        <Button 
                        disabled
                        variant="contained" color="primary">
                            Obter
                        </Button>
                    )
                    
                    }
                    
                    <Button onClick={handleCloseRefresh} variant="contained" color="primary">
                        Fechar
                    </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={openAddNewCheck}
                    onClose={handleCloseAddNewCheck}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title2">{"Novo check"}</DialogTitle>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Essa ação irá acessar as contas do Organizations e fazer a partir das roles do tipo "
                        <FormControl style={{width:"10em"}}>
                            {/* <InputLabel id="controlled-open-select-label-tipo-da-conta">Tipo da conta</InputLabel> */}
                            <Select required={true} labelId="controlled-open-select-label-tipo-da-conta" id="demo-controlled-open-select"
                            onChange={e => {
                                setAccountSelect(e.target.value);
                                onChangeTypeRole(e);
                            }}
                            >   
                                {type_roles && type_roles.map((elem,index) =>{
                                    return <MenuItem key={elem} value={elem}>{elem}</MenuItem>;
                                })}
                            </Select>
                        </FormControl>
                        " e fazer os checks para gerar um novo relatório de compliance. Poderá demorar alguns minutos, deseja continuar?
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    {disabledButtonRequestCompliance ? (
                        <Button disabled
                        variant="contained" color="primary">
                            Sim
                        </Button>
                    ) : (
                        <Button
                        onClick={requestNewCompliance} 
                        variant="contained" color="primary">
                            Sim
                        </Button>
                    )
                
                    }
                    
                    <Button onClick={handleCloseAddNewCheck} variant="contained" color="secondary" autoFocus>
                        Não
                    </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={openRenderModalTableDetails}
                    onClose={() => handleCloseRenderModalTableDetails()}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    fullWidth={true}
                    maxWidth={"md"}
                    // maxWidth={false}
                >
                    <DialogTitle id="alert-dialog-title2">Details</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Paper className={classes.paper}>
                                    <h1 style={{fontSize: "18px"}}>Policy in runtime (not compliant)</h1>
                                    <JSONPretty id="json-pretty" data={contentRenderModalTableDetails.split("%SPLIT%")[0]}></JSONPretty>
                                </Paper>
                            </Grid>
                            {/* <hr /> */}
                            <Grid item xs={6}>
                                <Paper className={classes.paper}>
                                    <h1 style={{fontSize: "18px"}}>Template policy (compliant)</h1>
                                    <JSONPretty id="json-pretty" data={contentRenderModalTableDetails.split("%SPLIT%")[1]}></JSONPretty>
                                </Paper>
                            </Grid>
                        </Grid>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => handleCloseRenderModalTableDetails()} variant="contained" color="primary" autoFocus>
                            Fechar
                        </Button>
                    </DialogActions>
                </Dialog>
             
                <AlertMessage open={openAlert} typeMessage={typeMessage} message={messageAlert} openAlertCallback={handleOpenAlert}/>
            </Box>
        </main>
        
    );
}

AccountsTable.propTypes = {
    // onChangeTypeRole: PropTypes.func.isRequired
    onChange: PropTypes.func,
    required: PropTypes.bool,
    // data: (elem) => {
    //     if(elem.id === "type-roles"){
    //         console.log(elem);
    //     }
    // }
    // value: PropTypes.object.isRequired
};

export default AccountsTable;