import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Cookies from 'universal-cookie';

export default function withAuth(ComponentToProtect) {
  return class extends Component {
    constructor() {
      super();
      this.state = {
        loading: true,
        redirect: false,
        token: ""
      };
    }

    isAuthenticated(){
      return this.state.authenticated;
    }

    componentDidMount() {

      //fetch('https://ph9emn94e6.execute-api.us-east-2.amazonaws.com/dev/account/checkToken', {
      fetch('https://ph9emn94e6.execute-api.us-east-2.amazonaws.com/dev/account/id/rodjul', {
        //method: 'POST',
        method: 'GET',
        mode: 'cors',
        //body: JSON.stringify(this.state.token),
        headers: {
          'Content-Type': 'application/json',
          "X-Api-Key": process.env.X_API_KEY_AWS,
        }
      }).then(res => {
          //console.log(ComponentToProtect);
          // ao dar o check, valida se o token é valido 
          if (res.status === 200 ) {
            //this.props.history.push("/login");
            this.setState({ loading: false });
            const cookies = new Cookies();
            cookies.set('myCat', 'Pacman', { path: '/' });
            console.log(cookies.get('myCat')); // Pacman


          } else if(res.status === 401){
            //this.setState({ loading: false, redirect: false});

          }else {
            const error = new Error(res.error);
            throw error;
          }
        })
        .catch(err => {
          console.error(err);
          this.setState({ loading: false, redirect: true });
        });
    }


    render() {
      const { loading, redirect } = this.state;
      
      if (loading) {
        return null;
      }
      if (redirect) {
        return <Redirect to="/login" />;
      }
      return <ComponentToProtect {...this.props} />;
    }
  }
}
