import {React, useState} from "react";

import sendRequest from "@/components/apicalls";

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from "primereact/card";
import { Menu } from "primereact/menu"

export default function chat(){
    const [otherUser, setOtherUser] = useState("")
    const [activeUsers, setActiveUsers] = useState([])

    const fetchActiveUsers = async () =>{
        const resp = await sendRequest("https://localhost:5000/activeusers", "GET")
        setActiveUsers(await resp.json())
    }

    return(
    //add sidebar with activeusers
    //only show chat card when a user is chosen
    //
    //set a listening socket?
    <>

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