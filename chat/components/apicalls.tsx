
export default async function sendRequest(url: string, method: string, data?: Record<string, any>, contentType: string="application/json" , token?: string){

    let headers: Record<any, any> = {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': 'localhost',
    };

    if(token){
        console.log("token found! "+token)
        const authToken = 'Bearer ' + token;
        headers['Authorization'] = authToken;
    }

    let reqData: Record<any, any> = {
          method: method,
          headers: headers,
          redirect: "follow"
    };

    if(data){
        const strData = JSON.stringify(data)
        reqData['body'] =  strData;
    }

    try {
        const response = await fetch(url, reqData );


    return response;
  }
  catch (error) {
    console.error('Error sending request: ', method, "error: ", error);
    throw error;
  }
}