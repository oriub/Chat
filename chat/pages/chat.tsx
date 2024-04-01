import {React, useState} from "react";

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

export default function chat(){
    const [otherUser, setOtherUser] = useState("")

    return(
    //add sidebar with activeusers
    //only show chat card when a user is chosen
    //
    //set a listening socket?

    {otherUser &&
        <Card title={otherUser} className="center">
            <div className="p-inputgroup flex-1 center">
                <InputText placeholder="Keyword" />
                <Button icon="pi pi-search" className="p-button-info" />
            </div>
        </Card>
    }
    );
}