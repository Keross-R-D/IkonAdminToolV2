import React from "react";
import { v4 as uuidv4 } from "uuid";
import RoleTable from "./components/role-table";
import { headers } from "next/headers";

async function Page() {
  const header = await headers();
  const host =
    (header.get("x-forwarded-proto") || "http") +
    "://" +
    (header.get("host") || "localhost:3000");
  try {
    const response = await fetch(`${host}/api/roles`, {
      next: {
        tags: ["roles"],
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch roles:", response.statusText);
      return (
        <div>
          <RoleTable softwareId={uuidv4()} roles={[]} groups={[]} />
        </div>
      );
    }

    const roles = await response.json();
    const safeRoles = Array.isArray(roles) ? roles : [];

    const responseGroups = await fetch(`${host}/api/groups`, {
      next: {
        tags: ["groups"],
      },
    });
    const groups = await responseGroups.json();

    return (
      <div>
        <RoleTable softwareId={uuidv4()} roles={safeRoles} groups={groups} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching roles:", error);
    return (
      <div>
        <RoleTable softwareId={uuidv4()} roles={[]} groups={[]} />
      </div>
    );
  }
}

export default Page;
