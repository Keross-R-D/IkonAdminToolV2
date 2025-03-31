import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";


export default async function MenuUser() {


    return (
        <>
            <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage src="" />
                <AvatarFallback className="rounded-lg">{"Test User".match(/\b([A-Z])/g)?.join('')}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Test User</span>
                <span className="truncate text-xs">test.user@keross.com</span>
            </div>
        </>
    )
}
