import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";
import { Button } from "@/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import UserDropdownMenu from "@/ikon/components/user-dropdown-menu";

export default async function TopMenuUser() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Avatar className="rounded-full">
            <AvatarImage
              src=""
              alt=""
            />
            <AvatarFallback className="rounded-lg">
              {"Test User".match(/\b([A-Z])/g)?.join("")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        sideOffset={4}
      >
        <UserDropdownMenu />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
