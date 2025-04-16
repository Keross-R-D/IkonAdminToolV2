import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shadcn/ui/sidebar";
import {
  AppWindow,
  ClipboardCheck,
  FolderGit2,
  GitPullRequestArrow,
  Home,
  LayoutGrid,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";

const navManu = [
  {
    title: "Process Management",
    href: "",
    icon: FolderGit2,
    isActive: true,
  },
  {
    title: "Groups",
    href: "groups",
    icon: Users,
    isActive: false,
  },
  {
    title: "Roles",
    href: "roles",
    icon: Users,
    isActive: false,
  },
  // {
  //   title: "Users",
  //   href: "users",
  //   icon: User,
  //   isActive: false,
  // },
];
export default async function MainSideBar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
    >
      <SidebarHeader className="">
        <SidebarMenu className="justify-center h-9">
          <SidebarMenuItem>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src="/assets/images/dark/symble-keross.png"
                  alt="Keross"
                />
                <AvatarFallback className="rounded-lg">
                  {"Keross".substring(0, 1)}
                </AvatarFallback>
              </Avatar>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              {navManu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={{
                      children: item.title,
                      hidden: false,
                    }}
                    // isActive={appName === item.href}
                    className="px-2.5 md:px-2"
                    asChild
                  >
                    <Link href={"/" + item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarUser />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}
    </Sidebar>
  );
}
