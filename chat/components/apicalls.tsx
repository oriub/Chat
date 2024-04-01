import React from "react";

export default async function sendRequest(url: string, data: string, method: string, contentType: str="application/json", token?: string){

    const headers = {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': 'localhost',
    };

    if(token){
        console.log("token found! "+token)
        const authToken = 'Bearer ' + token;
        headers.push({'Authorization': authToken});
    }


    try {
        const response = await fetch(url, {
          method: method,
          headers: headers,
          body: JSON.stringify(data),
          redirect: "follow"
    });

//     if (!response.ok) {
//       throw new Error('Failed to send request', method);
//     }

    const responseData = await response.json();
    return responseData;
  }
  catch (error) {
    console.error('Error sending request: ', method, "error: ", error);
    throw error;
  }
}