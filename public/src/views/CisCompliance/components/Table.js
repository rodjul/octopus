import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import {Fab, Box, Button, InputLabel, Select, FormControl, MenuItem, Typography } from "@material-ui/core";
import MaterialTable from 'material-table';
// import { Table, Dropdown, Button, Form, Modal } from "react-bootstrap";

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


const columns = [
    { field: 'account_id', title: 'Account\u00a0ID', headerStyle: {fontWeight: 'bolder',} },
    { field: 'account_name', title: 'Nome', headerStyle: {fontWeight: 'bolder',} },
    { field: 'title', title: 'Title', headerStyle: {fontWeight: 'bolder',} },
    { field: 'compliance', title: 'Compliance', align: 'justify', format: value => value.toLocaleString(), headerStyle: {fontWeight: 'bolder',} },
    { field: 'offenders', title: 'Offenders',  align: 'justify', format: value => value.toLocaleString(), headerStyle: {fontWeight: 'bolder',} },
    { field: 'failReason', title: 'Fail\u00a0Reason', align: 'justify', format: value => value.toFixed(2), headerStyle: {fontWeight: 'bolder',} }
];



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
    }
}));

const AccountsTable = (props) => {
    const classes = useStyles();
    const [openRefresh, setOpenRefresh] = React.useState(false);
    const [openAddNewCheck, setOpenAddNewCheck] = React.useState(false);
    const [disabledButtonRequestCompliance, setDisabledButtonRequestCompliance] = React.useState(true);

    const handleClickOpenRefresh = () => setOpenRefresh(true);

    const handleCloseRefresh = () => setOpenRefresh(false);

    const handleClickOpenAdd = () => setOpenAddNewCheck(true);

    const handleCloseAddNewCheck = () => {
        setDisabledButtonRequestCompliance(true);
        setOpenAddNewCheck(false);
    }

    const requestNewCompliance = () => {
        setOpenAddNewCheck(false);
        props.requestNewCompliance();
    }

    // const requestNewCompliance = () => {
    //     props.requestNewCompliance;
    //     if (!loading) {
    //         setLoading(true);
    //         setSuccess(false);
            
    //         let resp = await onSubmit(event);
    //         resp = JSON.parse(resp);
    //         console.log(resp);
    //         if(!resp['error']){
    //             setLoading(false);

    //             setOpenAlert(true);
    //             setTypeMessage("success");
    //             setMessageAlert("CriaÃ§Ã£o da conta com sucesso");
                
    //             setLoadTable(true);
    //         }else{
    //             setLoading(false);

    //             setOpenAlert(true);
    //             setTypeMessage("error");
    //             setMessageAlert("Ocorreu um erro ao criar a conta. Contate o suporte");
                
    //         }
    // }

    const accounts = props.accounts;
    const dates_available = props.dates_available;


    let test = 
    {
        "1": {
            "1": {
                "ControlId": "1.1",
                "Description": "Avoid the use of the root account",
                "Offenders": [],
                "Result": true,
                "ScoredControl": true,
                "failReason": ""
            },
            "2": {
                "ControlId": "1.2",
                "Description": "Ensure multi-factor authentication (MFA) is enabled for all IAM users that have a console password",
                "Offenders": [],
                "Result": true,
                "ScoredControl": true,
                "failReason": ""
            },
            "3": {
                "ControlId": "1.3",
                "Description": "Ensure credentials unused for 90 days or greater are disabled",
                "Offenders": [
                    "arn:aws:iam::826839167791:user/buissa-s3:key1",
                    "arn:aws:iam::826839167791:user/lincoln.oliveira:key1"
                ],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Credentials unused > 90 days detected. "
            },
            "4": {
                "ControlId": "1.4",
                "Description": "Ensure access keys are rotated every 90 days or less",
                "Offenders": [
                    "arn:aws:iam::826839167791:user/AzureADRoleManager:unrotated key1",
                    "arn:aws:iam::826839167791:user/buissa-s3:unrotated key1",
                    "arn:aws:iam::826839167791:user/lincoln.oliveira:unrotated key1"
                ],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Key rotation >90 days or not used since rotation"
            },
            "5": {
                "ControlId": "1.5",
                "Description": "Ensure IAM password policy requires at least one uppercase letter",
                "Offenders": [],
                "Result": true,
                "ScoredControl": true,
                "failReason": ""
            },
            "6": {
                "ControlId": "1.6",
                "Description": "Ensure IAM password policy requires at least one lowercase letter",
                "Offenders": [],
                "Result": true,
                "ScoredControl": true,
                "failReason": ""
            },
            "7": {
                "ControlId": "1.7",
                "Description": "Ensure IAM password policy requires at least one symbol",
                "Offenders": [],
                "Result": true,
                "ScoredControl": true,
                "failReason": ""
            },
            "8": {
                "ControlId": "1.8",
                "Description": "Ensure IAM password policy requires at least one number",
                "Offenders": [],
                "Result": true,
                "ScoredControl": true,
                "failReason": ""
            },
            "9": {
                "ControlId": "1.9",
                "Description": "Ensure IAM password policy requires minimum length of 14 or greater",
                "Offenders": [],
                "Result": true,
                "ScoredControl": true,
                "failReason": ""
            },
            "10": {
                "ControlId": "1.10",
                "Description": "Ensure IAM password policy prevents password reuse",
                "Offenders": [],
                "Result": true,
                "ScoredControl": true,
                "failReason": ""
            },
            "11": {
                "ControlId": "1.11",
                "Description": "Ensure IAM password policy expires passwords within 90 days or less",
                "Offenders": [],
                "Result": true,
                "ScoredControl": true,
                "failReason": ""
            },
            "12": {
                "ControlId": "1.12",
                "Description": "Ensure no root account access key exists",
                "Offenders": [],
                "Result": true,
                "ScoredControl": true,
                "failReason": ""
            },
            "13": {
                "ControlId": "1.13",
                "Description": "Ensure MFA is enabled for the root account",
                "Offenders": [],
                "Result": true,
                "ScoredControl": true,
                "failReason": ""
            },
            "14": {
                "ControlId": "1.14",
                "Description": "Ensure hardware MFA is enabled for the root account",
                "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Root account not using hardware MFA"
            },
            "15": {
                "ControlId": "1.15",
                "Description": "Ensure security questions are registered in the AWS account, please verify manually",
                "Offenders": [],
                "Result": "Manual",
                "ScoredControl": false,
                "failReason": "Control not implemented using API, please verify manually"
            },
            "16": {
                "ControlId": "1.16",
                "Description": "Ensure IAM policies are attached only to groups or roles",
                "Offenders": [
                    "arn:aws:iam::826839167791:user/rodjul_serverless"
                ],
                "Result": false,
                "ScoredControl": true,
                "failReason": "IAM user have inline policy attached"
            },
            "17": {
                "ControlId": "1.17",
                "Description": "Maintain current contact details, please verify manually",
                "Offenders": [],
                "Result": "Manual",
                "ScoredControl": false,
                "failReason": "Control not implemented using API, please verify manually"
            },
            "18": {
                "ControlId": "1.18",
                "Description": "Ensure security contact information is registered, please verify manually",
                "Offenders": [],
                "Result": "Manual",
                "ScoredControl": false,
                "failReason": "Control not implemented using API, please verify manually"
            },
            "19": {
                "ControlId": "1.19",
                "Description": "Ensure IAM instance roles are used for AWS resource access from instances, application code is not audited",
                "Offenders": [],
                "Result": true,
                "ScoredControl": false,
                "failReason": "Instance not assigned IAM role for EC2"
            },
            "20": {
                "ControlId": "1.20",
                "Description": "Ensure a support role has been created to manage incidents with AWS Support",
                "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "No user, group or role assigned AWSSupportAccess"
            },
            "21": {
                "ControlId": "1.21",
                "Description": "Do not setup access keys during initial user setup for all IAM users that have a console password",
                "Offenders": [],
                "Result": true,
                "ScoredControl": false,
                "failReason": ""
            },
            "22": {
                "ControlId": "1.22",
                "Description": "Ensure IAM policies that allow full administrative privileges are not created",
                "Offenders": [
                    "arn:aws:iam::826839167791:policy/policy-Admin_SrcIPLimited",
                    "arn:aws:iam::826839167791:policy/Policy-AdminDiversos",
                    "arn:aws:iam::826839167791:policy/policy-ManageTerraform"
                ],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Found full administrative policy"
            }
        },
        "2": {
            "1": {
                "ControlId": "2.1",
                "Description": "Ensure CloudTrail is enabled in all regions",
                "Offenders": [],
                "Result": true,
                "ScoredControl": true,
                "failReason": ""
            },
            "2": {
                "ControlId": "2.2",
                "Description": "Ensure CloudTrail log file validation is enabled",
                "Offenders": [
                    "arn:aws:cloudtrail:sa-east-1:826839167791:trail/totvs-cloudtrail"
                ],
                "Result": false,
                "ScoredControl": true,
                "failReason": "CloudTrails without log file validation discovered"
            },
            "3": {
                "ControlId": "2.3",
                "Description": "Ensure the S3 bucket used to store CloudTrail logs is not publicly accessible",
                "Offenders": [
                    "arn:aws:cloudtrail:sa-east-1:826839167791:trail/totvs-cloudtrail:AccessDenied"
                ],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Missing permissions to verify bucket ACL. "
            },
            "4": {
                "ControlId": "2.4",
                "Description": "Ensure CloudTrail trails are integrated with CloudWatch Logs",
                "Offenders": [
                    "arn:aws:cloudtrail:sa-east-1:826839167791:trail/totvs-cloudtrail"
                ],
                "Result": false,
                "ScoredControl": true,
                "failReason": "CloudTrails without CloudWatch Logs discovered"
            },
            "5": {
                "ControlId": "2.5",
                "Description": "Ensure AWS Config is enabled in all regions",
                "Offenders": [
                    "eu-north-1:NotRecording",
                    "ap-south-1:NotRecording",
                    "eu-west-3:NotRecording",
                    "eu-west-2:NotRecording",
                    "eu-west-1:NotRecording",
                    "ap-northeast-2:NotRecording",
                    "ap-northeast-1:NotRecording",
                    "sa-east-1:NotRecording",
                    "ca-central-1:NotRecording",
                    "ap-southeast-1:NotRecording",
                    "ap-southeast-2:NotRecording",
                    "eu-central-1:NotRecording",
                    "us-east-1:NotRecording",
                    "us-east-2:NotRecording",
                    "us-west-1:NotRecording",
                    "us-west-2:NotRecording",
                    "Global:NotRecording"
                ],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Config not enabled in all regions, not capturing all/global events or delivery channel errors"
            },
            "6": {
                "ControlId": "2.6",
                "Description": "Ensure S3 bucket access logging is enabled on the CloudTrail S3 bucket",
                "Offenders": [
                    "arn:aws:cloudtrail:sa-east-1:826839167791:trail/totvs-cloudtrail",
                    "Trail:arn:aws:cloudtrail:sa-east-1:826839167791:trail/totvs-cloudtrail - S3Bucket:totvs-cloudtrail"
                ],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Cloudtrail not configured to log to S3. CloudTrail S3 bucket without logging discovered"
            },
            "7": {
                "ControlId": "2.7",
                "Description": "Ensure CloudTrail logs are encrypted at rest using KMS CMKs",
                "Offenders": [
                    "Trail:arn:aws:cloudtrail:sa-east-1:826839167791:trail/totvs-cloudtrail"
                ],
                "Result": false,
                "ScoredControl": true,
                "failReason": "CloudTrail not using KMS CMK for encryption discovered"
            },
            "8": {
                "ControlId": "2.8",
                "Description": "Ensure rotation for customer created CMKs is enabled",
                "Offenders": [
                    "Key:arn:aws:kms:us-east-1:826839167791:key/eed51d87-3738-43a2-ac33-5f6b6b805fe4",
                    "Key:arn:aws:kms:us-east-2:826839167791:key/3c48c25b-4e88-476b-a437-c06429489616",
                    "Key:arn:aws:kms:us-east-2:826839167791:key/679aa68e-11be-4ade-8756-07508dd8d759",
                    "Key:arn:aws:kms:us-east-2:826839167791:key/75a63769-95fe-44ce-8f6a-8d1dcb8d1f78",
                    "Key:arn:aws:kms:us-east-2:826839167791:key/819b1b21-5e74-4c65-94df-cd1c3bb4b948",
                    "Key:arn:aws:kms:us-east-2:826839167791:key/98a6ffcb-2508-4406-8889-7e21e497e63d",
                    "Key:arn:aws:kms:us-east-2:826839167791:key/a07342bc-a8d8-4b39-8dc2-8a32925fd05e",
                    "Key:arn:aws:kms:us-east-2:826839167791:key/a6a168db-0a64-40e9-8d8d-50871c216bd9"
                ],
                "Result": false,
                "ScoredControl": true,
                "failReason": "KMS CMK rotation not enabled"
            },
            "9": {
                "ControlId": "2.9",
                "Description": "Ensure VPC flow logging is enabled in all VPCs",
                "Offenders": [
                    "eu-north-1 : vpc-0a1ef463",
                    "ap-south-1 : vpc-e897cf80",
                    "eu-west-3 : vpc-f980d190",
                    "eu-west-2 : vpc-fbfa6192",
                    "eu-west-1 : vpc-76426610",
                    "ap-northeast-2 : vpc-38667e50",
                    "ap-northeast-1 : vpc-9ac696fd",
                    "sa-east-1 : vpc-9f3bd9fb",
                    "sa-east-1 : vpc-983bd9fc",
                    "ca-central-1 : vpc-6cb10c05",
                    "ap-southeast-1 : vpc-4aa98c2d",
                    "ap-southeast-2 : vpc-61c38806",
                    "eu-central-1 : vpc-aa9ab9c1",
                    "us-east-1 : vpc-7de35e1b",
                    "us-east-2 : vpc-c83254a1",
                    "us-west-1 : vpc-a97de9cd",
                    "us-west-2 : vpc-10e60677"
                ],
                "Result": false,
                "ScoredControl": true,
                "failReason": "VPC without active VPC Flow Logs found"
            }
        },
        "3": {
            "1": {
                "ControlId": "3.1",
                "Description": "Ensure log metric filter unauthorized api calls",
                "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Incorrect log metric alerts for unauthorized_api_calls"
            },
            "2": {
                "ControlId": "3.2",
                "Description": "Ensure a log metric filter and alarm exist for Management Console sign-in without MFA",
                "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Incorrect log metric alerts for management console signin without MFA"
            },
            "3": {
                "ControlId": "3.3",
                "Description": "Ensure a log metric filter and alarm exist for root usage",
                "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Incorrect log metric alerts for root usage"
            },
            "4": {
                "ControlId": "3.4",
                "Description": "Ensure a log metric filter and alarm exist for IAM changes",
                "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Incorrect log metric alerts for IAM policy changes"
            },
            "5": {
                "ControlId": "3.5",
                "Description": "Ensure a log metric filter and alarm exist for CloudTrail configuration changes",
                "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Incorrect log metric alerts for CloudTrail configuration changes"
            },
            "6": {
                "ControlId": "3.6",
                "Description": "Ensure a log metric filter and alarm exist for console auth failures",
                "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Ensure a log metric filter and alarm exist for console auth failures"
            },
            "7": {
                "ControlId": "3.7",
                "Description": "Ensure a log metric filter and alarm exist for disabling or scheduling deletion of KMS CMK",            "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Ensure a log metric filter and alarm exist for disabling or scheduling deletion of KMS CMK"
            },
            "8": {
                "ControlId": "3.8",
                "Description": "Ensure a log metric filter and alarm exist for S3 bucket policy changes",
                "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Ensure a log metric filter and alarm exist for S3 bucket policy changes"
            },
            "9": {
                "ControlId": "3.9",
                "Description": "Ensure a log metric filter and alarm exist for for AWS Config configuration changes",
                "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Ensure a log metric filter and alarm exist for for AWS Config configuration changes"
            },
            "10": {
                "ControlId": "3.10",
                "Description": "Ensure a log metric filter and alarm exist for security group changes",
                "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Ensure a log metric filter and alarm exist for security group changes"
            },
            "11": {
                "ControlId": "3.11",
                "Description": "Ensure a log metric filter and alarm exist for changes to Network Access Control Lists (NACL)",
                "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Ensure a log metric filter and alarm exist for changes to Network Access Control Lists (NACL)"
            },
            "12": {
                "ControlId": "3.12",
                "Description": "Ensure a log metric filter and alarm exist for changes to network gateways",
                "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Ensure a log metric filter and alarm exist for changes to network gateways"
            },
            "13": {
                "ControlId": "3.13",
                "Description": "Ensure a log metric filter and alarm exist for route table changes",
                "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Ensure a log metric filter and alarm exist for route table changes"
            },
            "14": {
                "ControlId": "3.14",
                "Description": "Ensure a log metric filter and alarm exist for VPC changes",
                "Offenders": [],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Ensure a log metric filter and alarm exist for VPC changes"
            }
        },
        "4": {
            "1": {
                "ControlId": "4.1",
                "Description": "Ensure no security groups allow ingress from 0.0.0.0/0 to port 22",
                "Offenders": [
                    "sg-00cf0e0e6828581fc",
                    "sa-east-1 : sg-070d03dccb06c28d8",
                    "sg-098289950ef29fe06",
                    "sg-0a03324bb9e34414e",
                    "sg-0a8459004c9e19639",
                    "sg-0a8eef1d05a4127c2",
                    "sg-0d3222df4d4d6a276",
                    "sg-0ef261322a419b788",
                    "sg-0f714826a09aa2b91",
                    "sg-0f714826a09aa2b91",
                    "sg-70a73917",
                    "sg-7a87191d",
                    "sg-ab138acc",
                    "sg-aec7b9ca",
                    "sg-0b013be66c4e38cba",
                    "sg-004dad64cb7590861",
                    "sg-01725e24329c4c359",
                    "sg-01fbb7ed10d83c8e5",
                    "sg-03174c38f95ee27a8",
                    "sg-03279ecfc079ccfb2",
                    "sg-064a9ade9ef87f067",
                    "sg-0662d846d70bba271",
                    "sg-0722d2053fb73a4cd",
                    "sg-07d6416ff4ade8406",
                    "sg-0803d35da90c200ce",
                    "sg-0926be4c1c7b242f3",
                    "sg-09baa106f61e6ecab",
                    "sg-0a8ff709b1e50830e",
                    "sg-0ac5c016765c65758",
                    "sg-0b2695105eecdfcd3",
                    "sg-0b9bcee44b768ec0a",
                    "sg-0bef4acdb51ed62ef",
                    "sg-0c5b0b58e13662ade",
                    "sg-0c9fc38ecafa5a992",
                    "sg-0cebae2eadf71267e",
                    "sg-0d1d5c18893f7304e",
                    "sg-0eec4e0a497832a21",
                    "sg-0fafe9defaa8d9e80",
                    "sg-0ff565d398e4b40a9",
                    "sg-9aaf4ef0"
                ],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Found Security Group with port 22 open to the world (0.0.0.0/0)"
            },
            "2": {
                "ControlId": "4.2",
                "Description": "Ensure no security groups allow ingress from 0.0.0.0/0 to port 3389",
                "Offenders": [
                    "sg-0676facc2924da605",
                    "sa-east-1 : sg-070d03dccb06c28d8",
                    "sg-0d3a9d97b42a82941",
                    "sg-0ef261322a419b788",
                    "sg-0f714826a09aa2b91",
                    "sg-0f714826a09aa2b91",
                    "sg-0b013be66c4e38cba",
                    "sg-0125a22098dc8410c",
                    "sg-0260320920a22b8f9",
                    "sg-0722d2053fb73a4cd",
                    "sg-079fe5245ccd88030",
                    "sg-0cca3480f266627e0",
                    "sg-0d5a3a2ee1276a2fb",
                    "sg-0e4aba2bc2f53f37a",
                    "sg-0e68c4e58b56bc2fa"
                ],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Found Security Group with port 3389 open to the world (0.0.0.0/0)"
            },
            "3": {
                "ControlId": "4.3",
                "Description": "Ensure the default security group of every VPC restricts all traffic",
                "Offenders": [
                    "eu-north-1 : sg-4003a529",
                    "ap-south-1 : sg-08bb3562",
                    "eu-west-3 : sg-38f96a50",
                    "eu-west-2 : sg-3797b55e",
                    "eu-west-1 : sg-04092178",
                    "ap-northeast-2 : sg-4021392a",
                    "ap-northeast-1 : sg-bba76dc0",
                    "sa-east-1 : sg-f64bb092",
                    "sa-east-1 : sg-f74bb093",
                    "ca-central-1 : sg-6a3e5103",
                    "ap-southeast-1 : sg-bc0797c4",
                    "ap-southeast-2 : sg-fbb4c283",
                    "eu-central-1 : sg-4a87c026",
                    "us-east-1 : sg-5b6b9927",
                    "us-east-2 : sg-3ab69e53",
                    "us-west-1 : sg-7d42781a",
                    "us-west-2 : sg-8242d6fb"
                ],
                "Result": false,
                "ScoredControl": true,
                "failReason": "Default security groups with ingress or egress rules discovered"
            },
            "4": {
                "ControlId": "4.4",
                "Description": "Ensure routing tables for VPC peering are least access",
                "Offenders": [],
                "Result": true,
                "ScoredControl": false,
                "failReason": ""
            }
        }
    };    
    let rows = [];
    console.log("Accounts: ",accounts);
    if(accounts.length){
        // para cada conta
        accounts.map( account => {
            // obtemos o conteudo do compliance
            let data_content = JSON.parse(account['DataCompliance']);
            
            for(let i=0; i<Object.keys(data_content).length ; i++){
                for(let j=0; j<Object.keys(data_content[i]).length ; j++){
                    let data = data_content[i][j];
                    rows.push(
                        {
                            "account_id":account['Account'],
                            "account_name":account['Name'],
                            "title":data['ControlId'] +" "+data['Description'],
                            "compliance":data['Result'],
                            "offenders":data['Offenders'].toString(),
                            "failReason":data['failReason']
                        }
                    );
                }
            }
            console.log(rows);
        });

    }


    // if(accounts.length){
    //     accounts.map(elem => {
    //         JSON.parse(elem['DataCompliance']).map(elem2 => {
    //             // id: 'Account', title: 'Account\u00a0ID'; id: 'Name', title: 'Name\u00a0Account'; id: 'name', title: 'Role\u00a0Name';
    //             // id: 'policy', title: 'Policy'; id: 'compliance', title: 'Compliance'; id: 'status', title: 'Status';
    //             // id: 'policies_adicionais', title: 'Policie
                
    //             rows.push( {
    //                 "account_id":elem['Account'], "account_name":elem['Name'], "role_name":elem2['name'], 
    //                 "role_policy":elem2['policy'], "compliance":elem2['compliance'].toString(), "status":elem2['status'],
    //                 "policies_adicionais":elem2.hasOwnProperty("policies_adicionais") ? elem2['policies_adicionais'].toString() : "",
    //             } );
    //         });
    //     });
    // }
    

    return (
        <main className={classes.content}>
            <Typography className={classes.titleHeader} variant="h4" noWrap >
                CIS Compliance
            </Typography>
            <Box boxShadow={3}>

                <MaterialTable
                    title="Resultados"
                    // isLoading={rows.length ? false: true}
                    columns={columns}
                    data={rows}
                    options={{
                        exportButton: true,
                        pageSize: 25,
                        pageSizeOptions: [25,50,100,200],
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
                    onClose={handleCloseRefresh}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Selecionar o dia do relatório por conta"}</DialogTitle>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <FormControl style={{width:"10em", marginRight:"1em"}}>
                            <InputLabel id="controlled-open-select-label-tipo-da-conta">Data da ação</InputLabel>
                            <Select required labelId="controlled-open-select-label-tipo-da-conta" id="demo-controlled-open-select"
                            onChange={e => props.onChangeDataCheck(e)}
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

                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    <Button 
                    onClick={() => {
                        props.getCompliance();
                        handleCloseRefresh();
                    }} 
                    variant="contained" color="primary">
                        Obter
                    </Button>
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
                        Essa ação irá acessar as contas do Organizations e fazer os checks do CIS para gerar um novo relatório de compliance. 
                        Poderá demorar alguns minutos, deseja continuar?
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                        onClick={requestNewCompliance} 
                        variant="contained" color="primary">
                            Sim
                        </Button>
                    
                    <Button onClick={handleCloseAddNewCheck} variant="contained" color="secondary" autoFocus>
                        Não
                    </Button>
                    </DialogActions>
                </Dialog>


             

            </Box>
        </main>
        
    );
}


export default AccountsTable;