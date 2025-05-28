import { NextRequest, NextResponse } from "next/server";
import { apiReaquest } from "@/ikon/utils/apiRequest";
import { getCookieSession } from "@/ikon/utils/cookieSession";
import { read } from "fs";
import { useSearchParams } from 'next/navigation'
import { request } from "http";
import { getValidAccessToken } from "@/ikon/utils/accessToken";

export async function GET(req: NextRequest) {
    try {

        const searchParams = req.nextUrl.searchParams;
        const processId = searchParams.get('processId');
        const getAllInstances = searchParams.get('getAllInstances');


        const authToken = await getValidAccessToken();


        let host = await getCookieSession("hostURL");
        const currentloggedInServer = await getCookieSession("currentloggedInServer");

        if(currentloggedInServer === "local-auth") {
            host = await getCookieSession("localHostURL");
        }
        // const host = "http://localhost:8081"
        const completeUrl = `${host}/processengine/runtime/process/${processId}/instance?allInstances=${getAllInstances}`;

        const response = await fetch(
            completeUrl,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
            }
        )

        const data = await response.json();

        return NextResponse.json(
            {instances: data}
        )

    } catch (error) {
        console.error("Server error: ", error);
        return NextResponse.json(
            {error: "Internal Server Error"},
            {status: 500}
        )
    } 
}