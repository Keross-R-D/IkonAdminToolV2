
import React from "react";
import GroupTable from "./components/group-table";
import { v4 as uuidv4 } from "uuid";
import { apiReaquest } from "@/ikon/utils/apiRequest";

async function page() {

  
  const groups = await apiReaquest("/api/groups",{
    next: {
      tags: ["groups"],
    },
  })

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
