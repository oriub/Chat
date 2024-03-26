import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    console.log("hi")
}

export default function LoginPage(){
    return(

        <Card title="Login" className="center">
            <form onSubmit={ handleLoginSubmit }>
                <InputText placeholder="Username" className="block"/>
                <Password placeholder="Password" className="block"/>
                <Button type="submit" label="Login" rounded />
            </form>
        </Card>


    );
}
        