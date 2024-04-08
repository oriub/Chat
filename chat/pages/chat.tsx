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
        console.log(newActiveUsers)
        setActiveUsers(newActiveUsers);


        let newDict: MessagesPerUser = {}
        newActiveUsers.forEach((u) => {
            console.log("u: ",u)
            let messages: Array<SingleMessage> = [];
            if (u in messageDict) {
                messages = messageDict[u];
            }
            newDict[u] = messages;
        });

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

    const sendMessage =  (recipient: string, message: string) => {
        if(socket){
            const obj = {
                recipient: recipient,
                message: message
            };
            const data = JSON.stringify(obj);

            socket.send(data);
        }
    };

    const addMessageToDict = (sender: string, message: string) =>{
        const obj = {
            "sender": sender,
            "message": message
        };
        messageDict[currentUser].push(obj);
        console.log(messageDict);
    };

    const handleSendMessage =(event: React.FormEvent<HTMLFormElement>) =>{
        event.preventDefault();
        const target = event.target as typeof event.target & {
            text: { value: string };
        };

        sendMessage(otherUser, target.text.value);
        addMessageToDict("me", target.text.value)
        setCurrentUser(currentUser);
        event.target.reset()

    };


    useEffect(()=>{
        fetchCurrentUser()
        .then((username)=>openSocket(username))
        .then(()=>fetchActiveUsers())

    }, []);


    if(currentUser && socket){
        try {
            socket.onmessage = function (event: MessageEvent) {
                const message = event.data;
                const messageObj = JSON.parse(message);
                console.log("msg", message);

                addMessageToDict(messageObj.sender, messageObj.message);

            }
        }
        catch (e) {
            console.log(e);
        }

    }

    console.log(messageDict);

    const footer = (
        <div className="col-12 md:col-4">
        <span>
            <div className="p-inputgroup fullwidth center-horizontal">
                <form onSubmit={handleSendMessage} className="p-fluid fullwidth">
                    <InputText placeholder="message" name="text" className="width80"/>
                    <Button icon="pi pi-search" className="p-button-info " type="submit"/>
                </form>
            </div>
        </span>
        </div>
    );
    console.log(otherUser);
    return (
        <>
            <Menu model={menuItems} className="w-full md:w-15rem"/>
            {otherUser &&
                <Card title={otherUser} footer={footer} className="center">
                    {messageDict[otherUser] &&

                        (messageDict[otherUser]).map(
                            function (message){
                                return(<ChatMessage text={message.message} sender={message.sender}></ChatMessage>);
                            }
                        )
                    }
                </Card>
        }
        </>
    );

}
