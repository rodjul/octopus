import React from 'react';
import { Link, Route, Switch, BrowserRouter } from 'react-router-dom';
import { Button, FormGroup, FormControl, FormLabel, Navbar, Nav, NavDropdown, Form } from "react-bootstrap";
import logo from './logo.svg';
import './App.css';
import CreateAccount from './CreateAccount';
import withAuth from './withAuth';
import LoginForm from './LoginForm';
import Policies from './Policies';
import AccountsCompliance from './AccountsCompliance';



const NavbarApp = () => 
  <Navbar bg="light" expand="lg">
  <Navbar.Brand href="#">Octopus</Navbar.Brand>
  <Navbar.Toggle aria-controls="basic-navbar-nav" />
  <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="mr-auto">
      <Nav.Link href="/login">Login</Nav.Link>
      <Nav.Link href="/create-account">Criar conta</Nav.Link>
      <Nav.Link href="/policies">Gerenciar policies</Nav.Link>
      <Nav.Link href="/accounts-compliance">Compliance das contas</Nav.Link>

      {/* <NavDropdown title="Dropdown" id="basic-nav-dropdown">
        <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
        <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
        <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
      </NavDropdown> */}
    
    </Nav>
    
    {/* <Form inline>
      <FormControl type="text" placeholder="Search" className="mr-sm-2" />
      <Button variant="outline-success">Search</Button>
    </Form> */}
  
  </Navbar.Collapse>
</Navbar>;


class App  extends React.Component {
  
  render(){
    // console.log(<withAuth/>);
    // console.log( <withAuth./> );
    return (
      <section className="container">
        <BrowserRouter>
          <NavbarApp />
          <Switch>
              <Route path="/login" exact component={LoginForm} />
              <Route path="/create-account" component={(CreateAccount)} />
              <Route path="/policies" component={Policies} />
              <Route path="/accounts-compliance" component={AccountsCompliance} />
          </Switch>
        </BrowserRouter>
        
      </section>
    );
  }
}

export default App;
