"use server"
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

interface RoleData {
    id?: string;
    name: string;
    description?: string;
    softwareId: string;
  }
  
  export const saveRoleData = async (role: RoleData): Promise<RoleData> => {
    try {
      const header = await headers();
  const host =
    (header.get("x-forwarded-proto") || "http") +
    "://" +
    (header.get("host") || "localhost:3000");
      const response = await fetch(`${host}/api/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role),
      });
  
      if (!response.ok) throw new Error('Failed to save role');
      
      const result = await response.json();
      revalidateTag("roles");
      return result.data;
      
    } catch (error) {
      console.error('Error saving role:', error);
      throw error;
    }
  };