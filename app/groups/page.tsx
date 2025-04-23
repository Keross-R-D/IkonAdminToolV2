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
    <div className="p-2">
      <GroupTable  groups={groups} />
    </div>
  );
}

export default page;
