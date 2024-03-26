import {React, useState} from "react";
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

import sendRequest from "@/components/apicalls";





export default function LoginPage(){
    let [errMessage, setErrMessage] = useState('');

    async function handleSignupSubmit(event: React.FormEvent<HTMLFormElement>){
        const url = "http://localhost:5000/signup";
        event.preventDefault();
        console.log("signup submitted");

        const target = event.target as typeof event.target & {
          username: { value: string };
          password: { value: string };
          //passwordRepeat: {value: string};
        };

        const data = {
            "username": target.username.value,
            "password": target.password.value
        };

        try{
            const resp = await sendRequest(url, data, "POST");
        }
        catch(error){
            console.log("fuck")
            console.log(error)
            setErrMessage(error)
        }
    }



    return(

        <Card title="SignUp" className="center">
            {errMessage && <Message severity="warn" text={errMessage} />}
            <form onSubmit={ handleSignupSubmit }>
                <InputText name="username" placeholder="Username" className="block"/>
                <Password name="password" placeholder="Password" className="block"/>
                <Password name="repeat" placeholder="Repeat Password" className="block"/>
                <Button type="submit" label="Sign Up" rounded />
            </form>
        </Card>

    );
}
