import { RenderAppBreadcrumb } from '@/ikon/components/app-breadcrumb';
import { headers } from 'next/headers';
import React from 'react'

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const header = await headers();
        const host =
            (header.get("x-forwarded-proto") || "http") +
            "://" +
            (header.get("host") || "localhost:3000");
        const response = await fetch(`${host}/api/get_projectData`);
        const projectData = await response.json();
    return (
        <>
            <RenderAppBreadcrumb breadcrumb={{ level: 0, title: `${projectData.projectName} - Role Management`, href: "/" }} />
            {children   }
        </>
    )
}

