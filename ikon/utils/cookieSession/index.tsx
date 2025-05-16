"use server";
import { cookies } from "next/headers";

const cookiePrefix = "ikoncloud_next_";

interface CookieSessionOptionsProps {
  maxAge?: number,
  expires?: Date
}

export async function setCookieSession(
  sessionName: string,
  data: string, options?: CookieSessionOptionsProps
) {
  const cookieStore = await cookies();

  cookieStore.set(cookiePrefix + sessionName, data, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    expires: options?.expires,
    maxAge: options?.maxAge
  });
}

export async function getCookieSession(
  sessionName: string
): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(cookiePrefix + sessionName)?.value;
  return cookie;
}

export async function clearCookieSession(sessionName: string) {
  const cookieStore = await cookies();
  cookieStore.delete(cookiePrefix + sessionName);
}

export async function clearAllCookieSession() {
  const cookieStore = await cookies();
  cookieStore.getAll().forEach((cookie) => {
    if (cookie.name.startsWith(cookiePrefix)) {
      cookieStore.delete(cookie.name);
    }
  });
}