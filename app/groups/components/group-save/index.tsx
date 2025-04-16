"use server"
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

interface GroupData {
    id?: string;
    name: string;
    description?: string;
    softwareId: string;
  }
  
  export const saveGroupData = async (group: GroupData): Promise<GroupData> => {
    try {
      const header = await headers();
  const host =
    (header.get("x-forwarded-proto") || "http") +
    "://" +
    (header.get("host") || "localhost:3000");
      const response = await fetch(`${host}/api/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(group),
      });
  
      if (!response.ok) throw new Error('Failed to save group');
      
      const result = await response.json();
      revalidateTag("groups")
      return result.data;
      
    } catch (error) {
      console.error('Error saving group:', error);
      throw error;
    }
  };