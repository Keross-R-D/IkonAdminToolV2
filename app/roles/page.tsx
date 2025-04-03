import React from "react";

import { v4 as uuidv4 } from "uuid";
import GroupTable from "./components/role-table";

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
