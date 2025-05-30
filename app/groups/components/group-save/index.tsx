"use server";
import { apiReaquest } from "@/ikon/utils/apiRequest";
import { revalidateTag } from "next/cache";

interface GroupData {
  id?: string;
  name: string;
  description?: string;
}


interface ErrorResponse {
  error: string;
  details?: string;
}

export const saveGroupData = async (group: GroupData): Promise<GroupData> => {
  try {
    
    
    const response = await apiReaquest("/api/groups" ,{
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(group),
    }) 

    revalidateTag("groups");
    return response;
    
  } catch (error: unknown) {
    console.error('Error saving group:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred while saving the group');
  }
};