import { Message } from 'primereact/message';
import React from 'react';
import {MessageProps} from "primereact/message";

type ChatMessageProps = MessageProps & {sender:string};
type Severity = "info" | "success" | "warn" | "error" | "secondary" | "contrast" | undefined;

export default function ChatMessage(props: ChatMessageProps){
    let severity: Severity = "info";
    if(props.sender == "me"){
        severity = "success";
    }
    return(<Message severity={severity} text={props.text} icon=" " className="block"></Message>);
}