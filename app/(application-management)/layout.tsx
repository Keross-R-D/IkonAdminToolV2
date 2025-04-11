import { RenderAppBreadcrumb } from '@/ikon/components/app-breadcrumb';
import React from 'react'

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <RenderAppBreadcrumb breadcrumb={{ level: 0, title: "Application Management", href: "/" }} />
            {children   }
        </>
    )
}

