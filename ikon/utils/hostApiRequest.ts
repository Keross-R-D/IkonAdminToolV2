"use server"
import { headers } from "next/headers";
import { getValidAccessToken } from "./accessToken";

export async function hostApiReaquest(apiUrl: string, hostURL:string, init?: RequestInit,isTokenRequired?:boolean) {
  try {
    const header = await headers();

    const initHeaders = new Headers(init?.headers);
    const cookie = header.get('cookie') || '';
    initHeaders.append("Cookie", cookie);
    if(isTokenRequired == undefined || isTokenRequired){
      const accessToken = await getValidAccessToken();
      console.log("accessToken",accessToken)
      initHeaders.append("Authorization",`Bearer ${accessToken}`)
    }
    if(init)
        init.headers = initHeaders;
    else 
        init = {
            headers : initHeaders
           }

    const protocol = 'https';
    
    const host = `${protocol}://${hostURL}`
console.log("host",host)
    const response = await fetch(`${host}${apiUrl}`, init);
    

    const contentType = response.headers.get("Content-Type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    return responseData
  } catch (error) {
   // console.error(`API Request Failed - ${init.method} ${apiUrl}:`, error);
    const err = error as Error;
    return {
      status: "Failure",
      message: err.message || "An error occurred while making the request",
    };
  }
}