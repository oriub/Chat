import * as React from 'react'
import { Button, Form } from "react-bootstrap"

function handleSubmit(event: React.FormEvent<HTMLFormElement>){
    event.preventDefault()

}
function LoginForm(){
    return(
        <Form onSubmit={handleSubmit}>
            <Form.Label htmlFor="inputPassword5">Username</Form.Label>
            <Form.Control type="text" id="inputUsername" />
            <Form.Label htmlFor="inputPassword5">Password</Form.Label>
            <Form.Control type="password" id="inputPassword5" aria-describedby="passwordHelpBlock"/>
            <Button variant="primary" type="submit">Submit</Button>
        </Form>
    );
};

export default LoginForm;