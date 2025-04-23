"use server";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

interface GroupData {
  id?: string;
  name: string;
  description?: string;
}

interface ApiResponse {
  success: boolean;
  data: GroupData;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export const saveGroupData = async (group: GroupData): Promise<GroupData> => {
  try {
    const headerList = headers();
    const protocol = (await headerList).get("x-forwarded-proto") || "http";
    const hostname = (await headerList).get("host") || "localhost:3000";
    const host = `${protocol}://${hostname}`;
    
    const response = await fetch(`${host}/api/groups`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(group),
    });

    if (!response.ok) {
      let errorData: ErrorResponse | null = null;
      try {
        errorData = await response.json() as ErrorResponse;
      } catch (e) {
        errorData = { error: 'Failed to parse error response' };
      }
      throw new Error(errorData.error || 'Failed to save group');
    }

    const result = await response.json() as ApiResponse;
    revalidateTag("groups");
    return result.data;
    
  } catch (error: unknown) {
    console.error('Error saving group:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred while saving the group');
  }
};