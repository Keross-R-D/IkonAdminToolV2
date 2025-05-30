import React from "react";
import { v4 as uuidv4 } from "uuid";
import RoleTable from "./components/role-table";
import { headers } from "next/headers";
import { apiReaquest } from "@/ikon/utils/apiRequest";

interface Role {
  id: string;
  name: string;
  permissions?: string[];
  description?: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  softwareId: string;
}

async function Page() {
  const headerList = headers();
  const protocol = (await headerList).get("x-forwarded-proto") || "http";
  const hostname = (await headerList).get("host") || "localhost:3000";
  const host = `${protocol}://${hostname}`;
  const softwareId = uuidv4();

  try {
    let safeRoles: Role[] = [];
    try {
      const rolesResponse = await apiReaquest("/api/roles",{
        next: { tags: ["roles"] },
        cache: 'no-store'
      });

      // if (rolesResponse.ok) {
        const rolesData =  rolesResponse;
        safeRoles = Array.isArray(rolesData) ? rolesData : [];
      // } else if (rolesResponse.status !== 404) {
      //   console.error(`Roles API error: ${rolesResponse.status} ${rolesResponse.statusText}`);
      // }
    } catch (error) {
      console.error("Roles fetch error:", error);
    }

    let safeGroups: Group[] = [];
    try {
      const groupsResponse = await apiReaquest("/api/groups",{
        next: { tags: ["groups"] },
        cache: 'no-store'
      });

      // if (groupsResponse.ok) {
        const groupsData =  groupsResponse;
        safeGroups = Array.isArray(groupsData) ? groupsData : [];
      // } else if (groupsResponse.status !== 404) {
      //   console.error(`Groups API error: ${groupsResponse.status} ${groupsResponse.statusText}`);
      // }
    } catch (error) {
      console.error("Groups fetch error:", error);
    }

    return (
      <div className="p-4 h-full">

        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 h-full">
          <div className="p-2">
            <RoleTable
              softwareId={softwareId}
              roles={safeRoles}
              groups={safeGroups}
            />
          </div>
        </div>
      </div>

    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return (
      <div className="p-4 h-full">

        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 h-full">
          <div className="p-2">
            <RoleTable
              softwareId={softwareId}
              roles={[]}
              groups={[]}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Page;