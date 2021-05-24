import React from "react";
import { getAuthorization } from "../../../utils";
import SnackbarNotification from "../../../components/SnackbarNotification";
import {
    Box, Typography
} from "@material-ui/core";

import DialogGetReport from "./components/DialogGetReport";
import DialogNewReport from "./components/DialogNewReport";
import TableReport from "./components/TableReport";

import "./styles.css";


export default class NetworkReport extends React.Component {
    constructor(){
        super();
        this.state = {
            blocking: false,
            networks: [],
            dateReports: [],

            requestSuccess: false,
            requestError: false,
            errorMessagePopup: "",

        }
    }

    async componentDidMount(){
        window.document.title = "Octopus - AWS Network Report";

        this.setState({blocking: true});

        let stateValues = this;
        await fetch(`${process.env.REACT_APP_ENDPOINT}/aws/networks/reports`, {
            method: "GET", mode :"cors", headers: {"Authorization": getAuthorization()},
        })
        .then(response => this._handleFetchErrors(response, stateValues))
        .then(response => {
            this.setState({dateReports: response.data});
        })
        .catch(e => console.error(e));
        
        this.setState({blocking: false});
    
    }

    async _handleFetchErrors(response, stateValues = {}) {
        if (!response.ok) {
            if(response.status === 401){
                alert("Not authenticated. Login again");
                window.location.reload();
            }else{
                let message = "";
                if(response.status === 400){
                    message = "Invalid request";
                }else if(response.status === 403){
                    message = "You don't have permissions to do this action";
                }else if(response.status === 404){
                    message = "Not found";
                }else if(response.status === 500 || response.status === 502){
                    message = "Server error. Contact administrator!";
                }

                // let hasJsonData = false;
                // await response.json().then(e => {
                //     hasJsonData = true;
                //     stateValues.setState({
                //         errorMessagePopup: message + " Message: " + e.message,
                //         requestError: true,
                //     });
                // });

                // if(!hasJsonData){
                    stateValues.setState({
                        errorMessagePopup: message,
                        requestError: true,
                    },()=>stateValues.setState({requestError: false}));
                // }

                // stateValues.setState({isLoading: false});
                // stateValues.setState({requestError: false});
                throw Error(response);
                //https://gist.github.com/odewahn/5a5eeb23279eed6a80d7798fdb47fe91
                // return Promise.resolve(response.json()).then((responseInJson) => { // This will end up in ERROR part
                //     return Promise.reject({"promise":responseInJson, "status":response.status}); //  responseInJson.message = "Some nasty error message!"
                // });
            }
        }
        return response.json();
    }

    async onSubmitGetReport(e){
        let dateReport = e.dateReport;
        let typeReport = e.typeReport;
        if(!dateReport)
            return
        
        this.setState({blocking: true});
        let stateValues = this;
        await fetch(`${process.env.REACT_APP_ENDPOINT}/aws/networks/reports/${encodeURIComponent(dateReport)}/${encodeURIComponent(typeReport)}`, {
            method: "GET", mode :"cors", headers: {"Authorization": getAuthorization()},
        })
        .then(response => this._handleFetchErrors(response, stateValues))
        .then(response => {

            let format = [];
            response.data.report.length && response.data.report.map( account => {
                let accountId = account['AccountId'];
                let email = account['Email'];
                let securityGroup = account['SecurityGroup'];
                let resources = account['Resources'];
    
                let regions = Object.keys(resources);
                // console.log(regions);
                
                for(let i in regions){
                    let dataFormated = resources[regions[i]]
                        .filter(resource => resource.error ? false : true) // remove from data, resources that has errors
                        .map(resource => {
                        
                        let acls = [];
                        let securityGroupId = resource['Instances'][0]['SecurityGroups'][0]['GroupId'];
                        let instanceType = resource['Instances'][0]['InstanceType'];
                        let location = regions[i];
                        let launchTime = resource['Instances'][0]['LaunchTime'];
                        let instanceName = resource['Instances'][0]['KeyName'];
                        let publicIpAddress = resource['Instances'][0]['PublicIpAddress'];
                        let privateIpAddress = resource['Instances'][0]['PrivateIpAddress'];
                        let subNetId = resource['Instances'][0]['SubnetId'];
                        let vpcId = resource['Instances'][0]['VpcId'];
    
                        
                        for(let index in securityGroup[location]){
                            let sgs = securityGroup[location][index];

                            if(sgs['GroupId'] === securityGroupId){
                                acls.push(
                                    sgs['IpPermissions'].map(inbound => {
                                        return {
                                            "type":"inbound", 
                                            "security_group_id":securityGroupId, 
                                            "group_name":inbound['GroupName'],
                                            "from_port":inbound['FromPort'],
                                            "to_port":inbound['ToPort'],
                                            "ip_protocol":inbound['IpProtocol'],
                                            "ip_ranges":inbound['IpRanges'],
                                        }
                                    })
                                );
                                acls.push(
                                    sgs['IpPermissionsEgress'].map(outbound => {
                                        return {
                                            "type":"outbound", 
                                            "security_group_id":securityGroupId, 
                                            "group_name":outbound['GroupName'],
                                            "from_port":outbound['FromPort'],
                                            "to_port":outbound['ToPort'],
                                            "ip_protocol":outbound['IpProtocol'],
                                            "ip_ranges":outbound['IpRanges'],
                                        }
                                    })
                                )
                            }
                        }
    
                        return {
                            "account_id":accountId,
                            "email":email,
                            "instance_type":instanceType,
                            "location":location,
                            "launch_time": launchTime,
                            "instance_name": instanceName,
                            "public_ip_address": publicIpAddress,
                            "private_ip_address": privateIpAddress,
                            "sub_net_id": subNetId,
                            "vpc_id": vpcId,
                            "acls": acls,
                        }
                    })
                    
                    if(dataFormated.length)
                        format.push(dataFormated);
                }
    
                // console.log(format);
                return format
            })
    
            if(format.length){
                let getAllData = [];
                for(let i=0; i<format.length; i++){
                    format[i].map(item => getAllData.push(item));
                }
                this.setState({networks: getAllData});
            }

        })
        .catch(e => console.error(e));
        
        this.setState({blocking: false});


    }

    async onSubmitRequestNewReport(){
        this.setState({blocking: true});
        let stateValues = this;
        await fetch(`${process.env.REACT_APP_ENDPOINT}/aws/networks/reports`, {
            method: "POST", mode :"cors", headers: {"Authorization": getAuthorization()},
        })
        .then(response => this._handleFetchErrors(response, stateValues))
        .then(response => {
            if(response.message === "Checking..."){
                this.setState({requestSuccess: true});
            }
        })
        .catch(e => console.error(e));
        
        this.setState({blocking: false, requestSuccess: false});

    }


    render(){

        return (
            <main className="content">
                <Typography className="titleHeader" variant="h4" noWrap >
                    Network Report
                </Typography>
                <Box boxShadow={3}>
                    <div className="paper" >
                        <section className="actions">
                            <DialogNewReport onSubmitRequestNewReport={this.onSubmitRequestNewReport.bind(this)} />
                            <DialogGetReport dateReports={this.state.dateReports} onSubmitGetReport={this.onSubmitGetReport.bind(this)} />
                            {/*<DialogAddUserProject dataSelected={this.state.dataSelected} onSubmitAddUserProject={this.onSubmitAddUserProject.bind(this)} /> */}
                        </section>
                        {this.state.blocking ? (
                            <TableReport
                                blocking={true}
                                network_data={[]}
                            />
                        ):(
                            <TableReport
                                blocking={false}
                                network_data={this.state.networks}
                            />
                        )}
                    </div>
                </Box>
                {this.state.requestSuccess && <SnackbarNotification variant="success" message="Success!"/>}
                {this.state.requestError && <SnackbarNotification variant="error" message={this.state.errorMessagePopup}/>}


            </main>            
            
        )
    }
}