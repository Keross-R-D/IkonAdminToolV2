import BreadcrumbComp from '@/app/components/Breadcrump';
import { RenderAppBreadcrumb } from '@/ikon/components/app-breadcrumb';
import React from 'react'

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <BreadcrumbComp page={"workflow"} title="Workflow"/>
            {/* <RenderAppBreadcrumb breadcrumb={{ level: 1, title: `Workflow - ${decodeURIComponent(paramsData?.workflow).split('/')[1]}`, href: `/workflow/${paramsData?.workflow}` }} /> */}
            {children}
        </>
    )
}

