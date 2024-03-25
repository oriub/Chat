import { PrimeReactProvider } from "primereact/api";
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Card } from 'primereact/card';
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";


export default function LoginPage(){
    return(

        <Card title="Login">
            <InputText placeholder="Username"/>
            <Password placeholder="Password"/>
        </Card>

    );
}
        