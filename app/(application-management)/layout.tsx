
import { RenderAppBreadcrumb } from '@/ikon/components/app-breadcrumb';
import { apiReaquest } from '@/ikon/utils/apiRequest';
import React from 'react'

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // const header = await headers();
    // const protocol = header.get('x-forwarded-proto') +"s" || 'https';
    // const host = `${protocol}://${header.get('host')}`;
    // console.log("host" , host)
    // const cookie = header.get('cookie') || '';
    // const response = await fetch(`${host}/api/get_projectData`, {
    //     headers: {
    //       Cookie: cookie
    //     }
    //   });
    // const projectData = await response.json();
    const projectData = await apiReaquest("/api/get_projectData")
    console.log("projectData", projectData)
    
    return (
        <>
            <RenderAppBreadcrumb breadcrumb={{ level: 0, title: `${projectData?.projectName} - Application Management`, href: "/" }} />
            {children   }
        </>
    )
}

