"use server"
import { apiReaquest } from "@/ikon/utils/apiRequest";
import { revalidateTag } from "next/cache";

interface RoleData {
    id?: string;
    name: string;
    description?: string;
    softwareId: string;
  }
  
  export const saveRoleData = async (role: RoleData): Promise<RoleData> => {
    try {
      const response =await apiReaquest("/api/roles",{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role),
      });
  
      // if (!response.ok) throw new Error('Failed to save role');
      
      //const result =  response;
      revalidateTag("roles");
      return response;
      
    } catch (error) {
      console.error('Error saving role:', error);
      throw error;
    }
  };