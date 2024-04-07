import {React, useState} from "react";
import WebSocket from 'ws'

import sendRequest from "@/components/apicalls";

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from "primereact/card";
import { Menu } from "primereact/menu"


export default function chat(){
    const [otherUser, setOtherUser] = useState("");
    const [activeUsers, setActiveUsers] = useState([]);
    const [messageDict, setMessageDict] = useState:<Record<string,Array<string>>>({});

    const me = async () => {
        const resp = await sendRequest("http://localhost:5000/users/me", "GET");
        return await resp.json();
    };

    const fetchActiveUsers = async () =>{
        console.log("starting to fetchActiveUsers");
        const resp = await sendRequest("http://localhost:5000/users/activeusers", "GET");
        console.log(resp.status);
        setActiveUsers(await resp.json());

        for(let user in messageDict){
            if(! activeUsers.includes(user)){
                delete messageDict[user];
            }
        }

        const missingUsers = activeUsers.filter(missingUser => messageDict.indexOf(missingUser));

        for(let missing in missingUsers){
            messageDict[missing] = [];
        }



    }

    const currentUser = me()["username"];
    const socket = new WebSocket("ws://localhost:5000/" + currentUser)
    //fetchActiveUsers()
    //console.log(activeUsers);

    return(
        <>

        <menu start={currentUser} model={activeUsers}/>
        {otherUser &&
            <Card title={otherUser} className="center">
                <div className="p-inputgroup flex-1 center">
                    <InputText placeholder="Keyword" />
                    <Button icon="pi pi-search" className="p-button-info" />
                </div>
            </Card>
        }
        </>
    );
}