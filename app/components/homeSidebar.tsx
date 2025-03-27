// components/ui/sidebar.tsx
import { FolderGit2, UsersRound, User2 } from "lucide-react";
import Link from "next/link";

const Sidebar = () => {
  return (
    <aside className="w-[4rem] border dark:bg-gray-800 dark:text-white h-full ">
      <nav className="flex flex-col gap-4 items-center py-4">
        <a href="/" className="block  rounded hover:border-2"><div className="p-1"><FolderGit2  /></div></a>
        <a href="/User" className="block  rounded hover:border-2"><div className="p-1"><User2/></div></a>
        <a href="/Groups" className="block  rounded hover:border-2"><div className="p-1"><UsersRound /></div></a>
      </nav>
    </aside>
  );
};

export default Sidebar;
