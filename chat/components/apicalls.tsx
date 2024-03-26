import React from "react";

export default async function sendRequest(url: string, data: string, method: string){
    try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'localhost'
          },
          body: JSON.stringify(data),
          redirect: "follow"
    });

    if (!response.ok) {
      throw new Error('Failed to send request', method);
    }

    const responseData = await response.json();
    return responseData;
  }
  catch (error) {
    console.error('Error sending request: ', method, "error: ", error);
    throw error;
  }
}