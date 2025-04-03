"use server"
import { revalidateTag } from "next/cache";

interface RoleData {
    id?: string;
    name: string;
    description?: string;
    softwareId: string;
  }
  
  export const saveRoleData = async (role: RoleData): Promise<RoleData> => {
    try {
      const response = await fetch('http://localhost:3000/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role),
      });
  
      if (!response.ok) throw new Error('Failed to save role');
      
      const result = await response.json();
      revalidateTag("roles")
      return result.data;
      
    } catch (error) {
      console.error('Error saving role:', error);
      throw error;
    }
  };