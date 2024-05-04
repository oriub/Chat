import {React, useState, useEffect, useRef} from "react";
//import {WebSocket} from 'ws';

import sendRequest from "@/components/apicalls";
import ChatMessage from "@/components/message";

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from "primereact/card";
import { Menu } from "primereact/menu"
import {Toast} from "primereact/toast";

import { useRouter } from "next/router";




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

    //current logged-in user
    const [currentUser, setCurrentUser] = useState("");
    //user whose chat (with) is open
    const [otherUser, setOtherUser] = useState("");
    //dict containing all messages received from the socket by user
    const [messageDict, setMessageDict] = useState<MessagesPerUser>({});
    //active users to send messages to, in format accepted by Menu component
    const [menuItems, setMenuItems] = useState<Array<MenuItem>>([])
    //socket with server
    const [socket, setSocket] = useState<WebSocket | null>(null)
    //changes when messages and active users refresh is needed (used for useEffect hook)
    const [refresh, setRefresh] = useState(false);

    //reference for the warning message toast
    const warning = useRef<Toast>(null);

    //on timeout of user login/socket connection
    const signout = () =>{
        return router.push("/login")
    }

    //get current logged in user from back
    const fetchCurrentUser = async () => {
        console.log("fetching user")
        try {
            const resp = await sendRequest("http://localhost:5000/users/me", "GET");

            if (resp.status != 200) {
                return signout()
            }

            const js = await resp.json();
            const username = await js["username"]
            setCurrentUser(await username);
            return username;
        }
        catch{
            return signout();
        }


    };

    //return all connected users from back, set menuitems accordingly
    const fetchActiveUsers = async (): Promise<MessagesPerUser|boolean> => {

        const resp = await sendRequest("http://localhost:5000/users/activeusers", "GET");

        if(resp.status != 200){
            return router.push("/login");
        }
        const newActiveUsers = await resp.json();

        let newDict: MessagesPerUser = {}
        newActiveUsers.forEach((u: string) => {

            let messages: Array<SingleMessage> = [];
            if (u in messageDict) {

                messages = messageDict[u];
                console.log("u: ",u, "messages",messages);
            }
            newDict[u] = messages;
        });
        console.log("newdict", newDict);


        setMenuItems(getMenuItems(newActiveUsers));

        //if the other user disconnected, show warning
        if(otherUser && !newDict[otherUser]){
            showWarning("user "+ otherUser + " Disconnected");
            setOtherUser("");
        }

        if( Object.keys(newDict).length == 0){
            showWarning("Disconnected")
            router.push("/")
        }

        return newDict;

    };

    //get an array of formatted menuitems from array of connected user usernames
    const getMenuItems = (newActiveUsers: Array<string>) =>{
        const menuItems: Array<MenuItem> = newActiveUsers.map(item => {
            return {label: item, icon: 'pi pi-fw pi-plus', command: () => setOtherUser(item)};
        })

        return menuItems;
    }

    //open socket with server
    const openSocket = async (username: string) => {

        const url = "ws://localhost:5000/socket/" + username;
        console.log("url is", url);
        setSocket(new WebSocket(url));

    };

    //send message via socket
    const sendMessage =  (recipient: string, message: string) => {
        if(socket){
            const obj = {
                recipient: recipient,
                message: message
            };
            const data = JSON.stringify(obj);

            socket.send(data);
        }
        else{
            signout();
        }
    };

    //add new sent/received message to the messages dict
    const addMessageToDict = (newMessageDict: MessagesPerUser, chat: string, sender: string, message: string) =>{
        const objMsg: SingleMessage = {
            "sender": sender,
            "message": message
        };
        console.log("dict", messageDict, chat);
        newMessageDict[chat].push(objMsg);

        setMessageDict(newMessageDict);

        //refresh messages and activeusers after!
        setRefresh(!refresh);

    };

    //on message send button press, take message from the form, send it and add it to the dict
    const handleSendMessage =(event: React.FormEvent<HTMLFormElement>) =>{
        event.preventDefault();
        const target = event.target as typeof event.target & {
            text: { value: string };
        };

        sendMessage(otherUser, target.text.value);
        addMessageToDict(messageDict, otherUser, "me", target.text.value)
        //reset form input after
        event.target.reset();
    };

    //parse message from received MessageEvent and add to dict
    const handleRecieveMessage = (event: MessageEvent) =>{

        fetchActiveUsers().then(newDict => {
            const message = event.data;
            const messageObj = JSON.parse(JSON.parse(message));
            console.log("msg ", messageObj);
            console.log("msg sender", messageObj.sender);
            console.log("msg", messageObj.message);

            addMessageToDict(newDict, messageObj.sender, messageObj.sender, messageObj.message);
        });
    };

    //signout when socket closes
    //add message later
    const handleSocketClose = (event: Event) =>{
        signout();
    };

    //load resources from back on page startup
    useEffect(()=>{
        fetchCurrentUser()
            .then((user) => openSocket(user)
                .then(()=>fetchActiveUsers()
                    .then((newDict) => setMessageDict(newDict))))

    }, []);

    //reload the active users and messages to display
    //when menu is pressed (otherUser changes) or message is sent/recieved (refresh changes)
    useEffect(()=>{
        fetchActiveUsers()
            .then((newDict) => setMessageDict(newDict));
    },[refresh,otherUser]);

    //on socket events, run the according function
    if(currentUser && socket) {

        socket.onclose = handleSocketClose;
        socket.onmessage = handleRecieveMessage;
    }


    const showWarning = (message: string) => {
        warning.current.show({severity: 'warn', summary: 'Warning', detail: message});
    }


    //card footer
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

    return (
        <>
            <Toast ref={warning}></Toast>
            <Menu model={menuItems} className="w-full md:w-15rem"/>
            {otherUser &&
                <Card title={otherUser} footer={footer} className="center">
                    {messageDict[otherUser] &&

                        (messageDict[otherUser]).map(
                            function (message){

                                return(<ChatMessage key={messageDict[otherUser].indexOf(message)} text={message.message} sender={message.sender}></ChatMessage>);
                            }
                        )


                    }

                </Card>
        }
        </>
    );

}
