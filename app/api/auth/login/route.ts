import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { apiReaquest } from "@/ikon/utils/apiRequest";
import { setCookieSession } from "@/ikon/utils/cookieSession";


export async function POST(req: Request) {
    try {
        console.log("Login request received");

        const body = await req.json();
        console.log("Request body:", body);

        if (!body.userlogin || !body.password) {
            return NextResponse.json(
                { error: "Username and password required" },
                { status: 400 }
            );
        }

        const loginDetails = {
            password: body.password,
            userlogin: body.userlogin,
            credentialType: "PASSWORD",
        };

        const url = `${body.host}/platform/auth/login`;

        const response = await fetch(
            url,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginDetails),
            }
        );

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("Login failed:", errorResponse);
            return NextResponse.json(
                { error: "Login failed", details: errorResponse },
                { status: 401 }
            );
        }
        const { accessToken, refreshToken, expiresIn, refreshExpiresIn } = await response.json();

        if (!accessToken || typeof accessToken !== "string") {
            return NextResponse.json(
                { error: "Token not provided or invalid" },
                { status: 400 }
            );
        }
        // Set the cookie
        await setCookieSession("accessToken", accessToken, { maxAge: expiresIn });
        await setCookieSession("refreshToken", refreshToken, { maxAge: refreshExpiresIn });
        await setCookieSession("hostURL", body.host, { maxAge: refreshExpiresIn });

        return NextResponse.json({ success: true, message: "Login successful!" });
    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}