

export interface UserData {
    userId: string;
    userName: string;
    userLogin: string;
    password: string;
    userPhone?: string;
    userEmail: string;
    userThumbnail?: string | null;
    userType?: string;
    active?: boolean;
    accountId?: string;
    userDeleted?: boolean;
}

const dummyUserData : UserData[] = [
    {
        "userId": "1",
        "userName": "Alice Johnson",
        "userLogin": "alice@keross",
        "password": "A1ice!234",
        "userPhone": "12345678",
        "userEmail": "alice@keross.com",
        "userThumbnail": null,
        "userType": "Human",
        "active": true,
        "accountId": "{{accountId}}",
        "userDeleted": false
    },
    {
        "userId": "2",
        "userName": "Bob Smith",
        "userLogin": "bob@keross",
        "password": "B0b@9876",
        "userPhone": "23456789",
        "userEmail": "bob@keross.com",
        "userThumbnail": null,
        "userType": "Human",
        "active": true,
        "accountId": "{{accountId}}",
        "userDeleted": false
    },
    {
        "userId": "3",
        "userName": "Charlie Brown",
        "userLogin": "charlie@keross",
        "password": "Ch@rlie123",
        "userPhone": "34567890",
        "userEmail": "charlie@keross.com",
        "userThumbnail": null,
        "userType": "Human",
        "active": true,
        "accountId": "{{accountId}}",
        "userDeleted": false
    },
    {
        "userId": "4",
        "userName": "David White",
        "userLogin": "david@keross",
        "password": "D@vid4567",
        "userPhone": "45678901",
        "userEmail": "david@keross.com",
        "userThumbnail": null,
        "userType": "Human",
        "active": true,
        "accountId": "{{accountId}}",
        "userDeleted": false
    },
    {
        "userId": "5",
        "userName": "Emma Wilson",
        "userLogin": "emma@keross",
        "password": "Emma!890",
        "userPhone": "56789012",
        "userEmail": "emma@keross.com",
        "userThumbnail": null,
        "userType": "Human",
        "active": true,
        "accountId": "{{accountId}}",
        "userDeleted": false
    },
    {
        "userId": "6",
        "userName": "Frank Thomas",
        "userLogin": "frank@keross",
        "password": "Fr@nk2023",
        "userPhone": "67890123",
        "userEmail": "frank@keross.com",
        "userThumbnail": null,
        "userType": "Human",
        "active": true,
        "accountId": "{{accountId}}",
        "userDeleted": false
    },
    {
        "userId": "7",
        "userName": "Grace Miller",
        "userLogin": "grace@keross",
        "password": "Gr@ce789",
        "userPhone": "78901234",
        "userEmail": "grace@keross.com",
        "userThumbnail": null,
        "userType": "Human",
        "active": true,
        "accountId": "{{accountId}}",
        "userDeleted": false
    },
    {
        "userId": "8",
        "userName": "Henry Lewis",
        "userLogin": "henry@keross",
        "password": "H3nry@111",
        "userPhone": "89012345",
        "userEmail": "henry@keross.com",
        "userThumbnail": null,
        "userType": "Human",
        "active": true,
        "accountId": "{{accountId}}",
        "userDeleted": false
    },
    {
        "userId": "9",
        "userName": "Ivy Anderson",
        "userLogin": "ivy@keross",
        "password": "IvY!2345",
        "userPhone": "90123456",
        "userEmail": "ivy@keross.com",
        "userThumbnail": null,
        "userType": "Human",
        "active": true,
        "accountId": "{{accountId}}",
        "userDeleted": false
    },
    {
        "userId": "10",
        "userName": "Jack Carter",
        "userLogin": "jack@keross",
        "password": "J@ck_678",
        "userPhone": "01234567",
        "userEmail": "jack@keross.com",
        "userThumbnail": null,
        "userType": "Human",
        "active": true,
        "accountId": "{{accountId}}",
        "userDeleted": false
    }
]
export default dummyUserData;

