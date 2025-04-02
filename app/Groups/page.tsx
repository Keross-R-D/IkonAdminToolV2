import React from "react";
import GroupTable from "./components/group-table";
import { v4 as uuidv4 } from "uuid";

async function page() {
  const response = await fetch("http://localhost:3000/api/groups", {
    next: {
      tags: ["groups"],
    },
  });
  const groups = await response.json();
  return (
    <div>
      <GroupTable softwareId={uuidv4()} groups={groups} />
    </div>
  );
}

export default page;
