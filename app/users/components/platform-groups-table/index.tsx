"use client";
import { DataTable } from "@/ikon/components/data-table";
import { DTColumnsProps, DTExtraParamsProps } from "@/ikon/components/data-table/type";
import React from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/shadcn/ui/checkbox";
import { GroupData } from "../../data/dummy-platform-groups";

function GroupsTable({ groups }: { groups: GroupData[] }) {
    
    const [groupData, setGroupData] = React.useState<GroupData | null>(null);

    const groupColumns: DTColumnsProps<GroupData>[] = [
        {
            accessorKey: "groupName",
            header: "Name",
        },
        {
            accessorKey: "groupDescription",
            header: "Description",
        },
    ];

    const extraParams: DTExtraParamsProps = {
        grouping: false,
        checkBoxColumn: true,
        checkBoxColumnCallback:(selectedRows : GroupData[])=> {
            console.log("Selected Rows: ", selectedRows);  
        }
    };
    return (
        <>
            <DataTable data={groups} columns={groupColumns} extraParams={extraParams} />
        </>
    );
}

export default GroupsTable;
