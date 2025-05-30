import React from "react";
import UsersTable from "./components/users-table";
import dummyUserData from "./data/dummy-user-data";

async function page() {
  return (
    <>
      <UsersTable users={dummyUserData} />
    </>
  );
}

export default page;