import React from "react";
import BlockUi from 'react-block-ui';
import { getAuthorization } from "../../../utils";
import LoadingCircularProgress from "../../../components/LoadingCircularProgress";
import SnackbarNotification from "../../../components/SnackbarNotification";


import {
    Input, Button, FormGroup, Label, Form
} from 'reactstrap';
import {
    Box, Typography
} from "@material-ui/core";
// import { Add as AddIcon, Save as SaveIcon, Delete as DeleteIcon, Info as InfoIcon, TramOutlined } from '@material-ui/icons';
import "./styles.css";


export default class ProviderGCP extends React.PureComponent {
    constructor(){
        super();
        this.state = {
            blocking: true,
            requestSuccess: false,
            errorMessagePopup : "",
            requestError: false,
            
            // user data
            file: null,
        };
    }


    async componentDidMount(){
        window.document.title = "Octopus - GCP - Account API";
        
        console.log(this.state.organizations);
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
                }, ()=> stateValues.setState({requestError: false}));
                // }

                // stateValues.setState({isLoading: false});
                
                throw Error(response);
                //https://gist.github.com/odewahn/5a5eeb23279eed6a80d7798fdb47fe91
                // return Promise.resolve(response.json()).then((responseInJson) => { // This will end up in ERROR part
                //     return Promise.reject({"promise":responseInJson, "status":response.status}); //  responseInJson.message = "Some nasty error message!"
                // });
            }
        }
        return response.json();
    }

    handleFileUpload(e){
        // let reader = new FileReader();
        // let file = e.target.files[0];
        
        // this.setState({file});
        this.setState({file: e.target.value});
        // console.log(formData, file, e.target.files)

        // console.log(e, e.target, e.target.value, e.target.files[0])
    }

    async onSubmit(e){

        this.setState({blocking: true, requestSuccess: false, requestError: false});

        let formData = new FormData();
        formData.append('file', this.state.file);
        let stateValues = this;
        await fetch(`${process.env.REACT_APP_ENDPOINT}/gcp/accountapi/metadata`, {
            method: "POST", mode :"cors", headers: {
                "Authorization": getAuthorization(),
                // "Content-Type":"multipart/form-data",
                "Content-Type":"application/json",
            },
            body: JSON.stringify({"metadata": this.state.file}) // formData, //new FormData().append("file",this.state.file),
        })
        .then(response => this._handleFetchErrors(response, stateValues))
        .then(response => {
            if(!response.error){
                this.setState({requestSuccess: true}, ()=> this.setState({requestSuccess: false}));
            }else{
                this.setState({requestError: true, errorMessagePopup: "Error: "+response.message}, 
                    ()=> this.setState({requestError: false})
                );
            }
            // this.setState({projectsIamPolicy: response.data});
        })
        .catch(e => console.error(e));
        
        this.setState({blocking: false, requestError: false, requestSuccess: false});
    }

    render(){
        return (
            <main className="content">
                <Typography className="titleHeader" variant="h4" noWrap >
                    Account API
                </Typography>
                <Box boxShadow={3}>
                    <div className="paper" >

                        <BlockUi tag="div" blocking={this.state.blocking} message="" loader={<LoadingCircularProgress/>}>
                            <h2 style={{fontSize: "1.4rem"}}>Enviar arquivo de configuração</h2>

                            <p>Para acessar os dados do GCLOUD por API, precisa criar uma API KEY. Para realizar essa ação, acesse o portal do GCP, crie uma conta de serviço, e por fim de as seguintes permissões na raiz do Organization:</p>
                            
                            <ul>
                                <li>Security Reviewer</li>
                                <li>Folder Creator</li>
                                <li>Organization Viewer</li>
                                <li>Project Creator</li>
                                <li>Project IAM Admin</li>
                            </ul>

                            <p>Na página de Services Account no IAM, onde se criou a conta, crie uma chave de API e automaticamente irá baixar um arquivo de configuração em JSON.</p>

                            <Form>
                                <FormGroup>
                                    <Label for="exampleText">Conteúdo do Arquivo JSON da conta de serviço</Label>
                                    <Input 
                                        style={{height:"20rem"}}
                                        type="textarea" 
                                        name="text" 
                                        id="settingsapi" 
                                        placeholder={`Example:\n{\n\t"type": "service_account",\n\t"project_id": "project-id-example",\n\t"private_key_id": "b3c9f1233a49e45533",\n\t"private_key": "-----BEGIN PRIVATE KEY-----\\n\\n-----END PRIVATE KEY-----\\n",\n\t"client_email": "octopus-api@project-id-example.iam.gserviceaccount.com",\n\t"client_id": "100273907999999999999",\n\t"auth_uri": "https://accounts.google.com/o/oauth2/auth",\n\t"token_uri": "https://oauth2.googleapis.com/token",\n\t"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",\n\t"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/octopus-api%40project-id-example.iam.gserviceaccount.com"\n}\n
                                        `}
                                        onChange={this.handleFileUpload.bind(this)} 
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Button color="primary" onClick={this.onSubmit.bind(this)}>Atualizar arquivo de configuração</Button>
                                </FormGroup>
                            </Form>

                        </BlockUi>
                    </div>
                </Box>
                {this.state.requestSuccess && <SnackbarNotification variant="success" message="Success!"/>}
                {this.state.requestError && <SnackbarNotification variant="error" message={this.state.errorMessagePopup}/>}

            </main>
        )
    }


}
