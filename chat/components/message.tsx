import { Message } from 'primereact/message';

export default function ChatMessage(text: string, sender: string){
    let severity = "info";
    if(sender == "me"){
        severity = "success";
    }
    return(<Message severity={severity} text={text}></Message>);
}