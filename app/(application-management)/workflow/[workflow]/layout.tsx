import { RenderAppBreadcrumb } from '@/ikon/components/app-breadcrumb';
import React from 'react'

export default async function Layout({
    children,
    params
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ workflow: string; }>
}>) {
    const paramsData = await params
    return (
        <>
            <RenderAppBreadcrumb breadcrumb={{ level: 1, title: "Workflow", href: `/workflow/${paramsData?.workflow}` }} />
            {children}
        </>
    )
}

