import Link from "next/link";
import AppBreadcrumb from "../app-breadcrumb";
import TopMenuUser from "@/ikon/components/top-menu-user";
import { Bot, LayoutGrid } from "lucide-react";
import { IconButtonWithTooltip } from "../buttons";
import { SidebarTrigger } from "@/shadcn/ui/sidebar";
import { ModeToggle } from "../ModeToggle";
import HostServer from "../host-server";
import AddEnv from "../Add-Env";
import { getCookieSession } from "@/ikon/utils/cookieSession";
async function Header() {
  const accessToken = await getCookieSession("accessToken");
  const refreshToken = await getCookieSession("refreshToken");
  let isLoggedIn = false;
  if (accessToken || refreshToken) {
    isLoggedIn = true;
  } else {
    isLoggedIn = false;
  }
  return (
    <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-secondary text-secondary-foreground px-2 lg:px-4 py-2">
      <SidebarTrigger />
      <AppBreadcrumb />
      <div className="ms-auto flex items-center gap-1 lg:gap-2">
        {/* <Link href={BASE_APP_BASE_PATH + "/examples"}>Examples</Link> */}
        {/* <IconButtonWithTooltip tooltipContent='IKON GPT' variant={"ghost"} asChild>
                    <Link href={"/ikon-gpt"} >
                        <Bot />
                    </Link>
                </IconButtonWithTooltip> */}
        {/* <IconButtonWithTooltip tooltipContent='App Store' variant={"ghost"} asChild>
                    <Link href={"/app-store"}>
                        <LayoutGrid />
                    </Link>
                </IconButtonWithTooltip> */}

        <HostServer
          isLoggedIn={isLoggedIn}
          isAccessTokenExpire={!accessToken}
        />
        <ModeToggle />
        {/* <TopMenuUser /> */}
      </div>
    </header>
  );
}

export default Header;
