import { Message } from 'primereact/message';
import {JSX} from "react";

 export default function ChatMessage(props){
    let severity = "info";
    if(props.sender == "me"){
        severity = "success";
    }
    return(<Message severity={props.severity} text={props.text}></Message>);
    //return(<Message  text={text}></Message>);
}