import { NextRequest, NextResponse } from "next/server";
import { apiReaquest } from "@/ikon/utils/apiRequest";
import { getCookieSession } from "@/ikon/utils/cookieSession";
import { read } from "fs";
import { useSearchParams } from "next/navigation";
import { request } from "http";
import { getValidAccessToken } from "@/ikon/utils/accessToken";

export async function GET(req: NextRequest) {
  try {
    
    const subscriptionStatus = false

    return NextResponse.json({ subscriptionStatus });
  } catch (error) {
    console.error("Server error: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
