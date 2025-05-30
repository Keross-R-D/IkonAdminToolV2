import { RenderAppBreadcrumb } from '@/ikon/components/app-breadcrumb';
import { apiReaquest } from '@/ikon/utils/apiRequest';
import React from 'react'

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const projectData = await apiReaquest("/api/get_projectData");
    return (
        <>
            <RenderAppBreadcrumb breadcrumb={{ level: 0, title: `${projectData.projectName} - Role Management`, href: "/" }} />
            {children   }
        </>
    )
}

