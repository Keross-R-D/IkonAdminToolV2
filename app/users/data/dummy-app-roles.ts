export interface GroupData {
    appId: string;
    groupId: string;
    groupName: string;
    groupDescription: string;
    users: string[];
}

const dummyAppGroupData = [
    {
        appId: "1",
        groupId: "1",
        groupName: 'App Admin 1',
        groupDescription: 'Admin Group 1',
        users: [],
    },
    {
        appId: "1",
        groupId: "2",
        groupName: 'App Member 1',
        groupDescription: 'Member Group 1',
        users: [],
    },
    {
        appId: "2",
        groupId: "1",
        groupName: 'App Admin 2',
        groupDescription: 'Admin Group 2',
        users: [],
    },
    {
        appId: "2",
        groupId: "2",
        groupName: 'App Member 2',
        groupDescription: 'Member Group 2',
        users: [],
    },
]

export default dummyAppGroupData;