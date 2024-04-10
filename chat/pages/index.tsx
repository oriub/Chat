import {Button} from "primereact/button";
import {useRouter} from "next/router";
import {Card} from "primereact/card";

export default function Home() {
  const router = useRouter();
  return (
      <>
         <Card title="Welcome!" className=" center big-padding welcomecard">
            <Button type="button" className="margin-bot button" label="signup" onClick={()=>router.push("/signup")}  outlined ></Button>
         <br/>
            <Button type="button" className="margin-top button" label="login" onClick={()=>router.push("/login")} outlined></Button>
         </Card>
        </>

  );
}
