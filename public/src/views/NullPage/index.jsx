import React, { Component }  from "react";

/**
 * This Page is a hack to handle SSO redirect. When authenticate with Firefox Browser, the react-lib redirect to <loginpage>/null e.g /login/null which as a
 * result, the flow stops working (not natural as a view to user). Then, when the react-adal redirect to this route, 
 * this NullPage class will redirect to <loginpage>#retry e.g /login#retry to force again to retry the authentication,
 * and then the react-adal can handle the flow to redirect to the correct page
 */
class NullPage extends Component {
    
    componentDidMount(){
        window.location = "/login#retry";
    }

    render(){
        return (
            <>
            {/* <button onClick={() => withAdalLoginApi()}>CLICK</button> */}
            </>
        );
    }
}

export default NullPage;