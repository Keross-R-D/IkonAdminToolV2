"use server"
import { headers } from "next/headers";

export async function apiReaquest(apiUrl: string, init?: RequestInit) {
  try {
    const header = await headers();
    const initHeaders = new Headers(init?.headers);
    const cookie = header.get('cookie') || '';
    initHeaders.append("Cookie", cookie);
    if(init)
        init.headers = initHeaders;
    else 
        init = {
            headers : initHeaders
           }

    const protocol = 'http';
    const host = `${protocol}://${header.get('host')}`;
    const response = await fetch(`${host}${apiUrl}`, init);
    // console.log("response:",response)

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