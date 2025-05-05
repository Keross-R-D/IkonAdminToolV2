import { RenderAppBreadcrumb } from '@/ikon/components/app-breadcrumb';
import React from 'react'

export default async function Layout({
    children,
    params
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ myTask: string; }>
}>) {
    const paramsData = await params
    return (
        <>
            <RenderAppBreadcrumb breadcrumb={{ level: 1, title: `My Task - ${decodeURIComponent(paramsData?.myTask).split('/')[1]}`, href: `/workflow/${paramsData?.myTask}` }} />
            {children}
        </>
    )
}

