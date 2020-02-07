import React from 'react';
import { Button, FormGroup, FormControl, FormLabel, Navbar, Nav, NavDropdown, Form } from "react-bootstrap";

class LoginForm extends React.Component {

  handleSubmit = (event) => {
      event.preventDefault();
      alert('Your username is: ' + this.input.value);
  };
    
  render() {
    return (
    <section className="forms">
      <Form onSubmit={this.handleSubmit}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" placeholder="Enter email" />
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password" />
        </Form.Group>
        <Button variant="primary" type="submit">Submit</Button>
      </Form>
    </section>

    );
  }
}

export default LoginForm;