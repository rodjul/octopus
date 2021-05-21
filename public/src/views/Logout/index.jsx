import React from "react";
import {authContext} from "../../adalConfig";

export default class Logout extends React.Component {
    componentDidMount(){
        if(process.env.REACT_APP_ENABLE_SSO==="true"){
            authContext.logOut()
        }
        localStorage.removeItem("currentUser");

        window.location = "/login";

    }


    render(){

        return ""
    }

}