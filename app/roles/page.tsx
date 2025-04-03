import React from "react";
import { v4 as uuidv4 } from "uuid";
import RoleTable from "./components/role-table";

async function Page() {
  try {
    const response = await fetch("http://localhost:3000/api/roles", {
      next: {
        tags: ["roles"],
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch roles:", response.statusText);
      return (
        <div>
          <RoleTable softwareId={uuidv4()} roles={[]} />
        </div>
      );
    }

    const roles = await response.json();
    const safeRoles = Array.isArray(roles) ? roles : [];

    return (
      <div>
        <RoleTable softwareId={uuidv4()} roles={safeRoles} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching roles:", error);
    return (
      <div>
        <RoleTable softwareId={uuidv4()} roles={[]} />
      </div>
    );
  }
}

export default Page;