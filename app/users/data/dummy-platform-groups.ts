export interface GroupData {
    groupId: string;
    groupName: string;
    groupDescription: string;
    users: string[];
}

const dummyGroupData = [
    {
        groupId: "1",
        groupName: 'ADMIN',
        groupDescription: 'Admin Group',
        users: [],
    },
    {
        groupId: "2",
        groupName: 'SUPERADMIN',
        groupDescription: 'Superadmin Group',
        users: [],
    },
]

export default dummyGroupData;