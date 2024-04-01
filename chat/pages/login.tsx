import {React, useState} from "react";
import { useRouter } from 'next/router'

import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

import sendRequest from "@/components/apicalls";





export default function LoginPage(){

    const [errMessage, setErrMessage] = useState('');

    async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault();
        console.log("hi")

        const url = "http://localhost:5000/token";

        const target = event.target as typeof event.target & {
              username: { value: string };
              password: { value: string };
       };

        const data = {
            "username": target.username.value,
            "password": target.password.value
       };

        try{
            const resp = await sendRequest(url, data, "POST", );
            console.log(resp)
            if(resp.status == 200){
                router.push('/')
            }
            else{
                setErrMessage(resp.detail);
            }
        }
        catch(error){
            console.log("fuck");
            console.log( error);
            setErrMessage(error.message);
        }
    }

    return(
        <Card title="Login" className="center">
        {errMessage && <Message severity="warn" text={errMessage} />}
            <form onSubmit={ handleLoginSubmit }>
                <InputText name="username" placeholder="Username" className="block"/>
                <Password name="password" placeholder="Password" className="block"/>
                <Button type="submit" label="Login" rounded />
            </form>
        </Card>

    );
}
        