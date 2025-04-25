
import React from "react";
import GroupTable from "./components/group-table";
import { v4 as uuidv4 } from "uuid";
import { headers } from "next/headers";

async function page() {

  const header = await headers();
  const host =
    (header.get("x-forwarded-proto") || "http") +
    "://" +
    (header.get("host") || "localhost:3000");
  const response = await fetch(`${host}/api/groups`, {
    next: {
      tags: ["groups"],
    },
  });
  const groups = await response.json();

  return (
    <div className="p-4 h-full">

      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 h-full">
        <div className="p-2">
          <GroupTable groups={groups} />
        </div>
      </div>
    </div>
  );
}

export default page;
