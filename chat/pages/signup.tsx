import * as React from "react";
import {useState} from "react";
import { useRouter } from 'next/router'

import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

import sendRequest from "@/components/apicalls";





export default function LoginPage(){
    const [errMessage, setErrMessage] = useState('');
    const router = useRouter()

    async function handleSignupSubmit(event: React.FormEvent<HTMLFormElement>){

        event.preventDefault();
        console.log("signup submitted");

        const url = "http://localhost:5000/signup";

        const target = event.target as typeof event.target & {
          username: { value: string };
          password: { value: string };
          passwordRepeat: {value: string};
        };

        const data = {
            "username": target.username.value,
            "password": target.password.value
        };

        try{
            const resp = await sendRequest(url, "POST",  data);
            if(resp.status == 200){
                await router.push('/login')
            }
            else{
                setErrMessage(resp.statusText)
                console.log(resp)
            }
        }
        catch(error: any){
            console.log("fuck");
            console.log( error);
            setErrMessage(error.message);
        }
    }



    return(
        <>
        <Card title="SignUp" className="center" >
            {errMessage && <Message severity="warn" text={errMessage} />}
            <form onSubmit={ handleSignupSubmit }>
                <InputText name="username" placeholder="Username" className="block"/>
                <Password name="password" placeholder="Password" className="block"/>
                <Password name="repeat" placeholder="Repeat Password" className="block"/>
                <Button type="submit" label="Sign Up"  rounded />
            </form>
        </Card>
        </>
    );
}
