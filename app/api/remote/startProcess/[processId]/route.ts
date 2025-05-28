import { NextRequest, NextResponse } from "next/server";
import { getCookieSession } from "@/ikon/utils/cookieSession";

export async function POST(req: NextRequest) {
    try {

        const searchParams = req.nextUrl.searchParams;
        const processId = searchParams.get('processId');

        const body =  await req.json();

        const authToken = await getCookieSession("accessToken");
        let host = await getCookieSession("hostURL");
        const currentloggedInServer = await getCookieSession("currentloggedInServer");

        if(currentloggedInServer === "local-auth") {
            host = await getCookieSession("localHostURL");
        }
        const completeUrl = `${host}/processengine/runtime/process/${processId}/instance?allInstances=false`;

        const reqBody = JSON.stringify({
            "processInstanceIdentifierFields": body.processInstanceIdentifierFields,
            "data": body.processData
        })

        const response = await fetch(
            completeUrl,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify(reqBody),
            }
        )

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("Login failed:", errorResponse);
            return NextResponse.json(
                { error: "Login failed", details: errorResponse },
                { status: 401 }
            );
        }

        return NextResponse.json({ success: true, message: "start process successful!" });


    } catch (error) {
        console.error("Server error: ", error);
        return NextResponse.json(
            {error: "Internal Server Error"},
            {status: 500}
        )
    } 
}