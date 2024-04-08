import {React, useState, useEffect} from "react";
//import {WebSocket} from 'ws';

import sendRequest from "@/components/apicalls";
import ChatMessage from "@/components/message";

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from "primereact/card";
import { Menu } from "primereact/menu"
import { useRouter } from "next/router";
import {string} from "prop-types";






export default function chat() {
    interface SingleMessage{
        message: string;
        sender: string;
    }
    type MessagesPerUser = {
        [key: string]: Array<SingleMessage>;
    };

    interface MenuItem {
        label: string;
        icon: string;
        command: Function;
    }

    const router = useRouter();


    const [currentUser, setCurrentUser] = useState("");
    const [otherUser, setOtherUser] = useState("");
    const [activeUsers, setActiveUsers] = useState([]);
    const [messageDict, setMessageDict] = useState<MessagesPerUser>({});
    const [menuItems, setMenuItems] = useState<Array<MenuItem>>([])
    const [socket, setSocket] = useState<WebSocket | null>(null)

    const fetchCurrentUser = async () => {
        console.log("fetching user")
        const resp = await sendRequest("http://localhost:5000/users/me", "GET");

        if (resp.status == 401) {
            router.push("/login")
        }

        const js = await resp.json();
        const username = await js["username"]
        setCurrentUser(await username);
        return username

    };

    const fetchActiveUsers = async () => {

        const resp = await sendRequest("http://localhost:5000/users/activeusers", "GET");
        const newActiveUsers = await resp.json()
        setActiveUsers(newActiveUsers);


        let newDict: MessagesPerUser = {}
        for (let u in newActiveUsers) {
            let messages: Array<SingleMessage> = [];
            if (u in messageDict) {
                messages = messageDict[u];
            }
            newDict[u] = messages;
        }

        setMessageDict(newDict);

        setMenuItems(newActiveUsers.map(item => {
            return {label: item, icon: 'pi pi-fw pi-plus', command: () => setOtherUser(item)};
        }));
    };


    const openSocket = (username: string) => {

        const url = "ws://localhost:5000/socket/" + username;
        console.log("url is", url)
        setSocket(new WebSocket(url));

    };

    const sendMessage = (recipient: string, message: string) => {
        if(socket){
            const obj = {
                recipient: recipient,
                message: message
            };
            const data = JSON.stringify(obj);

            socket.send(data);
        }
    };

    const handleSendMessage =(event: React.FormEvent<HTMLFormElement>) =>{
        event.preventDefault()
    }


    useEffect(()=>{
        fetchCurrentUser()
        .then((username)=>openSocket(username))
        .then(()=>fetchActiveUsers())

    }, []);


    if(currentUser && socket){
        try {
            socket.onmessage = function (event: Event) {
                const message = event.data;
                console.log(message);
            }
        }
        catch (e) {
            console.log(e);
        }

    }

    console.log(currentUser);



    return(
        <>
        <Menu model={menuItems} className="w-full md:w-15rem"/>
        {otherUser &&
            <Card title={otherUser} className="center sized" >
            {messageDict[otherUser] &&
                    messageDict[otherUser].map(message => <ChatMessage text={message.message} sender={message.sender} ></ChatMessage>)
            }

                <div className="p-inputgroup flex-1 center">
                    <form onSubmit={handleSendMessage}>
                        <InputText placeholder="message" />
                        <Button icon="pi pi-search" className="p-button-info" type={"submit"}/>
                    </form>
                </div>
            </Card>
        }
        </>
    );
}
