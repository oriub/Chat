import { Message } from 'primereact/message';
import {JSX} from "react";

//create the message component, change the color according to sender
 export default function ChatMessage(props){
    let severity = "info";
    if(props.sender == "me"){
        severity = "success";
    }
    return(<Message severity={severity} text={props.text} icon=" " className="block"></Message>);
    //return(<Message  text={text}></Message>);
}